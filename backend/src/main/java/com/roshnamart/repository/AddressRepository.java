package com.roshnamart.repository;

import com.roshnamart.entity.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AddressRepository extends JpaRepository<Address, Long> {
    List<Address> findByBuyerId(Long buyerId);
    Optional<Address> findByBuyerIdAndIsDefaultTrue(Long buyerId);
}
