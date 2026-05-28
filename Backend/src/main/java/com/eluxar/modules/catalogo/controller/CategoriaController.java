package com.eluxar.modules.catalogo.controller;

import com.eluxar.common.ApiResponse;
import com.eluxar.modules.catalogo.entity.Categoria;
import com.eluxar.modules.catalogo.service.CategoriaService;
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
@RequestMapping("/api/categorias")
@RequiredArgsConstructor
@Tag(name = "Categorías", description = "Gestión de categorías de productos")
public class CategoriaController {

    private final CategoriaService categoriaService;

    @GetMapping
    @Operation(summary = "Listar todas las categorías activas")
    public ResponseEntity<ApiResponse<List<Categoria>>> listarTodas() {
        return ResponseEntity.ok(ApiResponse.success(categoriaService.listarTodas()));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Crear nueva categoría (ADMIN)")
    public ResponseEntity<ApiResponse<Categoria>> crear(@RequestBody Map<String, String> body) {
        Categoria nueva = categoriaService.crear(body.get("nombre"), body.get("descripcion"));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Categoría creada", nueva));
    }
}
