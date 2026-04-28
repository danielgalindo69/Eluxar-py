package com.eluxar.modules.ia.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IaRequestDTO {

    @NotBlank(message = "El mensaje del usuario no puede estar vacío")
    private String mensaje;

}
