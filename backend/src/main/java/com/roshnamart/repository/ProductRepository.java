package com.roshnamart.repository;

import com.roshnamart.entity.Product;
import com.roshnamart.entity.ProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query("SELECT p FROM Product p WHERE p.status = 'ACTIVE' " +
           "AND (:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.brand) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:categoryId IS NULL OR p.category.id = :categoryId) " +
           "AND (:sellerId IS NULL OR p.seller.id = :sellerId) " +
           "AND (:minPrice IS NULL OR p.price >= :minPrice) " +
           "AND (:maxPrice IS NULL OR p.price <= :maxPrice) " +
           "AND (:minRating IS NULL OR p.rating >= :minRating)")
    Page<Product> filterPublicProducts(
            @Param("search") String search,
            @Param("categoryId") Long categoryId,
            @Param("sellerId") Long sellerId,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("minRating") Double minRating,
            Pageable pageable
    );

    Page<Product> findBySellerId(Long sellerId, Pageable pageable);
    Page<Product> findBySellerIdAndStatus(Long sellerId, ProductStatus status, Pageable pageable);
    long countBySellerId(Long sellerId);
    long countBySellerIdAndStatus(Long sellerId, ProductStatus status);
    long countBySellerIdAndQuantityLessThanEqual(Long sellerId, Integer quantity);

    List<Product> findTop8ByStatusOrderByCreatedAtDesc(ProductStatus status);
    List<Product> findTop8ByStatusAndDiscountPriceIsNotNullOrderByDiscountPriceAsc(ProductStatus status);

    Page<Product> findByStatus(ProductStatus status, Pageable pageable);
    long countByStatus(ProductStatus status);
}
