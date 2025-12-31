package com.urp.management.dto.request;

import com.urp.management.domain.enums.ScopeType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AssignRoleRequest {
    
    @NotNull(message = "Role ID is required")
    private Long roleId;
    
    @NotNull(message = "Scope type is required")
    private ScopeType scopeType;
    
    private String scopeId;
    
    private LocalDateTime expiresAt;
}
