package com.eluxar.modules.ventas.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PedidoDTO {

    private Long id;
    private String estado;
    private BigDecimal subtotal;
    private BigDecimal descuento;
    private BigDecimal costoEnvio;
    private BigDecimal total;
    private LocalDateTime creadoEn;
    private List<ItemDTO> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ItemDTO {
        private Long id;
        private Long varianteId;
        private String productoNombre;
        private Integer tamanoMl;
        private Integer cantidad;
        private BigDecimal precioUnitario;
        private BigDecimal subtotal;
    }
}
