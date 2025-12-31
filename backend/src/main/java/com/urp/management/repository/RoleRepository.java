package com.urp.management.repository;

import com.urp.management.domain.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    
    Optional<Role> findByName(String name);
    
    List<Role> findByTenantId(Long tenantId);
    
    List<Role> findByTenantIdIsNull();
    
    @Query("SELECT r FROM Role r WHERE " +
           "(:tenantId IS NULL OR r.tenant.id = :tenantId OR r.tenant IS NULL) " +
           "ORDER BY r.name")
    List<Role> findAvailableRoles(@Param("tenantId") Long tenantId);
}
