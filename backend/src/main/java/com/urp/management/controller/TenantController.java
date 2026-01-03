package com.urp.management.controller;

import com.urp.management.domain.enums.TenantStatus;
import com.urp.management.dto.request.CreateTenantRequest;
import com.urp.management.dto.request.UpdateTenantRequest;
import com.urp.management.dto.response.TenantResponse;
import com.urp.management.dto.response.UserResponse;
import com.urp.management.service.TenantService;
import com.urp.management.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/tenants")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('tenants.read')")
public class TenantController {
    
    private final TenantService tenantService;
    private final UserService userService;
    
    @GetMapping
    public ResponseEntity<Page<TenantResponse>> searchTenants(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) TenantStatus status,
            Pageable pageable) {
        Page<TenantResponse> tenants = tenantService.searchTenants(query, status, pageable);
        return ResponseEntity.ok(tenants);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<TenantResponse> getTenantById(@PathVariable Long id) {
        TenantResponse tenant = tenantService.getTenantById(id);
        return ResponseEntity.ok(tenant);
    }
    
    @GetMapping("/slug/{slug}")
    public ResponseEntity<TenantResponse> getTenantBySlug(@PathVariable String slug) {
        TenantResponse tenant = tenantService.getTenantBySlug(slug);
        return ResponseEntity.ok(tenant);
    }
    
    @PostMapping
    @PreAuthorize("hasAuthority('tenants.write')")
    public ResponseEntity<TenantResponse> createTenant(@Valid @RequestBody CreateTenantRequest request) {
        TenantResponse tenant = tenantService.createTenant(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(tenant);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('tenants.write')")
    public ResponseEntity<TenantResponse> updateTenant(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTenantRequest request) {
        TenantResponse tenant = tenantService.updateTenant(id, request);
        return ResponseEntity.ok(tenant);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('tenants.delete')")
    public ResponseEntity<Void> deleteTenant(@PathVariable Long id) {
        tenantService.deleteTenant(id);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/{id}/suspend")
    @PreAuthorize("hasAuthority('tenants.write')")
    public ResponseEntity<TenantResponse> suspendTenant(
            @PathVariable Long id,
            @RequestParam(required = false) String reason) {
        TenantResponse tenant = tenantService.suspendTenant(id, reason);
        return ResponseEntity.ok(tenant);
    }
    
    @PostMapping("/{id}/activate")
    @PreAuthorize("hasAuthority('tenants.write')")
    public ResponseEntity<TenantResponse> activateTenant(@PathVariable Long id) {
        TenantResponse tenant = tenantService.activateTenant(id);
        return ResponseEntity.ok(tenant);
    }
    
    @GetMapping("/{id}/users")
    public ResponseEntity<Page<UserResponse>> getTenantUsers(
            @PathVariable Long id,
            @RequestParam(required = false) String query,
            Pageable pageable) {
        Page<UserResponse> users = userService.searchUsers(query, null, id, pageable);
        return ResponseEntity.ok(users);
    }
}
