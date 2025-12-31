package com.urp.management.dto.response;

import com.urp.management.domain.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    
    private Long id;
    private String email;
    private String username;
    private String displayName;
    private String avatar;
    private UserStatus status;
    private Boolean emailVerified;
    private Boolean mfaEnabled;
    private LocalDateTime createdAt;
    private LocalDateTime lastLoginAt;
    private Long tenantId;
    private String tenantName;
    private Set<UserRoleResponse> roles;
}
