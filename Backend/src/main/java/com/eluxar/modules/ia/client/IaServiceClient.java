package com.eluxar.modules.ia.client;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class IaServiceClient {

    @Value("${ia.service.url:http://localhost:5000}")
    private String iaServiceUrl;

    @Value("${ia.internal.api.key:}")
    private String internalApiKey;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    // ── Constantes de reintentos ──────────────────────────────────────────────
    private static final int MAX_ATTEMPTS = 6;
    // Segundos de espera máxima en cada reintento (backoff progresivo) para ~65s total
    private static final int[] RETRY_DELAYS_SECONDS = {5, 10, 15, 15, 20};
    private static final String HIBERNATE_HEADER = "x-render-routing";
    private static final String HIBERNATE_HEADER_VALUE = "hibernate-rate-limited";
    private static final int HEALTH_POLL_INTERVAL_MS = 10000;

    /**
     * Hace un "ping" ligero al endpoint de health del IA-service
     * para despertarlo de la hibernación silenciosamente.
     */
    public void checkHealth() {
        String targetUrl = iaServiceUrl + "/health";
        try {
            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(targetUrl))
                    .timeout(Duration.ofSeconds(10))
                    .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36")
                    .header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
                    .header("Accept-Language", "en-US,en;q=0.9")
                    .GET()
                    .build();
            
            // Fire and forget - si falla o da timeout (ej. está durmiendo), está bien, la petición inicial ya empezó a despertarlo.
            httpClient.sendAsync(httpRequest, HttpResponse.BodyHandlers.discarding());
        } catch (Exception e) {
            log.warn("Error en health check silencioso al IA-service: {}", e.getMessage());
        }
    }

    /**
     * Realiza un POST a un endpoint del IA-service, manejando la recuperación de hibernación.
     */
    public HttpResponse<String> post(String endpoint, String payload, String requestId) throws Exception {
        String targetUrl = iaServiceUrl + endpoint;

        HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
                .uri(URI.create(targetUrl))
                .header("Content-Type", "application/json")
                .header("User-Agent", "Eluxar-Backend/1.0")
                .timeout(Duration.ofSeconds(120)) // AI calls can be slow
                .POST(HttpRequest.BodyPublishers.ofString(payload));

        if (internalApiKey != null && !internalApiKey.isBlank()) {
            requestBuilder.header("X-Internal-Key", internalApiKey);
        }

        HttpRequest httpRequest = requestBuilder.build();
        return executeWithHibernateRetry(httpRequest, requestId, targetUrl);
    }

    /**
     * Opcional: Realiza un GET a un endpoint del IA-service, manejando la recuperación de hibernación.
     */
    public HttpResponse<String> get(String endpoint, String requestId) throws Exception {
        String targetUrl = iaServiceUrl + endpoint;

        HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
                .uri(URI.create(targetUrl))
                .header("User-Agent", "Eluxar-Backend/1.0")
                .timeout(Duration.ofSeconds(120))
                .GET();

        if (internalApiKey != null && !internalApiKey.isBlank()) {
            requestBuilder.header("X-Internal-Key", internalApiKey);
        }

        HttpRequest httpRequest = requestBuilder.build();
        return executeWithHibernateRetry(httpRequest, requestId, targetUrl);
    }

    /**
     * Ejecuta la petición HTTP al IA-service con reintentos automáticos ante hibernación de Render Free.
     * Incorpora polling activo a /health para minimizar el tiempo de espera.
     */
    private HttpResponse<String> executeWithHibernateRetry(
            HttpRequest httpRequest, String requestId, String targetUrl) throws Exception {

        long globalStartTime = System.currentTimeMillis();
        boolean wasHibernated = false;

        for (int attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
            long startTime = System.currentTimeMillis();
            
            if (attempt > 1) {
                log.info("[{}] RETRY intento={}/{}", requestId, attempt, MAX_ATTEMPTS);
            } else {
                log.info("[{}] CALL intento={}/{}", requestId, attempt, MAX_ATTEMPTS);
            }
            
            HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());
            long durationMs = System.currentTimeMillis() - startTime;

            if (response.statusCode() != 429) {
                log.info("[{}] RESPONSE status={}", requestId, response.statusCode());
                if (wasHibernated && response.statusCode() >= 200 && response.statusCode() < 300) {
                    long recoveryTimeMs = System.currentTimeMillis() - globalStartTime;
                    log.info("[{}] RETRY_SUCCESS intento={}/{}", requestId, attempt, MAX_ATTEMPTS);
                    log.info("[{}] RECOVERY_TIME_MS={}", requestId, recoveryTimeMs);
                }
                return response;
            }

            log.info("[{}] RESPONSE status=429", requestId);

            Optional<String> retryAfter = response.headers().firstValue("Retry-After");
            retryAfter.ifPresent(v -> log.warn("[{}] Retry-After={}", requestId, v));

            String renderRouting = response.headers().firstValue(HIBERNATE_HEADER).orElse("");
            boolean isHibernation = renderRouting.contains(HIBERNATE_HEADER_VALUE);

            if (!isHibernation) {
                log.warn("[{}] FLASK_SERVICE_RETURNED_429 (rate-limit real) URL={} HEADERS={} BODY={}",
                        requestId, targetUrl, response.headers().map(), response.body());
                return response;
            }

            log.warn("[{}] HIBERNATE_DETECTED intento={}/{}", requestId, attempt, MAX_ATTEMPTS);

            if (!wasHibernated) {
                log.info("[{}] WAKEUP_TRIGGER_SENT", requestId);
                checkHealth(); // Trigger wake-up immediately on first detection
                wasHibernated = true;
            }

            if (attempt == MAX_ATTEMPTS) {
                long totalWaitMs = System.currentTimeMillis() - globalStartTime;
                log.error("[{}] HIBERNATE_RETRY_EXHAUSTED intentos={}", requestId, MAX_ATTEMPTS);
                log.error("[{}] TOTAL_WAIT_MS={}", requestId, totalWaitMs);
                throw new HibernateRetryExhaustedException();
            }

            int waitSeconds = RETRY_DELAYS_SECONDS[attempt - 1];
            boolean awake = waitForServiceAwake(requestId, waitSeconds);
            
            if (awake) {
                log.info("[{}] SERVICE_AWAKE", requestId);
            }
        }

        throw new HibernateRetryExhaustedException();
    }

    /**
     * Realiza polling a /health cada HEALTH_POLL_INTERVAL_MS.
     * Si responde exitosamente, asume que el servicio despertó.
     * Si falla o da timeout, duerme lo restante del intervalo y vuelve a intentar.
     */
    private boolean waitForServiceAwake(String requestId, int maxWaitSeconds) {
        String healthUrl = iaServiceUrl + "/health";
        log.info("[{}] HEALTH_CHECK_START url={}", requestId, healthUrl);

        long startWait = System.currentTimeMillis();
        long maxWaitMs = maxWaitSeconds * 1000L;

        HttpRequest healthRequest = HttpRequest.newBuilder()
                .uri(URI.create(healthUrl))
                .timeout(Duration.ofSeconds(30))
                .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36")
                .header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
                .header("Accept-Language", "en-US,en;q=0.9")
                .GET()
                .build();

        log.info("[{}] HEALTH_CHECK_REQUEST url={}", requestId, healthUrl);
        log.info("[{}] HEALTH_CHECK_METHOD GET", requestId);
        log.info("[{}] HEALTH_CHECK_HEADERS {}", requestId, healthRequest.headers().map());

        while (System.currentTimeMillis() - startWait < maxWaitMs) {
            long checkStart = System.currentTimeMillis();
            long elapsedMs = checkStart - startWait;
            log.info("[{}] HEALTH_CHECK_ATTEMPT elapsedMs={}", requestId, elapsedMs);

            try {
                HttpResponse<Void> response = httpClient.send(healthRequest, HttpResponse.BodyHandlers.discarding());
                long durationMs = System.currentTimeMillis() - checkStart;
                log.info("[{}] HEALTH_CHECK_STATUS status={} durationMs={}",
                        requestId, response.statusCode(), durationMs);

                if (response.statusCode() == 200) {
                    log.info("[{}] HEALTH_CHECK_SUCCESS servicio responde a /health", requestId);
                    return true;
                }

                log.warn("[{}] HEALTH_CHECK_NON_200 status={}", requestId, response.statusCode());

                if (response.statusCode() == 429) {
                    log.warn("[{}] HEALTH_CHECK_429 all_headers={}",
                            requestId, response.headers().map());
                    response.headers().firstValue("x-render-routing").ifPresent(
                            v -> log.warn("[{}] HEALTH_CHECK_429_HEADER x-render-routing={}", requestId, v));
                    response.headers().firstValue("retry-after").ifPresent(
                            v -> log.warn("[{}] HEALTH_CHECK_429_HEADER retry-after={}", requestId, v));
                    response.headers().firstValue("server").ifPresent(
                            v -> log.warn("[{}] HEALTH_CHECK_429_HEADER server={}", requestId, v));
                    response.headers().firstValue("cf-ray").ifPresent(
                            v -> log.warn("[{}] HEALTH_CHECK_429_HEADER cf-ray={}", requestId, v));
                }
            } catch (Exception e) {
                log.info("[{}] HEALTH_CHECK_EXCEPTION type={} message={}",
                        requestId, e.getClass().getSimpleName(), e.getMessage());
            }
            
            // Calcular cuánto falta para el próximo tick
            long timeElapsedInTick = System.currentTimeMillis() - checkStart;
            long timeToSleep = HEALTH_POLL_INTERVAL_MS - timeElapsedInTick;
            
            if (timeToSleep > 0) {
                long totalTimeElapsed = System.currentTimeMillis() - startWait;
                long timeLeft = maxWaitMs - totalTimeElapsed;
                if (timeLeft <= 0) break;
                
                try {
                    Thread.sleep(Math.min(timeToSleep, timeLeft));
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    return false;
                }
            }
        }
        
        log.info("[{}] HEALTH_CHECK_TIMEOUT maxWaitSeconds={}", requestId, maxWaitSeconds);
        return false;
    }

    public static final class HibernateRetryExhaustedException extends RuntimeException {
        public HibernateRetryExhaustedException() {
            super("Hibernate retry exhausted after " + MAX_ATTEMPTS + " attempts");
        }
    }
}
