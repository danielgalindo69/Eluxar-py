package com.eluxar.modules.ventas.dto;

import com.eluxar.modules.ventas.entity.Cupon;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class AdminCuponDTO {
    private Long id;
    private String codigo;
    private String tipo;
    private BigDecimal descuento;
    private BigDecimal montoMinimo;
    private Integer limiteUsos;
    private int usosActuales;
    private boolean activo;
    private LocalDateTime fechaExpiracion;
    private LocalDateTime creadoEn;

    public static AdminCuponDTO from(Cupon c) {
        return AdminCuponDTO.builder()
                .id(c.getId())
                .codigo(c.getCodigo())
                .tipo(c.getTipo().name())
                .descuento(c.getDescuento())
                .montoMinimo(c.getMontoMinimo())
                .limiteUsos(c.getLimiteUsos())
                .usosActuales(c.getUsosActuales())
                .activo(c.isActivo())
                .fechaExpiracion(c.getFechaExpiracion())
                .creadoEn(c.getCreadoEn())
                .build();
    }
}
