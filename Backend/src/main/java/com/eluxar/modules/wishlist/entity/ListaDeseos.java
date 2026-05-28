package com.eluxar.modules.wishlist.entity;

import com.eluxar.modules.catalogo.entity.Producto;
import com.eluxar.modules.usuarios.entity.Usuario;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "lista_deseos", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"usuario_id", "producto_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ListaDeseos {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime fechaAgregado;
}
