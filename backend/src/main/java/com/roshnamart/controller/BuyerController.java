package com.roshnamart.controller;

import com.roshnamart.dto.*;
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

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/buyer")
@RequiredArgsConstructor
@Tag(name = "Buyer", description = "Buyer operations: Cart, Orders, Checkout, Addresses, Wishlist, Reviews, Notifications")
public class BuyerController {

    private final CartService cartService;
    private final OrderService orderService;
    private final AddressService addressService;
    private final WishlistService wishlistService;
    private final ReviewService reviewService;
    private final NotificationService notificationService;
    private final CouponService couponService;
    private final AuthService authService;

    // --- CART ---
    @GetMapping("/cart")
    @Operation(summary = "Get current buyer cart")
    public ResponseEntity<CartResponse> getCart(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(cartService.getBuyerCart(principal.getId()));
    }

    @PostMapping("/cart/items")
    @Operation(summary = "Add item to cart")
    public ResponseEntity<CartResponse> addToCart(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody AddToCartRequest request
    ) {
        return ResponseEntity.ok(cartService.addToCart(principal.getId(), request));
    }

    @PutMapping("/cart/items/{id}")
    @Operation(summary = "Update item quantity in cart")
    public ResponseEntity<CartResponse> updateCartItem(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody UpdateCartItemRequest request
    ) {
        return ResponseEntity.ok(cartService.updateCartItem(principal.getId(), id, request));
    }

    @DeleteMapping("/cart/items/{id}")
    @Operation(summary = "Remove item from cart")
    public ResponseEntity<CartResponse> removeFromCart(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(cartService.removeFromCart(principal.getId(), id));
    }

    @DeleteMapping("/cart")
    @Operation(summary = "Clear cart")
    public ResponseEntity<Map<String, String>> clearCart(@AuthenticationPrincipal UserPrincipal principal) {
        cartService.clearCart(principal.getId());
        return ResponseEntity.ok(Map.of("message", "Cart cleared successfully"));
    }

    // --- ADDRESSES ---
    @GetMapping("/addresses")
    @Operation(summary = "Get all saved addresses for buyer")
    public ResponseEntity<List<AddressDto>> getAddresses(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(addressService.getBuyerAddresses(principal.getId()));
    }

    @PostMapping("/addresses")
    @Operation(summary = "Add a new delivery address")
    public ResponseEntity<AddressDto> addAddress(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody AddressDto dto
    ) {
        return new ResponseEntity<>(addressService.addAddress(principal.getId(), dto), HttpStatus.CREATED);
    }

    @PutMapping("/addresses/{id}")
    @Operation(summary = "Update an existing delivery address")
    public ResponseEntity<AddressDto> updateAddress(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody AddressDto dto
    ) {
        return ResponseEntity.ok(addressService.updateAddress(principal.getId(), id, dto));
    }

    @DeleteMapping("/addresses/{id}")
    @Operation(summary = "Delete a delivery address")
    public ResponseEntity<Map<String, String>> deleteAddress(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id
    ) {
        addressService.deleteAddress(principal.getId(), id);
        return ResponseEntity.ok(Map.of("message", "Address deleted successfully"));
    }

    @PatchMapping("/addresses/{id}/default")
    @Operation(summary = "Set address as default")
    public ResponseEntity<Map<String, String>> setDefaultAddress(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id
    ) {
        addressService.setDefaultAddress(principal.getId(), id);
        return ResponseEntity.ok(Map.of("message", "Default address updated"));
    }

    // --- COUPONS ---
    @GetMapping("/coupons/validate")
    @Operation(summary = "Validate a coupon code and calculate discount")
    public ResponseEntity<CouponValidateResponse> validateCoupon(
            @RequestParam String code,
            @RequestParam BigDecimal amount
    ) {
        return ResponseEntity.ok(couponService.validateCoupon(code, amount));
    }

    // --- CHECKOUT & ORDERS ---
    @PostMapping("/checkout")
    @Operation(summary = "Place order from cart items (multi-vendor transactional checkout)")
    public ResponseEntity<OrderResponse> placeOrder(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CheckoutRequest request
    ) {
        OrderResponse order = orderService.placeOrder(principal.getId(), request);
        return new ResponseEntity<>(order, HttpStatus.CREATED);
    }

    @GetMapping("/orders")
    @Operation(summary = "Get paginated order history for buyer")
    public ResponseEntity<Page<OrderResponse>> getOrders(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(orderService.getBuyerOrders(principal.getId(), page, size));
    }

