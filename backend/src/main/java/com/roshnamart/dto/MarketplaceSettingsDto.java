package com.roshnamart.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MarketplaceSettingsDto {
    private Long id;
    private String platformName;
    private BigDecimal defaultCommissionPercentage;
    private BigDecimal deliveryCharge;
    private BigDecimal freeDeliveryThreshold;
    private BigDecimal minOrderAmount;
    private Integer returnWindowDays;
    private Boolean sellerApprovalRequired;
    private Boolean productApprovalRequired;
    private Boolean codEnabled;
    private Boolean onlinePaymentEnabled;
}
