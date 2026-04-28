package com.eluxar.modules.catalogo.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "productos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String nombre;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(nullable = false)
    @Builder.Default
    private boolean activo = true;

    @Column(nullable = false)
    @Builder.Default
    private boolean destacado = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "marca_id")
    private Marca marca;

    /**
     * Categoría del producto representada como Enum.
     * Reemplaza la antigua relación FK con la tabla "categorias".
     * Valores: CABALLERO, DAMA, NINO, NINA.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "categoria", length = 20)
    private CategoriaEnum categoria;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "familia_olfativa_id")
    private FamiliaOlfativa familiaOlfativa;

    @OneToMany(mappedBy = "producto", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ProductoVariante> variantes = new ArrayList<>();

    @OneToMany(mappedBy = "producto", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ProductoImagen> imagenes = new ArrayList<>();
}

