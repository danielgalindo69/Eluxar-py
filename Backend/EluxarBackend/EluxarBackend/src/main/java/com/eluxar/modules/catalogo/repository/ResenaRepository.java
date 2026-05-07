package com.eluxar.modules.catalogo.repository;

import com.eluxar.modules.catalogo.entity.Resena;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ResenaRepository extends JpaRepository<Resena, Long> {

    Page<Resena> findByProductoIdOrderByCreadoEnDesc(Long productoId, Pageable pageable);

    Optional<Resena> findByProductoIdAndUsuarioId(Long productoId, Long usuarioId);

    @Query("SELECT AVG(r.calificacion) FROM Resena r WHERE r.producto.id = :productoId")
    Double getAverageRatingByProductoId(Long productoId);

    @Query("SELECT COUNT(r) FROM Resena r WHERE r.producto.id = :productoId")
    Integer countByProductoId(Long productoId);
}
