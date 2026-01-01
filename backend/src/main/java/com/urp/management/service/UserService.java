package com.urp.management.service;

import com.urp.management.domain.entity.*;
import com.urp.management.domain.enums.UserStatus;
import com.urp.management.dto.request.AdminResetPasswordRequest;
import com.urp.management.dto.request.AssignRoleRequest;
import com.urp.management.dto.request.CreateUserRequest;
import com.urp.management.dto.request.UpdatePasswordRequest;
import com.urp.management.dto.request.UpdateUserProfileRequest;
import com.urp.management.dto.response.UserResponse;
import com.urp.management.dto.response.UserRoleResponse;
import com.urp.management.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {
    
    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final AuditService auditService;
    private final PasswordEncoder passwordEncoder;
    
    public Page<UserResponse> searchUsers(String query, UserStatus status, Long tenantId, Pageable pageable) {
        return userRepository.searchUsers(query, status, tenantId, pageable)
                .map(this::mapToUserResponse);
    }
    
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return mapToUserResponse(user);
    }
    
    public UserResponse createUser(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        
        if (request.getUsername() != null && userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        
        User user = User.builder()
                .email(request.getEmail())
                .username(request.getUsername())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .displayName(request.getDisplayName())
                .phone(request.getPhone())
                .status(request.getStatus() != null ? request.getStatus() : UserStatus.ACTIVE)
                .emailVerified(false)
                .mfaEnabled(false)
                .locale(request.getLocale())
                .timezone(request.getTimezone())
                .build();
        
        if (request.getTenantId() != null) {
            Tenant tenant = tenantRepository.findById(request.getTenantId())
                    .orElseThrow(() -> new RuntimeException("Tenant not found"));
            user.setTenant(tenant);
        }
        
        user = userRepository.save(user);
        
        auditService.log("USER_CREATED", "User", user.getId().toString(), 
                null, getCurrentUserId());
        
        return mapToUserResponse(user);
    }
    
    public UserResponse updateUserStatus(Long id, UserStatus status) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        UserStatus oldStatus = user.getStatus();
        user.setStatus(status);
        
        if (status != UserStatus.BANNED) {
            user.setBannedAt(null);
            user.setBanReason(null);
            user.setBanExpiresAt(null);
        } else if (user.getBannedAt() == null) {
            user.setBannedAt(LocalDateTime.now());
        }
        
        user = userRepository.save(user);
        
        auditService.log("USER_STATUS_UPDATED", "User", id.toString(),
                String.format("{\"old\":\"%s\",\"new\":\"%s\"}", oldStatus, status),
                getCurrentUserId());
        
        return mapToUserResponse(user);
    }
    
    public UserResponse banUser(Long id, String reason, LocalDateTime expiresAt) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (reason == null || reason.isBlank()) {
            throw new RuntimeException("Ban reason is required");
        }
        
        user.setStatus(UserStatus.BANNED);
        user.setBannedAt(LocalDateTime.now());
        user.setBanReason(reason);
        user.setBanExpiresAt(expiresAt);
        
        user = userRepository.save(user);
        
        auditService.log("USER_BANNED", "User", id.toString(),
                String.format("{\"reason\":\"%s\",\"expires\":\"%s\"}", reason, expiresAt),
                getCurrentUserId());
        
        return mapToUserResponse(user);
    }
    
    public UserRoleResponse assignRole(Long userId, AssignRoleRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Role role = roleRepository.findById(request.getRoleId())
                .orElseThrow(() -> new RuntimeException("Role not found"));
        
        boolean alreadyAssigned = userRoleRepository.existsByUserIdAndRoleIdAndScopeTypeAndScopeId(
                userId, role.getId(), request.getScopeType(), request.getScopeId());
        if (alreadyAssigned) {
            throw new RuntimeException("Role already assigned for this scope");
        }
        
        User currentUser = getCurrentUser();
        
        UserRole userRole = UserRole.builder()
                .user(user)
                .role(role)
                .scopeType(request.getScopeType())
                .scopeId(request.getScopeId())
                .grantedBy(currentUser)
                .expiresAt(request.getExpiresAt())
                .build();
        
        userRole = userRoleRepository.save(userRole);
        
        auditService.log("ROLE_ASSIGNED", "UserRole", userRole.getId().toString(),
                String.format("{\"userId\":%d,\"roleId\":%d,\"scope\":\"%s\"}", 
                        userId, role.getId(), request.getScopeType()),
                getCurrentUserId());
        
        return mapToUserRoleResponse(userRole);
    }
    
    public void removeRole(Long userId, Long userRoleId) {
        UserRole userRole = userRoleRepository.findByIdAndUserId(userRoleId, userId)
                .orElseThrow(() -> new RuntimeException("Role assignment not found for user"));
        
        userRoleRepository.delete(userRole);
        
        auditService.log("ROLE_REMOVED", "UserRole", userRoleId.toString(),
                String.format("{\"userId\":%d}", userId),
                getCurrentUserId());
    }
    
    public UserResponse updateProfile(Long userId, UpdateUserProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (request.getDisplayName() != null) {
            user.setDisplayName(request.getDisplayName());
        }
        
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        
        if (request.getAvatar() != null) {
            user.setAvatar(request.getAvatar());
        }
        
        if (request.getLocale() != null) {
            user.setLocale(request.getLocale());
        }
        
        if (request.getTimezone() != null) {
            user.setTimezone(request.getTimezone());
        }
        
        user = userRepository.save(user);
        
        auditService.log("USER_PROFILE_UPDATED", "User", userId.toString(),
                null, getCurrentUserId());
        
        return mapToUserResponse(user);
    }
    
    public void updatePassword(Long userId, UpdatePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        User currentUser = getCurrentUser();
        if (!currentUser.getId().equals(userId)) {
            throw new RuntimeException("You can only update your own password");
        }
        
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Current password is incorrect");
        }
        
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        
        auditService.log("USER_PASSWORD_UPDATED", "User", userId.toString(),
                null, getCurrentUserId());
    }
    
    public void adminResetPassword(Long userId, AdminResetPasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        
        auditService.log("USER_PASSWORD_RESET_BY_ADMIN", "User", userId.toString(),
                null, getCurrentUserId());
    }
    
    private UserResponse mapToUserResponse(User user) {
        Set<UserRoleResponse> roles = user.getUserRoles().stream()
                .map(this::mapToUserRoleResponse)
                .collect(Collectors.toSet());
        
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .username(user.getUsername())
                .displayName(user.getDisplayName())
                .avatar(user.getAvatar())
                .phone(user.getPhone())
                .status(user.getStatus())
                .emailVerified(user.getEmailVerified())
                .mfaEnabled(user.getMfaEnabled())
                .createdAt(user.getCreatedAt())
                .lastLoginAt(user.getLastLoginAt())
                .tenantId(user.getTenant() != null ? user.getTenant().getId() : null)
                .tenantName(user.getTenant() != null ? user.getTenant().getName() : null)
                .roles(roles)
                .build();
    }
    
    private UserRoleResponse mapToUserRoleResponse(UserRole userRole) {
        return UserRoleResponse.builder()
                .id(userRole.getId())
                .roleId(userRole.getRole().getId())
                .roleName(userRole.getRole().getName())
                .scopeType(userRole.getScopeType())
                .scopeId(userRole.getScopeId())
                .grantedAt(userRole.getGrantedAt())
                .expiresAt(userRole.getExpiresAt())
                .grantedByName(userRole.getGrantedBy() != null ? 
                        userRole.getGrantedBy().getDisplayName() : null)
                .build();
    }
    
    private Long getCurrentUserId() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .map(User::getId)
                .orElse(null);
    }
    
    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Current user not found"));
    }
}
