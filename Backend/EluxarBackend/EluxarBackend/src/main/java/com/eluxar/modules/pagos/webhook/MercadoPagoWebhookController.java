package com.eluxar.modules.pagos.webhook;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controlador de Webhooks de Mercado Pago.
 *
 * FASE 1 (actual): Solo recibe y loggea eventos para validar la integración.
 * FASE 2 (futura): Procesará los eventos para actualizar el estado de los pedidos
 *                  en la base de datos (aprobado → CONFIRMADO, etc.).
 *
 * Endpoint público ya que MP no puede enviar JWT. La validación de firma
 * MP se implementará en Fase 2 para mayor seguridad.
 */
@Slf4j
@RestController
@RequestMapping("/api/payments")
public class MercadoPagoWebhookController {

    /**
     * Recibe notificaciones IPN/Webhook de Mercado Pago.
     * MP envía: type (payment, merchant_order) + data.id (id del recurso)
     */
    @PostMapping("/webhook")
    public ResponseEntity<Void> handleWebhook(
            @RequestBody(required = false) Map<String, Object> payload,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String id) {

        log.info("[Webhook MP] Evento recibido — type={}, id={}", type, id);

        if (payload != null) {
            log.debug("[Webhook MP] Payload: {}", payload);
        }

        // FASE 1: Solo validar que el webhook llega correctamente
        // FASE 2: Según el type, consultar la API de MP y actualizar el pedido en BD
        if ("payment".equals(type)) {
            log.info("[Webhook MP] Pago recibido con ID: {}", id);
            // TODO FASE 2: consultar paymentService.getPaymentDetails(id)
            //              y actualizar el estado del pedido correspondiente
        }

        // Mercado Pago espera HTTP 200 para marcar el webhook como exitoso
        return ResponseEntity.ok().build();
    }
}
