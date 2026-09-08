package com.roshnamart.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "sellers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Seller {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "business_name", nullable = false)
    private String businessName;

    @Column(name = "business_description", length = 1000)
    private String businessDescription;

    @Column(name = "business_email")
    private String businessEmail;

    @Column(name = "business_phone")
    private String businessPhone;

    private String address;
    private String city;
    private String state;
    private String pincode;

    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status", nullable = false)
    private SellerVerificationStatus verificationStatus;

    @Column(name = "commission_percentage", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal commissionPercentage = new BigDecimal("5.00");

    @Column(name = "total_sales")
    @Builder.Default
    private Integer totalSales = 0;

    @Column(name = "total_revenue", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal totalRevenue = BigDecimal.ZERO;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.verificationStatus == null) {
            this.verificationStatus = SellerVerificationStatus.PENDING;
        }
        if (this.commissionPercentage == null) {
            this.commissionPercentage = new BigDecimal("5.00");
        }
        if (this.totalSales == null) {
            this.totalSales = 0;
        }
        if (this.totalRevenue == null) {
            this.totalRevenue = BigDecimal.ZERO;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
