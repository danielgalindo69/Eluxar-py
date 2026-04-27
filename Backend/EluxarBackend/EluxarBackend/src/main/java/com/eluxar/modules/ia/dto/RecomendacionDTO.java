package com.eluxar.modules.ia.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecomendacionDTO {

    private String nombre;
    private String motivo;

}
