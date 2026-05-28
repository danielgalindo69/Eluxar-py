package com.eluxar.modules.pagos.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO que recibe el frontend con los ítems del carrito
 * para crear una preferencia de pago en Mercado Pago.
 */
@Data
public class PaymentPreferenceRequest {

    @NotNull(message = "El nombre del comprador es obligatorio")
    private String payerName;

    @NotNull(message = "El email del comprador es obligatorio")
    private String payerEmail;

    private String externalReference;

    @NotEmpty(message = "La lista de ítems no puede estar vacía")
    @Valid
    private List<PaymentItemDTO> items;

    @Data
    public static class PaymentItemDTO {

        @NotNull(message = "El título del ítem es obligatorio")
        private String title;

        @NotNull(message = "La cantidad es obligatoria")
        @Positive(message = "La cantidad debe ser positiva")
        private Integer quantity;

        @NotNull(message = "El precio unitario es obligatorio")
        @Positive(message = "El precio debe ser positivo")
        private BigDecimal unitPrice;
    }
}
