package com.eluxar.modules.catalogo.repository;

import com.eluxar.modules.catalogo.entity.Producto;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long>,
        JpaSpecificationExecutor<Producto> {

    List<Producto> findByActivoTrue();

    List<Producto> findByDestacadoTrueAndActivoTrue();

    @Query("SELECT p FROM Producto p WHERE p.activo = true AND p.totalResenas > 0 ORDER BY p.promedioCalificacion DESC, p.totalResenas DESC")
    List<Producto> findTopRatedProducts(Pageable pageable);

    /**
     * Búsqueda predictiva: busca coincidencias en nombre, familia olfativa o marca.
     * Case-insensitive. Devuelve máximo 8 resultados para el dropdown de autocompletado.
     */
    @Query("""
            SELECT p FROM Producto p
            LEFT JOIN p.familiaOlfativa f
            LEFT JOIN p.marca m
            WHERE p.activo = true
              AND (LOWER(p.nombre) LIKE LOWER(CONCAT('%', :q, '%'))
                OR LOWER(f.nombre) LIKE LOWER(CONCAT('%', :q, '%'))
                OR LOWER(m.nombre) LIKE LOWER(CONCAT('%', :q, '%')))
            ORDER BY p.nombre ASC
            """)
    List<Producto> buscarSugerencias(String q, Pageable pageable);
}
