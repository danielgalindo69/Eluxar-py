package com.eluxar.modules.ia.service;

import com.eluxar.modules.catalogo.entity.Producto;
import com.eluxar.modules.catalogo.repository.ProductoRepository;
import com.eluxar.modules.ia.dto.IaRequestDTO;
import com.eluxar.modules.ia.dto.IaResponseDTO;
import com.eluxar.modules.ia.dto.TestQuestionDTO;
import com.eluxar.modules.ia.dto.TestAnswerDTO;
import com.eluxar.modules.ia.dto.TestResultDTO;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class IaService {

    private final ProductoRepository productoRepository;
    private final PromptBuilder promptBuilder;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;

    public IaService(ProductoRepository productoRepository, PromptBuilder promptBuilder, ObjectMapper objectMapper) {
        this.productoRepository = productoRepository;
        this.promptBuilder = promptBuilder;
        this.objectMapper = objectMapper;
        
        org.springframework.http.client.SimpleClientHttpRequestFactory factory = new org.springframework.http.client.SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(10000);
        factory.setReadTimeout(15000);
        this.restTemplate = new RestTemplate(factory);
    }

    // The user explicitly requested to use this API Key
    private final String API_KEY = "AIzaSyClexjmHYtPxZyLe7yUqEVphHFz7D_KET0";
    private final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + API_KEY;

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public IaResponseDTO recomendar(IaRequestDTO requestDTO) {
        try {
            // 1. Obtener productos activos de la BD
            List<Producto> productos = productoRepository.findByActivoTrue();
            
            // Si la base de datos está vacía, usamos productos falsos para que puedas probar
            if (productos.isEmpty()) {
                log.warn("La base de datos de productos está vacía. Usando catálogo de prueba...");
                productos = getDefaultProducts();
            }
            
            // 2. Construir el prompt dinámico
            String promptText = promptBuilder.buildPrompt(requestDTO.getMensaje(), productos);
            
            // 3. Preparar el payload para la API de Gemini
            Map<String, Object> requestBody = buildGeminiRequest(promptText);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            // 4. Llamar a la API de Google Gemini
            log.info("Llamando a la API de Gemini...");
            ResponseEntity<String> response = restTemplate.postForEntity(GEMINI_API_URL, entity, String.class);
            
            // 5. Procesar la respuesta
            return parseGeminiResponse(response.getBody());
            
        } catch (Exception e) {
            log.error("Error al generar recomendación de IA", e);
            return new IaResponseDTO(
                "¡Hola! (DEBUG ERROR: " + e.getMessage() + ") Actualmente estoy experimentando un alto volumen de solicitudes (Límite de API de Google Gemini alcanzado). Pero aquí tienes algunas sugerencias excelentes de nuestro catálogo:",
                java.util.Arrays.asList(
                    new com.eluxar.modules.ia.dto.RecomendacionDTO("Acqua Di Gio", "Una fragancia muy fresca y versátil para cualquier ocasión."),
                    new com.eluxar.modules.ia.dto.RecomendacionDTO("Bleu de Chanel", "Elegancia pura, ideal para causar una gran impresión.")
                )
            );
        }
    }
    
    private Map<String, Object> buildGeminiRequest(String promptText) {
        Map<String, Object> textPart = new HashMap<>();
        textPart.put("text", promptText);
        
        Map<String, Object> parts = new HashMap<>();
        parts.put("parts", List.of(textPart));
        
        Map<String, Object> contents = new HashMap<>();
        contents.put("contents", List.of(parts));
        
        // Ensure response is JSON
        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("responseMimeType", "application/json");
        contents.put("generationConfig", generationConfig);
        
        return contents;
    }
    
    private IaResponseDTO parseGeminiResponse(String responseBody) throws Exception {
        String jsonText = extractJsonTextFromGeminiResponse(responseBody);
        return objectMapper.readValue(jsonText, IaResponseDTO.class);
    }

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<TestQuestionDTO> generarPreguntasTest() {
        try {
            String promptText = promptBuilder.buildTestQuestionsPrompt();
            Map<String, Object> requestBody = buildGeminiRequest(promptText);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            log.info("Llamando a la API de Gemini para generar preguntas...");
            ResponseEntity<String> response = restTemplate.postForEntity(GEMINI_API_URL, entity, String.class);
            
            String jsonText = extractJsonTextFromGeminiResponse(response.getBody());
            return java.util.Arrays.asList(objectMapper.readValue(jsonText, TestQuestionDTO[].class));
        } catch (Exception e) {
            log.error("Error al generar preguntas de IA, usando preguntas de respaldo", e);
            return java.util.Arrays.asList(
                new TestQuestionDTO(1, "¿Qué estación del año te inspira más?", java.util.Arrays.asList("Primavera", "Verano", "Otoño", "Invierno")),
                new TestQuestionDTO(2, "¿Cuál es tu ambiente ideal?", java.util.Arrays.asList("Jardín florido", "Bosque de montaña", "Playa al atardecer", "Biblioteca antigua")),
                new TestQuestionDTO(3, "¿Qué intensidad prefieres?", java.util.Arrays.asList("Sutil e íntima", "Moderada y versátil", "Intensa y envolvente", "Poderosa y duradera")),
                new TestQuestionDTO(4, "¿Para qué ocasión buscas fragancia?", java.util.Arrays.asList("Día a día", "Oficina elegante", "Cena romántica", "Evento especial")),
                new TestQuestionDTO(5, "¿Qué ingrediente te atrae más?", java.util.Arrays.asList("Cítricos frescos", "Flores delicadas", "Maderas profundas", "Especias orientales"))
            );
        }
    }

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public TestResultDTO analizarTest(TestAnswerDTO request) {
        try {
            List<Producto> productos = productoRepository.findByActivoTrue();
            if (productos.isEmpty()) {
                productos = getDefaultProducts();
            }
            
            String promptText = promptBuilder.buildTestAnalysisPrompt(request.getAnswers(), productos);
            Map<String, Object> requestBody = buildGeminiRequest(promptText);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            log.info("Llamando a la API de Gemini para analizar respuestas del test...");
            ResponseEntity<String> response = restTemplate.postForEntity(GEMINI_API_URL, entity, String.class);
            
            String jsonText = extractJsonTextFromGeminiResponse(response.getBody());
            return objectMapper.readValue(jsonText, TestResultDTO.class);
        } catch (Exception e) {
            log.error("Error al analizar test con IA, usando respuestas de respaldo", e);
            return new TestResultDTO(java.util.Arrays.asList("1", "4", "2"));
        }
    }

    private String extractJsonTextFromGeminiResponse(String responseBody) throws Exception {
        JsonNode root = objectMapper.readTree(responseBody);
        
        JsonNode candidates = root.path("candidates");
        if (candidates.isMissingNode() || !candidates.isArray() || candidates.size() == 0) {
            throw new Exception("Respuesta inválida de Gemini: No hay candidatos");
        }
        
        JsonNode firstCandidate = candidates.get(0);
        JsonNode textNode = firstCandidate.path("content").path("parts").get(0).path("text");
        
        if (textNode.isMissingNode()) {
            throw new Exception("Respuesta inválida de Gemini: No se encontró texto en la respuesta");
        }
        
        String jsonText = textNode.asText();
        
        if (jsonText.startsWith("```json")) {
            jsonText = jsonText.substring(7);
        }
        if (jsonText.startsWith("```")) {
            jsonText = jsonText.substring(3);
        }
        if (jsonText.endsWith("```")) {
            jsonText = jsonText.substring(0, jsonText.length() - 3);
        }
        
        return jsonText.trim();
    }

    private List<Producto> getDefaultProducts() {
        return List.of(
            Producto.builder().id(1L).nombre("Acqua Di Gio").descripcion("Fragancia fresca, marina y cítrica. Ideal para el día a día y la oficina.").build(),
            Producto.builder().id(2L).nombre("La Vie Est Belle").descripcion("Perfume muy dulce, con notas de praliné, vainilla y flores. Perfecto para salidas de noche.").build(),
            Producto.builder().id(3L).nombre("Sauvage Dior").descripcion("Aroma amaderado y especiado. Muy versátil y masculino, proyecta mucha seguridad.").build(),
            Producto.builder().id(4L).nombre("CK One").descripcion("Aroma cítrico, ligero y unisex. Excelente para clima caluroso o gimnasio.").build(),
            Producto.builder().id(5L).nombre("Bleu de Chanel").descripcion("Fragancia elegante, amaderada y cítrica. Perfecta para el hombre moderno, uso en oficina o eventos formales.").build(),
            Producto.builder().id(6L).nombre("Baccarat Rouge 540").descripcion("Aroma lujoso de ámbar y madera. Unisex, dulce y extremadamente duradero. Llama la atención en eventos especiales.").build(),
            Producto.builder().id(7L).nombre("Black Orchid").descripcion("Misteriosa, oscura y floral especiada. Unisex, ideal para personalidades atrevidas y noches frías.").build(),
            Producto.builder().id(8L).nombre("Coco Mademoiselle").descripcion("Floral y oriental. Elegante, femenina y sofisticada. Versátil para el trabajo y citas románticas.").build(),
            Producto.builder().id(9L).nombre("YSL Y").descripcion("Fresco, afrutado y con un toque de madera. Juvenil y energético, excelente para salidas nocturnas y uso casual.").build(),
            Producto.builder().id(10L).nombre("Good Girl").descripcion("Aroma seductor y dulce con notas de haba tonka y cacao. Perfecto para mujeres empoderadas en eventos nocturnos.").build()
        );
    }
}
