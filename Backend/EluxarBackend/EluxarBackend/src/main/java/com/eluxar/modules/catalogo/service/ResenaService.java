package com.eluxar.modules.catalogo.service;

import com.eluxar.exception.ResourceNotFoundException;
import com.eluxar.modules.catalogo.dto.ResenaDTO;
import com.eluxar.modules.catalogo.dto.ResenaRequest;
import com.eluxar.modules.catalogo.entity.Producto;
import com.eluxar.modules.catalogo.entity.Resena;
import com.eluxar.modules.catalogo.repository.ProductoRepository;
import com.eluxar.modules.catalogo.repository.ResenaRepository;
import com.eluxar.modules.usuarios.entity.Usuario;
import com.eluxar.modules.usuarios.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ResenaService {

    private final ResenaRepository resenaRepository;
    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;

    @Transactional(readOnly = true)
    public Page<ResenaDTO> listarPorProducto(Long productoId, Pageable pageable) {
        if (!productoRepository.existsById(productoId)) {
            throw new ResourceNotFoundException("Producto", productoId);
        }
        return resenaRepository.findByProductoIdOrderByCreadoEnDesc(productoId, pageable)
                .map(this::mapToDTO);
    }

    @Transactional
    public ResenaDTO guardarResena(Long productoId, Long usuarioId, ResenaRequest request) {
        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new ResourceNotFoundException("Producto", productoId));
                
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", usuarioId));

        // Sanitizar el comentario para evitar inyección XSS básica
        String comentarioLimpio = sanitizarTexto(request.getComentario());

        Optional<Resena> resenaExistente = resenaRepository.findByProductoIdAndUsuarioId(productoId, usuarioId);
        Resena resena;

        if (resenaExistente.isPresent()) {
            // Actualizar reseña existente
            resena = resenaExistente.get();
            resena.setCalificacion(request.getCalificacion());
            resena.setComentario(comentarioLimpio);
        } else {
            // Crear nueva reseña
            resena = Resena.builder()
                    .producto(producto)
                    .usuario(usuario)
                    .calificacion(request.getCalificacion())
                    .comentario(comentarioLimpio)
                    .build();
        }

        resena = resenaRepository.save(resena);
        
        // Actualizar promedio y conteo en el producto de forma asíncrona o sincrónica
        actualizarEstadisticasProducto(producto);

        return mapToDTO(resena);
    }

    private void actualizarEstadisticasProducto(Producto producto) {
        Double promedio = resenaRepository.getAverageRatingByProductoId(producto.getId());
        Integer total = resenaRepository.countByProductoId(producto.getId());
        
        producto.setPromedioCalificacion(promedio != null ? Math.round(promedio * 10.0) / 10.0 : 0.0);
        producto.setTotalResenas(total != null ? total : 0);
        
        productoRepository.save(producto);
    }

    private String sanitizarTexto(String input) {
        if (input == null) return null;
        // Reemplazo básico de etiquetas HTML para evitar XSS
        return input.replaceAll("<", "&lt;").replaceAll(">", "&gt;");
    }

    private ResenaDTO mapToDTO(Resena resena) {
        String nombre = resena.getUsuario().getNombre();
        String apellido = resena.getUsuario().getApellido();
        String iniciales = (nombre != null && !nombre.isEmpty() ? nombre.substring(0, 1).toUpperCase() : "") + 
                           (apellido != null && !apellido.isEmpty() ? apellido.substring(0, 1).toUpperCase() : "");

        return ResenaDTO.builder()
                .id(resena.getId())
                .productoId(resena.getProducto().getId())
                .usuarioId(resena.getUsuario().getId())
                .usuarioNombre(nombre + " " + apellido)
                .usuarioIniciales(iniciales)
                .calificacion(resena.getCalificacion())
                .comentario(resena.getComentario())
                .creadoEn(resena.getCreadoEn())
                .build();
    }
}
