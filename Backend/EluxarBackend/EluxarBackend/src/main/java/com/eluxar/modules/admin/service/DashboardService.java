package com.eluxar.modules.admin.service;

import com.eluxar.modules.admin.dto.DashboardMetricasDTO;
import com.eluxar.modules.catalogo.repository.ProductoRepository;
import com.eluxar.modules.inventario.entity.Inventario;
import com.eluxar.modules.inventario.repository.InventarioRepository;
import com.eluxar.modules.usuarios.repository.UsuarioRepository;
import com.eluxar.modules.ventas.entity.Pedido;
import com.eluxar.modules.ventas.entity.PedidoItem;
import com.eluxar.modules.ventas.repository.PedidoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final UsuarioRepository usuarioRepository;
    private final ProductoRepository productoRepository;
    private final PedidoRepository pedidoRepository;
    private final InventarioRepository inventarioRepository;

    private static final DateTimeFormatter MONTH_FMT = DateTimeFormatter.ofPattern("MMM yyyy", new Locale("es", "CO"));
    private static final String[] MONTH_NAMES = {"Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"};

    public DashboardMetricasDTO obtenerMetricas() {
        List<Pedido> pedidos = pedidoRepository.findAll();
        List<Inventario> inventarios = inventarioRepository.findAll();

        // ── KPIs básicos ─────────────────────────────────────────
        long pedidosPendientes = pedidos.stream()
                .filter(p -> p.getEstado() == Pedido.EstadoPedido.PENDIENTE
                          || p.getEstado() == Pedido.EstadoPedido.CONFIRMADO)
                .count();

        long pedidosEntregados = pedidos.stream()
                .filter(p -> p.getEstado() == Pedido.EstadoPedido.ENTREGADO)
                .count();

        BigDecimal ingresosTotales = pedidos.stream()
                .filter(p -> p.getEstado() != Pedido.EstadoPedido.CANCELADO)
                .map(Pedido::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int productosStockBajo = (int) inventarios.stream()
                .filter(i -> i.getStockActual() <= i.getStockMinimo())
                .count();

        // ── Top Productos más vendidos ────────────────────────────
        // Recorrer todos los items de pedidos no cancelados y agrupar por nombre de producto
        Map<String, Long> ventasPorProducto = pedidos.stream()
                .filter(p -> p.getEstado() != Pedido.EstadoPedido.CANCELADO)
                .flatMap(p -> p.getItems().stream())
                .collect(Collectors.groupingBy(
                        item -> item.getVariante().getProducto().getNombre(),
                        Collectors.summingLong(item -> item.getCantidad().longValue())
                ));

        List<Map<String, Object>> topProductos = ventasPorProducto.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(5)
                .map(e -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("name", e.getKey());
                    m.put("ventas", e.getValue());
                    return m;
                })
                .collect(Collectors.toList());

        // ── Volumen de ventas mensuales (últimos 12 meses) ────────
        // Acumular totales por (año, mes)
        Map<String, BigDecimal> totalesPorMes = new LinkedHashMap<>();
        // Inicializar los 12 meses con 0 para que el gráfico siempre tenga 12 columnas
        Calendar cal = Calendar.getInstance();
        for (int i = 11; i >= 0; i--) {
            Calendar c = Calendar.getInstance();
            c.add(Calendar.MONTH, -i);
            String key = MONTH_NAMES[c.get(Calendar.MONTH)] + " " + c.get(Calendar.YEAR);
            totalesPorMes.put(key, BigDecimal.ZERO);
        }

        pedidos.stream()
                .filter(p -> p.getEstado() != Pedido.EstadoPedido.CANCELADO
                          && p.getCreadoEn() != null)
                .forEach(p -> {
                    String key = MONTH_NAMES[p.getCreadoEn().getMonthValue() - 1]
                               + " " + p.getCreadoEn().getYear();
                    totalesPorMes.computeIfPresent(key, (k, v) -> v.add(p.getTotal()));
                });

        List<Map<String, Object>> ventasMensuales = totalesPorMes.entrySet().stream()
                .map(e -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    // El frontend espera "month" para el eje X y "total" para el valor
                    m.put("month", e.getKey().split(" ")[0]); // Solo "Ene", "Feb"...
                    m.put("total", e.getValue());
                    return m;
                })
                .collect(Collectors.toList());

        return DashboardMetricasDTO.builder()
                .totalUsuarios(usuarioRepository.count())
                .totalProductos(productoRepository.count())
                .totalPedidos((long) pedidos.size())
                .ingresosTotales(ingresosTotales)
                .pedidosPendientes(pedidosPendientes)
                .pedidosEntregados(pedidosEntregados)
                .productosStockBajo(productosStockBajo)
                .topProductos(topProductos)
                .ventasMensuales(ventasMensuales)
                .build();
    }
}
