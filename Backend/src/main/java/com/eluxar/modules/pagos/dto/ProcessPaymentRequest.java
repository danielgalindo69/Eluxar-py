package com.eluxar.modules.pagos.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

/**
 * DTO que recibe los datos del formulario generados por el Payment Brick de Mercado Pago.
 * El Brick tokeniza la tarjeta en el navegador y expone estos campos en el callback onSubmit.
 * El backend los usa para crear el pago real via PaymentClient del SDK.
 */
@Data
public class ProcessPaymentRequest {

    /** Token de la tarjeta generado por el SDK de MP en el navegador (nunca llega el número real). */
    @NotBlank(message = "El token de la tarjeta es obligatorio")
    private String token;

    /** ID del método de pago (ej: 'visa', 'master', 'amex', 'pse'). */
    @NotBlank(message = "El método de pago es obligatorio")
    private String paymentMethodId;

    /** ID del banco emisor. Puede ser null en algunos métodos. */
    private String issuerId;

    /** Número de cuotas seleccionadas por el usuario. */
    @NotNull(message = "Las cuotas son obligatorias")
    private Integer installments;

    /** Monto total de la transacción en pesos colombianos (COP). */
    @NotNull(message = "El monto de la transacción es obligatorio")
    @Positive(message = "El monto debe ser positivo")
    private BigDecimal transactionAmount;

    /**
     * Referencia externa vinculada al pedido en nuestra base de datos.
     * Debe ser el ID del pedido (String) para que el webhook y este endpoint
     * puedan localizar el pedido a confirmar.
     */
    @NotBlank(message = "La referencia externa es obligatoria")
    private String externalReference;

    // ── Datos del pagador ──────────────────────────────────────────

    /** Email del comprador. */
    @NotBlank(message = "El email del comprador es obligatorio")
    private String payerEmail;

    /** Tipo de documento de identidad (ej: 'CC', 'CE', 'NIT'). */
    private String payerIdentificationType;

    /** Número del documento de identidad. */
    private String payerIdentificationNumber;
}
