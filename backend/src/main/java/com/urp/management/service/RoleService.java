package com.urp.management.service;

import com.urp.management.domain.entity.Permission;
import com.urp.management.domain.entity.Role;
import com.urp.management.dto.request.CreateRoleRequest;
import com.urp.management.dto.request.UpdateRoleRequest;
import com.urp.management.dto.response.PermissionResponse;
import com.urp.management.dto.response.RoleResponse;
import com.urp.management.repository.PermissionRepository;
import com.urp.management.repository.RoleRepository;
import com.urp.management.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class RoleService {
    
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final TenantRepository tenantRepository;
    private final AuditService auditService;
    
    public List<RoleResponse> getAllRoles() {
        return roleRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    public RoleResponse getRoleById(Long id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found"));
        return mapToResponse(role);
    }
    
    public RoleResponse createRole(CreateRoleRequest request) {
        Role role = Role.builder()
                .name(request.getName())
                .description(request.getDescription())
                .isSystem(false)
                .permissions(new HashSet<>())
                .build();
        
        if (request.getTenantId() != null) {
            tenantRepository.findById(request.getTenantId())
                    .ifPresent(role::setTenant);
        }
        
        if (request.getPermissionIds() != null && !request.getPermissionIds().isEmpty()) {
            Set<Permission> permissions = new HashSet<>(
                    permissionRepository.findAllById(request.getPermissionIds())
            );
            role.setPermissions(permissions);
        }
        
        role = roleRepository.save(role);
        
        auditService.log("ROLE_CREATED", "Role", role.getId().toString(), 
                null, null);
        
        return mapToResponse(role);
    }
    
    public RoleResponse updateRole(Long roleId, UpdateRoleRequest request) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new RuntimeException("Role not found"));
        
        if (role.getIsSystem()) {
            throw new RuntimeException("Cannot modify system role");
        }
        
        role.setName(request.getName());
        role.setDescription(request.getDescription());
        
        if (request.getPermissionIds() != null) {
            Set<Permission> permissions = new HashSet<>(
                    permissionRepository.findAllById(request.getPermissionIds())
            );
            role.setPermissions(permissions);
        }
        
        role = roleRepository.save(role);
        
        auditService.log("ROLE_UPDATED", "Role", roleId.toString(), null, null);
        
        return mapToResponse(role);
    }
    
    public RoleResponse updateRolePermissions(Long roleId, Set<Long> permissionIds) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new RuntimeException("Role not found"));
        
        if (role.getIsSystem()) {
            throw new RuntimeException("Cannot modify system role");
        }
        
        Set<Permission> permissions = new HashSet<>(
                permissionRepository.findAllById(permissionIds)
        );
        
        role.setPermissions(permissions);
        role = roleRepository.save(role);
        
        auditService.log("ROLE_PERMISSIONS_UPDATED", "Role", roleId.toString(),
                String.format("{\"permissionCount\":%d}", permissions.size()),
                null);
        
        return mapToResponse(role);
    }
    
    public void deleteRole(Long id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found"));
        
        if (role.getIsSystem()) {
            throw new RuntimeException("Cannot delete system role");
        }
        
        roleRepository.delete(role);
        
        auditService.log("ROLE_DELETED", "Role", id.toString(), null, null);
    }
    
    public List<PermissionResponse> getAllPermissions() {
        return permissionRepository.findAll().stream()
                .map(this::mapPermissionToResponse)
                .collect(Collectors.toList());
    }
    
    private RoleResponse mapToResponse(Role role) {
        Set<PermissionResponse> permissions = role.getPermissions().stream()
                .map(this::mapPermissionToResponse)
                .collect(Collectors.toSet());
        
        return RoleResponse.builder()
                .id(role.getId())
                .name(role.getName())
                .description(role.getDescription())
                .isSystem(role.getIsSystem())
                .createdAt(role.getCreatedAt())
                .tenantId(role.getTenant() != null ? role.getTenant().getId() : null)
                .permissions(permissions)
                .build();
    }
    
    private PermissionResponse mapPermissionToResponse(Permission permission) {
        return PermissionResponse.builder()
                .id(permission.getId())
                .key(permission.getKey())
                .description(permission.getDescription())
                .category(permission.getCategory())
                .resource(permission.getResource())
                .action(permission.getAction())
                .build();
    }
}
