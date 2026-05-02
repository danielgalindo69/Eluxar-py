package com.eluxar.modules.catalogo.controller;

import com.eluxar.common.ApiResponse;
import com.eluxar.modules.catalogo.dto.ActualizacionPrecioMasivaRequest;
import com.eluxar.modules.catalogo.service.ProductoPrecioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/precios")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Precios", description = "Gestión de precios de productos (solo ADMIN)")
public class ProductoPrecioController {

    private final ProductoPrecioService precioService;

    @PutMapping("/masivo")
    @Operation(summary = "Actualizar masivamente precios de variantes")
    public ResponseEntity<ApiResponse<Void>> actualizarMasivamente(
            @Valid @RequestBody ActualizacionPrecioMasivaRequest request) {
        
        precioService.actualizarPreciosMasivamente(request);
        
        return ResponseEntity.ok(ApiResponse.success("Precios actualizados exitosamente", null));
    }
}
