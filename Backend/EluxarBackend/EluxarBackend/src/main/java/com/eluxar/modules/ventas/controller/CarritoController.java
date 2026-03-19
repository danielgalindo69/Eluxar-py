package com.eluxar.modules.ventas.controller;

import com.eluxar.common.ApiResponse;
import com.eluxar.modules.ventas.dto.CarritoDTO;
import com.eluxar.modules.ventas.service.CarritoService;
import com.eluxar.security.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/carrito")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Carrito", description = "Gestión del carrito de compras (Usuario autenticado)")
public class CarritoController {

    private final CarritoService carritoService;

    @GetMapping
    @Operation(summary = "Obtener carrito activo del usuario")
    public ResponseEntity<ApiResponse<CarritoDTO>> obtenerCarritoActivo(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(carritoService.obtenerCarritoActivo(userDetails.getId())));
    }

    @PostMapping("/agregar")
    @Operation(summary = "Agregar producto al carrito")
    public ResponseEntity<ApiResponse<CarritoDTO>> agregarItem(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody Map<String, Object> body) {
        
        Long varianteId = ((Number) body.get("varianteId")).longValue();
        Integer cantidad = (Integer) body.get("cantidad");
        
        return ResponseEntity.ok(ApiResponse.success(
                "Item agregado al carrito", 
                carritoService.agregarItem(userDetails.getId(), varianteId, cantidad)));
    }

    @PutMapping("/item/{itemId}")
    @Operation(summary = "Actualizar cantidad de un item en el carrito")
    public ResponseEntity<ApiResponse<CarritoDTO>> actualizarCantidad(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long itemId,
            @RequestBody Map<String, Object> body) {
        
        Integer cantidad = (Integer) body.get("cantidad");
        
        return ResponseEntity.ok(ApiResponse.success(
                "Cantidad actualizada", 
                carritoService.actualizarCantidad(userDetails.getId(), itemId, cantidad)));
    }

    @DeleteMapping("/item/{itemId}")
    @Operation(summary = "Eliminar item del carrito")
    public ResponseEntity<ApiResponse<CarritoDTO>> eliminarItem(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long itemId) {
        
        return ResponseEntity.ok(ApiResponse.success(
                "Item eliminado del carrito", 
                carritoService.eliminarItem(userDetails.getId(), itemId)));
    }
}
