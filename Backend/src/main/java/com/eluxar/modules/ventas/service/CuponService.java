package com.eluxar.modules.ventas.service;

import com.eluxar.modules.ventas.dto.CuponDTO;
import com.eluxar.modules.ventas.entity.Cupon;
import com.eluxar.modules.ventas.repository.CuponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import com.eluxar.modules.ventas.dto.AdminCuponDTO;
import com.eluxar.modules.ventas.dto.CuponRequest;

@Service
@RequiredArgsConstructor
public class CuponService {

    private final CuponRepository cuponRepo;

    public List<AdminCuponDTO> obtenerTodos() {
        return cuponRepo.findAll().stream()
                .map(AdminCuponDTO::from)
                .collect(Collectors.toList());
    }

    public AdminCuponDTO crearCupon(CuponRequest req) {
        if (cuponRepo.findByCodigoIgnoreCase(req.getCodigo()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El código del cupón ya existe");
        }

        Cupon cupon = Cupon.builder()
                .codigo(req.getCodigo().toUpperCase())
                .tipo(Cupon.TipoDescuento.valueOf(req.getTipo()))
                .descuento(req.getDescuento())
                .montoMinimo(req.getMontoMinimo())
                .limiteUsos(req.getLimiteUsos())
                .fechaExpiracion(req.getFechaExpiracion())
                .activo(req.isActivo())
                .build();

        return AdminCuponDTO.from(cuponRepo.save(cupon));
    }

    public AdminCuponDTO actualizarCupon(Long id, CuponRequest req) {
        Cupon cupon = cuponRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cupón no encontrado"));

        if (!cupon.getCodigo().equalsIgnoreCase(req.getCodigo()) && 
            cuponRepo.findByCodigoIgnoreCase(req.getCodigo()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El código de cupón ya está en uso");
        }

        cupon.setCodigo(req.getCodigo().toUpperCase());
        cupon.setTipo(Cupon.TipoDescuento.valueOf(req.getTipo()));
        cupon.setDescuento(req.getDescuento());
        cupon.setMontoMinimo(req.getMontoMinimo());
        cupon.setLimiteUsos(req.getLimiteUsos());
        cupon.setFechaExpiracion(req.getFechaExpiracion());
        cupon.setActivo(req.isActivo());

        return AdminCuponDTO.from(cuponRepo.save(cupon));
    }

    public void eliminarCupon(Long id) {
        if (!cuponRepo.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Cupón no encontrado");
        }
        try {
            cuponRepo.deleteById(id);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "No se puede eliminar el cupón porque ya ha sido utilizado en uno o más pedidos. En su lugar, puedes desactivarlo.");
        }
    }

    public CuponDTO validar(String codigo) {
        Cupon cupon = cuponRepo.findByCodigoIgnoreCase(codigo)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cupón no válido"));

        if (!cupon.isActivo()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El cupón no está activo");
        }
        if (cupon.getFechaExpiracion() != null && cupon.getFechaExpiracion().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El cupón ha expirado");
        }
        if (cupon.getLimiteUsos() != null && cupon.getUsosActuales() >= cupon.getLimiteUsos()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El cupón ha alcanzado su límite de usos");
        }

        return CuponDTO.from(cupon);
    }

    /** Llamado internamente al finalizar el pedido */
    public Cupon findAndValidate(String codigo) {
        Cupon cupon = cuponRepo.findByCodigoIgnoreCase(codigo)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cupón no válido"));
        // Incrementar uso
        cupon.setUsosActuales(cupon.getUsosActuales() + 1);
        return cuponRepo.save(cupon);
    }
}
