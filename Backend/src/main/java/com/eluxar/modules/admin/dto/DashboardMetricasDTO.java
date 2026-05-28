package com.eluxar.modules.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
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

    // Analíticas: top productos vendidos [{ name, ventas }]
    private List<Map<String, Object>> topProductos;

    // Analíticas: volumen de ventas por mes [{ mes, total }]
    private List<Map<String, Object>> ventasMensuales;
}
