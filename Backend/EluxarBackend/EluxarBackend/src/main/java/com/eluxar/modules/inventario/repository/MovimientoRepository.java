package com.eluxar.modules.inventario.repository;

import com.eluxar.modules.inventario.entity.MovimientoInventario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MovimientoRepository extends JpaRepository<MovimientoInventario, Long> {

    List<MovimientoInventario> findByInventarioIdOrderByCreadoEnDesc(Long inventarioId);

    /**
     * Listado activo: solo movimientos NO archivados, ordenados de más reciente a más antiguo.
     */
    List<MovimientoInventario> findByArchivadoFalseAndCreadoEnBetweenOrderByCreadoEnDesc(LocalDateTime desde, LocalDateTime hasta);

    /**
     * Listado activo completo sin filtro de fechas.
     */
    List<MovimientoInventario> findByArchivadoFalseOrderByCreadoEnDesc();

    /**
     * Para exportar Excel: incluye archivados también dentro del rango (reporte completo).
     */
    List<MovimientoInventario> findByCreadoEnBetweenOrderByCreadoEnDesc(LocalDateTime desde, LocalDateTime hasta);

    /**
     * Para exportar Excel: completo sin filtro de fechas.
     */
    List<MovimientoInventario> findAllByOrderByCreadoEnDesc();

    /**
     * Soft-delete masivo: marca como archivado todo lo anterior a la fecha indicada.
     */
    @Modifying
    @Query("UPDATE MovimientoInventario m SET m.archivado = true WHERE m.creadoEn < :antes AND m.archivado = false")
    void archivarAnterioresA(LocalDateTime antes);
}