    @GetMapping("/orders/{id}")
    @Operation(summary = "Get order details and items breakdown by ID")
    public ResponseEntity<OrderResponse> getOrderById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(orderService.getBuyerOrderById(principal.getId(), id));
    }

    @PostMapping("/orders/{id}/cancel")
    @Operation(summary = "Cancel an order in PLACED or CONFIRMED state")
    public ResponseEntity<OrderResponse> cancelOrder(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(orderService.cancelOrder(principal.getId(), id));
    }

    @PostMapping("/orders/{id}/buy-again")
    @Operation(summary = "Add previously purchased items from an order back into cart")
    public ResponseEntity<Map<String, String>> buyAgain(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id
    ) {
        orderService.buyAgain(principal.getId(), id);
        return ResponseEntity.ok(Map.of("message", "Eligible items added to cart"));
    }

    @PostMapping("/orders/return")
    @Operation(summary = "Submit return request for an eligible delivered item")
    public ResponseEntity<ReturnRequestDto> requestReturn(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ReturnRequestDto request
    ) {
        return ResponseEntity.ok(orderService.requestReturn(principal.getId(), request));
    }

    // --- WISHLIST ---
    @GetMapping("/wishlist")
    @Operation(summary = "Get all items in buyer wishlist")
    public ResponseEntity<List<ProductResponse>> getWishlist(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(wishlistService.getBuyerWishlist(principal.getId()));
    }

    @GetMapping("/wishlist/check/{productId}")
    @Operation(summary = "Check if product is in wishlist")
    public ResponseEntity<Map<String, Boolean>> checkWishlist(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long productId
    ) {
        boolean inWishlist = wishlistService.isInWishlist(principal.getId(), productId);
        return ResponseEntity.ok(Map.of("inWishlist", inWishlist));
    }

    @PostMapping("/wishlist/{productId}")
    @Operation(summary = "Add product to wishlist")
    public ResponseEntity<Map<String, String>> addToWishlist(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long productId
    ) {
        wishlistService.addToWishlist(principal.getId(), productId);
        return ResponseEntity.ok(Map.of("message", "Added to wishlist"));
    }

    @DeleteMapping("/wishlist/{productId}")
    @Operation(summary = "Remove product from wishlist")
    public ResponseEntity<Map<String, String>> removeFromWishlist(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long productId
    ) {
        wishlistService.removeFromWishlist(principal.getId(), productId);
        return ResponseEntity.ok(Map.of("message", "Removed from wishlist"));
    }

    @PostMapping("/wishlist/{productId}/move-to-cart")
    @Operation(summary = "Move item from wishlist into cart")
    public ResponseEntity<Map<String, String>> moveToCart(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long productId
    ) {
        wishlistService.moveToCart(principal.getId(), productId);
        return ResponseEntity.ok(Map.of("message", "Moved to cart"));
    }

    // --- REVIEWS ---
    @PostMapping("/reviews")
    @Operation(summary = "Submit review and rating for purchased product")
    public ResponseEntity<ReviewDto> addReview(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ReviewDto dto
    ) {
        return new ResponseEntity<>(reviewService.addReview(principal.getId(), dto), HttpStatus.CREATED);
    }

    @GetMapping("/reviews/eligible/{productId}")
    @Operation(summary = "Check if buyer is eligible to review product")
    public ResponseEntity<Map<String, Boolean>> isEligibleToReview(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long productId
    ) {
        boolean eligible = reviewService.isEligibleToReview(principal.getId(), productId);
        return ResponseEntity.ok(Map.of("eligible", eligible));
    }

    // --- NOTIFICATIONS ---
    @GetMapping("/notifications")
    @Operation(summary = "Get paginated notifications")
    public ResponseEntity<Page<NotificationDto>> getNotifications(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size
    ) {
        return ResponseEntity.ok(notificationService.getUserNotifications(principal.getId(), page, size));
    }

    @GetMapping("/notifications/unread-count")
    @Operation(summary = "Get unread notifications count")
    public ResponseEntity<Map<String, Long>> getUnreadNotificationsCount(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(Map.of("count", notificationService.getUnreadCount(principal.getId())));
    }

    @PatchMapping("/notifications/{id}/read")
    @Operation(summary = "Mark single notification as read")
    public ResponseEntity<Map<String, String>> markNotificationAsRead(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id
    ) {
        notificationService.markAsRead(id, principal.getId());
        return ResponseEntity.ok(Map.of("message", "Marked as read"));
    }

    @PatchMapping("/notifications/read-all")
    @Operation(summary = "Mark all notifications as read")
    public ResponseEntity<Map<String, String>> markAllNotificationsAsRead(@AuthenticationPrincipal UserPrincipal principal) {
        notificationService.markAllAsRead(principal.getId());
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }

    // --- PROFILE ---
    @GetMapping("/profile")
    @Operation(summary = "Get current buyer profile")
    public ResponseEntity<UserProfileResponse> getProfile(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(authService.getCurrentUserProfile(principal.getEmail()));
    }
}
