package com.roshnamart.repository;

import com.roshnamart.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByProductIdOrderByCreatedAtDesc(Long productId);
    Page<Review> findByProductIdOrderByCreatedAtDesc(Long productId, Pageable pageable);
    boolean existsByProductIdAndBuyerId(Long productId, Long buyerId);
}
