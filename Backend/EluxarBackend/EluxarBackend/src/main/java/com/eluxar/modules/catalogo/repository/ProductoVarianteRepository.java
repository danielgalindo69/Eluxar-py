package com.eluxar.modules.catalogo.repository;

import com.eluxar.modules.catalogo.entity.ProductoVariante;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductoVarianteRepository extends JpaRepository<ProductoVariante, Long> {

    Optional<ProductoVariante> findBySku(String sku);

    boolean existsBySku(String sku);
}
