package com.eluxar.modules.catalogo.controller;

import com.eluxar.common.ApiResponse;
import com.eluxar.modules.catalogo.dto.ProductoDTO;
import com.eluxar.modules.catalogo.dto.ProductoFiltroRequest;
import com.eluxar.modules.catalogo.service.ProductoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/productos")
@RequiredArgsConstructor
@Tag(name = "Productos", description = "Catálogo de perfumes")
public class ProductoController {

    private final ProductoService productoService;

    @GetMapping
    @Operation(summary = "Listar productos con filtros opcionales")
    public ResponseEntity<ApiResponse<List<ProductoDTO>>> listar(
            @RequestParam(required = false) String nombre,
            @RequestParam(required = false) Long categoriaId,
            @RequestParam(required = false) Long marcaId,
            @RequestParam(required = false) BigDecimal precioMin,
            @RequestParam(required = false) BigDecimal precioMax) {

        ProductoFiltroRequest filtro = new ProductoFiltroRequest();
        filtro.setNombre(nombre);
        filtro.setCategoriaId(categoriaId);
        filtro.setMarcaId(marcaId);
        filtro.setPrecioMin(precioMin);
        filtro.setPrecioMax(precioMax);

        return ResponseEntity.ok(ApiResponse.success(productoService.listarConFiltros(filtro)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener producto por ID")
    public ResponseEntity<ApiResponse<ProductoDTO>> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(productoService.obtenerPorId(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Crear producto (ADMIN)")
    public ResponseEntity<ApiResponse<ProductoDTO>> crear(@RequestBody ProductoDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Producto creado", productoService.crear(dto)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Actualizar producto (ADMIN)")
    public ResponseEntity<ApiResponse<ProductoDTO>> actualizar(@PathVariable Long id,
                                                                @RequestBody ProductoDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Producto actualizado", productoService.actualizar(id, dto)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Desactivar producto (ADMIN)")
    public ResponseEntity<ApiResponse<Void>> eliminar(@PathVariable Long id) {
        productoService.eliminar(id);
        return ResponseEntity.ok(ApiResponse.success("Producto desactivado", null));
    }
}
