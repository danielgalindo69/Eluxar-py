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

    /**
     * Delegates the chat message to the Flask/Python AI service and returns its response.
     * The Flask service handles the MCP agent loop internally.
     */
    public ChatResponse sendMessage(ChatRequest request) {
        try {
            // Build the payload for Flask: { "message": "...", "history": [...] }
            String payload = objectMapper.writeValueAsString(java.util.Map.of(
                    "message", request.getMessage() != null ? request.getMessage() : "",
                    "history", request.getHistory() != null ? request.getHistory() : List.of()
            ));

            HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
                    .uri(URI.create(iaServiceUrl + "/chat"))
                    .header("Content-Type", "application/json")
                    .header("User-Agent", "Eluxar-Backend/1.0")
                    .timeout(Duration.ofSeconds(120)) // AI calls can be slow
                    .POST(HttpRequest.BodyPublishers.ofString(payload));
                    
            if (internalApiKey != null && !internalApiKey.isBlank()) {
                requestBuilder.header("X-Internal-Key", internalApiKey);
            }
            
            HttpRequest httpRequest = requestBuilder.build();

            HttpResponse<String> httpResponse = httpClient.send(
                    httpRequest,
                    HttpResponse.BodyHandlers.ofString()
            );

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
                log.error("Flask AI service returned HTTP {}: {}", httpResponse.statusCode(), httpResponse.body());
                return new ChatResponse(
                        "Lo siento, el servicio de IA no está disponible en este momento. Por favor, intenta de nuevo más tarde.",
                        request.getHistory() != null ? request.getHistory() : new ArrayList<>()
                );
            }

        } catch (java.net.ConnectException e) {
            log.error("Cannot connect to Flask AI service at {}: {}", iaServiceUrl + "/chat", e.getMessage());
            return new ChatResponse(
                    "El servicio de asesoría IA no está disponible en este momento. Asegúrate de que el servicio Python esté en ejecución.",
                    request.getHistory() != null ? request.getHistory() : new ArrayList<>()
            );
        } catch (Exception e) {
            log.error("Error communicating with Flask AI service: {}", e.getMessage(), e);
            return new ChatResponse(
                    "Ocurrió un error al procesar tu mensaje. Por favor, intenta de nuevo.",
                    request.getHistory() != null ? request.getHistory() : new ArrayList<>()
            );
        }
    }
}
