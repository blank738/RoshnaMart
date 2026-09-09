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
public class SellerDashboardResponse {
    private long totalProducts;
    private long activeProducts;
    private long outOfStockProducts;
    private long totalOrders;
    private long totalSales;
    private BigDecimal grossRevenue;
    private BigDecimal commission;
    private BigDecimal netEarnings;
    private BigDecimal pendingEarnings;
    private double averageRating;
    private String verificationStatus;
    private BigDecimal commissionPercentage;
}
