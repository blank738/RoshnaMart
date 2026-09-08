package com.roshnamart.repository;

import com.roshnamart.entity.OrderItem;
import com.roshnamart.entity.OrderItemStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    List<OrderItem> findByOrderId(Long orderId);

    @Query("SELECT oi FROM OrderItem oi WHERE oi.seller.id = :sellerId ORDER BY oi.order.createdAt DESC")
    Page<OrderItem> findBySellerId(@Param("sellerId") Long sellerId, Pageable pageable);

    @Query("SELECT COUNT(DISTINCT oi.order.id) FROM OrderItem oi WHERE oi.seller.id = :sellerId")
    long countDistinctOrdersBySellerId(@Param("sellerId") Long sellerId);

    @Query("SELECT COALESCE(SUM(oi.subtotal), 0) FROM OrderItem oi WHERE oi.seller.id = :sellerId AND oi.itemStatus != 'CANCELLED'")
    BigDecimal calculateGrossRevenueBySellerId(@Param("sellerId") Long sellerId);

    @Query("SELECT COALESCE(SUM(oi.commissionAmount), 0) FROM OrderItem oi WHERE oi.seller.id = :sellerId AND oi.itemStatus != 'CANCELLED'")
    BigDecimal calculateCommissionBySellerId(@Param("sellerId") Long sellerId);

    @Query("SELECT COALESCE(SUM(oi.sellerEarning), 0) FROM OrderItem oi WHERE oi.seller.id = :sellerId AND oi.itemStatus != 'CANCELLED'")
    BigDecimal calculateNetEarningsBySellerId(@Param("sellerId") Long sellerId);

    @Query("SELECT COALESCE(SUM(oi.sellerEarning), 0) FROM OrderItem oi WHERE oi.seller.id = :sellerId AND oi.itemStatus NOT IN ('DELIVERED', 'CANCELLED', 'RETURNED', 'REFUNDED')")
    BigDecimal calculatePendingEarningsBySellerId(@Param("sellerId") Long sellerId);

    @Query("SELECT COUNT(DISTINCT oi.order.buyer.id) FROM OrderItem oi WHERE oi.product.id = :productId")
    long countBuyersByProductId(@Param("productId") Long productId);

    @Query("SELECT COUNT(oi) FROM OrderItem oi WHERE oi.product.id = :productId")
    long countOrdersByProductId(@Param("productId") Long productId);

    @Query("SELECT COALESCE(SUM(oi.subtotal), 0) FROM OrderItem oi WHERE oi.product.id = :productId AND oi.itemStatus != 'CANCELLED'")
    BigDecimal calculateGrossRevenueByProductId(@Param("productId") Long productId);

    @Query("SELECT COALESCE(SUM(oi.commissionAmount), 0) FROM OrderItem oi WHERE oi.product.id = :productId AND oi.itemStatus != 'CANCELLED'")
    BigDecimal calculateCommissionByProductId(@Param("productId") Long productId);

    @Query("SELECT COALESCE(SUM(oi.sellerEarning), 0) FROM OrderItem oi WHERE oi.product.id = :productId AND oi.itemStatus != 'CANCELLED'")
    BigDecimal calculateNetRevenueByProductId(@Param("productId") Long productId);

    boolean existsByOrderIdAndSellerId(Long orderId, Long sellerId);
    boolean existsByProductIdAndOrderBuyerId(Long productId, Long buyerId);
}
