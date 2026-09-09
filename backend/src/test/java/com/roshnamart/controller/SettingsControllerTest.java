package com.roshnamart.controller;

import com.roshnamart.dto.MarketplaceSettingsDto;
import com.roshnamart.service.AdminService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class SettingsControllerTest {

    @Mock
    private AdminService adminService;

    @InjectMocks
    private SettingsController settingsController;

    @Test
    @DisplayName("Public Settings Endpoint: Returns active delivery thresholds, commissions, and payment toggles")
    void testGetPublicSettings() {
        MarketplaceSettingsDto mockDto = MarketplaceSettingsDto.builder()
                .platformName("RoshnaMart")
                .defaultCommissionPercentage(new BigDecimal("5.00"))
                .deliveryCharge(new BigDecimal("50.00"))
                .freeDeliveryThreshold(new BigDecimal("500.00"))
                .minOrderAmount(new BigDecimal("100.00"))
                .codEnabled(true)
                .onlinePaymentEnabled(true)
                .build();

        when(adminService.getMarketplaceSettings()).thenReturn(mockDto);

        ResponseEntity<MarketplaceSettingsDto> response = settingsController.getPublicSettings();

        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals("RoshnaMart", response.getBody().getPlatformName());
        assertEquals(new BigDecimal("5.00"), response.getBody().getDefaultCommissionPercentage());
        assertEquals(new BigDecimal("50.00"), response.getBody().getDeliveryCharge());
        assertEquals(new BigDecimal("500.00"), response.getBody().getFreeDeliveryThreshold());
    }
}
