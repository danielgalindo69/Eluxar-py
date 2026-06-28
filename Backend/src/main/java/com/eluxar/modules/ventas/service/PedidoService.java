package com.eluxar.modules.ventas.service;

import com.eluxar.exception.ResourceNotFoundException;
import lombok.extern.slf4j.Slf4j;
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

import com.eluxar.modules.pagos.dto.PaymentPreferenceRequest;
import com.eluxar.modules.pagos.dto.PaymentPreferenceResponse;
import com.eluxar.modules.pagos.service.PaymentService;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.domain.Sort;

@Slf4j
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
    private final PaymentService paymentService;

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

        boolean esMercadoPago = "MERCADOPAGO".equalsIgnoreCase(request.getMetodoPago());
        
        Pedido pedido = com.eluxar.modules.ventas.entity.Pedido.builder()
                .usuario(usuario)
                .estado(esMercadoPago ? com.eluxar.modules.ventas.entity.Pedido.EstadoPedido.PENDIENTE : com.eluxar.modules.ventas.entity.Pedido.EstadoPedido.CONFIRMADO)
                .subtotal(subtotal)
                .descuento(descuento)
                .costoEnvio(BigDecimal.ZERO) // Demo: envío gratis
                .total(total)
                .direccionEnvio(request.getDireccionCompleta())
                .metodoPago(request.getMetodoPago())
                .cuponAplicado(cuponAplicado)
                .build();

        pedido = pedidoRepository.save(pedido);

        if (!esMercadoPago) {
            // Regla de Negocio #1: Al confirmar pedido (No MP) -> descontar stockActual del inventario
            for (CarritoItem item : carrito.getItems()) {
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
            }
        }

        // Crear items del pedido en BD
        for (CarritoItem item : carrito.getItems()) {
            PedidoItem pedidoItem = PedidoItem.builder()
                    .pedido(pedido)
                    .variante(item.getVariante())
                    .cantidad(item.getCantidad())
                    .precioUnitario(item.getPrecioUnitario())
                    .subtotal(item.getPrecioUnitario().multiply(BigDecimal.valueOf(item.getCantidad())))
                    .build();

            pedido.getItems().add(pedidoItem);
        }

        // Si es Mercado Pago, crear la preferencia AHORA usando el Service
        if (esMercadoPago) {
            PaymentPreferenceRequest mpRequest = new PaymentPreferenceRequest();
            mpRequest.setPayerName(usuario.getNombre() + " " + usuario.getApellido());
            mpRequest.setPayerEmail(usuario.getEmail());
            mpRequest.setExternalReference(pedido.getId().toString());
            
            // Consolidamos toda la compra en un único ítem con el precio neto total.
            // Esto evita los problemas de precios unitarios negativos o redondeos no soportados por MP.
            PaymentPreferenceRequest.PaymentItemDTO consolidatedItem = new PaymentPreferenceRequest.PaymentItemDTO();
            consolidatedItem.setTitle("Compra Eluxar - Pedido #" + pedido.getId());
            consolidatedItem.setQuantity(1);
            consolidatedItem.setUnitPrice(total);
            
            mpRequest.setItems(List.of(consolidatedItem));

            PaymentPreferenceResponse preference = paymentService.createPreference(mpRequest);
            pedido.setPreferenceId(preference.getPreferenceId());
        }

        // Desactivar carrito
        carrito.setActivo(false);
        carritoRepository.save(carrito);

        pedido = pedidoRepository.save(pedido);
        PedidoDTO dto = mapToDTO(pedido);
        
        // Enviar correo solo si NO es MP (MP lo enviará en el webhook)
        if (!esMercadoPago) {
            emailService.sendOrderSummaryEmail(dto, usuario.getEmail(), usuario.getNombre());
        }
        
        return dto;
    }

    public List<PedidoDTO> listarMisPedidos(Long usuarioId) {
        return pedidoRepository.findByUsuarioIdOrderByCreadoEnDesc(usuarioId).stream()
                .map(this::mapToDTO)
                .toList();
    }

    public List<PedidoDTO> listarTodos() {
        return pedidoRepository.findAll(Sort.by(Sort.Direction.DESC, "creadoEn")).stream()
                .map(this::mapToDTO)
                .toList();
    }

    private static final DateTimeFormatter EXCEL_DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private String traducirEstado(Pedido.EstadoPedido estado) {
        return switch (estado) {
            case PENDIENTE -> "Pendiente";
            case CONFIRMADO -> "Confirmado";
            case EN_PROCESO -> "En Proceso";
            case ENVIADO -> "Enviado";
            case ENTREGADO -> "Entregado";
            case CANCELADO -> "Cancelado";
        };
    }

    public byte[] exportarPedidosExcel(List<Long> ids) throws Exception {
        List<Pedido> pedidos;
        if (ids == null || ids.isEmpty()) {
            pedidos = pedidoRepository.findAll(Sort.by(Sort.Direction.DESC, "creadoEn"));
        } else {
            pedidos = pedidoRepository.findByIdIn(ids);
            pedidos.sort((a, b) -> b.getCreadoEn().compareTo(a.getCreadoEn()));
        }

        try (XSSFWorkbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Pedidos");

            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFillForegroundColor(IndexedColors.DARK_TEAL.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setBorderBottom(BorderStyle.THIN);
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerStyle.setFont(headerFont);

            String[] headers = {"N° Pedido", "Fecha", "Cliente", "Estado", "Productos",
                    "Cant. Items", "Subtotal", "Descuento", "Envío", "Total",
                    "Método Pago", "Dirección", "Cupón", "Tracking"};
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
                sheet.setColumnWidth(i, 18 * 256);
            }
            sheet.setColumnWidth(2, 30 * 256);
            sheet.setColumnWidth(4, 40 * 256);
            sheet.setColumnWidth(11, 35 * 256);

            int rowIdx = 1;
            for (Pedido p : pedidos) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(p.getId());
                row.createCell(1).setCellValue(p.getCreadoEn() != null ? p.getCreadoEn().format(EXCEL_DATE_FORMATTER) : "");
                row.createCell(2).setCellValue(p.getUsuario().getNombre() + " " + p.getUsuario().getApellido());
                row.createCell(3).setCellValue(traducirEstado(p.getEstado()));

                String productos = p.getItems() != null
                        ? p.getItems().stream()
                        .map(i -> i.getVariante().getProducto().getNombre())
                        .collect(Collectors.joining(", "))
                        : "";
                row.createCell(4).setCellValue(productos);

                int cantItems = p.getItems() != null
                        ? p.getItems().stream().mapToInt(PedidoItem::getCantidad).sum()
                        : 0;
                row.createCell(5).setCellValue(cantItems);

                row.createCell(6).setCellValue(p.getSubtotal() != null ? p.getSubtotal().doubleValue() : 0);
                row.createCell(7).setCellValue(p.getDescuento() != null ? p.getDescuento().doubleValue() : 0);
                row.createCell(8).setCellValue(p.getCostoEnvio() != null ? p.getCostoEnvio().doubleValue() : 0);
                row.createCell(9).setCellValue(p.getTotal() != null ? p.getTotal().doubleValue() : 0);
                row.createCell(10).setCellValue(p.getMetodoPago() != null ? p.getMetodoPago() : "");
                row.createCell(11).setCellValue(p.getDireccionEnvio() != null ? p.getDireccionEnvio() : "");
                row.createCell(12).setCellValue(p.getCuponAplicado() != null ? p.getCuponAplicado().getCodigo() : "");
                row.createCell(13).setCellValue(p.getTrackingNumber() != null ? p.getTrackingNumber() : "");
            }

            workbook.write(out);
            return out.toByteArray();
        }
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
                .preferenceId(pedido.getPreferenceId())
                .paymentId(pedido.getPaymentId())
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

    /**
     * Procesa un pago aprobado recibido por Webhook.
     * Actualiza el estado a CONFIRMADO, descuenta stock del inventario y envía correo de confirmación.
     */
    @Transactional
    public PedidoDTO procesarPagoAprobado(Long pedidoId, String paymentId) {
        log.info("[PedidoService] Procesando pago aprobado para Pedido #{} | PaymentId: {}", pedidoId, paymentId);
        // Usamos findByIdWithItems (JOIN FETCH) para cargar los items y variantes de forma EAGER.
        // Con findById simple, la colección LAZY puede estar vacía en el contexto del webhook
        // causando que el for-loop nunca descuente el stock del inventario.
        Pedido pedido = pedidoRepository.findByIdWithItems(pedidoId)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido", pedidoId));

        // Evitar procesar dos veces si ya está confirmado
        if (pedido.getEstado() == Pedido.EstadoPedido.CONFIRMADO) {
            log.info("[PedidoService] El pedido #{} ya se encuentra CONFIRMADO. Ignorando proceso de inventario.", pedidoId);
            return mapToDTO(pedido);
        }

        if (pedido.getEstado() != Pedido.EstadoPedido.PENDIENTE) {
            throw new IllegalStateException("El pedido #" + pedidoId + " no está en estado PENDIENTE. Estado actual: " + pedido.getEstado());
        }

        pedido.setEstado(Pedido.EstadoPedido.CONFIRMADO);
        pedido.setPaymentId(paymentId);

        // Descontar inventario para cada variante en el pedido
        for (PedidoItem item : pedido.getItems()) {
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
                    .motivo("Venta Webhook Pago #" + paymentId + " (Pedido #" + pedidoId + ")")
                    .build());
            log.debug("[PedidoService] Descontadas {} unidades del inventario variante ID {} para Pedido #{}", item.getCantidad(), item.getVariante().getId(), pedidoId);
        }

        pedido = pedidoRepository.save(pedido);
        PedidoDTO dto = mapToDTO(pedido);

        // Enviar correo de confirmación
        try {
            emailService.sendOrderSummaryEmail(dto, pedido.getUsuario().getEmail(), pedido.getUsuario().getNombre());
            log.info("[PedidoService] Correo de confirmación enviado exitosamente para Pedido #{}", pedidoId);
        } catch (Exception e) {
            log.error("[PedidoService] Error al enviar el correo de confirmación del pedido #{}: {}", pedidoId, e.getMessage(), e);
        }

        return dto;
    }

    /**
     * Procesa un pago rechazado/cancelado recibido por Webhook.
     * Actualiza el estado a CANCELADO.
     */
    @Transactional
    public PedidoDTO procesarPagoRechazado(Long pedidoId, String paymentId) {
        log.warn("[PedidoService] Procesando pago rechazado/cancelado para Pedido #{} | PaymentId: {}", pedidoId, paymentId);
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido", pedidoId));

        if (pedido.getEstado() == Pedido.EstadoPedido.CANCELADO) {
            return mapToDTO(pedido);
        }

        if (pedido.getEstado() != Pedido.EstadoPedido.PENDIENTE) {
            throw new IllegalStateException("El pedido #" + pedidoId + " no está en estado PENDIENTE. Estado actual: " + pedido.getEstado());
        }

        pedido.setEstado(Pedido.EstadoPedido.CANCELADO);
        pedido.setPaymentId(paymentId);

        return mapToDTO(pedidoRepository.save(pedido));
    }
}
