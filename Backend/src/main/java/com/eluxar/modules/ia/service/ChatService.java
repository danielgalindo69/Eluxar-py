package com.eluxar.modules.ia.service;

import com.eluxar.modules.ia.dto.ChatRequest;
import com.eluxar.modules.ia.dto.ChatResponse;
import com.eluxar.modules.ia.client.IaServiceClient;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {

    private final IaServiceClient iaServiceClient;
    private final ObjectMapper objectMapper;

    /**
     * Hace un "ping" ligero al endpoint de health del IA-service
     * para despertarlo de la hibernación silenciosamente.
     */
    public void checkHealth() {
        iaServiceClient.checkHealth();
    }

    /**
     * Delegates the chat message to the Flask/Python AI service and returns its response.
     * The Flask service handles the MCP agent loop internally.
     */
    public ChatResponse sendMessage(ChatRequest request) {
        String requestId = UUID.randomUUID().toString().substring(0, 8);
        try {
            // Build the payload for Flask: { "message": "...", "history": [...] }
            String payload = objectMapper.writeValueAsString(java.util.Map.of(
                    "message", request.getMessage() != null ? request.getMessage() : "",
                    "history", request.getHistory() != null ? request.getHistory() : List.of()
            ));

            HttpResponse<String> httpResponse = iaServiceClient.post("/chat", payload, requestId);

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
                log.error("[{}] Flask AI service STATUS={} HEADERS={} BODY={}",
                        requestId, httpResponse.statusCode(),
                        httpResponse.headers().map(), httpResponse.body());
                return new ChatResponse(
                        "Lo siento, el servicio de IA no está disponible en este momento. Por favor, intenta de nuevo más tarde.",
                        request.getHistory() != null ? request.getHistory() : new ArrayList<>()
                );
            }

        } catch (IaServiceClient.HibernateRetryExhaustedException e) {
            return new ChatResponse(
                    "Lo siento, el servicio de IA no está disponible en este momento. Por favor, intenta de nuevo más tarde.",
                    request.getHistory() != null ? request.getHistory() : new ArrayList<>()
            );
        } catch (java.net.ConnectException e) {
            log.error("[{}] Cannot connect to Flask AI service: {}", requestId, e.getMessage());
            return new ChatResponse(
                    "El servicio de asesoría IA no está disponible en este momento. Asegúrate de que el servicio Python esté en ejecución.",
                    request.getHistory() != null ? request.getHistory() : new ArrayList<>()
            );
        } catch (Exception e) {
            log.error("[{}] Error communicating with Flask AI service: {}", requestId, e.getMessage(), e);
            return new ChatResponse(
                    "Ocurrió un error al procesar tu mensaje. Por favor, intenta de nuevo.",
                    request.getHistory() != null ? request.getHistory() : new ArrayList<>()
            );
        }
    }
}
