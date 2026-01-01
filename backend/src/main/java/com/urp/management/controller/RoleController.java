package com.urp.management.controller;

import com.urp.management.dto.request.CreateRoleRequest;
import com.urp.management.dto.request.UpdateRoleRequest;
import com.urp.management.dto.response.PermissionResponse;
import com.urp.management.dto.response.RoleResponse;
import com.urp.management.service.RoleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/admin/roles")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('roles.read')")
public class RoleController {
    
    private final RoleService roleService;
    
    @GetMapping
    public ResponseEntity<List<RoleResponse>> getAllRoles() {
        List<RoleResponse> roles = roleService.getAllRoles();
        return ResponseEntity.ok(roles);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<RoleResponse> getRoleById(@PathVariable Long id) {
        RoleResponse role = roleService.getRoleById(id);
        return ResponseEntity.ok(role);
    }
    
    @PostMapping
    @PreAuthorize("hasAuthority('roles.write')")
    public ResponseEntity<RoleResponse> createRole(@Valid @RequestBody CreateRoleRequest request) {
        RoleResponse role = roleService.createRole(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(role);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('roles.write')")
    public ResponseEntity<RoleResponse> updateRole(
            @PathVariable Long id,
            @Valid @RequestBody UpdateRoleRequest request) {
        RoleResponse role = roleService.updateRole(id, request);
        return ResponseEntity.ok(role);
    }
    
    @PutMapping("/{id}/permissions")
    @PreAuthorize("hasAuthority('roles.write')")
    public ResponseEntity<RoleResponse> updateRolePermissions(
            @PathVariable Long id,
            @RequestBody Set<Long> permissionIds) {
        RoleResponse role = roleService.updateRolePermissions(id, permissionIds);
        return ResponseEntity.ok(role);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('roles.write')")
    public ResponseEntity<Void> deleteRole(@PathVariable Long id) {
        roleService.deleteRole(id);
        return ResponseEntity.noContent().build();
    }
}
