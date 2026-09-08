package com.roshnamart.repository;

import com.roshnamart.entity.Order;
import com.roshnamart.entity.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Page<Order> findByBuyerIdOrderByCreatedAtDesc(Long buyerId, Pageable pageable);
    Optional<Order> findByOrderNumber(String orderNumber);
    long countByOrderStatus(OrderStatus orderStatus);

    @Query("SELECT COALESCE(SUM(o.finalAmount), 0) FROM Order o WHERE o.orderStatus != 'CANCELLED'")
    BigDecimal calculateTotalMarketplaceRevenue();

    @Query("SELECT COALESCE(SUM(oi.commissionAmount), 0) FROM OrderItem oi WHERE oi.order.orderStatus != 'CANCELLED'")
    BigDecimal calculateTotalPlatformCommission();
}
