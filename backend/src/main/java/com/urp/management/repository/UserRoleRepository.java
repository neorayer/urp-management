package com.urp.management.repository;

import com.urp.management.domain.entity.UserRole;
import com.urp.management.domain.enums.ScopeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserRoleRepository extends JpaRepository<UserRole, Long> {
    
    List<UserRole> findByUserId(Long userId);
    
    @Query("SELECT ur FROM UserRole ur WHERE ur.user.id = :userId " +
           "AND (:scopeType IS NULL OR ur.scopeType = :scopeType) " +
           "AND (:scopeId IS NULL OR ur.scopeId = :scopeId)")
    List<UserRole> findByUserIdAndScope(@Param("userId") Long userId,
                                       @Param("scopeType") ScopeType scopeType,
                                       @Param("scopeId") String scopeId);
    
    void deleteByUserIdAndRoleId(Long userId, Long roleId);
}
