package com.eluxar.modules.ventas.controller;

import com.eluxar.common.ApiResponse;
import com.eluxar.modules.ventas.dto.CuponDTO;
import com.eluxar.modules.ventas.service.CuponService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cupones")
@RequiredArgsConstructor
public class CuponController {

    private final CuponService cuponService;

    /**
     * Valida que el cupón exista, esté activo, no haya expirado
     * y no haya superado su límite de usos.
     * NO incrementa el contador (eso ocurre al finalizar el pedido).
     */
    @GetMapping("/validar/{codigo}")
    public ResponseEntity<ApiResponse<CuponDTO>> validar(@PathVariable String codigo) {
        CuponDTO data = cuponService.validar(codigo);
        return ResponseEntity.ok(ApiResponse.success("Cupón válido", data));
    }
}
