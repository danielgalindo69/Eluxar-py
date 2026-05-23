package com.eluxar.modules.pagos.controller;

import com.eluxar.common.ApiResponse;
import com.eluxar.modules.pagos.dto.PaymentPreferenceRequest;
import com.eluxar.modules.pagos.dto.PaymentPreferenceResponse;
import com.eluxar.modules.pagos.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controlador REST para la integración de pagos con Mercado Pago.
 * Endpoint público: /api/payments/** (configurado en SecurityConfig).
 */
@Slf4j
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Tag(name = "Payments", description = "Integración de pagos con Mercado Pago Checkout Bricks")
public class PaymentController {

    private final PaymentService paymentService;

    /**
     * Crea una preferencia de pago en Mercado Pago.
     * El frontend usa el preferenceId retornado para renderizar el Checkout Brick.
     *
     * @param request DTO con ítems del carrito y datos del comprador
     * @return preferenceId para inicializar el Brick en el frontend
     */
    @PostMapping("/create-preference")
    @Operation(summary = "Crear preferencia de pago en Mercado Pago")
    public ResponseEntity<ApiResponse<PaymentPreferenceResponse>> createPreference(
            @Valid @RequestBody PaymentPreferenceRequest request) {

        log.info("[PaymentController] Solicitud de preferencia para: {} | Total ítems: {}",
                request.getPayerEmail(), request.getItems().size());

        PaymentPreferenceResponse response = paymentService.createPreference(request);
        return ResponseEntity.ok(ApiResponse.success("Preferencia creada exitosamente", response));
    }
}
