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

    // ─── Generar y enviar código ─────────────────────────────────────────────────

    @Transactional
    public void generateAndSendResetCode(String email) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(email);

        if (usuarioOpt.isEmpty()) {
            log.warn("[PasswordReset] Solicitud para email no registrado: {}", email);
            return; // Prevenir enumeración de usuarios — siempre respuesta positiva
        }

        Usuario usuario = usuarioOpt.get();

        if ("GOOGLE".equals(usuario.getProvider())) {
            log.warn("[PasswordReset] Solicitud ignorada para cuenta Google: {}", email);
            return; // No permitimos reset por código en cuentas Google — misma respuesta positiva
        }

        // Invalidar cualquier token previo antes de emitir uno nuevo
        tokenRepository.deleteByUsuario(usuario);
        log.debug("[PasswordReset] Tokens anteriores eliminados para usuario id={}", usuario.getId());

        // Generar código de 6 dígitos criptográficamente seguro (000000 – 999999)
        SecureRandom random = new SecureRandom();
        String code = String.format("%06d", random.nextInt(1_000_000));

        // Guardar solo el hash — nunca el código en texto plano
        String codeHash = passwordEncoder.encode(code);

        PasswordResetToken resetToken = PasswordResetToken.builder()
                .usuario(usuario)
                .tokenHash(codeHash)
                .expirationTime(LocalDateTime.now().plusMinutes(EXPIRATION_MINUTES))
                .attempts(0)
                .used(false)
                .build();

        tokenRepository.save(resetToken);

        // Enviar email HTML real con el template FreeMarker via Resend API
        emailService.sendPasswordResetEmail(usuario.getEmail(), usuario.getNombre(), code);

        log.info("[PasswordReset] Código generado y email enviado a: {}", email);
    }

    // ─── Verificar código ────────────────────────────────────────────────────────

    @Transactional
    public void verifyCode(String email, String code) {
        PasswordResetToken token = getValidTokenForUser(email);

        if (token.getAttempts() >= MAX_ATTEMPTS) {
            token.setUsed(true);
            tokenRepository.save(token);
            throw new IllegalArgumentException("Máximo de intentos alcanzado. Solicita un nuevo código.");
        }

        if (!passwordEncoder.matches(code, token.getTokenHash())) {
            token.setAttempts(token.getAttempts() + 1);
            tokenRepository.save(token);
            throw new IllegalArgumentException("El código es incorrecto.");
        }

        // Código válido — no marcamos como 'used' todavía, el siguiente paso lo hará
        log.debug("[PasswordReset] Código verificado correctamente para: {}", email);
    }

    // ─── Restablecer contraseña ──────────────────────────────────────────────────

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

        // Actualizar contraseña con hash BCrypt
        Usuario usuario = token.getUsuario();
        usuario.setPasswordHash(passwordEncoder.encode(newPassword));
        usuarioRepository.save(usuario);

        // Invalidar el token — ya no puede reutilizarse
        token.setUsed(true);
        tokenRepository.save(token);

        log.info("[PasswordReset] Contraseña actualizada exitosamente para: {}", email);
    }

    // ─── Helper privado ──────────────────────────────────────────────────────────

    private PasswordResetToken getValidTokenForUser(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        if ("GOOGLE".equals(usuario.getProvider())) {
            throw new IllegalArgumentException("Las cuentas de Google no pueden restablecer contraseña mediante código.");
        }

        return tokenRepository
                .findFirstByUsuarioAndUsedFalseAndExpirationTimeAfterOrderByCreatedAtDesc(usuario, LocalDateTime.now())
                .orElseThrow(() -> new IllegalArgumentException("No hay un código de recuperación válido o ha expirado."));
    }
}
