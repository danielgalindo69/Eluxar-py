package com.eluxar.modules.ventas.service;

import com.eluxar.exception.ResourceNotFoundException;
import com.eluxar.exception.StockInsuficienteException;
import com.eluxar.modules.catalogo.entity.ProductoImagen;
import com.eluxar.modules.catalogo.entity.ProductoPrecio;
import com.eluxar.modules.catalogo.entity.ProductoVariante;
import com.eluxar.modules.catalogo.repository.ProductoVarianteRepository;
import com.eluxar.modules.inventario.entity.Inventario;
import com.eluxar.modules.inventario.repository.InventarioRepository;
import com.eluxar.modules.usuarios.repository.UsuarioRepository;
import com.eluxar.modules.ventas.dto.CarritoDTO;
import com.eluxar.modules.ventas.entity.Carrito;
import com.eluxar.modules.ventas.entity.CarritoItem;
import com.eluxar.modules.ventas.repository.CarritoItemRepository;
import com.eluxar.modules.ventas.repository.CarritoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CarritoService {

    private final CarritoRepository carritoRepository;
    private final CarritoItemRepository carritoItemRepository;
    private final ProductoVarianteRepository varianteRepository;
    private final InventarioRepository inventarioRepository;
    private final UsuarioRepository usuarioRepository;

    public CarritoDTO obtenerCarritoActivo(Long usuarioId) {
        Carrito carrito = carritoRepository.findByUsuarioIdAndActivoTrue(usuarioId)
                .orElse(Carrito.builder().items(new ArrayList<>()).build());
        return mapToDTO(carrito);
    }

    @Transactional
    public CarritoDTO agregarItem(Long usuarioId, Long varianteId, Integer cantidad) {
        // Regla de Negocio #2: Verificar stock disponible
        Inventario inventario = inventarioRepository.findByVarianteId(varianteId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventario para variante", varianteId));

        if (inventario.getStockActual() < cantidad) {
            throw new StockInsuficienteException(varianteId, inventario.getStockActual(), cantidad);
        }

        Carrito carrito = carritoRepository.findByUsuarioIdAndActivoTrue(usuarioId)
                .orElseGet(() -> {
                    var usuario = usuarioRepository.findById(usuarioId)
                            .orElseThrow(() -> new ResourceNotFoundException("Usuario", usuarioId));
                    return carritoRepository.save(Carrito.builder().usuario(usuario).activo(true).build());
                });

        ProductoVariante variante = varianteRepository.findById(varianteId)
                .orElseThrow(() -> new ResourceNotFoundException("Variante", varianteId));

        BigDecimal precioVenta = variante.getPrecios().stream()
                .filter(ProductoPrecio::isActivo)
                .findFirst()
                .map(p -> p.getPrecioOferta() != null ? p.getPrecioOferta() : p.getPrecioVenta())
                .orElseThrow(() -> new IllegalStateException("Variante sin precio activo"));

        CarritoItem item = carritoItemRepository.findByCarritoIdAndVarianteId(carrito.getId(), varianteId)
                .orElseGet(() -> CarritoItem.builder()
                        .carrito(carrito)
                        .variante(variante)
                        .cantidad(0)
                        .precioUnitario(precioVenta)
                        .build());

        // Verificar stock de la cantidad total (existente + nueva)
        int nuevaCantidad = item.getCantidad() + cantidad;
        if (inventario.getStockActual() < nuevaCantidad) {
            throw new StockInsuficienteException(varianteId, inventario.getStockActual(), nuevaCantidad);
        }

        item.setCantidad(nuevaCantidad);
        item.setPrecioUnitario(precioVenta); // Actualizar precio por si cambió

        if (item.getId() == null) {
            carrito.getItems().add(item);
        }

        carritoRepository.save(carrito);
        return mapToDTO(carrito);
    }

    @Transactional
    public CarritoDTO actualizarCantidad(Long usuarioId, Long itemId, Integer cantidad) {
        Carrito carrito = carritoRepository.findByUsuarioIdAndActivoTrue(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Carrito activo"));

        CarritoItem item = carritoItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item de carrito", itemId));

        if (!item.getCarrito().getId().equals(carrito.getId())) {
            throw new IllegalArgumentException("El item no pertenece a tu carrito");
        }

        // Regla de Negocio #2: Verificar stock disponible
        Inventario inventario = inventarioRepository.findByVarianteId(item.getVariante().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Inventario para variante", item.getVariante().getId()));

        if (inventario.getStockActual() < cantidad) {
            throw new StockInsuficienteException(item.getVariante().getId(), inventario.getStockActual(), cantidad);
        }

        item.setCantidad(cantidad);
        carritoItemRepository.save(item);

        return mapToDTO(carrito);
    }

    @Transactional
    public CarritoDTO eliminarItem(Long usuarioId, Long itemId) {
        Carrito carrito = carritoRepository.findByUsuarioIdAndActivoTrue(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Carrito activo"));

        CarritoItem item = carritoItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item de carrito", itemId));

        if (!item.getCarrito().getId().equals(carrito.getId())) {
            throw new IllegalArgumentException("El item no pertenece a tu carrito");
        }

        carrito.getItems().remove(item);
        carritoItemRepository.delete(item);

        return mapToDTO(carrito);
    }

    private CarritoDTO mapToDTO(Carrito carrito) {
        BigDecimal subtotal = BigDecimal.ZERO;
        var items = new ArrayList<CarritoDTO.ItemDTO>();

        if (carrito.getItems() != null) {
            for (CarritoItem item : carrito.getItems()) {
                BigDecimal itemSubtotal = item.getPrecioUnitario().multiply(BigDecimal.valueOf(item.getCantidad()));
                subtotal = subtotal.add(itemSubtotal);

                String imagenUrl = item.getVariante().getProducto().getImagenes().stream()
                        .filter(ProductoImagen::isPrincipal)
                        .findFirst()
                        .map(ProductoImagen::getUrl)
                        .orElse(null);

                items.add(CarritoDTO.ItemDTO.builder()
                        .id(item.getId())
                        .varianteId(item.getVariante().getId())
                        .productoNombre(item.getVariante().getProducto().getNombre())
                        .tamanoMl(item.getVariante().getTamanoMl())
                        .sku(item.getVariante().getSku())
                        .cantidad(item.getCantidad())
                        .precioUnitario(item.getPrecioUnitario())
                        .subtotal(itemSubtotal)
                        .imagenUrl(imagenUrl)
                        .build());
            }
        }

        return CarritoDTO.builder()
                .id(carrito.getId())
                .items(items)
                .subtotal(subtotal)
                .build();
    }
}
