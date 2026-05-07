package com.eluxar.modules.ventas.dto;

import com.eluxar.modules.ventas.entity.Cupon;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class CuponDTO {
    private String codigo;
    private BigDecimal descuento;
    private String tipo;       // "PORCENTAJE" | "VALOR_FIJO"
    private BigDecimal montoMinimo;

    public static CuponDTO from(Cupon c) {
        return CuponDTO.builder()
                .codigo(c.getCodigo())
                .descuento(c.getDescuento())
                .tipo(c.getTipo().name())
                .montoMinimo(c.getMontoMinimo())
                .build();
    }
}
