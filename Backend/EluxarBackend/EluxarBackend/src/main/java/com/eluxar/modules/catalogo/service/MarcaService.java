package com.eluxar.modules.catalogo.service;

import com.eluxar.exception.ResourceNotFoundException;
import com.eluxar.modules.catalogo.entity.Marca;
import com.eluxar.modules.catalogo.repository.MarcaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MarcaService {

    private final MarcaRepository marcaRepository;

    public List<Marca> listarTodas() {
        return marcaRepository.findByActivaTrue();
    }

    public Marca obtenerPorId(Long id) {
        return marcaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Marca", id));
    }

    @Transactional
    public Marca crear(String nombre, String descripcion, String logoUrl) {
        if (marcaRepository.existsByNombre(nombre)) {
            throw new IllegalArgumentException("Ya existe una marca con el nombre: " + nombre);
        }
        return marcaRepository.save(Marca.builder()
                .nombre(nombre)
                .descripcion(descripcion)
                .logoUrl(logoUrl)
                .activa(true)
                .build());
    }
}
