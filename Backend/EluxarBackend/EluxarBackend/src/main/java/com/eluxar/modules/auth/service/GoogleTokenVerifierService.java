package com.eluxar.modules.auth.service;

import com.eluxar.modules.auth.dto.GoogleAuthRequest;
import com.eluxar.modules.auth.dto.GoogleAuthResponse;
import com.eluxar.modules.usuarios.entity.Rol;
import com.eluxar.modules.usuarios.entity.Usuario;
import com.eluxar.modules.usuarios.repository.RolRepository;
import com.eluxar.modules.usuarios.repository.UsuarioRepository;
import com.eluxar.security.JwtTokenProvider;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collections;

@Slf4j
@Service
@RequiredArgsConstructor
public class GoogleTokenVerifierService {

    @Value("${google.client.id}")
    private String googleClientId;

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final JwtTokenProvider jwtTokenProvider;

    private GoogleIdTokenVerifier verifier;

    @PostConstruct
    public void init() {
        verifier = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(),
                GsonFactory.getDefaultInstance()
        )
                .setAudience(Collections.singletonList(googleClientId))
                .build();

        log.info("[Google Auth] GoogleIdTokenVerifier initialized for client: {}",
                googleClientId.substring(0, Math.min(20, googleClientId.length())) + "...");
    }

    @Transactional
    public GoogleAuthResponse authenticate(GoogleAuthRequest request) {
        log.debug("[Google Auth] Verifying incoming Google ID Token...");

        // ── 1. Verify the token with Google ──────────────────────────────────
        GoogleIdToken idToken;
        try {
            idToken = verifier.verify(request.getToken());
        } catch (Exception e) {
            log.error("[Google Auth] Token verification threw an exception: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token de Google inválido");
        }

        if (idToken == null) {
            log.warn("[Google Auth] Token verification returned null — invalid or expired token");
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token de Google inválido o expirado");
        }

        // ── 2. Extract claims ─────────────────────────────────────────────────
        Payload payload = idToken.getPayload();
        String email = payload.getEmail();
        boolean emailVerified = Boolean.TRUE.equals(payload.getEmailVerified());
        String name = (String) payload.get("name");
        String pictureUrl = (String) payload.get("picture");

        log.debug("[Google Auth] Token valid for email={} emailVerified={}", email, emailVerified);

        // ── 3. Reject unverified emails ───────────────────────────────────────
        if (!emailVerified) {
            log.warn("[Google Auth] Rejected login — email not verified for: {}", email);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                    "El email de Google no está verificado");
        }

        // ── 4. Find or create user ────────────────────────────────────────────
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseGet(() -> createGoogleUser(email, name, pictureUrl));

        // Update picture URL if changed AND user doesn't have a custom uploaded image
        if (pictureUrl != null && !pictureUrl.equals(usuario.getPictureUrl()) && usuario.getImageFileId() == null) {
            usuario.setPictureUrl(pictureUrl);
            usuarioRepository.save(usuario);
        }

        if (!usuario.isActivo()) {
            log.warn("[Google Auth] Rejected login — account is locked for: {}", email);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                    "La cuenta está bloqueada. Contacta al administrador.");
        }

        // ── 5. Issue Eluxar JWT ───────────────────────────────────────────────
        String roleName = usuario.getRol().getNombre();
        String jwt = jwtTokenProvider.generateToken(
                usuario.getEmail(),
                usuario.getId(),
                "ROLE_" + roleName
        );

        log.info("[Google Auth] Login successful for email={} userId={} provider=GOOGLE",
                email, usuario.getId());

        return GoogleAuthResponse.builder()
                .token(jwt)
                .tipo("Bearer")
                .userId(usuario.getId())
                .email(usuario.getEmail())
                .nombre(nombre(usuario))
                .rol(roleName)
                .pictureUrl(usuario.getPictureUrl())
                .build();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Usuario createGoogleUser(String email, String name, String pictureUrl) {
        log.info("[Google Auth] Creating new user from Google account: {}", email);

        // Parse first/last name from full name (fallback to email prefix)
        String[] parts = name != null ? name.split(" ", 2) : new String[]{email.split("@")[0], ""};
        String nombre = parts[0];
        String apellido = parts.length > 1 ? parts[1] : "";

        Rol rol = rolRepository.findByNombre("USUARIO")
                .orElseGet(() -> rolRepository.save(new Rol(null, "USUARIO")));

        Usuario usuario = Usuario.builder()
                .nombre(nombre)
                .apellido(apellido)
                .email(email)
                .passwordHash(null)   // Google users don't have a password
                .provider("GOOGLE")
                .pictureUrl(pictureUrl)
                .activo(true)
                .intentosFallidos(0)
                .rol(rol)
                .build();

        return usuarioRepository.save(usuario);
    }

    private String nombre(Usuario u) {
        return (u.getNombre() + " " + u.getApellido()).trim();
    }
}
