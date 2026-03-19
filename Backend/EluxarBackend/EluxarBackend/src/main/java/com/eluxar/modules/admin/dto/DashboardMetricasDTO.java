package com.eluxar.modules.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardMetricasDTO {
    
    // Totales generales
    private Long totalUsuarios;
    private Long totalProductos;
    private Long totalPedidos;
    
    // Ventas
    private BigDecimal ingresosTotales;
    private Long pedidosPendientes;
    private Long pedidosEntregados;
    
    // Inventario
    private Integer productosStockBajo;
    
    // Distribución
    private Map<String, Long> productosPorCategoria;
    private Map<String, Long> ingresosPorMes;
}
