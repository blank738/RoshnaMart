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
public class AdminDashboardResponse {
    private long totalBuyers;
    private long totalSellers;
    private long pendingSellers;
    private long totalProducts;
    private long pendingProducts;
    private long totalOrders;
    private BigDecimal totalRevenue;
    private BigDecimal platformCommission;
    private long totalRefunds;
}
