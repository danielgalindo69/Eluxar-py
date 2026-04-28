package com.eluxar.common.service;

import freemarker.template.Configuration;
import freemarker.template.Template;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.ui.freemarker.FreeMarkerTemplateUtils;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Servicio de envío de correos usando Resend API (HTTP REST).
 * <p>
 * NO usa JavaMailSender ni SMTP. Hace POST directo a https://api.resend.com/emails
 * con autorización Bearer y body JSON. Los templates HTML se renderizan con FreeMarker
 * antes de ser enviados.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private static final String RESEND_API_URL = "https://api.resend.com/emails";

    private final RestTemplate restTemplate;
    private final Configuration freemarkerConfig;

    @Value("${resend.api.key}")
    private String resendApiKey;

    @Value("${resend.from}")
    private String fromAddress;

    // ─── API Pública ────────────────────────────────────────────────────────────

    /**
     * Envía el correo de recuperación de contraseña usando el template password-reset.ftl.
     *
     * @param to     Dirección de email del destinatario.
     * @param nombre Nombre del usuario (para personalizar el saludo).
     * @param codigo Código de 6 dígitos en texto plano (ya fue hasheado antes de guardarse).
     */
    @Async
    public void sendPasswordResetEmail(String to, String nombre, String codigo) {
        log.info("[Resend] Preparando email de recuperación para: {}", to);
        try {
            String htmlContent = renderPasswordResetTemplate(nombre, codigo);
            sendEmail(to, "Recuperación de contraseña - Eluxar", htmlContent);
            log.info("[Resend] Email de recuperación enviado exitosamente a: {}", to);
        } catch (Exception e) {
            log.error("[Resend] Error al enviar email de recuperación a {}: {}", to, e.getMessage());
            throw new RuntimeException("No se pudo enviar el correo de recuperación. Inténtalo de nuevo.");
        }
    }

    // ─── Renderizado de Template ─────────────────────────────────────────────────

    private String renderPasswordResetTemplate(String nombre, String codigo) throws Exception {
        Template template = freemarkerConfig.getTemplate("password-reset.ftl");

        Map<String, Object> model = new HashMap<>();
        model.put("nombre", nombre);
        model.put("codigo", codigo);
        model.put("anio", LocalDate.now().getYear());

        return FreeMarkerTemplateUtils.processTemplateIntoString(template, model);
    }

    // ─── Envío via Resend API ────────────────────────────────────────────────────

    private void sendEmail(String to, String subject, String htmlContent) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(resendApiKey);

        Map<String, Object> body = new HashMap<>();
        body.put("from", fromAddress);
        body.put("to", List.of(to));
        body.put("subject", subject);
        body.put("html", htmlContent);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(RESEND_API_URL, request, Map.class);
            log.debug("[Resend] API response status: {} | id: {}",
                    response.getStatusCode(),
                    response.getBody() != null ? response.getBody().get("id") : "N/A");
        } catch (HttpClientErrorException e) {
            log.error("[Resend] Error HTTP {}: {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("Resend API respondió con error " + e.getStatusCode() + ": " + e.getResponseBodyAsString());
        } catch (Exception e) {
            log.error("[Resend] Error inesperado al contactar la API: {}", e.getMessage());
            throw new RuntimeException("No se pudo contactar Resend API: " + e.getMessage());
        }
    }
}
