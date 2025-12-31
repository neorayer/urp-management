package com.urp.management.repository;

import com.urp.management.domain.entity.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SessionRepository extends JpaRepository<Session, Long> {
    
    Optional<Session> findBySessionId(String sessionId);
    
    Optional<Session> findByRefreshToken(String refreshToken);
    
    List<Session> findByUserIdAndRevokedAtIsNull(Long userId);
    
    List<Session> findByUserIdAndRevokedAtIsNullAndLastSeenAtAfter(Long userId, LocalDateTime threshold);
    
    void deleteByRevokedAtBefore(LocalDateTime threshold);
}
