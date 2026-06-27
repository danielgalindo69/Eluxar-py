package com.eluxar.modules.usuarios.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
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

    @JsonProperty("isDefault")
    private boolean isDefault;
}
