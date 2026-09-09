package com.roshnamart.controller;

import com.roshnamart.dto.MarketplaceSettingsDto;
import com.roshnamart.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
@Tag(name = "Settings", description = "Public marketplace settings (commission rates, delivery thresholds, payment gates)")
public class SettingsController {

    private final AdminService adminService;

    @GetMapping
    @Operation(summary = "Get active public marketplace settings")
    public ResponseEntity<MarketplaceSettingsDto> getPublicSettings() {
        return ResponseEntity.ok(adminService.getMarketplaceSettings());
    }
}
