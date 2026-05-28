package com.eluxar.modules.ventas.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "cupones")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Cupon {

    public enum TipoDescuento {
        PORCENTAJE, VALOR_FIJO
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String codigo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TipoDescuento tipo;

    /** Porcentaje (0-100) o valor fijo en COP */
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal descuento;

    /** Monto mínimo del pedido para que aplique el cupón */
    @Column(precision = 10, scale = 2)
    private BigDecimal montoMinimo;

    /** Número máximo de usos permitidos (null = ilimitado) */
    @Column
    private Integer limiteUsos;

    /** Usos actuales */
    @Column(nullable = false)
    @Builder.Default
    private int usosActuales = 0;

    @Column(nullable = false)
    @Builder.Default
    private boolean activo = true;

    @Column
    private LocalDateTime fechaExpiracion;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime creadoEn;
}
