package com.eluxar.modules.usuarios.service;

import com.eluxar.exception.ResourceNotFoundException;
import com.eluxar.modules.usuarios.dto.ProfileUpdateRequest;
import com.eluxar.modules.usuarios.entity.Usuario;
import com.eluxar.modules.usuarios.repository.UsuarioRepository;
import io.imagekit.sdk.models.results.Result;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProfileService {

    private final UsuarioRepository usuarioRepository;
    private final ImageKitService imageKitService;

    private static final List<String> ALLOWED_MIME_TYPES = Arrays.asList("image/png", "image/jpeg", "image/webp");
    private static final long MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

    @Transactional
    public String updateProfileImage(MultipartFile file) throws Exception {
        // 1. Validate file
        validateFile(file);

        // 2. Get current user
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado: " + email));

        // 3. Handle existing image (Deletion)
        if (usuario.getImageFileId() != null) {
            imageKitService.deleteImage(usuario.getImageFileId());
            log.info("Deleted old profile image for user: {}", email);
        }

        // 4. Upload new image
        String uniqueFileName = UUID.randomUUID().toString();
        Result result = imageKitService.uploadImage(file.getBytes(), uniqueFileName, "/users/profile/");
        
        // 5. Save in database
        usuario.setPictureUrl(result.getUrl());
        usuario.setImageFileId(result.getFileId());
        usuarioRepository.save(usuario);

        log.info("Updated profile image for user: {}. New FileId: {}", email, result.getFileId());
        
        return result.getUrl();
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("El archivo no puede estar vacío");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("El tamaño del archivo supera el límite de 2MB");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Tipo de archivo no permitido. Solo se aceptan PNG, JPEG o WEBP");
        }
    }
    @Transactional
    public void updateProfileData(ProfileUpdateRequest request) {
        String currentEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario usuario = usuarioRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Check if new email is already taken by another user
        if (!usuario.getEmail().equals(request.getEmail()) && 
            usuarioRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("El email ya está en uso");
        }

        // Split name into nombre and apellido
        String fullName = request.getName().trim();
        int firstSpace = fullName.indexOf(" ");
        if (firstSpace != -1) {
            usuario.setNombre(fullName.substring(0, firstSpace));
            usuario.setApellido(fullName.substring(firstSpace + 1).trim());
        } else {
            usuario.setNombre(fullName);
            usuario.setApellido(""); // Fallback if only one name is provided
        }

        usuario.setEmail(request.getEmail());
        usuario.setPhone(request.getPhone());

        usuarioRepository.save(usuario);
        log.info("Updated personal data for user: {}", currentEmail);
    }
}

