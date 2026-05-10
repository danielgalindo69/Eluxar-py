package com.eluxar.modules.ventas.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class CuponRequest {
    @NotBlank(message = "El código del cupón es obligatorio")
    private String codigo;

    @NotBlank(message = "El tipo de descuento es obligatorio (PORCENTAJE o VALOR_FIJO)")
    private String tipo;

    @NotNull(message = "El descuento es obligatorio")
    @Positive(message = "El descuento debe ser mayor a 0")
    private BigDecimal descuento;

    private BigDecimal montoMinimo;
    
    private Integer limiteUsos;

    private LocalDateTime fechaExpiracion;
    
    private boolean activo = true;
}
