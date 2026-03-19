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
        return inventarioRepository.findByVarianteId(varianteId)
                .map(this::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Inventario para variante", varianteId));
    }

    @Transactional
    public InventarioDTO actualizar(Long varianteId, Integer stockActual, Integer stockMinimo, String motivo) {
        Inventario inventario = inventarioRepository.findByVarianteId(varianteId)
                .orElseGet(() -> {
                    var variante = varianteRepository.findById(varianteId)
                            .orElseThrow(() -> new ResourceNotFoundException("ProductoVariante", varianteId));
                    return inventarioRepository.save(Inventario.builder().variante(variante).build());
                });

        int cantidadMovimiento = stockActual - inventario.getStockActual();
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
        return InventarioDTO.builder()
                .id(inv.getId())
                .varianteId(variante.getId())
                .sku(variante.getSku())
                .productoNombre(variante.getProducto() != null ? variante.getProducto().getNombre() : null)
                .tamanoMl(variante.getTamanoMl())
                .stockActual(inv.getStockActual())
                .stockReservado(inv.getStockReservado())
                .stockMinimo(inv.getStockMinimo())
                .stockBajo(inv.getStockActual() <= inv.getStockMinimo())
                .build();
    }
}
