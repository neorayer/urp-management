package com.urp.management.repository;

import com.urp.management.domain.entity.Tenant;
import com.urp.management.domain.enums.TenantStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TenantRepository extends JpaRepository<Tenant, Long> {
    
    Optional<Tenant> findBySlug(String slug);
    
    Optional<Tenant> findByDomain(String domain);
    
    boolean existsBySlug(String slug);
    
    Page<Tenant> findByNameContainingIgnoreCase(String name, Pageable pageable);
    
    Page<Tenant> findByStatus(TenantStatus status, Pageable pageable);
    
    Page<Tenant> findByNameContainingIgnoreCaseAndStatus(String name, TenantStatus status, Pageable pageable);
}
