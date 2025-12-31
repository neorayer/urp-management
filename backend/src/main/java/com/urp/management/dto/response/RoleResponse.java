package com.urp.management.dto.response;

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
public class RoleResponse {
    
    private Long id;
    private String name;
    private String description;
    private Boolean isSystem;
    private LocalDateTime createdAt;
    private Long tenantId;
    private Set<PermissionResponse> permissions;
    private Integer usageCount;
}
