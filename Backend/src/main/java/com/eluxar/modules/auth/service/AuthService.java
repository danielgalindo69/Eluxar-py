package com.eluxar.modules.auth.service;

import com.eluxar.modules.auth.dto.LoginRequest;
import com.eluxar.modules.auth.dto.LoginResponse;
import com.eluxar.modules.auth.dto.RegisterRequest;
import com.eluxar.modules.usuarios.entity.Rol;
import com.eluxar.modules.usuarios.entity.Usuario;
import com.eluxar.modules.usuarios.repository.UsuarioRepository;
import com.eluxar.modules.usuarios.repository.RolRepository;
import com.eluxar.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final int MAX_INTENTOS = 5;

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public LoginResponse login(LoginRequest request) {
        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Credenciales inválidas"));

        if (!usuario.isActivo()) {
            throw new LockedException("Cuenta bloqueada. Contacta al administrador.");
        }

        if (usuario.getPasswordHash() == null) {
            throw new BadCredentialsException("Esta cuenta usa Google. Inicia sesión con Google.");
        }

        if (!passwordEncoder.matches(request.getPassword(), usuario.getPasswordHash())) {
            int intentos = usuario.getIntentosFallidos() + 1;
            usuario.setIntentosFallidos(intentos);
            if (intentos >= MAX_INTENTOS) {
                usuario.setActivo(false);
            }
            usuarioRepository.save(usuario);
            throw new BadCredentialsException("Credenciales inválidas");
        }

        // Login exitoso: resetear intentos fallidos
        usuario.setIntentosFallidos(0);
        usuarioRepository.save(usuario);

        String rol = "ROLE_" + usuario.getRol().getNombre();
        String token = jwtTokenProvider.generateToken(usuario.getEmail(), usuario.getId(), rol);

        return LoginResponse.builder()
                .token(token)
                .tipo("Bearer")
                .userId(usuario.getId())
                .email(usuario.getEmail())
                .nombre(usuario.getNombre())
                .apellido(usuario.getApellido())
                .rol(usuario.getRol().getNombre())
                .pictureUrl(usuario.getPictureUrl())
                .build();
    }

    @Transactional
    public void register(RegisterRequest request) {
        registerWithRole(request, "USUARIO");
    }

    @Transactional
    public void registerAdmin(RegisterRequest request) {
        registerWithRole(request, "ADMIN");
    }

    private void registerWithRole(RegisterRequest request, String roleName) {
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Ya existe una cuenta con el email: " + request.getEmail());
        }

        Rol rol = rolRepository.findByNombre(roleName)
                .orElseGet(() -> rolRepository.save(new Rol(null, roleName)));

        Usuario usuario = Usuario.builder()
                .nombre(request.getNombre())
                .apellido(request.getApellido())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .activo(true)
                .intentosFallidos(0)
                .rol(rol)
                .build();

        usuarioRepository.save(usuario);
    }
}
