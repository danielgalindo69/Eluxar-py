package com.eluxar.modules.usuarios.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DireccionDTO {
    private Long id;
    private String label;
    private String street;
    private String barrio;
    private String city;
    private String state;
    private String zip;
    private String country;
    private boolean isDefault;
}
