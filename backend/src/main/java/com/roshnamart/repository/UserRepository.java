package com.roshnamart.repository;

import com.roshnamart.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    org.springframework.data.domain.Page<User> findByRole(com.roshnamart.entity.Role role, org.springframework.data.domain.Pageable pageable);
}
