package com.eluxar.modules.catalogo.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "producto_precios")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductoPrecio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variante_id", nullable = false)
    private ProductoVariante variante;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal precioCosto;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal precioVenta;

    @Column(precision = 10, scale = 2)
    private BigDecimal precioOferta;

    @Column(nullable = false)
    @Builder.Default
    private boolean activo = true;
}
