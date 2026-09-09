package com.roshnamart.controller;

import com.roshnamart.dto.*;
import com.roshnamart.entity.*;
import com.roshnamart.exception.ResourceNotFoundException;
import com.roshnamart.mapper.EntityDtoMapper;
import com.roshnamart.repository.ProductRepository;
import com.roshnamart.repository.SellerRepository;
import com.roshnamart.repository.UserRepository;
import com.roshnamart.security.UserPrincipal;
import com.roshnamart.service.AdminService;
import com.roshnamart.service.CategoryService;
import com.roshnamart.service.CouponService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "Marketplace administration, seller verification, user controls, order management, settings, audit trail")
public class AdminController {

    private final AdminService adminService;
    private final CategoryService categoryService;
    private final CouponService couponService;
    private final SellerRepository sellerRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final EntityDtoMapper mapper;

    private User getAdminUser(UserPrincipal principal) {
        return userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Admin user not found"));
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Get marketplace-wide analytics and KPIs")
    public ResponseEntity<AdminDashboardResponse> getDashboard() {
        return ResponseEntity.ok(adminService.getAdminDashboard());
    }

    // --- SELLERS ---
    @GetMapping("/sellers")
    @Operation(summary = "Get paginated sellers with optional verification status or search")
    public ResponseEntity<Page<Seller>> getSellers(
            @RequestParam(required = false) SellerVerificationStatus status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        if (search != null && !search.trim().isEmpty()) {
            return ResponseEntity.ok(sellerRepository.searchSellers(search.trim(), pageable));
        }
        if (status != null) {
            return ResponseEntity.ok(sellerRepository.findByVerificationStatus(status, pageable));
        }
        return ResponseEntity.ok(sellerRepository.findAll(pageable));
    }

    @PutMapping("/sellers/{id}/approve")
    @Operation(summary = "Approve pending seller registration")
    public ResponseEntity<Map<String, String>> approveSeller(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id
    ) {
        adminService.approveSeller(id, getAdminUser(principal));
        return ResponseEntity.ok(Map.of("message", "Seller approved successfully"));
    }

    @PutMapping("/sellers/{id}/reject")
    @Operation(summary = "Reject seller registration")
    public ResponseEntity<Map<String, String>> rejectSeller(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id
    ) {
        adminService.rejectSeller(id, getAdminUser(principal));
        return ResponseEntity.ok(Map.of("message", "Seller rejected successfully"));
    }

    @PutMapping("/sellers/{id}/suspend")
    @Operation(summary = "Suspend active seller")
    public ResponseEntity<Map<String, String>> suspendSeller(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id
    ) {
        adminService.suspendSeller(id, getAdminUser(principal));
        return ResponseEntity.ok(Map.of("message", "Seller suspended successfully"));
    }

    @PutMapping("/sellers/{id}/reactivate")
    @Operation(summary = "Reactivate suspended seller")
    public ResponseEntity<Map<String, String>> reactivateSeller(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id
    ) {
        adminService.reactivateSeller(id, getAdminUser(principal));
        return ResponseEntity.ok(Map.of("message", "Seller reactivated successfully"));
    }

    // --- BUYERS & USERS ---
    @GetMapping("/buyers")
    @Operation(summary = "Get paginated registered buyers")
    public ResponseEntity<Page<User>> getBuyers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(userRepository.findByRole(Role.ROLE_BUYER, pageable));
    }

    @PutMapping("/users/{id}/status")
    @Operation(summary = "Update user status (ACTIVE, INACTIVE, BLOCKED)")
    public ResponseEntity<Map<String, String>> updateUserStatus(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestParam UserStatus status
    ) {
        adminService.updateUserStatus(id, status, getAdminUser(principal));
        return ResponseEntity.ok(Map.of("message", "User status updated to " + status));
    }

    // --- PRODUCTS ---
    @GetMapping("/products")
    @Operation(summary = "Get all marketplace products with optional status filter")
    public ResponseEntity<Page<ProductResponse>> getProducts(
            @RequestParam(required = false) ProductStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Product> products = (status != null) ?
                productRepository.findByStatus(status, pageable) :
                productRepository.findAll(pageable);
        return ResponseEntity.ok(products.map(mapper::toProductResponse));
    }

