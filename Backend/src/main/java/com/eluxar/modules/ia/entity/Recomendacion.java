package com.eluxar.modules.ia.entity;

import com.eluxar.modules.usuarios.entity.Usuario;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "recomendaciones")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Recomendacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    private Integer productId;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String respuestaTexto;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime fechaCreacion;
}
