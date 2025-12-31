package com.urp.management.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.Set;

@Data
public class CreateRoleRequest {
    
    @NotBlank(message = "Role name is required")
    private String name;
    
    private String description;
    
    private Long tenantId;
    
    private Set<Long> permissionIds;
}
