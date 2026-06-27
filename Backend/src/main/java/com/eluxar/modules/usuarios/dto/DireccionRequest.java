package com.eluxar.modules.usuarios.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
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

    @JsonProperty("isDefault")
    private boolean isDefault;
}
