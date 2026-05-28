package com.eluxar.modules.usuarios.controller;

import com.eluxar.common.ApiResponse;
import com.eluxar.modules.usuarios.dto.DireccionDTO;
import com.eluxar.modules.usuarios.dto.DireccionRequest;
import com.eluxar.modules.usuarios.service.DireccionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios/direcciones")
@RequiredArgsConstructor
public class DireccionController {

    private final DireccionService direccionService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<DireccionDTO>>> listar(Authentication auth) {
        List<DireccionDTO> data = direccionService.listar(auth.getName());
        return ResponseEntity.ok(ApiResponse.success("Direcciones obtenidas", data));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DireccionDTO>> crear(
            @RequestBody DireccionRequest req,
            Authentication auth) {
        DireccionDTO data = direccionService.crear(auth.getName(), req);
        return ResponseEntity.ok(ApiResponse.success("Dirección creada", data));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DireccionDTO>> actualizar(
            @PathVariable Long id,
            @RequestBody DireccionRequest req,
            Authentication auth) {
        DireccionDTO data = direccionService.actualizar(auth.getName(), id, req);
        return ResponseEntity.ok(ApiResponse.success("Dirección actualizada", data));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> eliminar(
            @PathVariable Long id,
            Authentication auth) {
        direccionService.eliminar(auth.getName(), id);
        return ResponseEntity.ok(ApiResponse.success("Dirección eliminada", null));
    }

    @PutMapping("/{id}/predeterminada")
    public ResponseEntity<ApiResponse<DireccionDTO>> setPredeterminada(
            @PathVariable Long id,
            Authentication auth) {
        DireccionDTO data = direccionService.setPredeterminada(auth.getName(), id);
        return ResponseEntity.ok(ApiResponse.success("Dirección predeterminada actualizada", data));
    }
}
