package com.roshnamart.service;

import com.roshnamart.dto.OrderItemResponse;
import com.roshnamart.dto.SellerDashboardResponse;
import com.roshnamart.entity.*;
import com.roshnamart.exception.ForbiddenException;
import com.roshnamart.exception.InvalidOrderStateException;
import com.roshnamart.exception.ResourceNotFoundException;
import com.roshnamart.mapper.EntityDtoMapper;
import com.roshnamart.repository.OrderItemRepository;
import com.roshnamart.repository.ProductRepository;
import com.roshnamart.repository.SellerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SellerService {

    private final SellerRepository sellerRepository;
    private final ProductRepository productRepository;
    private final OrderItemRepository orderItemRepository;
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

        // Notify Buyer
        notificationService.sendNotification(
                item.getOrder().getBuyer().getUser(),
                "Order Item Status Updated",
                "Your item '" + item.getProductName() + "' is now " + newStatus,
                "ORDER_STATUS_UPDATE"
        );

        return mapper.toOrderItemResponse(saved);
    }

    @Transactional(readOnly = true)
    public Seller getSellerByUserId(Long sellerUserId) {
        return sellerRepository.findByUserId(sellerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Seller profile not found"));
    }
}
