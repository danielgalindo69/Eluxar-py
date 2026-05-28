package com.eluxar.modules.ventas.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CarritoDTO {

    private Long id;
    private List<ItemDTO> items;
    private BigDecimal subtotal;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ItemDTO {
        private Long id;
        private Long varianteId;
        private String productoNombre;
        private Integer tamanoMl;
        private String sku;
        private Integer cantidad;
        private BigDecimal precioUnitario;
        private BigDecimal subtotal;
        private String imagenUrl;
    }
}
