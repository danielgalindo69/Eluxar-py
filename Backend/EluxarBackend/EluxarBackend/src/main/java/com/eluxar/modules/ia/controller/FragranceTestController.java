package com.eluxar.modules.ia.controller;

import com.eluxar.modules.ia.dto.FragranceTestRequest;
import com.eluxar.modules.ia.dto.FragranceTestResponse;
import com.eluxar.modules.ia.service.FragranceTestService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ia")
@RequiredArgsConstructor
@Tag(name = "IA Fragrance Test", description = "Test olfativo con recomendación de fragancias por IA")
public class FragranceTestController {

    private final FragranceTestService fragranceTestService;

    /**
     * POST /api/ia/fragrance-test
     * Processes one step of the olfactory test.
     *
     * Request body:  { "message": "...", "history": [...], "step": 0 }
     * Response body: { "response": "...", "question": "...", "options": [...],
     *                   "history": [...], "step": 1, "finished": false, "totalSteps": 7 }
     */
    @PostMapping("/fragrance-test")
    @Operation(summary = "Procesar un paso del test olfativo IA")
    public ResponseEntity<FragranceTestResponse> fragranceTest(@RequestBody FragranceTestRequest request) {
        FragranceTestResponse response = fragranceTestService.processTest(request);
        return ResponseEntity.ok(response);
    }
}
