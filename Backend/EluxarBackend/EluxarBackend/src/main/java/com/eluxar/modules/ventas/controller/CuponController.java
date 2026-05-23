package com.eluxar.modules.ventas.controller;

import com.eluxar.common.ApiResponse;
import com.eluxar.modules.ventas.dto.CuponDTO;
import com.eluxar.modules.ventas.service.CuponService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import com.eluxar.modules.ventas.dto.AdminCuponDTO;
import com.eluxar.modules.ventas.dto.CuponRequest;
import java.util.List;

@RestController
@RequestMapping("/api/cupones")
@RequiredArgsConstructor
public class CuponController {

    private final CuponService cuponService;

    /**
     * Valida que el cupón exista, esté activo, no haya expirado
     * y no haya superado su límite de usos.
     * NO incrementa el contador (eso ocurre al finalizar el pedido).
     */
    @GetMapping("/validar/{codigo}")
    public ResponseEntity<ApiResponse<CuponDTO>> validar(@PathVariable String codigo) {
        CuponDTO data = cuponService.validar(codigo);
        return ResponseEntity.ok(ApiResponse.success("Cupón válido", data));
    }

    // --- Admin Endpoints ---

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<AdminCuponDTO>>> obtenerTodos() {
        return ResponseEntity.ok(ApiResponse.success("Lista de cupones", cuponService.obtenerTodos()));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AdminCuponDTO>> crearCupon(@Valid @RequestBody CuponRequest request) {
        AdminCuponDTO creado = cuponService.crearCupon(request);
        return ResponseEntity.ok(ApiResponse.success("Cupón creado exitosamente", creado));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AdminCuponDTO>> actualizarCupon(
            @PathVariable Long id, 
            @Valid @RequestBody CuponRequest request) {
        AdminCuponDTO actualizado = cuponService.actualizarCupon(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cupón actualizado exitosamente", actualizado));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> eliminarCupon(@PathVariable Long id) {
        cuponService.eliminarCupon(id);
        return ResponseEntity.ok(ApiResponse.success("Cupón eliminado exitosamente", null));
    }
}
