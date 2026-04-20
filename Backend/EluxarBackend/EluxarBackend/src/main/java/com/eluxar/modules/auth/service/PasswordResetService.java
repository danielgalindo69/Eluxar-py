package com.eluxar.modules.auth.service;

import com.eluxar.common.service.EmailService;
import com.eluxar.exception.ResourceNotFoundException;
import com.eluxar.modules.auth.entity.PasswordResetToken;
import com.eluxar.modules.auth.repository.PasswordResetTokenRepository;
import com.eluxar.modules.usuarios.entity.Usuario;
import com.eluxar.modules.usuarios.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordResetService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    private static final int EXPIRATION_MINUTES = 10;
    private static final int MAX_ATTEMPTS = 5;

    @Transactional
    public void generateAndSendResetCode(String email) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(email);

        if (usuarioOpt.isEmpty()) {
            log.warn("Solicitud de recuperación para email inexistente: {}", email);
            return; // Prevenir enumeración de usuarios
        }

        Usuario usuario = usuarioOpt.get();

        if ("GOOGLE".equals(usuario.getProvider())) {
            log.warn("Solicitud de recuperación ignorada para usuario GOOGLE: {}", email);
            return; // No enviamos código a cuentas de Google, prevenimos filtrado.
        }

        // Generar un código criptográficamente seguro de 6 dígitos (000000 a 999999)
        SecureRandom random = new SecureRandom();
        int codeInt = random.nextInt(1000000);
        String code = String.format("%06d", codeInt);

        // Hash del código antes de guardarlo por seguridad
        String codeHash = passwordEncoder.encode(code);

        // Invalidamos tokens anteriores (si quieres garantizar sólo 1 activo, aunque el query por createdAtDesc maneja esto)
        
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .usuario(usuario)
                .tokenHash(codeHash)
                .expirationTime(LocalDateTime.now().plusMinutes(EXPIRATION_MINUTES))
                .attempts(0)
                .used(false)
                .build();

        tokenRepository.save(resetToken);

        // Mandar texto plano al usuario
        String emailBody = "Your verification code is: " + code + ". It expires in 10 minutes.";
        emailService.sendSimpleEmail(usuario.getEmail(), "Password Reset - Eluxar", emailBody);
    }

    @Transactional
    public void verifyCode(String email, String code) {
        PasswordResetToken token = getValidTokenForUser(email);

        if (token.getAttempts() >= MAX_ATTEMPTS) {
            token.setUsed(true); // Bloqueamos el token tras demasiados intentos
            tokenRepository.save(token);
            throw new IllegalArgumentException("Máximo de intentos alcanzado. Solicita un nuevo código.");
        }

        if (!passwordEncoder.matches(code, token.getTokenHash())) {
            token.setAttempts(token.getAttempts() + 1);
            tokenRepository.save(token);
            throw new IllegalArgumentException("El código es incorrecto.");
        }

        // Si llega aquí, el código es válido, pero no lo marcamos como 'used' todavía 
        // porque primero necesita ser verificado antes del cambio real (a no ser que unamos los flujos).
    }

    @Transactional
    public void resetPassword(String email, String code, String newPassword) {
        PasswordResetToken token = getValidTokenForUser(email);

        if (token.getAttempts() >= MAX_ATTEMPTS) {
            throw new IllegalArgumentException("Máximo de intentos alcanzado. Solicita un nuevo código.");
        }

        if (!passwordEncoder.matches(code, token.getTokenHash())) {
            token.setAttempts(token.getAttempts() + 1);
            tokenRepository.save(token);
            throw new IllegalArgumentException("El código es incorrecto.");
        }

        Usuario usuario = token.getUsuario();
        usuario.setPasswordHash(passwordEncoder.encode(newPassword));
        usuarioRepository.save(usuario);

        token.setUsed(true);
        tokenRepository.save(token);
        
        log.info("Contraseña actualizada exitosamente para: {}", email);
    }

    private PasswordResetToken getValidTokenForUser(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado (o inválido)"));

        if ("GOOGLE".equals(usuario.getProvider())) {
            throw new IllegalArgumentException("Las cuentas de Google no pueden restablecer contraseña mediante código.");
        }

        return tokenRepository.findFirstByUsuarioAndUsedFalseAndExpirationTimeAfterOrderByCreatedAtDesc(usuario, LocalDateTime.now())
                .orElseThrow(() -> new IllegalArgumentException("No hay un código de recuperación válido o ha expirado."));
    }
}
