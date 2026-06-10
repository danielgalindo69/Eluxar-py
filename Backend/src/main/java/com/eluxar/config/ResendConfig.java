package com.eluxar.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

/**
 * Configuración del cliente HTTP compartido (Resend API + IA service).
 * Timeout de 60s para soportar procesamiento de imágenes con Clipdrop.
 */
@Configuration
public class ResendConfig {

    @Bean
    public RestTemplate restTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(10_000);  // 10s para conectar
        factory.setReadTimeout(60_000);     // 60s para leer respuesta (Clipdrop puede tardar)
        return new RestTemplate(factory);
    }
}
