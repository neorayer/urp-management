package com.urp.management.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.Set;

@Data
public class UpdateRoleRequest {
    
    @NotBlank(message = "Role name is required")
    private String name;
    
    private String description;
    
    private Set<Long> permissionIds;
}
