package com.eluxar.modules.usuarios.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "usuarios")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(nullable = false, length = 100)
    private String apellido;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(nullable = true)
    private String passwordHash;

    @Column(columnDefinition = "VARCHAR(20) NOT NULL DEFAULT 'LOCAL'")
    @Builder.Default
    private String provider = "LOCAL"; // LOCAL or GOOGLE

    @Column(length = 500)
    private String pictureUrl;

    @Column(nullable = false)
    @Builder.Default
    private boolean activo = true;

    @Column(nullable = false)
    @Builder.Default
    private int intentosFallidos = 0;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime fechaRegistro;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "rol_id", nullable = false)
    private Rol rol;
}
