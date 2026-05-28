package com.eluxar.modules.catalogo.service;

import com.eluxar.exception.ResourceNotFoundException;
import com.eluxar.modules.catalogo.entity.Categoria;
import com.eluxar.modules.catalogo.repository.CategoriaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;

    public List<Categoria> listarTodas() {
        return categoriaRepository.findByActivaTrue();
    }

    public Categoria obtenerPorId(Long id) {
        return categoriaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria", id));
    }

    @Transactional
    public Categoria crear(String nombre, String descripcion) {
        if (categoriaRepository.existsByNombre(nombre)) {
            throw new IllegalArgumentException("Ya existe una categoría con el nombre: " + nombre);
        }
        return categoriaRepository.save(Categoria.builder()
                .nombre(nombre)
                .descripcion(descripcion)
                .activa(true)
                .build());
    }
}
