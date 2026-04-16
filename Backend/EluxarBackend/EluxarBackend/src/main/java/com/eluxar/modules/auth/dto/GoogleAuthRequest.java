package com.eluxar.modules.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GoogleAuthRequest {

    @NotBlank(message = "El token de Google es obligatorio")
    private String token;
}
