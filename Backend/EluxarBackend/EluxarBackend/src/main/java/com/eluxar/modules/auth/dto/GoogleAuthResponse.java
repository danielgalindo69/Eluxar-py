package com.eluxar.modules.auth.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class GoogleAuthResponse {

    private String token;
    private String tipo;
    private Long userId;
    private String email;
    private String nombre;
    private String rol;
    private String pictureUrl;
}
