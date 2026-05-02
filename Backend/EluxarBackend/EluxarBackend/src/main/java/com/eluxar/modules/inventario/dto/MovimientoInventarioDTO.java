package com.eluxar.modules.inventario.dto;

import com.eluxar.modules.inventario.entity.MovimientoInventario.TipoMovimiento;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class MovimientoInventarioDTO {
    private Long id;
    private Long varianteId;
    private String productoNombre;
    private String tamanoMl;
    private TipoMovimiento tipo;
    private Integer cantidad;
    private String motivo;
    private LocalDateTime fecha;
    private String usuario;
}
