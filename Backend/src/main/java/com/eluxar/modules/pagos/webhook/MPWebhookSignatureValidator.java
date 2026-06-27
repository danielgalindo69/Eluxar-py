package com.eluxar.modules.pagos.webhook;

import lombok.extern.slf4j.Slf4j;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

/**
 * Validador manual de firmas HMAC-SHA256 para Webhooks de Mercado Pago.
 * Implementa la verificación recomendada por Mercado Pago sin requerir actualizar
 * el SDK oficial a la rama 3.x (previniendo conflictos de dependencias).
 */
@Slf4j
public class MPWebhookSignatureValidator {

    /**
     * Valida la firma del webhook de Mercado Pago.
     *
     * @param resourceId  ID del recurso notificado (data.id o id)
     * @param xRequestId  Cabecera x-request-id recibida
     * @param xSignature  Cabecera x-signature recibida (formato: ts=TIMESTAMP,v1=HASH)
     * @param secretKey   Clave secreta del Webhook obtenida del portal de desarrolladores
     * @return true si la firma es válida, false en caso contrario
     */
    public static boolean validate(String resourceId, String xRequestId, String xSignature, String secretKey) {
        if (xSignature == null || xSignature.isBlank() || secretKey == null || secretKey.isBlank()) {
            log.warn("[MPWebhookSignatureValidator] Firma o Clave secreta nulas/vacías. Validación abortada.");
            return false;
        }

        try {
            // 1. Extraer timestamp (ts) y firma (v1) del header x-signature
            String ts = "";
            String v1 = "";
            String[] parts = xSignature.split(",");
            for (String part : parts) {
                part = part.trim();
                if (part.startsWith("ts=")) {
                    ts = part.substring(3);
                } else if (part.startsWith("v1=")) {
                    v1 = part.substring(3);
                }
            }

            if (ts.isBlank() || v1.isBlank()) {
                log.warn("[MPWebhookSignatureValidator] Cabecera x-signature inválida o incompleta: {}", xSignature);
                return false;
            }

            // 2. Construir el manifiesto en el formato exacto:
            // id:<data.id>;request-id:<x-request-id>;ts:<ts>;
            // Importante: Si el ID contiene letras, deben convertirse a minúsculas.
            StringBuilder manifestBuilder = new StringBuilder();
            if (resourceId != null && !resourceId.isBlank()) {
                manifestBuilder.append("id:").append(resourceId.trim().toLowerCase()).append(";");
            }
            if (xRequestId != null && !xRequestId.isBlank()) {
                manifestBuilder.append("request-id:").append(xRequestId.trim()).append(";");
            }
            manifestBuilder.append("ts:").append(ts).append(";");

            String manifest = manifestBuilder.toString();
            log.debug("[MPWebhookSignatureValidator] Manifiesto construido para validación: '{}'", manifest);

            // 3. Generar el hash HMAC-SHA256 usando el secretKey
            Mac hmac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            hmac.init(secretKeySpec);
            byte[] hashBytes = hmac.doFinal(manifest.getBytes(StandardCharsets.UTF_8));

            // Convertir a cadena hexadecimal
            StringBuilder hexString = new StringBuilder();
            for (byte b : hashBytes) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            String calculatedHash = hexString.toString();

            // 4. Comparación en tiempo constante para evitar ataques de temporización (timing attacks)
            boolean isValid = safeEquals(calculatedHash, v1);
            if (!isValid) {
                log.warn("[MPWebhookSignatureValidator] Validación fallida. Esperado: v1={}, Calculado={}", v1, calculatedHash);
            }
            return isValid;

        } catch (Exception e) {
            log.error("[MPWebhookSignatureValidator] Error al validar firma del webhook: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * Comparador de cadenas en tiempo constante para mitigar ataques de temporización.
     */
    private static boolean safeEquals(String a, String b) {
        if (a == null || b == null) {
            return false;
        }
        if (a.length() != b.length()) {
            return false;
        }
        int result = 0;
        for (int i = 0; i < a.length(); i++) {
            result |= a.charAt(i) ^ b.charAt(i);
        }
        return result == 0;
    }
}
