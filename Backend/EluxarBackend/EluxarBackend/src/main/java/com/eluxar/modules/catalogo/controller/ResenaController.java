package com.eluxar.modules.catalogo.controller;

import com.eluxar.common.ApiResponse;
import com.eluxar.modules.catalogo.dto.ResenaDTO;
import com.eluxar.modules.catalogo.dto.ResenaRequest;
import com.eluxar.modules.catalogo.service.ResenaService;
import com.eluxar.security.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/productos/{productoId}/resenas")
@RequiredArgsConstructor
@Tag(name = "Reseñas", description = "Gestión de valoraciones de productos")
public class ResenaController {

    private final ResenaService resenaService;

    @GetMapping
    @Operation(summary = "Listar reseñas paginadas de un producto")
    public ResponseEntity<ApiResponse<Page<ResenaDTO>>> listarPorProducto(
            @PathVariable Long productoId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        return ResponseEntity.ok(ApiResponse.success(resenaService.listarPorProducto(productoId, PageRequest.of(page, size))));
    }

    @PostMapping
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Crear o actualizar reseña (Usuario)")
    public ResponseEntity<ApiResponse<ResenaDTO>> guardarResena(
            @PathVariable Long productoId,
            @Valid @RequestBody ResenaRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
            
        ResenaDTO resena = resenaService.guardarResena(productoId, userDetails.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Reseña guardada exitosamente", resena));
    }
}
