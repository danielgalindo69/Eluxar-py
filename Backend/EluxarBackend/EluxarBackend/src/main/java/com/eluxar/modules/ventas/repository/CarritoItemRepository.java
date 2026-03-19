package com.eluxar.modules.ventas.repository;

import com.eluxar.modules.ventas.entity.CarritoItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CarritoItemRepository extends JpaRepository<CarritoItem, Long> {

    Optional<CarritoItem> findByCarritoIdAndVarianteId(Long carritoId, Long varianteId);
}
