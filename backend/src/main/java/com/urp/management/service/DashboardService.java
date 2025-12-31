package com.urp.management.service;

import com.urp.management.domain.entity.AuditLog;
import com.urp.management.domain.enums.UserStatus;
import com.urp.management.dto.response.DashboardStatsResponse;
import com.urp.management.dto.response.RecentActivityResponse;
import com.urp.management.repository.AuditLogRepository;
import com.urp.management.repository.RoleRepository;
import com.urp.management.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {
    
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final AuditLogRepository auditLogRepository;
    
    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats() {
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.searchUsers(null, UserStatus.ACTIVE, null, Pageable.unpaged())
                .getTotalElements();
        long activeRoles = roleRepository.count();
        long totalAuditLogs = auditLogRepository.count();
        
        return DashboardStatsResponse.builder()
                .totalUsers(totalUsers)
                .activeUsers(activeUsers)
                .activeRoles(activeRoles)
                .totalAuditLogs(totalAuditLogs)
                .build();
    }
    
    @Transactional(readOnly = true)
    public List<RecentActivityResponse> getRecentActivity(int limit) {
        Pageable pageable = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "createdAt"));
        return auditLogRepository.findAll(pageable).stream()
                .map(this::convertToRecentActivity)
                .collect(Collectors.toList());
    }
    
    private RecentActivityResponse convertToRecentActivity(AuditLog log) {
        return RecentActivityResponse.builder()
                .id(log.getId())
                .action(log.getAction())
                .description(buildDescription(log))
                .timestamp(log.getCreatedAt())
                .actorEmail(log.getActorUser() != null ? log.getActorUser().getEmail() : "System")
                .build();
    }
    
    private String buildDescription(AuditLog log) {
        String action = log.getAction();
        String targetType = log.getTargetType();
        String metadata = log.getMetadata();
        
        // Build a human-readable description
        if (action.startsWith("USER_")) {
            return String.format("User %s", action.substring(5).toLowerCase().replace('_', ' '));
        } else if (action.startsWith("ROLE_")) {
            return String.format("Role %s", action.substring(5).toLowerCase().replace('_', ' '));
        } else if (action.startsWith("PERMISSION_")) {
            return String.format("Permission %s", action.substring(11).toLowerCase().replace('_', ' '));
        }
        
        return action.toLowerCase().replace('_', ' ');
    }
}
