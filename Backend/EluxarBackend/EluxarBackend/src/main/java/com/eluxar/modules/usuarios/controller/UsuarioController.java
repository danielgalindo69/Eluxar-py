package com.eluxar.modules.usuarios.controller;

import com.eluxar.common.ApiResponse;
import com.eluxar.modules.usuarios.dto.UsuarioDTO;
import com.eluxar.modules.usuarios.service.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
@Tag(name = "Usuarios", description = "Gestión de usuarios (solo ADMIN)")
@SecurityRequirement(name = "bearerAuth")
public class UsuarioController {

    private final UsuarioService usuarioService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Listar todos los usuarios")
    public ResponseEntity<ApiResponse<List<UsuarioDTO>>> listarTodos() {
        return ResponseEntity.ok(ApiResponse.success(usuarioService.listarTodos()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Obtener usuario por ID")
    public ResponseEntity<ApiResponse<UsuarioDTO>> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(usuarioService.obtenerPorId(id)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Desactivar usuario")
    public ResponseEntity<ApiResponse<Void>> desactivar(@PathVariable Long id) {
        usuarioService.desactivar(id);
        return ResponseEntity.ok(ApiResponse.success("Usuario desactivado", null));
    }

    @PutMapping("/{id}/rol")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Actualizar rol de usuario")
    public ResponseEntity<ApiResponse<UsuarioDTO>> actualizarRol(
            @PathVariable Long id, 
            @RequestBody java.util.Map<String, String> body) {
        String rol = body.get("rol");
        return ResponseEntity.ok(ApiResponse.success(
                "Rol actualizado", usuarioService.actualizarRol(id, rol)));
    }

    @PutMapping("/{id}/toggle-active")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Alternar estado activo de un usuario")
    public ResponseEntity<ApiResponse<UsuarioDTO>> toggleActivo(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(
                "Estado actualizado", usuarioService.toggleActivo(id)));
    }
}
