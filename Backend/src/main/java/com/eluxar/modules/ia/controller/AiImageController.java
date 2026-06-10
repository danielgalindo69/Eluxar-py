package com.eluxar.modules.ia.controller;

import com.eluxar.common.ApiResponse;
import com.eluxar.modules.ia.service.AiImageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller para operaciones de IA sobre imágenes de productos.
 * Mantiene la misma ruta del endpoint para compatibilidad con el frontend.
 */
@RestController
@RequestMapping("/api/productos/{id}/imagenes")
@RequiredArgsConstructor
@Tag(name = "IA Imágenes", description = "Mejora de imágenes de producto mediante IA (Clipdrop)")
public class AiImageController {

    private final AiImageService aiImageService;

    /**
     * POST /api/productos/{id}/imagenes/{imagenId}/mejorar-ia
     * Envía la imagen al servicio Python (Clipdrop) y retorna la imagen mejorada en Base64.
     */
    @PostMapping("/{imagenId}/mejorar-ia")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Mejorar imagen con IA (Clipdrop replace-background)")
    public ResponseEntity<ApiResponse<Map<String, String>>> mejorarImagenConIA(
            @PathVariable Long id,
            @PathVariable Long imagenId,
            @RequestBody Map<String, String> request) {
        try {
            String style = request.get("style");
            String additionalPrompt = request.get("additional_prompt");
            Map<String, String> result = aiImageService.mejorarImagenConIA(id, imagenId, style, additionalPrompt);
            return ResponseEntity.ok(ApiResponse.success("Imagen generada exitosamente", result));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error al mejorar imagen con IA: " + e.getMessage()));
        }
    }
}
