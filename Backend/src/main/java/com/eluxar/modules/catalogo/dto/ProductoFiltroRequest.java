package com.eluxar.modules.catalogo.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProductoFiltroRequest {

    private String nombre;
    /** Filtro por categoría usando el valor del Enum: CABALLERO, DAMA, NINO, NINA */
    private String categoria;
    private Long marcaId;
    private BigDecimal precioMin;
    private BigDecimal precioMax;
    private Boolean soloDestacados;
    private Boolean soloActivos;
}
