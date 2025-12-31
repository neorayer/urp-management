package com.urp.management.config;

import com.urp.management.domain.entity.Permission;
import com.urp.management.domain.entity.Role;
import com.urp.management.domain.entity.User;
import com.urp.management.domain.entity.UserRole;
import com.urp.management.domain.enums.ScopeType;
import com.urp.management.domain.enums.UserStatus;
import com.urp.management.repository.PermissionRepository;
import com.urp.management.repository.RoleRepository;
import com.urp.management.repository.UserRepository;
import com.urp.management.repository.UserRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {
    
    private final PermissionRepository permissionRepository;
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) {
        if (permissionRepository.count() == 0) {
            initializePermissions();
            initializeRoles();
            initializeAdminUser();
        }
    }
    
    private void initializePermissions() {
        List<Permission> permissions = Arrays.asList(
            // Admin permissions
            createPermission("admin.manage", "Full admin access", "Admin", "admin", "manage"),
            
            // User permissions
            createPermission("users.read", "View users", "Users", "users", "read"),
            createPermission("users.write", "Create/Edit users", "Users", "users", "write"),
            createPermission("users.delete", "Delete users", "Users", "users", "delete"),
            createPermission("users.ban", "Ban users", "Users", "users", "ban"),
            createPermission("users.invite", "Invite users", "Users", "users", "invite"),
            
            // Role permissions
            createPermission("roles.read", "View roles", "Roles", "roles", "read"),
            createPermission("roles.write", "Create/Edit roles", "Roles", "roles", "write"),
            createPermission("roles.assign", "Assign roles", "Roles", "roles", "assign"),
            createPermission("roles.manage", "Full role management", "Roles", "roles", "manage"),
            
            // Audit permissions
            createPermission("audit.read", "View audit logs", "Audit", "audit", "read"),
            createPermission("audit.export", "Export audit logs", "Audit", "audit", "export"),
            
            // Session permissions
            createPermission("sessions.read", "View sessions", "Sessions", "sessions", "read"),
            createPermission("sessions.revoke", "Revoke sessions", "Sessions", "sessions", "revoke"),
            
            // Group permissions
            createPermission("groups.read", "View groups", "Groups", "groups", "read"),
            createPermission("groups.write", "Create/Edit groups", "Groups", "groups", "write")
        );
        
        permissionRepository.saveAll(permissions);
    }
    
    private Permission createPermission(String key, String description, 
                                       String category, String resource, String action) {
        return Permission.builder()
                .key(key)
                .description(description)
                .category(category)
                .resource(resource)
                .action(action)
                .build();
    }
    
    private void initializeRoles() {
        // Super Admin role
        Role superAdmin = Role.builder()
                .name("Super Admin")
                .description("Full system access")
                .isSystem(true)
                .permissions(new HashSet<>(permissionRepository.findAll()))
                .build();
        roleRepository.save(superAdmin);
        
        // User Manager role
        List<Permission> userManagerPerms = permissionRepository.findAll().stream()
                .filter(p -> p.getResource().equals("users") || p.getResource().equals("sessions"))
                .toList();
        
        Role userManager = Role.builder()
                .name("User Manager")
                .description("Manage users and sessions")
                .isSystem(true)
                .permissions(new HashSet<>(userManagerPerms))
                .build();
        roleRepository.save(userManager);
        
        // Auditor role
        List<Permission> auditorPerms = permissionRepository.findAll().stream()
                .filter(p -> p.getAction().equals("read"))
                .toList();
        
        Role auditor = Role.builder()
                .name("Auditor")
                .description("Read-only access to all resources")
                .isSystem(true)
                .permissions(new HashSet<>(auditorPerms))
                .build();
        roleRepository.save(auditor);
    }
    
    private void initializeAdminUser() {
        if (userRepository.count() == 0) {
            User admin = User.builder()
                    .email("admin@urp.com")
                    .username("admin")
                    .passwordHash(passwordEncoder.encode("Admin@123"))
                    .displayName("System Administrator")
                    .status(UserStatus.ACTIVE)
                    .emailVerified(true)
                    .mfaEnabled(false)
                    .build();
            
            userRepository.save(admin);

            // Assign Super Admin role to the admin user
            Role superAdminRole = roleRepository.findByName("Super Admin")
                    .orElseThrow(() -> new RuntimeException("Super Admin role not found"));

            UserRole userRole = UserRole.builder()
                    .user(admin)
                    .role(superAdminRole)
                    .scopeType(ScopeType.GLOBAL)
                    .grantedBy(admin) // self-granted for initial admin
                    .build();

            userRoleRepository.save(userRole);
        }
    }
}
