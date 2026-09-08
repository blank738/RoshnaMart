package com.roshnamart.service;

import com.roshnamart.dto.AdminDashboardResponse;
import com.roshnamart.dto.MarketplaceSettingsDto;
import com.roshnamart.dto.OrderResponse;
import com.roshnamart.dto.ReturnRequestDto;
import com.roshnamart.entity.*;
import com.roshnamart.exception.ResourceNotFoundException;
import com.roshnamart.mapper.EntityDtoMapper;
import com.roshnamart.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final SellerRepository sellerRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final ReturnRequestRepository returnRequestRepository;
    private final MarketplaceSettingsRepository settingsRepository;
    private final AuditLogRepository auditLogRepository;
    private final NotificationService notificationService;
    private final EntityDtoMapper mapper;

    @Transactional(readOnly = true)
    public AdminDashboardResponse getAdminDashboard() {
        long totalBuyers = userRepository.findAll().stream().filter(u -> u.getRole() == Role.ROLE_BUYER).count();
        long totalSellers = sellerRepository.count();
        long pendingSellers = sellerRepository.countByVerificationStatus(SellerVerificationStatus.PENDING);
        long totalProducts = productRepository.count();
        long pendingProducts = productRepository.countByStatus(ProductStatus.PENDING_APPROVAL);
        long totalOrders = orderRepository.count();
        BigDecimal totalRevenue = orderRepository.calculateTotalMarketplaceRevenue();
        BigDecimal platformCommission = orderRepository.calculateTotalPlatformCommission();
        long totalRefunds = returnRequestRepository.countByStatus(ReturnStatus.REFUNDED);

        return AdminDashboardResponse.builder()
                .totalBuyers(totalBuyers)
                .totalSellers(totalSellers)
                .pendingSellers(pendingSellers)
                .totalProducts(totalProducts)
                .pendingProducts(pendingProducts)
                .totalOrders(totalOrders)
                .totalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO)
                .platformCommission(platformCommission != null ? platformCommission : BigDecimal.ZERO)
                .totalRefunds(totalRefunds)
                .build();
    }

    @Transactional
    public void approveSeller(Long sellerId, User admin) {
        Seller seller = sellerRepository.findById(sellerId)
                .orElseThrow(() -> new ResourceNotFoundException("Seller not found with id: " + sellerId));

        seller.setVerificationStatus(SellerVerificationStatus.APPROVED);
        sellerRepository.save(seller);

        logAction(admin, "SELLER_APPROVED", "Seller", sellerId, "Approved seller: " + seller.getBusinessName());
        notificationService.sendNotification(
                seller.getUser(),
                "Seller Account Approved",
                "Congratulations! Your seller account for " + seller.getBusinessName() + " has been approved.",
                "SELLER_APPROVED"
        );
    }

    @Transactional
    public void rejectSeller(Long sellerId, User admin) {
        Seller seller = sellerRepository.findById(sellerId)
                .orElseThrow(() -> new ResourceNotFoundException("Seller not found with id: " + sellerId));

        seller.setVerificationStatus(SellerVerificationStatus.REJECTED);
        sellerRepository.save(seller);

        logAction(admin, "SELLER_REJECTED", "Seller", sellerId, "Rejected seller: " + seller.getBusinessName());
        notificationService.sendNotification(
                seller.getUser(),
                "Seller Account Rejected",
                "Your seller application for " + seller.getBusinessName() + " was not approved at this time.",
                "SELLER_REJECTED"
        );
    }

    @Transactional
    public void suspendSeller(Long sellerId, User admin) {
        Seller seller = sellerRepository.findById(sellerId)
                .orElseThrow(() -> new ResourceNotFoundException("Seller not found with id: " + sellerId));

        seller.setVerificationStatus(SellerVerificationStatus.SUSPENDED);
        sellerRepository.save(seller);

        logAction(admin, "SELLER_SUSPENDED", "Seller", sellerId, "Suspended seller: " + seller.getBusinessName());
    }

    @Transactional
    public void reactivateSeller(Long sellerId, User admin) {
        Seller seller = sellerRepository.findById(sellerId)
                .orElseThrow(() -> new ResourceNotFoundException("Seller not found with id: " + sellerId));

        seller.setVerificationStatus(SellerVerificationStatus.APPROVED);
        sellerRepository.save(seller);

        logAction(admin, "SELLER_REACTIVATED", "Seller", sellerId, "Reactivated seller: " + seller.getBusinessName());
    }

    @Transactional
    public void updateUserStatus(Long userId, UserStatus status, User admin) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        user.setStatus(status);
        userRepository.save(user);

        logAction(admin, "USER_STATUS_UPDATED", "User", userId, "Updated status of " + user.getEmail() + " to " + status);
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> getAllOrders(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return orderRepository.findAll(pageable).map(mapper::toOrderResponse);
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, OrderStatus status, User admin) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        order.setOrderStatus(status);
        Order saved = orderRepository.save(order);

        logAction(admin, "ORDER_STATUS_UPDATED", "Order", orderId, "Updated order status to " + status);
        notificationService.sendNotification(
                order.getBuyer().getUser(),
                "Order Status Update",
                "Your order #" + order.getOrderNumber() + " is now " + status,
                "ORDER_STATUS_UPDATE"
        );

        return mapper.toOrderResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<ReturnRequestDto> getReturns(ReturnStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        if (status != null) {
            return returnRequestRepository.findByStatus(status, pageable).map(mapper::toReturnRequestDto);
        }
        return returnRequestRepository.findAll(pageable).map(mapper::toReturnRequestDto);
    }

    @Transactional
    public ReturnRequestDto processReturn(Long returnId, ReturnStatus status, User admin) {
        ReturnRequest req = returnRequestRepository.findById(returnId)
                .orElseThrow(() -> new ResourceNotFoundException("Return request not found with id: " + returnId));

        req.setStatus(status);
        ReturnRequest saved = returnRequestRepository.save(req);

        logAction(admin, "RETURN_PROCESSED", "ReturnRequest", returnId, "Updated return status to " + status);
        notificationService.sendNotification(
                req.getBuyer().getUser(),
                "Return Request Update",
                "Your return request for " + req.getOrderItem().getProductName() + " has been updated to " + status,
                "RETURN_STATUS_UPDATE"
        );

        return mapper.toReturnRequestDto(saved);
    }

    @Transactional(readOnly = true)
    public MarketplaceSettingsDto getMarketplaceSettings() {
        MarketplaceSettings settings = settingsRepository.findFirstByOrderByIdAsc()
                .orElseGet(() -> settingsRepository.save(MarketplaceSettings.builder().build()));
        return mapper.toMarketplaceSettingsDto(settings);
    }

    @Transactional
    public MarketplaceSettingsDto updateMarketplaceSettings(MarketplaceSettingsDto dto, User admin) {
        MarketplaceSettings settings = settingsRepository.findFirstByOrderByIdAsc()
                .orElseGet(() -> MarketplaceSettings.builder().build());

        if (dto.getPlatformName() != null) settings.setPlatformName(dto.getPlatformName());
        if (dto.getDefaultCommissionPercentage() != null) settings.setDefaultCommissionPercentage(dto.getDefaultCommissionPercentage());
        if (dto.getDeliveryCharge() != null) settings.setDeliveryCharge(dto.getDeliveryCharge());
        if (dto.getFreeDeliveryThreshold() != null) settings.setFreeDeliveryThreshold(dto.getFreeDeliveryThreshold());
        if (dto.getMinOrderAmount() != null) settings.setMinOrderAmount(dto.getMinOrderAmount());
        if (dto.getReturnWindowDays() != null) settings.setReturnWindowDays(dto.getReturnWindowDays());
        if (dto.getSellerApprovalRequired() != null) settings.setSellerApprovalRequired(dto.getSellerApprovalRequired());
        if (dto.getProductApprovalRequired() != null) settings.setProductApprovalRequired(dto.getProductApprovalRequired());
        if (dto.getCodEnabled() != null) settings.setCodEnabled(dto.getCodEnabled());
        if (dto.getOnlinePaymentEnabled() != null) settings.setOnlinePaymentEnabled(dto.getOnlinePaymentEnabled());

        MarketplaceSettings saved = settingsRepository.save(settings);
        logAction(admin, "SETTINGS_UPDATED", "MarketplaceSettings", saved.getId(), "Marketplace settings updated");

        return mapper.toMarketplaceSettingsDto(saved);
    }

    @Transactional(readOnly = true)
    public Page<AuditLog> getAuditLogs(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return auditLogRepository.findAllByOrderByTimestampDesc(pageable);
    }

    @Transactional
    public void logAction(User admin, String action, String entityType, Long entityId, String description) {
        AuditLog log = AuditLog.builder()
                .admin(admin)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .description(description)
                .build();
        auditLogRepository.save(log);
    }
}
