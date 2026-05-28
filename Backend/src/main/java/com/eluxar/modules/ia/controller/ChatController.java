package com.eluxar.modules.ia.controller;

import com.eluxar.modules.ia.dto.ChatRequest;
import com.eluxar.modules.ia.dto.ChatResponse;
import com.eluxar.modules.ia.service.ChatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ia")
@RequiredArgsConstructor
@Tag(name = "IA Chat", description = "Asesor virtual de fragancias con IA")
public class ChatController {

    private final ChatService chatService;

    /**
     * POST /api/ia/chat
     * Receives a message from the frontend and delegates to the Python Flask agent.
     *
     * Request body:  { "message": "...", "history": [] }
     * Response body: { "response": "...", "history": [] }
     */
    @PostMapping("/chat")
    @Operation(summary = "Enviar mensaje al asesor de fragancias IA")
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
        ChatResponse response = chatService.sendMessage(request);
        return ResponseEntity.ok(response);
    }
}
