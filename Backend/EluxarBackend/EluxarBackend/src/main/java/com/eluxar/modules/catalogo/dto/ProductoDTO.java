package com.eluxar.modules.catalogo.dto;

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
public class ProductoDTO {

    private Long id;
    private String nombre;
    private String descripcion;
    private boolean activo;
    private boolean destacado;
    private String marca;

    /**
     * Recibe y retorna la categoría como String.
     * Al crear/actualizar: se convierte a CategoriaEnum en el servicio.
     * Al leer: se serializa el nombre del Enum (ej: "CABALLERO").
     */
    private String categoria;
    private String familiaOlfativa;
    private List<VarianteDTO> variantes;

    /** Lista de URLs de Cloudinary de las imágenes del producto */
    private List<String> imagenes;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VarianteDTO {
        private Long id;
        private Integer tamanoMl;
        private String sku;
        private boolean activa;
        private BigDecimal precioVenta;
        private BigDecimal precioOferta;
        private Integer stockActual;
    }
}

