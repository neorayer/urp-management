package com.urp.management.dto.response;

import com.urp.management.domain.enums.TenantStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TenantResponse {
    
    private Long id;
    private String name;
    private String slug;
    private String domain;
    private TenantStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime suspendedAt;
    private LocalDateTime trialEndsAt;
    private Long userCount;
}
