package com.eluxar.modules.usuarios.controller;

import com.eluxar.common.ApiResponse;
import com.eluxar.modules.usuarios.dto.ProfileUpdateRequest;
import com.eluxar.modules.usuarios.service.ProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
@Tag(name = "Perfil de Usuario", description = "Gestión del perfil del usuario autenticado")
@SecurityRequirement(name = "bearerAuth")
public class UserProfileController {

    private final ProfileService profileService;

    @PutMapping("/perfil")
    @Operation(summary = "Actualizar datos personales del perfil")
    public ResponseEntity<ApiResponse<Void>> updateProfileData(
            @Valid @RequestBody ProfileUpdateRequest request) {
        
        profileService.updateProfileData(request);
        
        return ResponseEntity.ok(ApiResponse.success(
                "Perfil actualizado exitosamente",
                null
        ));
    }

    @PostMapping("/profile/image")
    @Operation(summary = "Subir o actualizar imagen de perfil")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadProfileImage(
            @RequestParam("file") MultipartFile file) throws Exception {
        
        String imageUrl = profileService.updateProfileImage(file);
        
        return ResponseEntity.ok(ApiResponse.success(
                "Imagen de perfil actualizada exitosamente",
                Map.of("imageUrl", imageUrl)
        ));
    }
}
