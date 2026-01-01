package com.urp.management.repository;

import com.urp.management.domain.entity.UserRole;
import com.urp.management.domain.enums.ScopeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRoleRepository extends JpaRepository<UserRole, Long> {
    
    List<UserRole> findByUserId(Long userId);
    
    Optional<UserRole> findByIdAndUserId(Long id, Long userId);
    
    @Query("SELECT ur FROM UserRole ur WHERE ur.user.id = :userId " +
           "AND (:scopeType IS NULL OR ur.scopeType = :scopeType) " +
           "AND (:scopeId IS NULL OR ur.scopeId = :scopeId)")
    List<UserRole> findByUserIdAndScope(@Param("userId") Long userId,
                                       @Param("scopeType") ScopeType scopeType,
                                       @Param("scopeId") String scopeId);
    
    void deleteByUserIdAndRoleId(Long userId, Long roleId);
    
    boolean existsByUserIdAndRoleIdAndScopeTypeAndScopeId(Long userId, Long roleId,
                                                          ScopeType scopeType, String scopeId);
}
