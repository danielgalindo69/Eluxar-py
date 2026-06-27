package com.eluxar.modules.ia.service;

import com.eluxar.modules.ia.dto.RecomendacionRequest;
import com.eluxar.modules.ia.dto.RecomendacionResponse;
import com.eluxar.modules.ia.entity.Recomendacion;
import com.eluxar.modules.ia.repository.RecomendacionRepository;
import com.eluxar.modules.usuarios.entity.Usuario;
import com.eluxar.modules.usuarios.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecomendacionService {

    private final RecomendacionRepository recomendacionRepository;
    private final UsuarioRepository usuarioRepository;

    @Transactional
    public RecomendacionResponse guardar(Long usuarioId, RecomendacionRequest request) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con id: " + usuarioId));

        Recomendacion entity = Recomendacion.builder()
                .usuario(usuario)
                .productId(request.getProductId())
                .respuestaTexto(request.getRespuestaTexto())
                .build();

        entity = recomendacionRepository.save(entity);

        return toResponse(entity);
    }

    @Transactional(readOnly = true)
    public List<RecomendacionResponse> listarPorUsuario(Long usuarioId) {
        return recomendacionRepository.findByUsuarioIdOrderByFechaCreacionDesc(usuarioId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private RecomendacionResponse toResponse(Recomendacion entity) {
        return new RecomendacionResponse(
                entity.getId(),
                entity.getProductId(),
                entity.getRespuestaTexto(),
                entity.getFechaCreacion()
        );
    }
}
