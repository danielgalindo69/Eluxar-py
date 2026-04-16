package com.eluxar.modules.auth.controller;

import com.eluxar.common.ApiResponse;
import com.eluxar.modules.auth.dto.GoogleAuthRequest;
import com.eluxar.modules.auth.dto.GoogleAuthResponse;
import com.eluxar.modules.auth.dto.LoginRequest;
import com.eluxar.modules.auth.dto.LoginResponse;
import com.eluxar.modules.auth.dto.RegisterRequest;
import com.eluxar.modules.auth.service.AuthService;
import com.eluxar.modules.auth.service.GoogleTokenVerifierService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Autenticación", description = "Registro, login y logout")
public class AuthController {

    private final AuthService authService;
    private final GoogleTokenVerifierService googleTokenVerifierService;

    @PostMapping("/register")
    @Operation(summary = "Registrar nuevo usuario")
    public ResponseEntity<ApiResponse<Void>> register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Usuario registrado exitosamente", null));
    }

    @PostMapping("/register-admin")
    @Operation(summary = "Registrar nuevo administrador")
    public ResponseEntity<ApiResponse<Void>> registerAdmin(@Valid @RequestBody RegisterRequest request) {
        authService.registerAdmin(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Administrador registrado exitosamente", null));
    }

    @PostMapping("/login")
    @Operation(summary = "Iniciar sesión y obtener JWT")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login exitoso", response));
    }

    @PostMapping("/logout")
    @Operation(summary = "Cerrar sesión (cliente debe descartar el token)")
    public ResponseEntity<ApiResponse<Void>> logout() {
        // JWT es stateless: el cliente debe eliminar el token del lado del frontend
        return ResponseEntity.ok(ApiResponse.success("Sesión cerrada exitosamente", null));
    }

    @PostMapping("/google")
    @Operation(summary = "Login con Google ID Token (sin redirect, sin client_secret)")
    public ResponseEntity<ApiResponse<GoogleAuthResponse>> googleLogin(
            @Valid @RequestBody GoogleAuthRequest request) {
        GoogleAuthResponse response = googleTokenVerifierService.authenticate(request);
        return ResponseEntity.ok(ApiResponse.success("Login con Google exitoso", response));
    }
}
