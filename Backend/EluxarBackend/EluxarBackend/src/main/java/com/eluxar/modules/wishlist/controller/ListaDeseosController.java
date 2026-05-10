package com.eluxar.modules.wishlist.controller;

import com.eluxar.common.ApiResponse;
import com.eluxar.modules.catalogo.dto.ProductoDTO;
import com.eluxar.modules.wishlist.service.ListaDeseosService;
import com.eluxar.security.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Lista de Deseos", description = "Gestión de lista de deseos de usuarios")
public class ListaDeseosController {

    private final ListaDeseosService listaDeseosService;

    @GetMapping
    @Operation(summary = "Obtener los productos en la lista de deseos del usuario")
    public ResponseEntity<ApiResponse<List<ProductoDTO>>> obtenerMiLista(@AuthenticationPrincipal CustomUserDetails userDetails) {
        List<ProductoDTO> wishlist = listaDeseosService.obtenerListaDeseos(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Lista de deseos obtenida", wishlist));
    }

    @GetMapping("/ids")
    @Operation(summary = "Obtener solo los IDs de los productos en la lista de deseos")
    public ResponseEntity<ApiResponse<List<Long>>> obtenerMisIds(@AuthenticationPrincipal CustomUserDetails userDetails) {
        List<Long> ids = listaDeseosService.obtenerIdsListaDeseos(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("IDs obtenidos", ids));
    }

    @PostMapping("/{productoId}")
    @Operation(summary = "Agregar un producto a la lista de deseos")
    public ResponseEntity<ApiResponse<Void>> agregarProducto(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long productoId) {
        listaDeseosService.agregarProducto(userDetails.getId(), productoId);
        return ResponseEntity.ok(ApiResponse.success("Producto agregado a la lista de deseos", null));
    }

    @DeleteMapping("/{productoId}")
    @Operation(summary = "Eliminar un producto de la lista de deseos")
    public ResponseEntity<ApiResponse<Void>> eliminarProducto(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long productoId) {
        listaDeseosService.eliminarProducto(userDetails.getId(), productoId);
        return ResponseEntity.ok(ApiResponse.success("Producto eliminado de la lista de deseos", null));
    }
}
