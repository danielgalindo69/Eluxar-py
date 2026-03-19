package com.eluxar.modules.admin.controller;

import com.eluxar.common.ApiResponse;
import com.eluxar.modules.admin.dto.DashboardMetricasDTO;
import com.eluxar.modules.admin.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "Panel de control administrativo")
@SecurityRequirement(name = "bearerAuth")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Obtener métricas principales para el panel administrativo (ADMIN)")
    public ResponseEntity<ApiResponse<DashboardMetricasDTO>> obtenerDashboard() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.obtenerMetricas()));
    }
}
