package com.roshnamart.repository;

import com.roshnamart.entity.ReturnRequest;
import com.roshnamart.entity.ReturnStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReturnRequestRepository extends JpaRepository<ReturnRequest, Long> {
    Page<ReturnRequest> findByBuyerId(Long buyerId, Pageable pageable);
    Page<ReturnRequest> findBySellerId(Long sellerId, Pageable pageable);
    Page<ReturnRequest> findByStatus(ReturnStatus status, Pageable pageable);
    long countByStatus(ReturnStatus status);
}
