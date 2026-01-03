package com.urp.management.repository;

import com.urp.management.domain.entity.User;
import com.urp.management.domain.enums.UserStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    @EntityGraph(attributePaths = {"userRoles", "userRoles.role", "userRoles.role.permissions"})
    Optional<User> findByEmail(String email);
    
    Optional<User> findByUsername(String username);
    
    boolean existsByEmail(String email);
    
    boolean existsByUsername(String username);
    
    long countByTenantId(Long tenantId);
    
    @Query("SELECT u FROM User u WHERE " +
           "(:query IS NULL OR LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(u.username) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(u.displayName) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "AND (:status IS NULL OR u.status = :status) " +
           "AND (:tenantId IS NULL OR u.tenant.id = :tenantId)")
    Page<User> searchUsers(@Param("query") String query,
                          @Param("status") UserStatus status,
                          @Param("tenantId") Long tenantId,
                          Pageable pageable);
}
