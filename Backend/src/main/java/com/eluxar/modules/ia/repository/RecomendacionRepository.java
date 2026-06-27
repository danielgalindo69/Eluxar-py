package com.eluxar.modules.ia.repository;

import com.eluxar.modules.ia.entity.Recomendacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecomendacionRepository extends JpaRepository<Recomendacion, Long> {

    List<Recomendacion> findByUsuarioIdOrderByFechaCreacionDesc(Long usuarioId);
}