    @PutMapping("/products/{id}/status")
    @Operation(summary = "Approve or update status of a product (ACTIVE, REJECTED, INACTIVE)")
    public ResponseEntity<ProductResponse> updateProductStatus(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestParam ProductStatus status
    ) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        product.setStatus(status);
        Product saved = productRepository.save(product);

        adminService.logAction(getAdminUser(principal), "PRODUCT_STATUS_UPDATED", "Product", id, "Updated product status to " + status);
        return ResponseEntity.ok(mapper.toProductResponse(saved));
    }

    // --- ORDERS ---
    @GetMapping("/orders")
    @Operation(summary = "Get all marketplace orders with multi-seller items breakdown")
    public ResponseEntity<Page<OrderResponse>> getOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(adminService.getAllOrders(page, size));
    }

    @PatchMapping("/orders/{id}/status")
    @Operation(summary = "Update order status")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestParam OrderStatus status
    ) {
        return ResponseEntity.ok(adminService.updateOrderStatus(id, status, getAdminUser(principal)));
    }

    // --- RETURNS ---
    @GetMapping("/returns")
    @Operation(summary = "Get return requests with optional status filter")
    public ResponseEntity<Page<ReturnRequestDto>> getReturns(
            @RequestParam(required = false) ReturnStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(adminService.getReturns(status, page, size));
    }

    @PatchMapping("/returns/{id}/process")
    @Operation(summary = "Approve, reject, or refund a return request")
    public ResponseEntity<ReturnRequestDto> processReturn(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestParam ReturnStatus status
    ) {
        return ResponseEntity.ok(adminService.processReturn(id, status, getAdminUser(principal)));
    }

    // --- COUPONS ---
    @GetMapping("/coupons")
    @Operation(summary = "Get all coupons")
    public ResponseEntity<List<Coupon>> getCoupons() {
        return ResponseEntity.ok(couponService.getAllCoupons());
    }

    @PostMapping("/coupons")
    @Operation(summary = "Create a new coupon code")
    public ResponseEntity<Coupon> createCoupon(@Valid @RequestBody Coupon coupon) {
        return new ResponseEntity<>(couponService.createCoupon(coupon), HttpStatus.CREATED);
    }

    @PatchMapping("/coupons/{id}/status")
    @Operation(summary = "Activate or deactivate a coupon")
    public ResponseEntity<Coupon> updateCouponStatus(
            @PathVariable Long id,
            @RequestParam String status
    ) {
        return ResponseEntity.ok(couponService.updateCouponStatus(id, status));
    }

    // --- SETTINGS ---
    @GetMapping("/settings")
    @Operation(summary = "Get configurable marketplace settings")
    public ResponseEntity<MarketplaceSettingsDto> getSettings() {
        return ResponseEntity.ok(adminService.getMarketplaceSettings());
    }

    @PutMapping("/settings")
    @Operation(summary = "Update marketplace settings (commissions, delivery fees, approval toggles)")
    public ResponseEntity<MarketplaceSettingsDto> updateSettings(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody MarketplaceSettingsDto dto
    ) {
        return ResponseEntity.ok(adminService.updateMarketplaceSettings(dto, getAdminUser(principal)));
    }

    // --- AUDIT LOGS ---
    @GetMapping("/audit-logs")
    @Operation(summary = "Get paginated audit logs of administrative actions")
    public ResponseEntity<Page<AuditLog>> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(adminService.getAuditLogs(page, size));
    }

    // --- CATEGORIES ---
    @PostMapping("/categories")
    @Operation(summary = "Create product category")
    public ResponseEntity<CategoryResponse> createCategory(@Valid @RequestBody CategoryRequest request) {
        return new ResponseEntity<>(categoryService.createCategory(request), HttpStatus.CREATED);
    }

    @PutMapping("/categories/{id}")
    @Operation(summary = "Update product category")
    public ResponseEntity<CategoryResponse> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequest request
    ) {
        return ResponseEntity.ok(categoryService.updateCategory(id, request));
    }

    @DeleteMapping("/categories/{id}")
    @Operation(summary = "Deactivate product category")
    public ResponseEntity<Map<String, String>> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(Map.of("message", "Category deactivated successfully"));
    }
}
