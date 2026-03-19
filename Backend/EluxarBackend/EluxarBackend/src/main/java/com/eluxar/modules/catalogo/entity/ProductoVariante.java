package com.eluxar.modules.catalogo.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "producto_variantes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductoVariante {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;

    @Column(nullable = false)
    private Integer tamanoMl;

    @Column(nullable = false, unique = true, length = 100)
    private String sku;

    @Column(nullable = false)
    @Builder.Default
    private boolean activa = true;

    @OneToMany(mappedBy = "variante", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ProductoPrecio> precios = new ArrayList<>();
}
