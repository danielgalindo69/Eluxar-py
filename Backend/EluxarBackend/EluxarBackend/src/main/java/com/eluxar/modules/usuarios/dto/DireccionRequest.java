package com.eluxar.modules.usuarios.dto;

import lombok.Data;

@Data
public class DireccionRequest {
    private String label;
    private String street;
    private String barrio;
    private String city;
    private String state;
    private String zip;
    private String country;
    private boolean isDefault;
}
