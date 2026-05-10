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
import com.eluxar.modules.ventas.entity.Cupon;
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
    private final com.eluxar.common.service.EmailService emailService;
    private final CuponService cuponService;

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

        BigDecimal descuento = BigDecimal.ZERO;
        Cupon cuponAplicado = null;

        if (request.getCodigoDescuento() != null && !request.getCodigoDescuento().isBlank()) {
            cuponAplicado = cuponService.findAndValidate(request.getCodigoDescuento());
            
            if (cuponAplicado.getMontoMinimo() != null && subtotal.compareTo(cuponAplicado.getMontoMinimo()) < 0) {
                throw new IllegalArgumentException("El pedido no alcanza el monto mínimo para este cupón");
            }

            if (cuponAplicado.getTipo() == Cupon.TipoDescuento.PORCENTAJE) {
                descuento = subtotal.multiply(cuponAplicado.getDescuento()).divide(BigDecimal.valueOf(100));
            } else {
                descuento = cuponAplicado.getDescuento();
            }
        }

        BigDecimal total = subtotal.subtract(descuento);
        if (total.compareTo(BigDecimal.ZERO) < 0) {
            total = BigDecimal.ZERO;
        }

        Pedido pedido = Pedido.builder()
                .usuario(usuario)
                .estado(Pedido.EstadoPedido.CONFIRMADO)
                .subtotal(subtotal)
                .descuento(descuento)
                .costoEnvio(BigDecimal.ZERO) // Demo: envío gratis
                .total(total)
                .direccionEnvio(request.getDireccionCompleta())
                .metodoPago(request.getMetodoPago())
                .cuponAplicado(cuponAplicado)
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
        PedidoDTO dto = mapToDTO(pedido);
        
        // Enviar factura electrónica por Resend en segundo plano
        emailService.sendOrderSummaryEmail(dto, usuario.getEmail(), usuario.getNombre());
        
        return dto;
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

    /**
     * Permite al cliente cambiar la dirección de envío de su pedido.
     * Regla de negocio: Solo permitido en estados PENDIENTE, CONFIRMADO o EN_PROCESO.
     * Una vez ENVIADO o ENTREGADO, la dirección queda bloqueada permanentemente.
     */
    @Transactional
    public PedidoDTO cambiarDireccionEnvio(Long usuarioId, Long pedidoId, String nuevaDireccion) {
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido", pedidoId));

        // Verificar que el pedido pertenece al usuario autenticado
        if (!pedido.getUsuario().getId().equals(usuarioId)) {
            throw new IllegalArgumentException("Este pedido no pertenece a tu cuenta");
        }

        // Validar estado: solo pre-despacho
        Pedido.EstadoPedido estado = pedido.getEstado();
        boolean bloqueado = estado == Pedido.EstadoPedido.ENVIADO
                || estado == Pedido.EstadoPedido.ENTREGADO
                || estado == Pedido.EstadoPedido.CANCELADO;

        if (bloqueado) {
            throw new IllegalStateException(
                    "No es posible cambiar la dirección porque el pedido ya fue " + estado.name() +
                    ". Contacta con soporte si necesitas ayuda."
            );
        }

        pedido.setDireccionEnvio(nuevaDireccion);
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
                .direccionEnvio(pedido.getDireccionEnvio())
                .metodoPago(pedido.getMetodoPago())
                .trackingNumber(pedido.getTrackingNumber())
                .creadoEn(pedido.getCreadoEn())
                .items(pedido.getItems().stream().map(item -> {
                    String imagenUrl = item.getVariante().getProducto().getImagenes().stream()
                            .filter(com.eluxar.modules.catalogo.entity.ProductoImagen::isPrincipal)
                            .findFirst()
                            .map(com.eluxar.modules.catalogo.entity.ProductoImagen::getUrl)
                            .orElse(null);
                    return PedidoDTO.ItemDTO.builder()
                            .id(item.getId())
                            .varianteId(item.getVariante().getId())
                            .productoNombre(item.getVariante().getProducto().getNombre())
                            .tamanoMl(item.getVariante().getTamanoMl())
                            .cantidad(item.getCantidad())
                            .precioUnitario(item.getPrecioUnitario())
                            .subtotal(item.getSubtotal())
                            .imagenUrl(imagenUrl)
                            .build();
                }).toList())
                .build();
    }
}
