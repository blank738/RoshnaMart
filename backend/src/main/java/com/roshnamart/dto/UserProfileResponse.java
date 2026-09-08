package com.roshnamart.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String role;
    private String status;
    private LocalDateTime createdAt;

    // Buyer specific
    private Long buyerId;
    private LocalDate dateOfBirth;
    private String gender;
    private String profileImage;

    // Seller specific
    private Long sellerId;
    private String businessName;
    private String businessDescription;
    private String businessEmail;
    private String businessPhone;
    private String address;
    private String city;
    private String state;
    private String pincode;
    private String verificationStatus;
    private BigDecimal commissionPercentage;
    private Integer totalSales;
    private BigDecimal totalRevenue;
}
