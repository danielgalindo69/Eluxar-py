package com.eluxar.modules.pagos.webhook;
 
import com.eluxar.modules.ventas.service.PedidoService;
import com.mercadopago.client.payment.PaymentClient;
import com.mercadopago.resources.payment.Payment;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
 
import java.util.Map;
 
/**
 * Controlador de Webhooks de Mercado Pago.
 * Recibe las notificaciones de eventos de pago (IPN / Webhooks)
 * y actualiza el estado de los pedidos y el inventario correspondientes.
 */
@Slf4j
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class MercadoPagoWebhookController {
 
    private final PedidoService pedidoService;

    @Value("${mercadopago.webhook-secret}")
    private String webhookSecret;
 
    /**
     * Recibe notificaciones IPN/Webhook de Mercado Pago.
     * Soporta tanto parámetros de consulta (IPN clásico) como cuerpo JSON (Webhooks v1/v2).
     */
    @PostMapping("/webhook")
    public ResponseEntity<Void> handleWebhook(
            @RequestBody(required = false) Map<String, Object> payload,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String id,
            @RequestHeader(value = "x-signature", required = false) String xSignature,
            @RequestHeader(value = "x-request-id", required = false) String xRequestId) {
 
        String resourceId = id;
        String eventType = type;
 
        // Si el payload JSON está presente, intentar extraer los datos (formato Webhook de MP)
        if (payload != null) {
            log.debug("[Webhook MP] Payload recibido: {}", payload);
            if (eventType == null && payload.containsKey("type")) {
                eventType = String.valueOf(payload.get("type"));
            }
            if (resourceId == null && payload.containsKey("data") && payload.get("data") instanceof Map) {
                Map<?, ?> data = (Map<?, ?>) payload.get("data");
                if (data.containsKey("id")) {
                    resourceId = String.valueOf(data.get("id"));
                }
            }
        }
 
        log.info("[Webhook MP] Notificación recibida — type={}, id={}", eventType, resourceId);

        // ── VALIDACIÓN DE FIRMA HMAC-SHA256 ──────────────────────────────
        // Se valida únicamente si la clave secreta está configurada.
        if (webhookSecret != null && !webhookSecret.isBlank()) {
            boolean isSignatureValid = MPWebhookSignatureValidator.validate(resourceId, xRequestId, xSignature, webhookSecret);
            if (!isSignatureValid) {
                log.warn("[Webhook MP] Firma digital inválida. Rechazando petición de webhook para el recurso: {}", resourceId);
                return ResponseEntity.status(401).build();
            }
            log.info("[Webhook MP] Firma digital de webhook validada exitosamente.");
        }
 
        // Solo procesamos eventos relacionados con pagos ("payment")
        if ("payment".equals(eventType) && resourceId != null && !resourceId.isBlank()) {
            log.info("[Webhook MP] Iniciando consulta de detalles para el pago: {}", resourceId);
            try {
                // 1. Consultar a la API de Mercado Pago usando el SDK (enfoque Pull seguro)
                PaymentClient client = new PaymentClient();
                Payment payment = client.get(Long.parseLong(resourceId));
 
                String status = payment.getStatus();
                String externalReference = payment.getExternalReference(); // Contiene el ID del pedido
 
                log.info("[Webhook MP] Detalles obtenidos de MP: Status={}, ExternalReference (PedidoId)={}",
                        status, externalReference);
 
                if (externalReference != null && !externalReference.isBlank()) {
                    Long pedidoId = Long.parseLong(externalReference);
 
                    // 2. Procesar el estado del pago
                    if ("approved".equals(status)) {
                        pedidoService.procesarPagoAprobado(pedidoId, resourceId);
                        log.info("[Webhook MP] Pago del Pedido #{} aprobado y procesado exitosamente.", pedidoId);
                    } else if ("rejected".equals(status) || "cancelled".equals(status) || "refunded".equals(status)) {
                        pedidoService.procesarPagoRechazado(pedidoId, resourceId);
                        log.warn("[Webhook MP] Pago del Pedido #{} rechazado/cancelado (Status: {}). Pedido cancelado.", pedidoId, status);
                    } else {
                        log.info("[Webhook MP] Pago del Pedido #{} se encuentra en estado '{}'. No se toman acciones.", pedidoId, status);
                    }
                } else {
                    log.warn("[Webhook MP] La notificación de pago con ID {} no contiene external_reference.", resourceId);
                }
 
            } catch (NumberFormatException e) {
                log.error("[Webhook MP] Formato de ID de pago o pedido inválido: {}", resourceId);
            } catch (Exception e) {
                log.error("[Webhook MP] Error al procesar la notificación del pago {}: {}", resourceId, e.getMessage());
                // Si el error es de la API de MP (ej. 404 por ID de prueba falso), devolvemos 200 para que no reintente
                if (e.getClass().getName().contains("MPApiException") || e.getMessage().contains("404")) {
                    log.warn("[Webhook MP] El pago {} no se encontró en Mercado Pago (posible simulación de prueba). Ignorando.", resourceId);
                    return ResponseEntity.ok().build();
                }
                // Si es otro error (ej. base de datos), retornamos 500 para que Mercado Pago reintente enviar la notificación
                return ResponseEntity.status(500).build();
            }
        }
 
        // Mercado Pago requiere una respuesta HTTP 200/201 para confirmar la recepción
        return ResponseEntity.ok().build();
    }
}
