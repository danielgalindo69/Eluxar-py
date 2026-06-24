package com.eluxar.modules.ia.service;

import com.eluxar.modules.ia.dto.FragranceTestRequest;
import com.eluxar.modules.ia.dto.FragranceTestResponse;
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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class FragranceTestService {

    @org.springframework.beans.factory.annotation.Value("${ia.service.url:http://localhost:5000}")
    private String iaServiceUrl;

    @org.springframework.beans.factory.annotation.Value("${ia.internal.api.key:}")
    private String internalApiKey;

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    /**
     * Delegates a fragrance test step to the Flask/Python AI service.
     * Steps 0-6 return questions with options; the final step returns an AI recommendation.
     */
    public FragranceTestResponse processTest(FragranceTestRequest request) {
        String requestId = UUID.randomUUID().toString().substring(0, 8);
        String targetUrl = iaServiceUrl + "/fragrance-test";
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("message", request.getMessage() != null ? request.getMessage() : "");
            payload.put("history", request.getHistory() != null ? request.getHistory() : List.of());
            payload.put("step", request.getStep());

            String jsonPayload = objectMapper.writeValueAsString(payload);

            HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
                    .uri(URI.create(targetUrl))
                    .header("Content-Type", "application/json")
                    .header("User-Agent", "Eluxar-Backend/1.0")
                    .timeout(Duration.ofSeconds(120))
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload));

            if (internalApiKey != null && !internalApiKey.isBlank()) {
                requestBuilder.header("X-Internal-Key", internalApiKey);
            }

            HttpRequest httpRequest = requestBuilder.build();

            log.info("[{}] CALL url={} method=POST step={} timestamp={}",
                    requestId, targetUrl, request.getStep(), System.currentTimeMillis());

            long startTime = System.currentTimeMillis();
            HttpResponse<String> httpResponse = httpClient.send(
                    httpRequest,
                    HttpResponse.BodyHandlers.ofString()
            );
            long durationMs = System.currentTimeMillis() - startTime;

            log.info("[{}] RESPONSE status={} durationMs={}",
                    requestId, httpResponse.statusCode(), durationMs);

            // Registrar Retry-After si existe
            Optional<String> retryAfter = httpResponse.headers().firstValue("Retry-After");
            retryAfter.ifPresent(v -> log.warn("[{}] Retry-After={}", requestId, v));

            if (httpResponse.statusCode() == 429) {
                log.error("[{}] FLASK_SERVICE_RETURNED_429 STATUS=429 URL={} HEADERS={} BODY={}",
                        requestId, targetUrl,
                        httpResponse.headers().map(),
                        httpResponse.body());
                return buildErrorResponse(request, "El servicio de IA no está disponible. Intenta de nuevo más tarde.");
            }

            if (httpResponse.statusCode() >= 200 && httpResponse.statusCode() < 300) {
                return objectMapper.readValue(httpResponse.body(), FragranceTestResponse.class);
            } else {
                log.error("[{}] Flask fragrance-test STATUS={} URL={} HEADERS={} BODY={}",
                        requestId, httpResponse.statusCode(), targetUrl,
                        httpResponse.headers().map(), httpResponse.body());
                return buildErrorResponse(request, "El servicio de IA no está disponible. Intenta de nuevo más tarde.");
            }

        } catch (java.net.ConnectException e) {
            log.error("[{}] Cannot connect to Flask fragrance-test at {}: {}", requestId, targetUrl, e.getMessage());
            return buildErrorResponse(request, "El servicio de test olfativo no está disponible. Asegúrate de que el servicio Python esté en ejecución.");
        } catch (Exception e) {
            log.error("[{}] Error communicating with Flask fragrance-test url={}: {}", requestId, targetUrl, e.getMessage(), e);
            return buildErrorResponse(request, "Ocurrió un error al procesar el test. Intenta de nuevo.");
        }
    }

    private FragranceTestResponse buildErrorResponse(FragranceTestRequest request, String message) {
        FragranceTestResponse response = new FragranceTestResponse();
        response.setResponse(message);
        response.setHistory(request.getHistory() != null ? request.getHistory() : new ArrayList<>());
        response.setStep(request.getStep());
        response.setFinished(true);
        response.setTotalSteps(7);
        return response;
    }
}
