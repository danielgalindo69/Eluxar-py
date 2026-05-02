package com.eluxar.modules.inventario.controller;

import com.eluxar.common.ApiResponse;
import com.eluxar.modules.inventario.dto.InventarioDTO;
import com.eluxar.modules.inventario.service.InventarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventario")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Inventario", description = "Gestión de stock (solo ADMIN)")
public class InventarioController {

    private final InventarioService inventarioService;

    @GetMapping
    @Operation(summary = "Listar todo el inventario")
    public ResponseEntity<ApiResponse<List<InventarioDTO>>> listarTodo() {
        return ResponseEntity.ok(ApiResponse.success(inventarioService.listarTodo()));
    }

    @PutMapping("/{varianteId}")
    @Operation(summary = "Actualizar stock de una variante")
    public ResponseEntity<ApiResponse<InventarioDTO>> actualizar(
            @PathVariable Long varianteId,
            @RequestBody Map<String, Object> body) {

        Integer stockActual = (Integer) body.get("stockActual");
        Integer stockMinimo = body.containsKey("stockMinimo") ? (Integer) body.get("stockMinimo") : null;
        String motivo = (String) body.getOrDefault("motivo", "Ajuste manual");

        return ResponseEntity.ok(ApiResponse.success("Stock actualizado",
                inventarioService.actualizar(varianteId, stockActual, stockMinimo, motivo)));
    }

    @GetMapping("/movimientos")
    @Operation(summary = "Listar el historial de movimientos")
    public ResponseEntity<ApiResponse<List<com.eluxar.modules.inventario.dto.MovimientoInventarioDTO>>> listarMovimientos() {
        return ResponseEntity.ok(ApiResponse.success(inventarioService.listarMovimientos()));
    }

    @GetMapping("/alertas")
    @Operation(summary = "Obtener alertas de stock bajo")
    public ResponseEntity<ApiResponse<List<com.eluxar.modules.inventario.dto.AlertaStockDTO>>> obtenerAlertas() {
        return ResponseEntity.ok(ApiResponse.success(inventarioService.obtenerAlertasStock()));
    }
}
