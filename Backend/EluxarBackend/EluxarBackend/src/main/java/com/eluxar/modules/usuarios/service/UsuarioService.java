package com.eluxar.modules.usuarios.service;

import com.eluxar.exception.ResourceNotFoundException;
import com.eluxar.modules.usuarios.dto.UsuarioDTO;
import com.eluxar.modules.usuarios.mapper.UsuarioMapper;
import com.eluxar.modules.usuarios.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final UsuarioMapper usuarioMapper;

    public List<UsuarioDTO> listarTodos() {
        return usuarioRepository.findAll().stream()
                .map(usuarioMapper::toDTO)
                .toList();
    }

    public UsuarioDTO obtenerPorId(Long id) {
        return usuarioRepository.findById(id)
                .map(usuarioMapper::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", id));
    }

    @Transactional
    public void desactivar(Long id) {
        var usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", id));
        usuario.setActivo(false);
        usuarioRepository.save(usuario);
    }
}
