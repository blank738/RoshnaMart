package com.roshnamart.mapper;

import com.roshnamart.dto.*;
import com.roshnamart.entity.*;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class EntityDtoMapper {

    public ProductResponse toProductResponse(Product product) {
        if (product == null) return null;

        Integer discountPercentage = null;
        if (product.getDiscountPrice() != null && product.getPrice() != null && product.getPrice().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal diff = product.getPrice().subtract(product.getDiscountPrice());
            discountPercentage = diff.multiply(BigDecimal.valueOf(100))
                    .divide(product.getPrice(), 0, RoundingMode.HALF_UP).intValue();
        }

        List<String> additionalImages = product.getImages() != null ?
                product.getImages().stream().map(ProductImage::getImageUrl).collect(Collectors.toList()) :
                Collections.emptyList();

        return ProductResponse.builder()
                .id(product.getId())
                .sellerId(product.getSeller() != null ? product.getSeller().getId() : null)
                .sellerBusinessName(product.getSeller() != null ? product.getSeller().getBusinessName() : null)
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .discountPrice(product.getDiscountPrice())
                .discountPercentage(discountPercentage)
                .quantity(product.getQuantity())
                .imageUrl(product.getImageUrl())
                .brand(product.getBrand())
                .sku(product.getSku())
                .status(product.getStatus() != null ? product.getStatus().name() : null)
                .rating(product.getRating())
                .reviewCount(product.getReviewCount())
                .additionalImages(additionalImages)
                .createdAt(product.getCreatedAt())
                .build();
    }

    public CategoryResponse toCategoryResponse(Category category) {
        if (category == null) return null;
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .image(category.getImage())
                .status(category.getStatus())
                .build();
    }

    public AddressDto toAddressDto(Address address) {
        if (address == null) return null;
        return AddressDto.builder()
                .id(address.getId())
                .fullName(address.getFullName())
                .phone(address.getPhone())
                .addressLine(address.getAddressLine())
                .city(address.getCity())
                .state(address.getState())
                .pincode(address.getPincode())
                .country(address.getCountry())
                .addressType(address.getAddressType())
                .isDefault(address.getIsDefault())
                .build();
    }

    public CartItemResponse toCartItemResponse(CartItem item) {
        if (item == null) return null;
        return CartItemResponse.builder()
                .id(item.getId())
                .productId(item.getProduct() != null ? item.getProduct().getId() : null)
                .productName(item.getProduct() != null ? item.getProduct().getName() : null)
                .productImage(item.getProduct() != null ? item.getProduct().getImageUrl() : null)
                .sellerId(item.getSeller() != null ? item.getSeller().getId() : null)
                .sellerBusinessName(item.getSeller() != null ? item.getSeller().getBusinessName() : null)
                .price(item.getPrice())
                .quantity(item.getQuantity())
                .subtotal(item.getSubtotal())
                .availableStock(item.getProduct() != null ? item.getProduct().getQuantity() : 0)
                .build();
    }

    public CartResponse toCartResponse(Cart cart) {
        if (cart == null) return null;
        List<CartItemResponse> itemResponses = cart.getItems() != null ?
                cart.getItems().stream().map(this::toCartItemResponse).collect(Collectors.toList()) :
                Collections.emptyList();

        BigDecimal subtotal = itemResponses.stream()
                .map(CartItemResponse::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int totalItems = itemResponses.stream().mapToInt(CartItemResponse::getQuantity).sum();

        return CartResponse.builder()
                .id(cart.getId())
                .items(itemResponses)
                .totalItems(totalItems)
                .subtotal(subtotal)
                .build();
    }

    public OrderItemResponse toOrderItemResponse(OrderItem item) {
        if (item == null) return null;
        return OrderItemResponse.builder()
                .id(item.getId())
                .productId(item.getProduct() != null ? item.getProduct().getId() : null)
                .productName(item.getProductName())
                .productImage(item.getProduct() != null ? item.getProduct().getImageUrl() : null)
                .sellerId(item.getSeller() != null ? item.getSeller().getId() : null)
                .sellerBusinessName(item.getSeller() != null ? item.getSeller().getBusinessName() : null)
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .subtotal(item.getSubtotal())
                .commissionAmount(item.getCommissionAmount())
                .sellerEarning(item.getSellerEarning())
                .itemStatus(item.getItemStatus() != null ? item.getItemStatus().name() : null)
                .build();
    }

    public PaymentResponse toPaymentResponse(Payment payment) {
        if (payment == null) return null;
        return PaymentResponse.builder()
                .id(payment.getId())
                .paymentMethod(payment.getPaymentMethod() != null ? payment.getPaymentMethod().name() : null)
                .transactionId(payment.getTransactionId())
                .amount(payment.getAmount())
                .paymentStatus(payment.getPaymentStatus() != null ? payment.getPaymentStatus().name() : null)
                .paymentDate(payment.getPaymentDate())
                .build();
    }

    public OrderResponse toOrderResponse(Order order) {
        if (order == null) return null;
        List<OrderItemResponse> itemResponses = order.getItems() != null ?
                order.getItems().stream().map(this::toOrderItemResponse).collect(Collectors.toList()) :
                Collections.emptyList();

        return OrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .buyerId(order.getBuyer() != null ? order.getBuyer().getId() : null)
                .buyerName(order.getBuyer() != null && order.getBuyer().getUser() != null ? order.getBuyer().getUser().getName() : null)
                .buyerEmail(order.getBuyer() != null && order.getBuyer().getUser() != null ? order.getBuyer().getUser().getEmail() : null)
                .totalAmount(order.getTotalAmount())
                .discountAmount(order.getDiscountAmount())
                .deliveryCharge(order.getDeliveryCharge())
                .finalAmount(order.getFinalAmount())
                .paymentStatus(order.getPaymentStatus() != null ? order.getPaymentStatus().name() : null)
                .orderStatus(order.getOrderStatus() != null ? order.getOrderStatus().name() : null)
                .shippingAddress(toAddressDto(order.getShippingAddress()))
                .items(itemResponses)
                .payment(toPaymentResponse(order.getPayment()))
                .createdAt(order.getCreatedAt())
                .build();
    }

    public ReviewDto toReviewDto(Review review) {
        if (review == null) return null;
        return ReviewDto.builder()
                .id(review.getId())
                .productId(review.getProduct() != null ? review.getProduct().getId() : null)
                .buyerId(review.getBuyer() != null ? review.getBuyer().getId() : null)
                .buyerName(review.getBuyer() != null && review.getBuyer().getUser() != null ? review.getBuyer().getUser().getName() : null)
                .rating(review.getRating())
                .title(review.getTitle())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .build();
    }

    public NotificationDto toNotificationDto(Notification notification) {
        if (notification == null) return null;
        return NotificationDto.builder()
                .id(notification.getId())
                .userId(notification.getUser() != null ? notification.getUser().getId() : null)
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType())
                .isRead(notification.getIsRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }

    public ReturnRequestDto toReturnRequestDto(ReturnRequest returnRequest) {
        if (returnRequest == null) return null;
        return ReturnRequestDto.builder()
                .id(returnRequest.getId())
                .orderItemId(returnRequest.getOrderItem() != null ? returnRequest.getOrderItem().getId() : null)
                .buyerId(returnRequest.getBuyer() != null ? returnRequest.getBuyer().getId() : null)
                .buyerName(returnRequest.getBuyer() != null && returnRequest.getBuyer().getUser() != null ? returnRequest.getBuyer().getUser().getName() : null)
                .sellerId(returnRequest.getSeller() != null ? returnRequest.getSeller().getId() : null)
                .sellerBusinessName(returnRequest.getSeller() != null ? returnRequest.getSeller().getBusinessName() : null)
                .productId(returnRequest.getOrderItem() != null && returnRequest.getOrderItem().getProduct() != null ? returnRequest.getOrderItem().getProduct().getId() : null)
                .productName(returnRequest.getOrderItem() != null ? returnRequest.getOrderItem().getProductName() : null)
                .reason(returnRequest.getReason())
                .description(returnRequest.getDescription())
                .imageUrl(returnRequest.getImageUrl())
                .status(returnRequest.getStatus() != null ? returnRequest.getStatus().name() : null)
                .createdAt(returnRequest.getCreatedAt())
                .build();
    }

    public MarketplaceSettingsDto toMarketplaceSettingsDto(MarketplaceSettings settings) {
        if (settings == null) return null;
        return MarketplaceSettingsDto.builder()
                .id(settings.getId())
                .platformName(settings.getPlatformName())
                .defaultCommissionPercentage(settings.getDefaultCommissionPercentage())
                .deliveryCharge(settings.getDeliveryCharge())
                .freeDeliveryThreshold(settings.getFreeDeliveryThreshold())
                .minOrderAmount(settings.getMinOrderAmount())
                .returnWindowDays(settings.getReturnWindowDays())
                .sellerApprovalRequired(settings.getSellerApprovalRequired())
                .productApprovalRequired(settings.getProductApprovalRequired())
                .codEnabled(settings.getCodEnabled())
                .onlinePaymentEnabled(settings.getOnlinePaymentEnabled())
                .build();
    }
}
