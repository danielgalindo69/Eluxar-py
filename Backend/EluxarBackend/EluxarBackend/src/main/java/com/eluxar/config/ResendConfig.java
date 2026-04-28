package com.eluxar.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

/**
 * Configuración del cliente HTTP para la integración con Resend API.
 * Se usa RestTemplate en lugar de JavaMailSender/SMTP.
 */
@Configuration
public class ResendConfig {

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
