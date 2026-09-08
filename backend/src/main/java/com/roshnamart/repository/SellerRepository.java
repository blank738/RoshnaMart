package com.roshnamart.repository;

import com.roshnamart.entity.Seller;
import com.roshnamart.entity.SellerVerificationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface SellerRepository extends JpaRepository<Seller, Long> {
    Optional<Seller> findByUserId(Long userId);
    Optional<Seller> findByUserEmail(String email);
    Page<Seller> findByVerificationStatus(SellerVerificationStatus status, Pageable pageable);
    long countByVerificationStatus(SellerVerificationStatus status);

    @Query("SELECT s FROM Seller s WHERE (:search IS NULL OR LOWER(s.businessName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(s.user.name) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Seller> searchSellers(@Param("search") String search, Pageable pageable);
}
