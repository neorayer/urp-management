package com.urp.management.repository;

import com.urp.management.domain.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    
    @Query("SELECT a FROM AuditLog a WHERE " +
           "(:actorUserId IS NULL OR a.actorUser.id = :actorUserId) " +
           "AND (:action IS NULL OR a.action = :action) " +
           "AND (:targetType IS NULL OR a.targetType = :targetType) " +
           "AND (:targetId IS NULL OR a.targetId = :targetId) " +
           "AND (:from IS NULL OR a.createdAt >= :from) " +
           "AND (:to IS NULL OR a.createdAt <= :to) " +
           "ORDER BY a.createdAt DESC")
    Page<AuditLog> searchAuditLogs(@Param("actorUserId") Long actorUserId,
                                   @Param("action") String action,
                                   @Param("targetType") String targetType,
                                   @Param("targetId") String targetId,
                                   @Param("from") LocalDateTime from,
                                   @Param("to") LocalDateTime to,
                                   Pageable pageable);
    
    void deleteByCreatedAtBefore(LocalDateTime threshold);
}
