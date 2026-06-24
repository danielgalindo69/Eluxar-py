package com.eluxar.modules.ia.service;

import com.eluxar.exception.ResourceNotFoundException;
import com.eluxar.modules.catalogo.entity.Producto;
import com.eluxar.modules.catalogo.entity.ProductoImagen;
import com.eluxar.modules.catalogo.repository.ProductoRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.io.InputStream;
import java.net.URL;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
public class AiImageService {

    @Value("${ia.service.url:http://localhost:5000}")
    private String iaServiceUrl;

    @Value("${ia.internal.api.key:}")
    private String internalApiKey;

    private final ProductoRepository productoRepository;
    private final RestTemplate restTemplate;

    public AiImageService(ProductoRepository productoRepository, RestTemplate restTemplate) {
        this.productoRepository = productoRepository;
        this.restTemplate = restTemplate;
    }

    @Transactional(readOnly = true)
    public Map<String, String> mejorarImagenConIA(Long productoId, Long imagenId, String style, String additionalPrompt) throws Exception {
        String requestId = UUID.randomUUID().toString().substring(0, 8);
        try {
            log.info("[{}] === INICIO mejorar-ia para imagenId: {}", requestId, imagenId);

            log.info("[{}] Buscando imagen en BD...", requestId);
            Producto producto = productoRepository.findById(productoId)
                    .orElseThrow(() -> new ResourceNotFoundException("Producto", productoId));

            ProductoImagen imagen = producto.getImagenes().stream()
                    .filter(i -> i.getId().equals(imagenId))
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("Imagen", imagenId));

            log.info("[{}] Imagen encontrada: {}", requestId, imagen.getUrl());
            log.info("[{}] Leyendo archivo desde Cloudinary...", requestId);
            String imageUrl = imagen.getUrl();
            byte[] imageBytes;
            try (InputStream in = new URL(imageUrl).openStream()) {
                imageBytes = in.readAllBytes();
            }

            log.info("[{}] Convirtiendo a base64 ({} bytes)...", requestId, imageBytes.length);
            String base64Image = Base64.getEncoder().encodeToString(imageBytes);

            String pythonApiUrl = iaServiceUrl + "/edit-image";
            log.info("[{}] CALL url={} method=POST timestamp={}",
                    requestId, pythonApiUrl, System.currentTimeMillis());

            Map<String, String> payload = new HashMap<>();
            payload.put("image_base64", base64Image);
            payload.put("style", style != null ? style : "");
            payload.put("additional_prompt", additionalPrompt != null ? additionalPrompt : "");

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("User-Agent", "Eluxar-Backend/1.0");
            if (internalApiKey != null && !internalApiKey.isBlank()) {
                headers.set("X-Internal-Key", internalApiKey);
            }
            HttpEntity<Map<String, String>> request = new HttpEntity<>(payload, headers);

            long startTime = System.currentTimeMillis();
            ResponseEntity<Map> response = restTemplate.postForEntity(pythonApiUrl, request, Map.class);
            long durationMs = System.currentTimeMillis() - startTime;

            log.info("[{}] RESPONSE status={} durationMs={}",
                    requestId, response.getStatusCode(), durationMs);

            // Registrar Retry-After si existe
            String retryAfter = response.getHeaders().getFirst("Retry-After");
            if (retryAfter != null) {
                log.warn("[{}] Retry-After={}", requestId, retryAfter);
            }

            if (response.getStatusCode().value() == 429) {
                log.error("[{}] FLASK_SERVICE_RETURNED_429 STATUS=429 URL={} HEADERS={} BODY={}",
                        requestId, pythonApiUrl,
                        response.getHeaders(),
                        response.getBody());
                throw new RuntimeException("El IA-service devolvió 429 Too Many Requests");
            }

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, String> result = new HashMap<>();
                result.put("edited_image_base64", (String) response.getBody().get("edited_image_base64"));
                result.put("original_image_base64", (String) response.getBody().get("original_image_base64"));
                return result;
            } else {
                log.error("[{}] Flask edit-image STATUS={} URL={} HEADERS={} BODY={}",
                        requestId, response.getStatusCode(), pythonApiUrl,
                        response.getHeaders(), response.getBody());
                throw new RuntimeException("El servicio de IA respondió con error: " + response.getStatusCode());
            }
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            log.error("[{}] HttpClientErrorException STATUS={} URL={} HEADERS={} BODY={}",
                    requestId, e.getStatusCode(), iaServiceUrl + "/edit-image",
                    e.getResponseHeaders(), e.getResponseBodyAsString());
            if (e.getStatusCode().value() == 429) {
                log.error("[{}] FLASK_SERVICE_RETURNED_429 (via HttpClientErrorException)", requestId);
            }
            throw e;
        } catch (org.springframework.web.client.RestClientException e) {
            log.error("[{}] RestClientException url={}: {}", requestId, iaServiceUrl + "/edit-image", e.getMessage(), e);
            throw e;
        } catch (Exception e) {
            log.error("[{}] === ERROR en mejorar-ia: {}", requestId, e.getMessage(), e);
            throw e;
        }
    }
}
