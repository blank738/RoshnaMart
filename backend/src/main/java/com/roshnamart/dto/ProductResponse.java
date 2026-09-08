package com.roshnamart.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {
    private Long id;
    private Long sellerId;
    private String sellerBusinessName;
    private Long categoryId;
    private String categoryName;
    private String name;
    private String description;
    private BigDecimal price;
    private BigDecimal discountPrice;
    private Integer discountPercentage;
    private Integer quantity;
    private String imageUrl;
    private String brand;
    private String sku;
    private String status;
    private Double rating;
    private Integer reviewCount;
    private List<String> additionalImages;
    private LocalDateTime createdAt;
}
