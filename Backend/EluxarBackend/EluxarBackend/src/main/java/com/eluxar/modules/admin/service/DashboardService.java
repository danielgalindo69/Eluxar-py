package com.eluxar.modules.admin.service;

import com.eluxar.modules.admin.dto.DashboardMetricasDTO;
import com.eluxar.modules.catalogo.repository.ProductoRepository;
import com.eluxar.modules.inventario.entity.Inventario;
import com.eluxar.modules.inventario.repository.InventarioRepository;
import com.eluxar.modules.usuarios.repository.UsuarioRepository;
import com.eluxar.modules.ventas.entity.Pedido;
import com.eluxar.modules.ventas.repository.PedidoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final UsuarioRepository usuarioRepository;
    private final ProductoRepository productoRepository;
    private final PedidoRepository pedidoRepository;
    private final InventarioRepository inventarioRepository;

    public DashboardMetricasDTO obtenerMetricas() {
        List<Pedido> pedidos = pedidoRepository.findAll();
        List<Inventario> inventarios = inventarioRepository.findAll();

        long pedidosPendientes = pedidos.stream()
                .filter(p -> p.getEstado() == Pedido.EstadoPedido.PENDIENTE || p.getEstado() == Pedido.EstadoPedido.CONFIRMADO)
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

        return DashboardMetricasDTO.builder()
                .totalUsuarios(usuarioRepository.count())
                .totalProductos(productoRepository.count())
                .totalPedidos((long) pedidos.size())
                .ingresosTotales(ingresosTotales)
                .pedidosPendientes(pedidosPendientes)
                .pedidosEntregados(pedidosEntregados)
                .productosStockBajo(productosStockBajo)
                .productosPorCategoria(new HashMap<>()) // Simplificado para demo
                .ingresosPorMes(new HashMap<>()) // Simplificado para demo
                .build();
    }
}
