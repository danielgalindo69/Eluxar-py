package com.eluxar.modules.catalogo.service;

import com.eluxar.exception.ResourceNotFoundException;
import com.eluxar.modules.catalogo.dto.ActualizacionPrecioMasivaRequest;
import com.eluxar.modules.catalogo.entity.ProductoPrecio;
import com.eluxar.modules.catalogo.entity.ProductoVariante;
import com.eluxar.modules.catalogo.repository.ProductoPrecioRepository;
import com.eluxar.modules.catalogo.repository.ProductoVarianteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProductoPrecioService {

    private final ProductoPrecioRepository precioRepository;
    private final ProductoVarianteRepository varianteRepository;

    @Transactional
    public void actualizarPreciosMasivamente(ActualizacionPrecioMasivaRequest request) {
        if (request.getActualizaciones() == null || request.getActualizaciones().isEmpty()) {
            return;
        }

        for (ActualizacionPrecioMasivaRequest.ActualizacionPrecioVariante actualizacion : request.getActualizaciones()) {
            ProductoVariante variante = varianteRepository.findById(actualizacion.getVarianteId())
                    .orElseThrow(() -> new ResourceNotFoundException("ProductoVariante", actualizacion.getVarianteId()));

            // Desactivar todos los precios actuales
            for (ProductoPrecio precioActual : variante.getPrecios()) {
                precioActual.setActivo(false);
                precioRepository.save(precioActual);
            }

            // Crear el nuevo precio histórico y activarlo
            ProductoPrecio nuevoPrecio = ProductoPrecio.builder()
                    .variante(variante)
                    .precioVenta(actualizacion.getNuevoPrecioVenta())
                    .precioOferta(actualizacion.getNuevoPrecioOferta())
                    .precioCosto(actualizacion.getNuevoPrecioCosto() != null ? actualizacion.getNuevoPrecioCosto() : actualizacion.getNuevoPrecioVenta())
                    .activo(true)
                    .build();

            precioRepository.save(nuevoPrecio);
        }
    }
}
