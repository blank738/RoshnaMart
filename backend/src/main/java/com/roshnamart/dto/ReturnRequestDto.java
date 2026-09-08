package com.roshnamart.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReturnRequestDto {
    private Long id;

    @NotNull(message = "Order item ID is required")
    private Long orderItemId;

    private Long buyerId;
    private String buyerName;
    private Long sellerId;
    private String sellerBusinessName;
    private Long productId;
    private String productName;

    @NotBlank(message = "Return reason is required")
    private String reason;

    private String description;
    private String imageUrl;
    private String status;
    private LocalDateTime createdAt;
}
