package com.eluxar.modules.ventas.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CheckoutRequest {

    @NotBlank(message = "La dirección es requerida")
    private String direccion;

    private String barrio;

    @NotBlank(message = "La ciudad es requerida")
    private String ciudad;

    private String codigoPostal;

    private String departamento;

    @NotBlank(message = "El país es requerido")
    private String pais;

    @NotBlank(message = "El método de pago es requerido")
    private String metodoPago;

    /** Código de descuento (opcional) */
    private String codigoDescuento;

    private String notas;

    /** Construye la dirección completa para almacenar en el pedido */
    public String getDireccionCompleta() {
        StringBuilder sb = new StringBuilder(direccion);
        if (barrio != null && !barrio.isBlank()) sb.append(", ").append(barrio);
        if (ciudad != null && !ciudad.isBlank()) sb.append(", ").append(ciudad);
        if (codigoPostal != null && !codigoPostal.isBlank()) sb.append(" ").append(codigoPostal);
        if (departamento != null && !departamento.isBlank()) sb.append(", ").append(departamento);
        if (pais != null && !pais.isBlank()) sb.append(", ").append(pais);
        return sb.toString();
    }
}
