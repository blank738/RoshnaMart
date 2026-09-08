package com.roshnamart.repository;

import com.roshnamart.entity.MarketplaceSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface MarketplaceSettingsRepository extends JpaRepository<MarketplaceSettings, Long> {
    Optional<MarketplaceSettings> findFirstByOrderByIdAsc();
}
