package com.eluxar.modules.usuarios.repository;

import com.eluxar.modules.usuarios.entity.DireccionUsuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DireccionUsuarioRepository extends JpaRepository<DireccionUsuario, Long> {

    List<DireccionUsuario> findByUsuarioIdOrderByIsDefaultDesc(Long usuarioId);

    int countByUsuarioId(Long usuarioId);

    @Modifying
    @Query("UPDATE DireccionUsuario d SET d.isDefault = false WHERE d.usuario.id = :usuarioId")
    void clearDefaultForUser(@Param("usuarioId") Long usuarioId);
}
