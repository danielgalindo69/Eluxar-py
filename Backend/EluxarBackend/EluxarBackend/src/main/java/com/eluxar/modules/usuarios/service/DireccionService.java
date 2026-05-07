package com.eluxar.modules.usuarios.service;

import com.eluxar.common.ApiResponse;
import com.eluxar.modules.usuarios.dto.DireccionDTO;
import com.eluxar.modules.usuarios.dto.DireccionRequest;
import com.eluxar.modules.usuarios.entity.DireccionUsuario;
import com.eluxar.modules.usuarios.entity.Usuario;
import com.eluxar.modules.usuarios.repository.DireccionUsuarioRepository;
import com.eluxar.modules.usuarios.repository.UsuarioRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DireccionService {

    private static final int MAX_DIRECCIONES = 5;

    private final DireccionUsuarioRepository direccionRepo;
    private final UsuarioRepository usuarioRepo;

    private Usuario getUsuario(String email) {
        return usuarioRepo.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
    }

    private DireccionDTO toDTO(DireccionUsuario d) {
        return DireccionDTO.builder()
                .id(d.getId())
                .label(d.getLabel())
                .street(d.getStreet())
                .barrio(d.getBarrio())
                .city(d.getCity())
                .state(d.getState())
                .zip(d.getZip())
                .country(d.getCountry())
                .isDefault(d.isDefault())
                .build();
    }

    public List<DireccionDTO> listar(String email) {
        Usuario u = getUsuario(email);
        return direccionRepo.findByUsuarioIdOrderByIsDefaultDesc(u.getId())
                .stream().map(this::toDTO).toList();
    }

    @Transactional
    public DireccionDTO crear(String email, DireccionRequest req) {
        Usuario u = getUsuario(email);
        if (direccionRepo.countByUsuarioId(u.getId()) >= MAX_DIRECCIONES) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Máximo " + MAX_DIRECCIONES + " direcciones permitidas");
        }

        // Si es la primera dirección o se marca como default, limpiar las demás
        boolean esDefault = req.isDefault() ||
                direccionRepo.countByUsuarioId(u.getId()) == 0;

        if (esDefault) {
            direccionRepo.clearDefaultForUser(u.getId());
        }

        DireccionUsuario dir = DireccionUsuario.builder()
                .usuario(u)
                .label(req.getLabel())
                .street(req.getStreet())
                .barrio(req.getBarrio())
                .city(req.getCity())
                .state(req.getState())
                .zip(req.getZip())
                .country(req.getCountry() != null ? req.getCountry() : "Colombia")
                .isDefault(esDefault)
                .build();

        return toDTO(direccionRepo.save(dir));
    }

    @Transactional
    public DireccionDTO actualizar(String email, Long id, DireccionRequest req) {
        Usuario u = getUsuario(email);
        DireccionUsuario dir = direccionRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Dirección no encontrada"));

        if (!dir.getUsuario().getId().equals(u.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No autorizado");
        }

        if (req.isDefault()) {
            direccionRepo.clearDefaultForUser(u.getId());
            dir.setDefault(true);
        }

        dir.setLabel(req.getLabel());
        dir.setStreet(req.getStreet());
        dir.setBarrio(req.getBarrio());
        dir.setCity(req.getCity());
        dir.setState(req.getState());
        dir.setZip(req.getZip());
        if (req.getCountry() != null) dir.setCountry(req.getCountry());

        return toDTO(direccionRepo.save(dir));
    }

    @Transactional
    public void eliminar(String email, Long id) {
        Usuario u = getUsuario(email);
        DireccionUsuario dir = direccionRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Dirección no encontrada"));

        if (!dir.getUsuario().getId().equals(u.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No autorizado");
        }
        direccionRepo.delete(dir);
    }

    @Transactional
    public DireccionDTO setPredeterminada(String email, Long id) {
        Usuario u = getUsuario(email);
        DireccionUsuario dir = direccionRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Dirección no encontrada"));

        if (!dir.getUsuario().getId().equals(u.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No autorizado");
        }

        direccionRepo.clearDefaultForUser(u.getId());
        dir.setDefault(true);
        return toDTO(direccionRepo.save(dir));
    }
}
