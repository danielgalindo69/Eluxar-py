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
        String nombreNormalizado = normalizeName(nombre);

        if (marcaRepository.existsByNombreIgnoreCase(nombreNormalizado)) {
            throw new IllegalArgumentException("Ya existe una marca con el nombre: " + nombreNormalizado);
        }
        return marcaRepository.save(Marca.builder()
                .nombre(nombreNormalizado)
                .descripcion(descripcion)
                .logoUrl(logoUrl)
                .activa(true)
                .build());
    }

    /**
     * Normaliza el texto a Title Case. Ej: "chanel" -> "Chanel", "cAROlina heRreRa" -> "Carolina Herrera"
     */
    private String normalizeName(String input) {
        if (input == null || input.trim().isEmpty()) return input;
        
        String[] words = input.trim().toLowerCase().split("\\s+");
        StringBuilder titleCase = new StringBuilder();
        
        for (String word : words) {
            if (!word.isEmpty()) {
                titleCase.append(Character.toUpperCase(word.charAt(0)))
                         .append(word.substring(1))
                         .append(" ");
            }
        }
        return titleCase.toString().trim();
    }
}
