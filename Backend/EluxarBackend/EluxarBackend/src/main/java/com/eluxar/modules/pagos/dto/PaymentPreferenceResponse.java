package com.eluxar.modules.pagos.dto;

import lombok.Builder;
import lombok.Data;

/**
 * DTO de respuesta que retorna el preferenceId al frontend
 * para que pueda inicializar el Checkout Brick de Mercado Pago.
 */
@Data
@Builder
public class PaymentPreferenceResponse {

    /** ID de preferencia generado por la API de Mercado Pago */
    private String preferenceId;

    /** URL de pago en sandbox (init_point) – útil para debugging */
    private String sandboxInitPoint;
}
