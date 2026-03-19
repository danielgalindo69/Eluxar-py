package com.eluxar.modules.catalogo.repository;

import com.eluxar.modules.catalogo.entity.Marca;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MarcaRepository extends JpaRepository<Marca, Long> {

    List<Marca> findByActivaTrue();

    boolean existsByNombre(String nombre);

    Optional<Marca> findByNombre(String nombre);
}
