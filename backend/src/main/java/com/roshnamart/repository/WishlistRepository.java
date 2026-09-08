package com.roshnamart.repository;

import com.roshnamart.entity.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, Long> {
    List<Wishlist> findByBuyerIdOrderByCreatedAtDesc(Long buyerId);
    Optional<Wishlist> findByBuyerIdAndProductId(Long buyerId, Long productId);
    boolean existsByBuyerIdAndProductId(Long buyerId, Long productId);
    void deleteByBuyerIdAndProductId(Long buyerId, Long productId);
}
