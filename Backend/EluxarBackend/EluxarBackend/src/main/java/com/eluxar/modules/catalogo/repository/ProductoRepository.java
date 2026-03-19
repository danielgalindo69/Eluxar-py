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
}
