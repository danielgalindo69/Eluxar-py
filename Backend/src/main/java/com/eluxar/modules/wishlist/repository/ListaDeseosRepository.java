package com.eluxar.modules.wishlist.repository;

import com.eluxar.modules.wishlist.entity.ListaDeseos;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ListaDeseosRepository extends JpaRepository<ListaDeseos, Long> {
    
    List<ListaDeseos> findByUsuarioIdOrderByFechaAgregadoDesc(Long usuarioId);
    
    Optional<ListaDeseos> findByUsuarioIdAndProductoId(Long usuarioId, Long productoId);
    
    boolean existsByUsuarioIdAndProductoId(Long usuarioId, Long productoId);
    
    void deleteByUsuarioIdAndProductoId(Long usuarioId, Long productoId);
}
