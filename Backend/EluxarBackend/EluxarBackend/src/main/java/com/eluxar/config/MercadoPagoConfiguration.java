package com.eluxar.config;

import com.mercadopago.MercadoPagoConfig;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

/**
 * Inicialización del SDK oficial de Mercado Pago.
 * El access token se carga desde variables de entorno (nunca hardcodeado).
 * Para escalar a producción, solo se reemplaza el valor de MP_ACCESS_TOKEN.
 */
@Slf4j
@Configuration
public class MercadoPagoConfiguration {

    @Value("${mercadopago.access-token}")
    private String accessToken;

    @PostConstruct
    public void init() {
        MercadoPagoConfig.setAccessToken(accessToken);
        log.info("[MercadoPago] SDK inicializado correctamente en modo sandbox.");
    }
}
