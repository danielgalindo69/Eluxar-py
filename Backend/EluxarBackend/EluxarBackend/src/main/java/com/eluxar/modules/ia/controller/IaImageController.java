package com.eluxar.modules.ia.controller;

import com.eluxar.modules.ia.dto.IaImageResponseDTO;
import com.eluxar.modules.ia.service.ImageIaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/ia/imagen")
@RequiredArgsConstructor
@Tag(name = "IA Imágenes", description = "Endpoints para mejora de imágenes de productos usando Stability AI")
public class IaImageController {

    private final ImageIaService imageIaService;

    @Operation(summary = "Mejorar imagen de producto", description = "Genera una versión mejorada con IA manteniendo la botella original (Requiere ROL ADMIN).")
    @PostMapping("/mejorar")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<IaImageResponseDTO> mejorarImagen(
            @RequestParam("imagen") MultipartFile imagen,
            @RequestParam(value = "estilo", required = false) String estilo,
            @RequestParam(value = "prompt", required = false) String prompt) {

        IaImageResponseDTO response = imageIaService.mejorarImagen(imagen, estilo, prompt);

        // Si falló (imagen_url es null), puedes devolver un 500 o 400. 
        // Según los requerimientos se devuelve la respuesta JSON con el mensaje de error.
        if (response.getImagenUrl() == null) {
            return ResponseEntity.internalServerError().body(response);
        }

        return ResponseEntity.ok(response);
    }
}
