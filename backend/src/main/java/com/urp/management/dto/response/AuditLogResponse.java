package com.urp.management.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogResponse {
    
    private Long id;
    private String action;
    private String targetType;
    private String targetId;
    private String diffJson;
    private LocalDateTime createdAt;
    private Long actorUserId;
    private String actorUserEmail;
    private String ipAddress;
    private String userAgent;
}
