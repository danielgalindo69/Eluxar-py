package com.eluxar.modules.wishlist.service;

import com.eluxar.modules.catalogo.dto.ProductoDTO;
import com.eluxar.modules.catalogo.entity.Producto;
import com.eluxar.modules.catalogo.mapper.ProductoMapper;
import com.eluxar.modules.catalogo.repository.ProductoRepository;
import com.eluxar.modules.usuarios.entity.Usuario;
import com.eluxar.modules.usuarios.repository.UsuarioRepository;
import com.eluxar.modules.wishlist.entity.ListaDeseos;
import com.eluxar.modules.wishlist.repository.ListaDeseosRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ListaDeseosService {

    private final ListaDeseosRepository listaDeseosRepository;
    private final UsuarioRepository usuarioRepository;
    private final ProductoRepository productoRepository;
    private final ProductoMapper productoMapper;

    public List<ProductoDTO> obtenerListaDeseos(Long usuarioId) {
        List<ListaDeseos> deseos = listaDeseosRepository.findByUsuarioIdOrderByFechaAgregadoDesc(usuarioId);
        return deseos.stream()
                .map(ListaDeseos::getProducto)
                .map(productoMapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<Long> obtenerIdsListaDeseos(Long usuarioId) {
        List<ListaDeseos> deseos = listaDeseosRepository.findByUsuarioIdOrderByFechaAgregadoDesc(usuarioId);
        return deseos.stream()
                .map(d -> d.getProducto().getId())
                .collect(Collectors.toList());
    }

    @Transactional
    public void agregarProducto(Long usuarioId, Long productoId) {
        if (listaDeseosRepository.existsByUsuarioIdAndProductoId(usuarioId, productoId)) {
            return; // Ya está en la lista
        }

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        
        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado"));

        ListaDeseos nuevoDeseo = ListaDeseos.builder()
                .usuario(usuario)
                .producto(producto)
                .build();

        listaDeseosRepository.save(nuevoDeseo);
    }

    @Transactional
    public void eliminarProducto(Long usuarioId, Long productoId) {
        listaDeseosRepository.deleteByUsuarioIdAndProductoId(usuarioId, productoId);
    }
}
