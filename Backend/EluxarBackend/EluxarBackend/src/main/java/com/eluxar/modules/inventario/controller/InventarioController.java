package com.eluxar.modules.inventario.controller;

import com.eluxar.common.ApiResponse;
import com.eluxar.modules.inventario.dto.InventarioDTO;
import com.eluxar.modules.inventario.service.InventarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
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
    @Operation(summary = "Listar el historial de movimientos activos (no archivados)")
    public ResponseEntity<ApiResponse<List<com.eluxar.modules.inventario.dto.MovimientoInventarioDTO>>> listarMovimientos(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
        return ResponseEntity.ok(ApiResponse.success(inventarioService.listarMovimientos(desde, hasta)));
    }

    @GetMapping("/alertas")
    @Operation(summary = "Obtener alertas de stock bajo")
    public ResponseEntity<ApiResponse<List<com.eluxar.modules.inventario.dto.AlertaStockDTO>>> obtenerAlertas() {
        return ResponseEntity.ok(ApiResponse.success(inventarioService.obtenerAlertasStock()));
    }

    /**
     * Genera y descarga el reporte de movimientos en formato Excel (.xlsx).
     * Acepta filtros opcionales por rango de fechas.
     */
    @GetMapping("/movimientos/exportar")
    @Operation(summary = "Exportar movimientos de inventario a Excel")
    public ResponseEntity<byte[]> exportarExcel(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) throws Exception {

        byte[] excelBytes = inventarioService.exportarMovimientosExcel(desde, hasta);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"movimientos_inventario.xlsx\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excelBytes);
    }

    /**
     * Archiva (soft-delete) todos los movimientos anteriores a la fecha indicada.
     * Los datos no se eliminan físicamente de la BD, solo se marcan como archivados.
     */
    @PatchMapping("/movimientos/archivar")
    @Operation(summary = "Archivar movimientos históricos (no se eliminan de BD)")
    public ResponseEntity<ApiResponse<Void>> archivarMovimientos(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate antes) {
        inventarioService.archivarMovimientosAnterioresA(antes);
        return ResponseEntity.ok(ApiResponse.success("Movimientos archivados correctamente", null));
    }
}
