package com.roshnamart.service;

import com.roshnamart.dto.OrderItemResponse;
import com.roshnamart.dto.SellerDashboardResponse;
import com.roshnamart.entity.*;
import com.roshnamart.exception.ForbiddenException;
import com.roshnamart.exception.InvalidOrderStateException;
import com.roshnamart.exception.ResourceNotFoundException;
import com.roshnamart.mapper.EntityDtoMapper;
import com.roshnamart.repository.OrderItemRepository;
import com.roshnamart.repository.OrderRepository;
import com.roshnamart.repository.ProductRepository;
import com.roshnamart.repository.SellerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SellerService {

    private final SellerRepository sellerRepository;
    private final ProductRepository productRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderRepository orderRepository;
    private final NotificationService notificationService;
    private final EntityDtoMapper mapper;

    @Transactional(readOnly = true)
    public SellerDashboardResponse getSellerDashboard(Long sellerUserId) {
        Seller seller = sellerRepository.findByUserId(sellerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Seller profile not found"));

        long totalProducts = productRepository.countBySellerId(seller.getId());
        long activeProducts = productRepository.countBySellerIdAndStatus(seller.getId(), ProductStatus.ACTIVE);
        long outOfStock = productRepository.countBySellerIdAndQuantityLessThanEqual(seller.getId(), 0);

        long totalOrders = orderItemRepository.countDistinctOrdersBySellerId(seller.getId());
        BigDecimal grossRevenue = orderItemRepository.calculateGrossRevenueBySellerId(seller.getId());
        BigDecimal commission = orderItemRepository.calculateCommissionBySellerId(seller.getId());
        BigDecimal netEarnings = orderItemRepository.calculateNetEarningsBySellerId(seller.getId());
        BigDecimal pendingEarnings = orderItemRepository.calculatePendingEarningsBySellerId(seller.getId());

        // Average rating across seller's products
        List<Product> products = productRepository.findBySellerId(seller.getId(), Pageable.unpaged()).getContent();
        double avgRating = products.stream()
                .filter(p -> p.getRating() != null && p.getRating() > 0)
                .mapToDouble(Product::getRating)
                .average()
                .orElse(0.0);

        return SellerDashboardResponse.builder()
                .totalProducts(totalProducts)
                .activeProducts(activeProducts)
                .outOfStockProducts(outOfStock)
                .totalOrders(totalOrders)
                .totalSales(seller.getTotalSales() != null ? seller.getTotalSales() : 0)
                .grossRevenue(grossRevenue)
                .commission(commission)
                .netEarnings(netEarnings)
                .pendingEarnings(pendingEarnings)
                .averageRating(Math.round(avgRating * 10.0) / 10.0)
                .verificationStatus(seller.getVerificationStatus().name())
                .commissionPercentage(seller.getCommissionPercentage())
                .build();
    }

    @Transactional(readOnly = true)
    public Page<OrderItemResponse> getSellerOrders(Long sellerUserId, int page, int size) {
        Seller seller = sellerRepository.findByUserId(sellerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Seller profile not found"));

        Pageable pageable = PageRequest.of(page, size);
        return orderItemRepository.findBySellerId(seller.getId(), pageable)
                .map(mapper::toOrderItemResponse);
    }

    @Transactional
    public OrderItemResponse updateOrderItemStatus(Long sellerUserId, Long orderItemId, OrderItemStatus newStatus) {
        Seller seller = sellerRepository.findByUserId(sellerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Seller profile not found"));

        OrderItem item = orderItemRepository.findById(orderItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Order item not found with id: " + orderItemId));

        if (!item.getSeller().getId().equals(seller.getId())) {
            throw new ForbiddenException("Unauthorized to modify order item belonging to another seller");
        }

        if (item.getItemStatus() == OrderItemStatus.CANCELLED || item.getItemStatus() == OrderItemStatus.RETURNED) {
            throw new InvalidOrderStateException("Cannot update status of an item that is " + item.getItemStatus());
        }

        item.setItemStatus(newStatus);
        OrderItem saved = orderItemRepository.save(item);

        // Synchronize parent Order status based on all its items
        Order order = item.getOrder();
        if (order != null) {
            List<OrderItem> allItems = orderItemRepository.findByOrderId(order.getId());
            OrderStatus derivedStatus = calculateDerivedOrderStatus(allItems);
            if (derivedStatus != null && order.getOrderStatus() != derivedStatus) {
                order.setOrderStatus(derivedStatus);
                order.setUpdatedAt(LocalDateTime.now());
                orderRepository.save(order);
            }
        }

        // Notify Buyer
        notificationService.sendNotification(
                item.getOrder().getBuyer().getUser(),
                "Order Item Status Updated",
                "Your item '" + item.getProductName() + "' is now " + newStatus,
                "ORDER_STATUS_UPDATE"
        );

        return mapper.toOrderItemResponse(saved);
    }

    private OrderStatus calculateDerivedOrderStatus(List<OrderItem> items) {
        if (items == null || items.isEmpty()) {
            return null;
        }

        // Check if all items are cancelled
        boolean allCancelled = items.stream()
                .allMatch(i -> i.getItemStatus() == OrderItemStatus.CANCELLED);
        if (allCancelled) {
            return OrderStatus.CANCELLED;
        }

        // Filter active items (non-cancelled)
        List<OrderItem> activeItems = items.stream()
                .filter(i -> i.getItemStatus() != OrderItemStatus.CANCELLED)
                .toList();

        if (activeItems.isEmpty()) {
            return OrderStatus.CANCELLED;
        }

        // Check if all active items are delivered (or return requested/returned/refunded)
        boolean allDelivered = activeItems.stream()
                .allMatch(i -> i.getItemStatus() == OrderItemStatus.DELIVERED
                        || i.getItemStatus() == OrderItemStatus.RETURN_REQUESTED
                        || i.getItemStatus() == OrderItemStatus.RETURNED
                        || i.getItemStatus() == OrderItemStatus.REFUNDED);
        if (allDelivered) {
            return OrderStatus.DELIVERED;
        }

        // Check if all active items are at least OUT_FOR_DELIVERY
        boolean allOutForDelivery = activeItems.stream()
                .allMatch(i -> i.getItemStatus() == OrderItemStatus.OUT_FOR_DELIVERY
                        || i.getItemStatus() == OrderItemStatus.DELIVERED
                        || i.getItemStatus() == OrderItemStatus.RETURN_REQUESTED
                        || i.getItemStatus() == OrderItemStatus.RETURNED
                        || i.getItemStatus() == OrderItemStatus.REFUNDED);
        if (allOutForDelivery) {
            return OrderStatus.OUT_FOR_DELIVERY;
        }

        // Check if all active items are at least SHIPPED
        boolean allShipped = activeItems.stream()
                .allMatch(i -> i.getItemStatus() == OrderItemStatus.SHIPPED
                        || i.getItemStatus() == OrderItemStatus.OUT_FOR_DELIVERY
                        || i.getItemStatus() == OrderItemStatus.DELIVERED
                        || i.getItemStatus() == OrderItemStatus.RETURN_REQUESTED
                        || i.getItemStatus() == OrderItemStatus.RETURNED
                        || i.getItemStatus() == OrderItemStatus.REFUNDED);
        if (allShipped) {
            return OrderStatus.SHIPPED;
        }

        // Check if any active item is PROCESSING or higher
        boolean anyProcessing = activeItems.stream()
                .anyMatch(i -> i.getItemStatus() == OrderItemStatus.PROCESSING
                        || i.getItemStatus() == OrderItemStatus.SHIPPED
                        || i.getItemStatus() == OrderItemStatus.OUT_FOR_DELIVERY
                        || i.getItemStatus() == OrderItemStatus.DELIVERED);
        if (anyProcessing) {
            return OrderStatus.PROCESSING;
        }

        // Check if any active item is CONFIRMED
        boolean anyConfirmed = activeItems.stream()
                .anyMatch(i -> i.getItemStatus() == OrderItemStatus.CONFIRMED);
        if (anyConfirmed) {
            return OrderStatus.CONFIRMED;
        }

        return OrderStatus.PLACED;
    }

    @Transactional(readOnly = true)
    public Seller getSellerByUserId(Long sellerUserId) {
        return sellerRepository.findByUserId(sellerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Seller profile not found"));
    }
}
