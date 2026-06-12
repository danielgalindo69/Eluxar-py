package com.eluxar.modules.pagos.webhook;
 
import com.eluxar.modules.ventas.service.PedidoService;
import com.mercadopago.client.payment.PaymentClient;
import com.mercadopago.resources.payment.Payment;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
 
    /**
     * Recibe notificaciones IPN/Webhook de Mercado Pago.
     * Soporta tanto parámetros de consulta (IPN clásico) como cuerpo JSON (Webhooks v1/v2).
     */
    @PostMapping("/webhook")
    public ResponseEntity<Void> handleWebhook(
            @RequestBody(required = false) Map<String, Object> payload,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String id) {
 
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
                log.error("[Webhook MP] Error al procesar la notificación del pago {}: {}", resourceId, e.getMessage(), e);
                // Retornamos 500 para que Mercado Pago reintente enviar la notificación
                return ResponseEntity.status(500).build();
            }
        }
 
        // Mercado Pago requiere una respuesta HTTP 200/201 para confirmar la recepción
        return ResponseEntity.ok().build();
    }
}
