package com.urp.management.controller;

import com.urp.management.domain.enums.UserStatus;
import com.urp.management.dto.request.AdminResetPasswordRequest;
import com.urp.management.dto.request.AssignRoleRequest;
import com.urp.management.dto.request.CreateUserRequest;
import com.urp.management.dto.request.UpdatePasswordRequest;
import com.urp.management.dto.request.UpdateUserProfileRequest;
import com.urp.management.dto.response.UserResponse;
import com.urp.management.dto.response.UserRoleResponse;
import com.urp.management.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('users.read')")
public class UserController {
    
    private final UserService userService;
    
    @GetMapping
    public ResponseEntity<Page<UserResponse>> searchUsers(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) UserStatus status,
            @RequestParam(required = false) Long tenantId,
            Pageable pageable) {
        Page<UserResponse> users = userService.searchUsers(query, status, tenantId, pageable);
        return ResponseEntity.ok(users);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        UserResponse user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }
    
    @PostMapping
    @PreAuthorize("hasAuthority('users.write')")
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody CreateUserRequest request) {
        UserResponse user = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(user);
    }
    
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('users.write')")
    public ResponseEntity<UserResponse> updateUserStatus(
            @PathVariable Long id,
            @RequestParam UserStatus status) {
        UserResponse user = userService.updateUserStatus(id, status);
        return ResponseEntity.ok(user);
    }
    
    @PostMapping("/{id}/ban")
    @PreAuthorize("hasAuthority('users.ban')")
    public ResponseEntity<UserResponse> banUser(
            @PathVariable Long id,
            @RequestParam String reason,
            @RequestParam(required = false) LocalDateTime expiresAt) {
        UserResponse user = userService.banUser(id, reason, expiresAt);
        return ResponseEntity.ok(user);
    }
    
    @PostMapping("/{id}/roles")
    @PreAuthorize("hasAuthority('roles.assign')")
    public ResponseEntity<UserRoleResponse> assignRole(
            @PathVariable Long id,
            @Valid @RequestBody AssignRoleRequest request) {
        UserRoleResponse userRole = userService.assignRole(id, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(userRole);
    }
    
    @DeleteMapping("/{id}/roles/{userRoleId}")
    @PreAuthorize("hasAuthority('roles.assign')")
    public ResponseEntity<Void> removeRole(
            @PathVariable Long id,
            @PathVariable Long userRoleId) {
        userService.removeRole(id, userRoleId);
        return ResponseEntity.noContent().build();
    }
    
    @PutMapping("/{id}/profile")
    @PreAuthorize("hasAuthority('users.write')")
    public ResponseEntity<UserResponse> updateProfile(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserProfileRequest request) {
        UserResponse user = userService.updateProfile(id, request);
        return ResponseEntity.ok(user);
    }
    
    @PutMapping("/{id}/password")
    public ResponseEntity<Void> updatePassword(
            @PathVariable Long id,
            @Valid @RequestBody UpdatePasswordRequest request) {
        userService.updatePassword(id, request);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/{id}/reset-password")
    @PreAuthorize("hasAuthority('users.write')")
    public ResponseEntity<Void> adminResetPassword(
            @PathVariable Long id,
            @Valid @RequestBody AdminResetPasswordRequest request) {
        userService.adminResetPassword(id, request);
        return ResponseEntity.ok().build();
    }
}
