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

@Slf4j
@Service
public class AiImageService {

    @Value("${ia.service.url:http://localhost:5000}")
    private String iaServiceUrl;

    private final ProductoRepository productoRepository;
    private final RestTemplate restTemplate;

    public AiImageService(ProductoRepository productoRepository, RestTemplate restTemplate) {
        this.productoRepository = productoRepository;
        this.restTemplate = restTemplate;
    }

    @Transactional(readOnly = true)
    public Map<String, String> mejorarImagenConIA(Long productoId, Long imagenId, String style, String additionalPrompt) throws Exception {
        try {
            log.info("=== INICIO mejorar-ia para imagenId: {}", imagenId);

            log.info("Buscando imagen en BD...");
            Producto producto = productoRepository.findById(productoId)
                    .orElseThrow(() -> new ResourceNotFoundException("Producto", productoId));

            ProductoImagen imagen = producto.getImagenes().stream()
                    .filter(i -> i.getId().equals(imagenId))
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("Imagen", imagenId));

            log.info("Imagen encontrada: {}", imagen.getUrl());
            log.info("Leyendo archivo desde Cloudinary...");
            String imageUrl = imagen.getUrl();
            byte[] imageBytes;
            try (InputStream in = new URL(imageUrl).openStream()) {
                imageBytes = in.readAllBytes();
            }

            log.info("Convirtiendo a base64...");
            String base64Image = Base64.getEncoder().encodeToString(imageBytes);

            String pythonApiUrl = iaServiceUrl + "/edit-image";
            log.info("Llamando a ai-service en: {}", pythonApiUrl);

            Map<String, String> payload = new HashMap<>();
            payload.put("image_base64", base64Image);
            payload.put("style", style != null ? style : "");
            payload.put("additional_prompt", additionalPrompt != null ? additionalPrompt : "");

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, String>> request = new HttpEntity<>(payload, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(pythonApiUrl, request, Map.class);

            log.info("Respuesta recibida del ai-service con status: {}", response.getStatusCode());
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, String> result = new HashMap<>();
                result.put("edited_image_base64", (String) response.getBody().get("edited_image_base64"));
                result.put("original_image_base64", (String) response.getBody().get("original_image_base64"));
                return result;
            } else {
                throw new RuntimeException("El servicio de IA respondió con error: " + response.getStatusCode());
            }
        } catch (Exception e) {
            log.error("=== ERROR en mejorar-ia: {}", e.getMessage(), e);
            throw e;
        }
    }
}
