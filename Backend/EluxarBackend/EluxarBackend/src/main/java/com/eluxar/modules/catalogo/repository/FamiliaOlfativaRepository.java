package com.eluxar.modules.catalogo.repository;

import com.eluxar.modules.catalogo.entity.FamiliaOlfativa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FamiliaOlfativaRepository extends JpaRepository<FamiliaOlfativa, Long> {
    Optional<FamiliaOlfativa> findByNombre(String nombre);
}
