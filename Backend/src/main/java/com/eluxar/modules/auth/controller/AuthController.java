package com.eluxar.modules.auth.controller;

import com.eluxar.common.ApiResponse;
import com.eluxar.modules.auth.dto.ForgotPasswordRequest;
import com.eluxar.modules.auth.dto.GoogleAuthRequest;
import com.eluxar.modules.auth.dto.GoogleAuthResponse;
import com.eluxar.modules.auth.dto.LoginRequest;
import com.eluxar.modules.auth.dto.LoginResponse;
import com.eluxar.modules.auth.dto.RegisterRequest;
import com.eluxar.modules.auth.dto.ResetPasswordRequest;
import com.eluxar.modules.auth.dto.VerifyCodeRequest;
import com.eluxar.modules.auth.service.AuthService;
import com.eluxar.modules.auth.service.GoogleTokenVerifierService;
import com.eluxar.modules.auth.service.PasswordResetService;
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
    private final PasswordResetService passwordResetService;

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

    @PostMapping("/forgot-password")
    @Operation(summary = "Solicitar código de restablecimiento de contraseña")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        passwordResetService.generateAndSendResetCode(request.getEmail());
        // Siempre respondemos con éxito para prevenir enumeración de usuarios
        return ResponseEntity.ok(ApiResponse.success("Si el email está registrado, se ha enviado un código de recuperación.", null));
    }

    @PostMapping("/verify-reset-code")
    @Operation(summary = "Verificar código ingresado para recuperar contraseña")
    public ResponseEntity<ApiResponse<Void>> verifyResetCode(@Valid @RequestBody VerifyCodeRequest request) {
        passwordResetService.verifyCode(request.getEmail(), request.getCode());
        return ResponseEntity.ok(ApiResponse.success("Código verificado exitosamente", null));
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Establecer la nueva contraseña con un código válido")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        passwordResetService.resetPassword(request.getEmail(), request.getCode(), request.getNewPassword());
        return ResponseEntity.ok(ApiResponse.success("Contraseña actualizada exitosamente", null));
    }
}
