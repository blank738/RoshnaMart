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
public class OrderResponse {
    private Long id;
    private String orderNumber;
    private Long buyerId;
    private String buyerName;
    private String buyerEmail;
    private BigDecimal totalAmount;
    private BigDecimal discountAmount;
    private BigDecimal deliveryCharge;
    private BigDecimal finalAmount;
    private String paymentStatus;
    private String orderStatus;
    private AddressDto shippingAddress;
    private List<OrderItemResponse> items;
    private PaymentResponse payment;
    private LocalDateTime createdAt;
}
