package com.eluxar.modules.inventario.dto;

import com.eluxar.modules.inventario.entity.MovimientoInventario.TipoMovimiento;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MovimientoRequest {
    
    @NotNull(message = "El ID de la variante es obligatorio")
    private Long varianteId;
    
    @NotNull(message = "El tipo de movimiento es obligatorio")
    private TipoMovimiento tipo;
    
    @NotNull(message = "La cantidad es obligatoria")
    @Min(value = 1, message = "La cantidad debe ser mayor a 0")
    private Integer cantidad;
    
    private String motivo;
}
