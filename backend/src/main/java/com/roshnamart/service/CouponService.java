package com.roshnamart.service;

import com.roshnamart.dto.CouponValidateResponse;
import com.roshnamart.entity.Coupon;
import com.roshnamart.entity.DiscountType;
import com.roshnamart.exception.InvalidCouponException;
import com.roshnamart.exception.ResourceNotFoundException;
import com.roshnamart.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CouponService {

    private final CouponRepository couponRepository;

    @Transactional(readOnly = true)
    public CouponValidateResponse validateCoupon(String code, BigDecimal orderAmount) {
        Coupon coupon = couponRepository.findByCode(code.toUpperCase().trim())
                .orElseThrow(() -> new InvalidCouponException("Coupon '" + code + "' does not exist"));

        if (!"ACTIVE".equalsIgnoreCase(coupon.getStatus())) {
            throw new InvalidCouponException("Coupon '" + code + "' is inactive");
        }

        LocalDate today = LocalDate.now();
        if (coupon.getStartDate() != null && today.isBefore(coupon.getStartDate())) {
            throw new InvalidCouponException("Coupon '" + code + "' is not yet valid");
        }

        if (coupon.getExpiryDate() != null && today.isAfter(coupon.getExpiryDate())) {
            throw new InvalidCouponException("Coupon '" + code + "' has expired");
        }

        if (coupon.getUsageLimit() != null && coupon.getUsedCount() >= coupon.getUsageLimit()) {
            throw new InvalidCouponException("Coupon '" + code + "' usage limit has been reached");
        }

        if (coupon.getMinimumOrderAmount() != null && orderAmount.compareTo(coupon.getMinimumOrderAmount()) < 0) {
            throw new InvalidCouponException("Minimum order amount of ₹" + coupon.getMinimumOrderAmount() + " required to use this coupon");
        }

        BigDecimal discountAmount;
        if (coupon.getDiscountType() == DiscountType.PERCENTAGE) {
            discountAmount = orderAmount.multiply(coupon.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            if (coupon.getMaximumDiscount() != null && discountAmount.compareTo(coupon.getMaximumDiscount()) > 0) {
                discountAmount = coupon.getMaximumDiscount();
            }
        } else {
            discountAmount = coupon.getDiscountValue();
        }

        return CouponValidateResponse.builder()
                .valid(true)
                .code(coupon.getCode())
                .discountType(coupon.getDiscountType().name())
                .discountValue(coupon.getDiscountValue())
                .discountAmount(discountAmount)
                .message("Coupon applied successfully! You saved ₹" + discountAmount)
                .build();
    }

    @Transactional
    public Coupon createCoupon(Coupon coupon) {
        coupon.setCode(coupon.getCode().toUpperCase().trim());
        return couponRepository.save(coupon);
    }

    @Transactional(readOnly = true)
    public List<Coupon> getAllCoupons() {
        return couponRepository.findAll();
    }

    @Transactional
    public Coupon updateCouponStatus(Long id, String status) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found with id: " + id));
        coupon.setStatus(status);
        return couponRepository.save(coupon);
    }
}
