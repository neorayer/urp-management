package com.urp.management.service;

import com.urp.management.domain.entity.AuditLog;
import com.urp.management.domain.entity.Tenant;
import com.urp.management.domain.entity.User;
import com.urp.management.dto.response.AuditLogResponse;
import com.urp.management.repository.AuditLogRepository;
import com.urp.management.repository.TenantRepository;
import com.urp.management.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class AuditService {
    
    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;
    
    public void log(String action, String targetType, String targetId, String diffJson, Long actorUserId) {
        HttpServletRequest request = getCurrentRequest();
        
        AuditLog auditLog = AuditLog.builder()
                .action(action)
                .targetType(targetType)
                .targetId(targetId)
                .diffJson(diffJson)
                .ipAddress(request != null ? getClientIp(request) : null)
                .userAgent(request != null ? request.getHeader("User-Agent") : null)
                .build();
        
        if (actorUserId != null) {
            userRepository.findById(actorUserId)
                    .ifPresent(auditLog::setActorUser);
        }
        
        auditLogRepository.save(auditLog);
    }
    
    public Page<AuditLogResponse> searchAuditLogs(Long actorUserId, String action, 
                                                  String targetType, String targetId,
                                                  LocalDateTime from, LocalDateTime to,
                                                  Pageable pageable) {
        return auditLogRepository.searchAuditLogs(actorUserId, action, targetType, 
                targetId, from, to, pageable)
                .map(this::mapToResponse);
    }
    
    private AuditLogResponse mapToResponse(AuditLog log) {
        return AuditLogResponse.builder()
                .id(log.getId())
                .action(log.getAction())
                .targetType(log.getTargetType())
                .targetId(log.getTargetId())
                .diffJson(log.getDiffJson())
                .createdAt(log.getCreatedAt())
                .actorUserId(log.getActorUser() != null ? log.getActorUser().getId() : null)
                .actorUserEmail(log.getActorUser() != null ? log.getActorUser().getEmail() : null)
                .ipAddress(log.getIpAddress())
                .userAgent(log.getUserAgent())
                .build();
    }
    
    private HttpServletRequest getCurrentRequest() {
        ServletRequestAttributes attributes = 
                (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        return attributes != null ? attributes.getRequest() : null;
    }
    
    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty()) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isEmpty()) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }
}
