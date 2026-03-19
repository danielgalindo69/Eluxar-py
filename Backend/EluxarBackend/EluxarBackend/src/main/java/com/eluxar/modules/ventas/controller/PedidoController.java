package com.eluxar.modules.ventas.controller;

import com.eluxar.common.ApiResponse;
import com.eluxar.modules.ventas.dto.CheckoutRequest;
import com.eluxar.modules.ventas.dto.PedidoDTO;
import com.eluxar.modules.ventas.service.PedidoService;
import com.eluxar.security.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pedidos")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Pedidos", description = "Gestión de pedidos y checkout")
public class PedidoController {

    private final PedidoService pedidoService;

    @PostMapping
    @Operation(summary = "Crear pedido (Checkout) desde carrito activo")
    public ResponseEntity<ApiResponse<PedidoDTO>> crearPedido(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody CheckoutRequest request) {

        PedidoDTO pedido = pedidoService.crearDesdeCarrito(userDetails.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Pedido creado exitosamente", pedido));
    }

    @GetMapping("/mis-pedidos")
    @Operation(summary = "Listar pedidos del usuario autenticado")
    public ResponseEntity<ApiResponse<List<PedidoDTO>>> listarMisPedidos(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        return ResponseEntity.ok(ApiResponse.success(pedidoService.listarMisPedidos(userDetails.getId())));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener detalle de un pedido")
    public ResponseEntity<ApiResponse<PedidoDTO>> obtenerPorId(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id) {

        boolean esAdmin = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        return ResponseEntity.ok(ApiResponse.success(pedidoService.obtenerPorId(userDetails.getId(), id, esAdmin)));
    }

    @PutMapping("/{id}/estado")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Actualizar estado de un pedido (ADMIN)")
    public ResponseEntity<ApiResponse<PedidoDTO>> actualizarEstado(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        String nuevoEstado = body.get("estado");
        return ResponseEntity.ok(ApiResponse.success(
                "Estado actualizado", pedidoService.actualizarEstado(id, nuevoEstado)));
    }
}
