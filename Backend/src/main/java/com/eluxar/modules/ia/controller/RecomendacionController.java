package com.eluxar.modules.ia.controller;

import com.eluxar.modules.ia.dto.RecomendacionRequest;
import com.eluxar.modules.ia.dto.RecomendacionResponse;
import com.eluxar.modules.ia.service.RecomendacionService;
import com.eluxar.security.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ia")
@RequiredArgsConstructor
@Tag(name = "IA Recomendaciones", description = "Persistencia de recomendaciones del test olfativo")
public class RecomendacionController {

    private final RecomendacionService recomendacionService;

    @PostMapping("/recomendaciones")
    @Operation(summary = "Guardar una recomendación del test olfativo")
    public ResponseEntity<RecomendacionResponse> guardar(
            @RequestBody RecomendacionRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        RecomendacionResponse response = recomendacionService.guardar(userDetails.getId(), request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/recomendaciones")
    @Operation(summary = "Listar recomendaciones del usuario autenticado")
    public ResponseEntity<List<RecomendacionResponse>> listar(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        List<RecomendacionResponse> recomendaciones = recomendacionService.listarPorUsuario(userDetails.getId());
        return ResponseEntity.ok(recomendaciones);
    }
}
