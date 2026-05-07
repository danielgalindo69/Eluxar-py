package com.eluxar.modules.catalogo.repository;

import com.eluxar.modules.catalogo.entity.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long>,
        JpaSpecificationExecutor<Producto> {

    List<Producto> findByActivoTrue();

    List<Producto> findByDestacadoTrueAndActivoTrue();

    @org.springframework.data.jpa.repository.Query("SELECT p FROM Producto p WHERE p.activo = true AND p.totalResenas > 0 ORDER BY p.promedioCalificacion DESC, p.totalResenas DESC")
    List<Producto> findTopRatedProducts(org.springframework.data.domain.Pageable pageable);
}
