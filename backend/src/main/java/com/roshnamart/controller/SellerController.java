package com.roshnamart.controller;

import com.roshnamart.dto.*;
import com.roshnamart.entity.OrderItemStatus;
import com.roshnamart.security.UserPrincipal;
import com.roshnamart.service.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/seller")
@RequiredArgsConstructor
@Tag(name = "Seller", description = "Seller dashboard, product management, orders fulfillment, and metrics")
public class SellerController {

    private final SellerService sellerService;
    private final ProductService productService;
    private final AuthService authService;
    private final NotificationService notificationService;

    @GetMapping("/dashboard")
    @Operation(summary = "Get aggregated seller metrics, sales, commissions, and ratings")
    public ResponseEntity<SellerDashboardResponse> getDashboard(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(sellerService.getSellerDashboard(principal.getId()));
    }

    @GetMapping("/products")
    @Operation(summary = "Get paginated products listed by current seller")
    public ResponseEntity<Page<ProductResponse>> getProducts(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(productService.getSellerProducts(principal.getId(), page, size));
    }

    @GetMapping("/products/{id}")
    @Operation(summary = "Get deep product details including gross, net revenue, and customer reviews")
    public ResponseEntity<SellerProductDetailResponse> getProductDetails(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(productService.getSellerProductDetails(principal.getId(), id));
    }

    @PostMapping("/products")
    @Operation(summary = "Create and list a new product (active or pending approval based on settings)")
    public ResponseEntity<ProductResponse> createProduct(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ProductCreateUpdateRequest request
    ) {
        ProductResponse response = productService.createProduct(principal.getId(), request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/products/{id}")
    @Operation(summary = "Update product details, pricing, and stock")
    public ResponseEntity<ProductResponse> updateProduct(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody ProductCreateUpdateRequest request
    ) {
        return ResponseEntity.ok(productService.updateProduct(principal.getId(), id, request));
    }

    @DeleteMapping("/products/{id}")
    @Operation(summary = "Deactivate product listing")
    public ResponseEntity<Map<String, String>> deleteProduct(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id
    ) {
        productService.deleteProduct(principal.getId(), id);
        return ResponseEntity.ok(Map.of("message", "Product deactivated successfully"));
    }

    @PatchMapping("/products/{id}/stock")
    @Operation(summary = "Quickly update available stock count")
    public ResponseEntity<ProductResponse> updateStock(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestParam Integer quantity
    ) {
        return ResponseEntity.ok(productService.updateStock(principal.getId(), id, quantity));
    }

    @GetMapping("/orders")
    @Operation(summary = "Get order items belonging to this seller")
    public ResponseEntity<Page<OrderItemResponse>> getOrders(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(sellerService.getSellerOrders(principal.getId(), page, size));
    }

    @PatchMapping("/orders/items/{orderItemId}/status")
    @Operation(summary = "Update status of an order item (e.g. PROCESSING, SHIPPED, DELIVERED)")
    public ResponseEntity<OrderItemResponse> updateOrderItemStatus(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long orderItemId,
            @RequestParam OrderItemStatus status
    ) {
        return ResponseEntity.ok(sellerService.updateOrderItemStatus(principal.getId(), orderItemId, status));
    }

    @GetMapping("/profile")
    @Operation(summary = "Get seller business profile and verification status")
    public ResponseEntity<UserProfileResponse> getProfile(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(authService.getCurrentUserProfile(principal.getEmail()));
    }

    @GetMapping("/notifications")
    @Operation(summary = "Get seller notifications")
    public ResponseEntity<Page<NotificationDto>> getNotifications(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size
    ) {
        return ResponseEntity.ok(notificationService.getUserNotifications(principal.getId(), page, size));
    }

    @GetMapping("/notifications/unread-count")
    @Operation(summary = "Get unread notifications count for seller")
    public ResponseEntity<Map<String, Long>> getUnreadNotificationsCount(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(Map.of("count", notificationService.getUnreadCount(principal.getId())));
    }

    @PatchMapping("/notifications/{id}/read")
    @Operation(summary = "Mark single seller notification as read")
    public ResponseEntity<Map<String, String>> markNotificationAsRead(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id
    ) {
        notificationService.markAsRead(id, principal.getId());
        return ResponseEntity.ok(Map.of("message", "Marked as read"));
    }

    @PatchMapping("/notifications/read-all")
    @Operation(summary = "Mark all seller notifications as read")
    public ResponseEntity<Map<String, String>> markAllNotificationsAsRead(@AuthenticationPrincipal UserPrincipal principal) {
        notificationService.markAllAsRead(principal.getId());
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }
}
