package com.eluxar.modules.catalogo.repository;

import com.eluxar.modules.catalogo.entity.ProductoPrecio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductoPrecioRepository extends JpaRepository<ProductoPrecio, Long> {
    List<ProductoPrecio> findByVarianteId(Long varianteId);
}
