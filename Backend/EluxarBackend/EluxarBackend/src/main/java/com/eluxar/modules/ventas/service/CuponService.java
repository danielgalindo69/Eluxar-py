package com.eluxar.modules.ventas.service;

import com.eluxar.modules.ventas.dto.CuponDTO;
import com.eluxar.modules.ventas.entity.Cupon;
import com.eluxar.modules.ventas.repository.CuponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CuponService {

    private final CuponRepository cuponRepo;

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
