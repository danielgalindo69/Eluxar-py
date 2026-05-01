package com.eluxar.modules.ventas.service;

import com.eluxar.exception.ResourceNotFoundException;
import com.eluxar.exception.StockInsuficienteException;
import com.eluxar.modules.inventario.entity.Inventario;
import com.eluxar.modules.inventario.entity.MovimientoInventario;
import com.eluxar.modules.inventario.repository.InventarioRepository;
import com.eluxar.modules.inventario.repository.MovimientoRepository;
import com.eluxar.modules.usuarios.repository.UsuarioRepository;
import com.eluxar.modules.ventas.dto.CheckoutRequest;
import com.eluxar.modules.ventas.dto.PedidoDTO;
import com.eluxar.modules.ventas.entity.Carrito;
import com.eluxar.modules.ventas.entity.CarritoItem;
import com.eluxar.modules.ventas.entity.Pedido;
import com.eluxar.modules.ventas.entity.PedidoItem;
import com.eluxar.modules.ventas.repository.CarritoRepository;
import com.eluxar.modules.ventas.repository.PedidoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final CarritoRepository carritoRepository;
    private final InventarioRepository inventarioRepository;
    private final MovimientoRepository movimientoRepository;
    private final UsuarioRepository usuarioRepository;

    @Transactional
    public PedidoDTO crearDesdeCarrito(Long usuarioId, CheckoutRequest request) {
        Carrito carrito = carritoRepository.findByUsuarioIdAndActivoTrue(usuarioId)
                .orElseThrow(() -> new IllegalArgumentException("No hay carrito activo"));

        if (carrito.getItems() == null || carrito.getItems().isEmpty()) {
            throw new IllegalArgumentException("El carrito está vacío");
        }

        var usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", usuarioId));

        BigDecimal subtotal = BigDecimal.ZERO;
        for (CarritoItem item : carrito.getItems()) {
            subtotal = subtotal.add(item.getPrecioUnitario().multiply(BigDecimal.valueOf(item.getCantidad())));
        }

        Pedido pedido = Pedido.builder()
                .usuario(usuario)
                .estado(Pedido.EstadoPedido.CONFIRMADO)
                .subtotal(subtotal)
                .descuento(BigDecimal.ZERO)
                .costoEnvio(BigDecimal.ZERO) // Demo: envío gratis
                .total(subtotal)
                .build();

        pedido = pedidoRepository.save(pedido);

        for (CarritoItem item : carrito.getItems()) {
            // Regla de Negocio #1: Al confirmar pedido -> descontar stockActual del inventario
            Inventario inventario = inventarioRepository.findByVarianteId(item.getVariante().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Inventario", item.getVariante().getId()));

            if (inventario.getStockActual() < item.getCantidad()) {
                throw new StockInsuficienteException(item.getVariante().getId(), inventario.getStockActual(), item.getCantidad());
            }

            // Descontar inventario
            inventario.setStockActual(inventario.getStockActual() - item.getCantidad());
            inventarioRepository.save(inventario);

            // Registrar movimiento de salida
            movimientoRepository.save(MovimientoInventario.builder()
                    .inventario(inventario)
                    .tipo(MovimientoInventario.TipoMovimiento.SALIDA)
                    .cantidad(item.getCantidad())
                    .motivo("Venta Pedido #" + pedido.getId())
                    .build());

            // Crear item del pedido
            PedidoItem pedidoItem = PedidoItem.builder()
                    .pedido(pedido)
                    .variante(item.getVariante())
                    .cantidad(item.getCantidad())
                    .precioUnitario(item.getPrecioUnitario())
                    .subtotal(item.getPrecioUnitario().multiply(BigDecimal.valueOf(item.getCantidad())))
                    .build();

            pedido.getItems().add(pedidoItem);
        }

        // Desactivar carrito
        carrito.setActivo(false);
        carritoRepository.save(carrito);

        pedido = pedidoRepository.save(pedido);
        return mapToDTO(pedido);
    }

    public List<PedidoDTO> listarMisPedidos(Long usuarioId) {
        return pedidoRepository.findByUsuarioIdOrderByCreadoEnDesc(usuarioId).stream()
                .map(this::mapToDTO)
                .toList();
    }

    public List<PedidoDTO> listarTodos() {
        return pedidoRepository.findAll(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "creadoEn")).stream()
                .map(this::mapToDTO)
                .toList();
    }

    public PedidoDTO obtenerPorId(Long usuarioId, Long pedidoId, boolean esAdmin) {
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido", pedidoId));

        if (!esAdmin && !pedido.getUsuario().getId().equals(usuarioId)) {
            throw new IllegalArgumentException("El pedido no pertenece a tu cuenta");
        }

        return mapToDTO(pedido);
    }

    @Transactional
    public PedidoDTO actualizarEstado(Long pedidoId, String nuevoEstado) {
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido", pedidoId));

        pedido.setEstado(Pedido.EstadoPedido.valueOf(nuevoEstado));
        return mapToDTO(pedidoRepository.save(pedido));
    }

    private PedidoDTO mapToDTO(Pedido pedido) {
        return PedidoDTO.builder()
                .id(pedido.getId())
                .clienteNombre(pedido.getUsuario().getNombre() + " " + pedido.getUsuario().getApellido())
                .estado(pedido.getEstado().name())
                .subtotal(pedido.getSubtotal())
                .descuento(pedido.getDescuento())
                .costoEnvio(pedido.getCostoEnvio())
                .total(pedido.getTotal())
                .creadoEn(pedido.getCreadoEn())
                .items(pedido.getItems().stream().map(item -> PedidoDTO.ItemDTO.builder()
                        .id(item.getId())
                        .varianteId(item.getVariante().getId())
                        .productoNombre(item.getVariante().getProducto().getNombre())
                        .tamanoMl(item.getVariante().getTamanoMl())
                        .cantidad(item.getCantidad())
                        .precioUnitario(item.getPrecioUnitario())
                        .subtotal(item.getSubtotal())
                        .build()).toList())
                .build();
    }
}
