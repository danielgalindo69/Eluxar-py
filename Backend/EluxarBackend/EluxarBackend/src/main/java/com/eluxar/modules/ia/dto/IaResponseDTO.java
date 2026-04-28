package com.eluxar.modules.ia.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IaResponseDTO {

    @JsonProperty("mensaje")
    private String mensaje;

    private List<RecomendacionDTO> recomendaciones;

}
