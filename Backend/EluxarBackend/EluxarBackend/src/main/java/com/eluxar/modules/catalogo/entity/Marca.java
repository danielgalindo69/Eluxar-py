package com.eluxar.modules.catalogo.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "marcas")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Marca {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String nombre;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(length = 255)
    private String logoUrl;

    @Column(nullable = false)
    @Builder.Default
    private boolean activa = true;
}
