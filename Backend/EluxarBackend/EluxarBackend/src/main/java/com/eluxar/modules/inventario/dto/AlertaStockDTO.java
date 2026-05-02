package com.eluxar.modules.inventario.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlertaStockDTO {
    private Long varianteId;
    private String sku;
    private String productoNombre;
    private Integer tamanoMl;
    private Integer stockActual;
    private Integer stockMinimo;
}
