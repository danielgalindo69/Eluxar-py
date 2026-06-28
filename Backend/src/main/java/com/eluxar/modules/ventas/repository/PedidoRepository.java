package com.eluxar.modules.ventas.repository;

import com.eluxar.modules.ventas.entity.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    List<Pedido> findByUsuarioIdOrderByCreadoEnDesc(Long usuarioId);

    List<Pedido> findByIdIn(List<Long> ids);

    /**
     * Carga el pedido junto con sus items y variantes de forma EAGER usando JOIN FETCH.
     * Usar en contextos transaccionales del webhook para evitar LazyInitializationException
     * o colecciones vacías al descontar stock del inventario.
     */
    @Query("SELECT p FROM Pedido p " +
           "JOIN FETCH p.items i " +
           "JOIN FETCH i.variante " +
           "WHERE p.id = :id")
    Optional<Pedido> findByIdWithItems(@Param("id") Long id);
}
