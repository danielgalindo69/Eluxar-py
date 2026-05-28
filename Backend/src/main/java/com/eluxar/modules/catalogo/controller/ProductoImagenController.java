package com.eluxar.modules.catalogo.controller;

import com.eluxar.common.ApiResponse;
import com.eluxar.modules.catalogo.dto.ProductoDTO;
import com.eluxar.modules.catalogo.service.ProductoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

/**
 * Endpoints para gestión de imágenes de un producto.
 * Las imágenes se almacenan en Cloudinary bajo la carpeta "eluxar/productos/{id}".
 */
@RestController
@RequestMapping("/api/productos/{id}/imagenes")
@RequiredArgsConstructor
@Tag(name = "Imágenes de Producto", description = "Subida y eliminación de imágenes en Cloudinary")
public class ProductoImagenController {

    private final ProductoService productoService;

    /**
     * Sube hasta 3 imágenes para un producto (total incluyendo las existentes).
     * Acepta multipart/form-data con campo "imagenes" (puede ser múltiple).
     */
    @PostMapping(consumes = "multipart/form-data")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Subir imágenes a Cloudinary (máx. 3 por producto)")
    public ResponseEntity<ApiResponse<ProductoDTO>> subirImagenes(
            @PathVariable Long id,
            @RequestParam("imagenes") List<MultipartFile> imagenes) {

        try {
            ProductoDTO dto = productoService.agregarImagenes(id, imagenes);
            return ResponseEntity.ok(ApiResponse.success("Imágenes subidas exitosamente", dto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error al subir imágenes a Cloudinary: " + e.getMessage()));
        }
    }

    /**
     * Elimina una imagen específica del producto (también de Cloudinary).
     */
    @DeleteMapping("/{imagenId}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Eliminar una imagen del producto y de Cloudinary")
    public ResponseEntity<ApiResponse<ProductoDTO>> eliminarImagen(
            @PathVariable Long id,
            @PathVariable Long imagenId) {

        ProductoDTO dto = productoService.eliminarImagen(id, imagenId);
        return ResponseEntity.ok(ApiResponse.success("Imagen eliminada", dto));
    }
}
