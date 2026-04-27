package com.eluxar.modules.ia.service;

import com.eluxar.modules.ia.dto.IaImageResponseDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import javax.imageio.ImageIO;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Slf4j
@Service
public class ImageIaService {

    @Value("${stability.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private static final String TEXT_TO_IMAGE_URL = "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image";
    private static final String UPLOAD_DIR = "uploads/imagenes/";

    public IaImageResponseDTO mejorarImagen(MultipartFile imagen, String estilo, String promptUsuario) {
        log.info("Iniciando flujo avanzado: Remover Fondo + IA Background + Combinación...");

        try {
            // 1. Extraer producto (Remover fondo)
            log.info("Removiendo fondo de la imagen original usando Stability AI...");
            byte[] productTransparent = removeBackground(imagen.getBytes());

            // 2. Generar nuevo fondo con IA
            log.info("Generando fondo de lujo con Stability AI...");
            byte[] background = generateBackground(estilo, promptUsuario);

            // 3. Superponer botella sobre el fondo
            log.info("Combinando producto y fondo...");
            byte[] finalImage = combineImages(background, productTransparent);

            // 4. Guardar resultado final
            String fileName = UUID.randomUUID().toString() + ".png";
            String savedUrl = guardarImagenLocalmente(finalImage, fileName);

            log.info("Flujo completado exitosamente: {}", savedUrl);

            return IaImageResponseDTO.builder()
                    .imagenUrl(savedUrl)
                    .promptUsado("luxury black background, soft shadows, golden reflections, cinematic lighting")
                    .mensaje("Imagen mejorada con éxito (Producto intacto)")
                    .build();

        } catch (Exception e) {
            log.error("Error al procesar imagen: {}", e.getMessage(), e);
            return IaImageResponseDTO.builder()
                    .mensaje(e.getMessage() != null ? e.getMessage() : "Error interno al procesar la imagen")
                    .imagenUrl(null)
                    .build();
        }
    }

    private byte[] removeBackground(byte[] originalImage) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + apiKey);
        headers.set("Accept", "application/json");
        headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        ByteArrayResource fileResource = new ByteArrayResource(originalImage) {
            @Override
            public String getFilename() {
                return "producto.png";
            }
        };
        body.add("image", fileResource);
        body.add("output_format", "png");

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(
                    "https://api.stability.ai/v2beta/stable-image/edit/remove-background", 
                    requestEntity, 
                    String.class);
                    
            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                throw new RuntimeException("Error en remove-background. Status: " + response.getStatusCode());
            }

            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(response.getBody());
            String base64Image = root.path("image").asText();
            if (base64Image == null || base64Image.isEmpty()) {
                throw new RuntimeException("Stability AI no devolvió la imagen sin fondo.");
            }
            return java.util.Base64.getDecoder().decode(base64Image);
        } catch (Exception e) {
            throw new RuntimeException("Fallo al remover fondo con Stability AI: " + e.getMessage());
        }
    }

    private byte[] generateBackground(String estilo, String customPrompt) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Accept", "application/json");
        headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)");

        String prompt = "luxury black background, soft shadows, golden reflections, cinematic lighting";
        if (estilo != null && !estilo.trim().isEmpty()) {
            prompt += ", " + estilo + " style";
        }
        if (customPrompt != null && !customPrompt.trim().isEmpty()) {
            prompt += ", " + customPrompt;
        }

        String jsonBody = "{" +
                "\"text_prompts\": [{\"text\": \"" + prompt + "\"}]," +
                "\"cfg_scale\": 7," +
                "\"height\": 1024," +
                "\"width\": 1024," +
                "\"samples\": 1," +
                "\"steps\": 30" +
                "}";

        HttpEntity<String> requestEntity = new HttpEntity<>(jsonBody, headers);
        ResponseEntity<String> response = restTemplate.postForEntity(TEXT_TO_IMAGE_URL, requestEntity, String.class);

        ObjectMapper mapper = new ObjectMapper();
        JsonNode root = mapper.readTree(response.getBody());
        JsonNode artifacts = root.path("artifacts");
        if (!artifacts.isArray() || artifacts.isEmpty()) {
            throw new RuntimeException("Stability AI no devolvió fondo generado.");
        }
        
        JsonNode firstArtifact = artifacts.get(0);
        if ("CONTENT_FILTERED".equals(firstArtifact.path("finishReason").asText())) {
            throw new RuntimeException("La IA bloqueó el fondo por filtros de seguridad.");
        }
        
        String base64Image = firstArtifact.path("base64").asText();
        return java.util.Base64.getDecoder().decode(base64Image);
    }

    private byte[] combineImages(byte[] backgroundBytes, byte[] productBytes) throws Exception {
        BufferedImage bg = ImageIO.read(new ByteArrayInputStream(backgroundBytes));
        BufferedImage product = ImageIO.read(new ByteArrayInputStream(productBytes));

        Graphics2D g2d = bg.createGraphics();
        g2d.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

        int targetHeight = (int) (bg.getHeight() * 0.75);
        double scale = (double) targetHeight / product.getHeight();
        int targetWidth = (int) (product.getWidth() * scale);

        int x = (bg.getWidth() - targetWidth) / 2;
        int y = (bg.getHeight() - targetHeight) / 2 + 50; 

        g2d.setColor(new java.awt.Color(0, 0, 0, 150));
        g2d.fillOval(x + 20, y + targetHeight - 15, targetWidth - 40, 30);

        g2d.drawImage(product, x, y, targetWidth, targetHeight, null);
        g2d.dispose();

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(bg, "png", baos);
        return baos.toByteArray();
    }

    private String guardarImagenLocalmente(byte[] imageBytes, String fileName) throws IOException {
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        Path filePath = uploadPath.resolve(fileName);
        Files.write(filePath, imageBytes);

        String baseUrl = ServletUriComponentsBuilder.fromCurrentContextPath().build().toUriString();
        return baseUrl + "/" + UPLOAD_DIR + fileName;
    }
}
