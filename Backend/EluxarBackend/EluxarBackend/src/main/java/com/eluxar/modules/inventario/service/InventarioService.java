package com.eluxar.modules.inventario.service;

import com.eluxar.exception.ResourceNotFoundException;
import com.eluxar.modules.catalogo.repository.ProductoVarianteRepository;
import com.eluxar.modules.inventario.dto.InventarioDTO;
import com.eluxar.modules.inventario.entity.Inventario;
import com.eluxar.modules.inventario.entity.MovimientoInventario;
import com.eluxar.modules.inventario.repository.InventarioRepository;
import com.eluxar.modules.inventario.repository.MovimientoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InventarioService {

    private final InventarioRepository inventarioRepository;
    private final MovimientoRepository movimientoRepository;
    private final ProductoVarianteRepository varianteRepository;

    public List<InventarioDTO> listarTodo() {
        return inventarioRepository.findAll().stream()
                .map(this::toDTO)
                .toList();
    }

    public InventarioDTO obtenerPorVariante(Long varianteId) {
        return buscarPorVariante(varianteId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventario para variante", varianteId));
    }

    public java.util.Optional<InventarioDTO> buscarPorVariante(Long varianteId) {
        return inventarioRepository.findByVarianteId(varianteId)
                .map(this::toDTO);
    }

    @Transactional
    public InventarioDTO actualizar(Long varianteId, Integer stockActual, Integer stockMinimo, String motivo) {
        Inventario inventario = inventarioRepository.findByVarianteId(varianteId)
                .orElseGet(() -> {
                    var variante = varianteRepository.findById(varianteId)
                            .orElseThrow(() -> new ResourceNotFoundException("ProductoVariante", varianteId));
                    return inventarioRepository.save(Inventario.builder()
                            .variante(variante)
                            .stockActual(0)
                            .stockReservado(0)
                            .stockMinimo(5)
                            .build());
                });

        int actual = inventario.getStockActual() != null ? inventario.getStockActual() : 0;
        int cantidadMovimiento = stockActual - actual;
        inventario.setStockActual(stockActual);
        if (stockMinimo != null) {
            inventario.setStockMinimo(stockMinimo);
        }
        inventarioRepository.save(inventario);

        // Registrar movimiento
        movimientoRepository.save(MovimientoInventario.builder()
                .inventario(inventario)
                .tipo(cantidadMovimiento >= 0
                        ? MovimientoInventario.TipoMovimiento.ENTRADA
                        : MovimientoInventario.TipoMovimiento.SALIDA)
                .cantidad(Math.abs(cantidadMovimiento))
                .motivo(motivo != null ? motivo : "Ajuste manual")
                .build());

        return toDTO(inventario);
    }

    private InventarioDTO toDTO(Inventario inv) {
        var variante = inv.getVariante();
        int actual = inv.getStockActual() != null ? inv.getStockActual() : 0;
        int minimo = inv.getStockMinimo() != null ? inv.getStockMinimo() : 5;
        
        return InventarioDTO.builder()
                .id(inv.getId())
                .varianteId(variante.getId())
                .sku(variante.getSku())
                .productoNombre(variante.getProducto() != null ? variante.getProducto().getNombre() : null)
                .tamanoMl(variante.getTamanoMl())
                .stockActual(actual)
                .stockReservado(inv.getStockReservado() != null ? inv.getStockReservado() : 0)
                .stockMinimo(minimo)
                .stockBajo(actual <= minimo)
                .build();
    }
}
