package com.eluxar.modules.ventas.repository;

import com.eluxar.modules.ventas.entity.Carrito;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CarritoRepository extends JpaRepository<Carrito, Long> {

    Optional<Carrito> findByUsuarioIdAndActivoTrue(Long usuarioId);
}
