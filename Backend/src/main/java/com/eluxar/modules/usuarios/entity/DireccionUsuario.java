package com.eluxar.modules.usuarios.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "direcciones_usuario")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DireccionUsuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(nullable = false, length = 100)
    private String label;          // "Casa", "Trabajo", etc.

    @Column(nullable = false, length = 255)
    private String street;         // Calle y número

    @Column(length = 100)
    private String barrio;         // Barrio

    @Column(nullable = false, length = 100)
    private String city;           // Ciudad

    @Column(length = 100)
    private String state;          // Departamento

    @Column(length = 20)
    private String zip;            // Código postal

    @Column(nullable = false, length = 100)
    @Builder.Default
    private String country = "Colombia";

    @Column(nullable = false)
    @Builder.Default
    private boolean isDefault = false;
}
