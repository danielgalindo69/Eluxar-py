package com.eluxar.modules.catalogo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResenaDTO {
    private Long id;
    private Long productoId;
    private Long usuarioId;
    private String usuarioNombre;
    private String usuarioIniciales;
    private Integer calificacion;
    private String comentario;
    private LocalDateTime creadoEn;
}
