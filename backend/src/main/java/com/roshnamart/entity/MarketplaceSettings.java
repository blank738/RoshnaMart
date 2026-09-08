package com.roshnamart.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "marketplace_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarketplaceSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "platform_name", nullable = false)
    @Builder.Default
    private String platformName = "RoshnaMart";

    @Column(name = "default_commission_percentage", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal defaultCommissionPercentage = new BigDecimal("5.00");

    @Column(name = "delivery_charge", nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal deliveryCharge = new BigDecimal("40.00");

    @Column(name = "free_delivery_threshold", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal freeDeliveryThreshold = new BigDecimal("500.00");

    @Column(name = "min_order_amount", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal minOrderAmount = new BigDecimal("100.00");

    @Column(name = "return_window_days")
    @Builder.Default
    private Integer returnWindowDays = 7;

    @Column(name = "seller_approval_required")
    @Builder.Default
    private Boolean sellerApprovalRequired = true;

    @Column(name = "product_approval_required")
    @Builder.Default
    private Boolean productApprovalRequired = false;

    @Column(name = "cod_enabled")
    @Builder.Default
    private Boolean codEnabled = true;

    @Column(name = "online_payment_enabled")
    @Builder.Default
    private Boolean onlinePaymentEnabled = true;
}
