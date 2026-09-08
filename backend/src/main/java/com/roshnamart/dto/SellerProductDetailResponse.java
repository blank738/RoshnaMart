package com.roshnamart.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SellerProductDetailResponse {
    private ProductResponse product;
    private long totalOrders;
    private long buyerCount;
    private BigDecimal grossRevenue;
    private BigDecimal commission;
    private BigDecimal netRevenue;
    private List<ReviewDto> reviews;
}
