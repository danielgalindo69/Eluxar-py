package com.eluxar.modules.inventario.entity;

import com.eluxar.modules.catalogo.entity.ProductoVariante;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "inventario")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Inventario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variante_id", nullable = false, unique = true)
    private ProductoVariante variante;

    @Column(nullable = false)
    @Builder.Default
    private Integer stockActual = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer stockReservado = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer stockMinimo = 5;
}
