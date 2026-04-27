package com.eluxar.modules.ia.controller;

import com.eluxar.modules.ia.dto.IaRequestDTO;
import com.eluxar.modules.ia.dto.IaResponseDTO;
import com.eluxar.modules.ia.dto.TestQuestionDTO;
import com.eluxar.modules.ia.dto.TestAnswerDTO;
import com.eluxar.modules.ia.dto.TestResultDTO;
import com.eluxar.modules.ia.service.IaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ia")
@RequiredArgsConstructor
@Tag(name = "IA", description = "Endpoints para el asesor de fragancias con Inteligencia Artificial")
public class IaController {

    private final IaService iaService;

    @Operation(summary = "Recomendar perfumes basados en el texto del usuario")
    @PostMapping("/recomendar")
    public ResponseEntity<IaResponseDTO> recomendar(@Valid @RequestBody IaRequestDTO request) {
        IaResponseDTO response = iaService.recomendar(request);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Generar preguntas dinámicas para el test olfativo")
    @GetMapping("/test-preguntas")
    public ResponseEntity<java.util.List<TestQuestionDTO>> generarPreguntasTest() {
        return ResponseEntity.ok(iaService.generarPreguntasTest());
    }

    @Operation(summary = "Analizar respuestas del test y devolver recomendaciones")
    @PostMapping("/test-analizar")
    public ResponseEntity<TestResultDTO> analizarTest(@Valid @RequestBody TestAnswerDTO request) {
        return ResponseEntity.ok(iaService.analizarTest(request));
    }
}
