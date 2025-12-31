package com.urp.management.repository;

import com.urp.management.domain.entity.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TenantRepository extends JpaRepository<Tenant, Long> {
    
    Optional<Tenant> findBySlug(String slug);
    
    Optional<Tenant> findByDomain(String domain);
    
    boolean existsBySlug(String slug);
}
