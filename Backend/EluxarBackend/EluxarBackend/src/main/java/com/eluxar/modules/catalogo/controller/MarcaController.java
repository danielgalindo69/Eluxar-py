package com.eluxar.modules.catalogo.controller;

import com.eluxar.common.ApiResponse;
import com.eluxar.modules.catalogo.entity.Marca;
import com.eluxar.modules.catalogo.service.MarcaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/marcas")
@RequiredArgsConstructor
@Tag(name = "Marcas", description = "Gestión de marcas de perfumes")
public class MarcaController {

    private final MarcaService marcaService;

    @GetMapping
    @Operation(summary = "Listar todas las marcas activas")
    public ResponseEntity<ApiResponse<List<Marca>>> listarTodas() {
        return ResponseEntity.ok(ApiResponse.success(marcaService.listarTodas()));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Crear nueva marca (ADMIN)")
    public ResponseEntity<ApiResponse<Marca>> crear(@RequestBody Map<String, String> body) {
        Marca nueva = marcaService.crear(body.get("nombre"), body.get("descripcion"), body.get("logoUrl"));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Marca creada", nueva));
    }
}
