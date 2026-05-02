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
public class ActualizacionPrecioMasivaRequest {
    private List<ActualizacionPrecioVariante> actualizaciones;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ActualizacionPrecioVariante {
        private Long varianteId;
        private BigDecimal nuevoPrecioVenta;
        private BigDecimal nuevoPrecioOferta;
        private BigDecimal nuevoPrecioCosto;
    }
}
