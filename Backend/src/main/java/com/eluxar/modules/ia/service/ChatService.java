package com.eluxar.modules.ia.service;

import com.eluxar.modules.ia.dto.ChatRequest;
import com.eluxar.modules.ia.dto.ChatResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {

    @org.springframework.beans.factory.annotation.Value("${ia.service.url:http://localhost:5000}")
    private String iaServiceUrl;

    @org.springframework.beans.factory.annotation.Value("${ia.internal.api.key:}")
    private String internalApiKey;

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    // ── Constantes de reintentos ──────────────────────────────────────────────
    private static final int MAX_RETRIES = 3;
    // Segundos de espera antes de cada reintento (backoff progresivo: intento 1 -> 3s, 2 -> 6s, 3 -> 10s)
    private static final int[] RETRY_DELAYS_SECONDS = {3, 6, 10};
    private static final String HIBERNATE_HEADER = "x-render-routing";
    private static final String HIBERNATE_HEADER_VALUE = "hibernate-rate-limited";

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
                    .GET()
                    .build();
            
            // Fire and forget - si falla o da timeout (ej. está durmiendo), está bien, la petición inicial ya empezó a despertarlo.
            httpClient.sendAsync(httpRequest, HttpResponse.BodyHandlers.discarding());
        } catch (Exception e) {
            log.warn("Error en health check silencioso al IA-service: {}", e.getMessage());
        }
    }

    /**
     * Delegates the chat message to the Flask/Python AI service and returns its response.
     * The Flask service handles the MCP agent loop internally.
     */
    public ChatResponse sendMessage(ChatRequest request) {
        String requestId = UUID.randomUUID().toString().substring(0, 8);
        String targetUrl = iaServiceUrl + "/chat";
        try {
            // Build the payload for Flask: { "message": "...", "history": [...] }
            String payload = objectMapper.writeValueAsString(java.util.Map.of(
                    "message", request.getMessage() != null ? request.getMessage() : "",
                    "history", request.getHistory() != null ? request.getHistory() : List.of()
            ));

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

            log.info("[{}] CALL url={} method=POST timestamp={}",
                    requestId, targetUrl, System.currentTimeMillis());

            HttpResponse<String> httpResponse = executeWithHibernateRetry(httpRequest, requestId, targetUrl);

            if (httpResponse.statusCode() >= 200 && httpResponse.statusCode() < 300) {
                // Parse Flask response: { "response": "...", "history": [...] }
                @SuppressWarnings("unchecked")
                java.util.Map<String, Object> flaskBody =
                        objectMapper.readValue(httpResponse.body(), java.util.Map.class);

                String agentResponse = (String) flaskBody.getOrDefault("response", "");
                @SuppressWarnings("unchecked")
                List<Object> updatedHistory = (List<Object>) flaskBody.getOrDefault("history", new ArrayList<>());

                return new ChatResponse(agentResponse, updatedHistory);
            } else {
                log.error("[{}] Flask AI service STATUS={} URL={} HEADERS={} BODY={}",
                        requestId, httpResponse.statusCode(), targetUrl,
                        httpResponse.headers().map(), httpResponse.body());
                return new ChatResponse(
                        "Lo siento, el servicio de IA no está disponible en este momento. Por favor, intenta de nuevo más tarde.",
                        request.getHistory() != null ? request.getHistory() : new ArrayList<>()
                );
            }

        } catch (HibernateRetryExhaustedException e) {
            log.error("[{}] HIBERNATE_RETRY_EXHAUSTED intentos={} — sin respuesta del servicio",
                    requestId, MAX_RETRIES);
            return new ChatResponse(
                    "Lo siento, el servicio de IA no está disponible en este momento. Por favor, intenta de nuevo más tarde.",
                    request.getHistory() != null ? request.getHistory() : new ArrayList<>()
            );
        } catch (java.net.ConnectException e) {
            log.error("[{}] Cannot connect to Flask AI service at {}: {}", requestId, targetUrl, e.getMessage());
            return new ChatResponse(
                    "El servicio de asesoría IA no está disponible en este momento. Asegúrate de que el servicio Python esté en ejecución.",
                    request.getHistory() != null ? request.getHistory() : new ArrayList<>()
            );
        } catch (Exception e) {
            log.error("[{}] Error communicating with Flask AI service url={}: {}", requestId, targetUrl, e.getMessage(), e);
            return new ChatResponse(
                    "Ocurrió un error al procesar tu mensaje. Por favor, intenta de nuevo.",
                    request.getHistory() != null ? request.getHistory() : new ArrayList<>()
            );
        }
    }

    /**
     * Ejecuta la petición HTTP al IA-service con reintentos automáticos ante hibernación de Render Free.
     *
     * <p>Cuando Render Free está durmiendo devuelve HTTP 429 con el header
     * {@code x-render-routing: hibernate-rate-limited}. En ese caso se reintenta hasta
     * {@value MAX_RETRIES} veces con un backoff progresivo (3 s → 6 s → 10 s).
     * Si el 429 no corresponde a hibernación, falla inmediatamente.
     *
     * <p>Nota de arquitectura: el proyecto usa spring-boot-starter-web (Tomcat, blocking I/O)
     * sin WebFlux. Thread.sleep es la solución adecuada y consistente con el HttpClient
     * bloqueante ya en uso; introducir un stack reactivo supondría una refactorización
     * desproporcionada para este caso de uso.
     *
     * @throws HibernateRetryExhaustedException si todos los intentos son respondidos con hibernación.
     */
    private HttpResponse<String> executeWithHibernateRetry(
            HttpRequest httpRequest, String requestId, String targetUrl) throws Exception {

        for (int attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
            long startTime = System.currentTimeMillis();
            HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());
            long durationMs = System.currentTimeMillis() - startTime;

            log.info("[{}] RESPONSE status={} durationMs={} intento={}/{}",
                    requestId, response.statusCode(), durationMs, attempt, MAX_RETRIES + 1);

            // Registrar Retry-After si existe
            Optional<String> retryAfter = response.headers().firstValue("Retry-After");
            retryAfter.ifPresent(v -> log.warn("[{}] Retry-After={}", requestId, v));

            if (response.statusCode() != 429) {
                // Respuesta exitosa o error no relacionado con hibernación → devolver tal cual
                return response;
            }

            String renderRouting = response.headers().firstValue(HIBERNATE_HEADER).orElse("");
            boolean isHibernation = renderRouting.contains(HIBERNATE_HEADER_VALUE);

            if (!isHibernation) {
                // 429 por rate-limit real, no reintentar
                log.warn("[{}] FLASK_SERVICE_RETURNED_429 (rate-limit, no hibernación) STATUS=429 URL={} HEADERS={} BODY={}",
                        requestId, targetUrl, response.headers().map(), response.body());
                return response;
            }

            if (attempt > MAX_RETRIES) {
                // Se agotaron todos los reintentos (attempt llegó a 4)
                log.error("[{}] HIBERNATE_RETRY_EXHAUSTED intentos={} URL={}",
                        requestId, MAX_RETRIES, targetUrl);
                throw new HibernateRetryExhaustedException();
            }

            int waitSeconds = RETRY_DELAYS_SECONDS[attempt - 1];
            log.warn("[{}] HIBERNATE_DETECTED intento={}/{} x-render-routing={} — esperando {}s antes del siguiente intento",
                    requestId, attempt, MAX_RETRIES, renderRouting, waitSeconds);

            Thread.sleep(waitSeconds * 1000L);

            log.info("[{}] RETRY intento={}/{} url={}", requestId, attempt + 1, MAX_RETRIES + 1, targetUrl);
        }

        throw new HibernateRetryExhaustedException();
    }

    /** Excepción interna que indica que todos los reintentos por hibernación se agotaron. */
    private static final class HibernateRetryExhaustedException extends RuntimeException {
        HibernateRetryExhaustedException() {
            super("Hibernate retry exhausted after " + MAX_RETRIES + " attempts");
        }
    }
}
