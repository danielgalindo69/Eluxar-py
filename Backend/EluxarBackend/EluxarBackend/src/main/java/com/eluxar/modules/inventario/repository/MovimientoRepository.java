package com.eluxar.modules.inventario.repository;

import com.eluxar.modules.inventario.entity.MovimientoInventario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MovimientoRepository extends JpaRepository<MovimientoInventario, Long> {

    List<MovimientoInventario> findByInventarioIdOrderByCreadoEnDesc(Long inventarioId);
}
