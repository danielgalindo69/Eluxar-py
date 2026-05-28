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

@Slf4j
@Service
@RequiredArgsConstructor
public class FragranceTestService {

    @org.springframework.beans.factory.annotation.Value("${ia.service.url:http://localhost:5000}")
    private String iaServiceUrl;

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    /**
     * Delegates a fragrance test step to the Flask/Python AI service.
     * Steps 0-6 return questions with options; the final step returns an AI recommendation.
     */
    public FragranceTestResponse processTest(FragranceTestRequest request) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("message", request.getMessage() != null ? request.getMessage() : "");
            payload.put("history", request.getHistory() != null ? request.getHistory() : List.of());
            payload.put("step", request.getStep());

            String jsonPayload = objectMapper.writeValueAsString(payload);

            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(iaServiceUrl + "/fragrance-test"))
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofSeconds(120))
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                    .build();

            HttpResponse<String> httpResponse = httpClient.send(
                    httpRequest,
                    HttpResponse.BodyHandlers.ofString()
            );

            if (httpResponse.statusCode() >= 200 && httpResponse.statusCode() < 300) {
                return objectMapper.readValue(httpResponse.body(), FragranceTestResponse.class);
            } else {
                log.error("Flask fragrance-test returned HTTP {}: {}", httpResponse.statusCode(), httpResponse.body());
                return buildErrorResponse(request, "El servicio de IA no está disponible. Intenta de nuevo más tarde.");
            }

        } catch (java.net.ConnectException e) {
            log.error("Cannot connect to Flask fragrance-test at {}: {}", iaServiceUrl + "/fragrance-test", e.getMessage());
            return buildErrorResponse(request, "El servicio de test olfativo no está disponible. Asegúrate de que el servicio Python esté en ejecución.");
        } catch (Exception e) {
            log.error("Error communicating with Flask fragrance-test: {}", e.getMessage(), e);
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
