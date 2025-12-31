package com.urp.management.dto.response;

import com.urp.management.domain.enums.ScopeType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserRoleResponse {
    
    private Long id;
    private Long roleId;
    private String roleName;
    private ScopeType scopeType;
    private String scopeId;
    private LocalDateTime grantedAt;
    private LocalDateTime expiresAt;
    private String grantedByName;
}
