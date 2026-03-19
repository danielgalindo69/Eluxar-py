package com.eluxar.modules.ventas.dto;

import lombok.Data;

@Data
public class CheckoutRequest {

    // Aquí irían datos de envío, método de pago, etc.
    // Para la demo mantendremos un checkout simple desde el carrito activo
    private String direccionEnvio;
    private String metodoPago;
    private String notas;
}
