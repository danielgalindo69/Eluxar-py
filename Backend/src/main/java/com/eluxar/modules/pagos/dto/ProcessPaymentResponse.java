package com.eluxar.modules.pagos.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO de respuesta tras procesar un pago con el SDK de Mercado Pago.
 * Retorna al frontend el resultado para que pueda redirigir al usuario
 * a la pantalla correcta (éxito, pendiente, rechazo).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProcessPaymentResponse {

    /** ID del pago creado en Mercado Pago (ej: 9876543210). */
    private Long paymentId;

    /**
     * Estado del pago retornado por Mercado Pago:
     * - "approved"  → pago aprobado, pedido confirmado
     * - "pending"   → pago en proceso (ej: PSE, transferencia)
     * - "rejected"  → pago rechazado (fondos insuficientes, datos incorrectos)
     * - "in_process"→ en análisis antifraude
     */
    private String status;

    /**
     * Detalle del estado (ej: "accredited", "insufficient_amount", "cc_rejected_bad_filled_date").
     * Útil para dar feedback específico al usuario sobre por qué fue rechazado.
     */
    private String statusDetail;
}
