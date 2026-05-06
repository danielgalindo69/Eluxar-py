package com.eluxar.modules.ventas.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CheckoutRequest {

    @NotBlank(message = "La dirección es requerida")
    private String direccion;

    @NotBlank(message = "La ciudad es requerida")
    private String ciudad;

    private String codigoPostal;
    private String provincia;

    @NotBlank(message = "El país es requerido")
    private String pais;

    @NotBlank(message = "El método de pago es requerido")
    private String metodoPago;

    private String notas;

    /** Construye la dirección completa para almacenar en el pedido */
    public String getDireccionCompleta() {
        StringBuilder sb = new StringBuilder(direccion);
        if (ciudad != null && !ciudad.isBlank()) sb.append(", ").append(ciudad);
        if (codigoPostal != null && !codigoPostal.isBlank()) sb.append(" ").append(codigoPostal);
        if (provincia != null && !provincia.isBlank()) sb.append(", ").append(provincia);
        if (pais != null && !pais.isBlank()) sb.append(", ").append(pais);
        return sb.toString();
    }
}
