package com.eluxar.modules.ia.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IaImageResponseDTO {

    @JsonProperty("imagen_url")
    private String imagenUrl;

    @JsonProperty("prompt_usado")
    private String promptUsado;

    @JsonProperty("mensaje")
    private String mensaje;
}
