package com.urp.management.service;

import com.urp.management.domain.entity.Tenant;
import com.urp.management.domain.entity.User;
import com.urp.management.domain.enums.TenantStatus;
import com.urp.management.dto.request.CreateTenantRequest;
import com.urp.management.dto.request.UpdateTenantRequest;
import com.urp.management.dto.response.TenantResponse;
import com.urp.management.repository.TenantRepository;
import com.urp.management.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class TenantService {
    
    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;
    
    public Page<TenantResponse> getAllTenants(Pageable pageable) {
        return tenantRepository.findAll(pageable)
                .map(this::mapToTenantResponse);
    }
    
    public Page<TenantResponse> searchTenants(String query, TenantStatus status, Pageable pageable) {
        if (query != null && !query.isBlank()) {
            if (status != null) {
                return tenantRepository.findByNameContainingIgnoreCaseAndStatus(query, status, pageable)
                        .map(this::mapToTenantResponse);
            } else {
                return tenantRepository.findByNameContainingIgnoreCase(query, pageable)
                        .map(this::mapToTenantResponse);
            }
        } else if (status != null) {
            return tenantRepository.findByStatus(status, pageable)
                    .map(this::mapToTenantResponse);
        } else {
            return getAllTenants(pageable);
        }
    }
    
    public TenantResponse getTenantById(Long id) {
        Tenant tenant = tenantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tenant not found"));
        return mapToTenantResponse(tenant);
    }
    
    public TenantResponse getTenantBySlug(String slug) {
        Tenant tenant = tenantRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Tenant not found"));
        return mapToTenantResponse(tenant);
    }
    
    public TenantResponse createTenant(CreateTenantRequest request) {
        if (tenantRepository.existsBySlug(request.getSlug())) {
            throw new RuntimeException("Tenant slug already exists");
        }
        
        if (request.getDomain() != null && tenantRepository.findByDomain(request.getDomain()).isPresent()) {
            throw new RuntimeException("Tenant domain already exists");
        }
        
        Tenant tenant = Tenant.builder()
                .name(request.getName())
                .slug(request.getSlug())
                .domain(request.getDomain())
                .status(request.getStatus() != null ? request.getStatus() : TenantStatus.ACTIVE)
                .settings(request.getSettings())
                .trialEndsAt(request.getTrialEndsAt())
                .build();
        
        tenant = tenantRepository.save(tenant);
        
        auditService.log("TENANT_CREATED", "Tenant", tenant.getId().toString(), 
                null, getCurrentUserId());
        
        return mapToTenantResponse(tenant);
    }
    
    public TenantResponse updateTenant(Long id, UpdateTenantRequest request) {
        Tenant tenant = tenantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tenant not found"));
        
        StringBuilder changes = new StringBuilder("{");
        
        if (request.getName() != null) {
            changes.append("\"name\":\"").append(tenant.getName()).append("->").append(request.getName()).append("\",");
            tenant.setName(request.getName());
        }
        
        if (request.getDomain() != null) {
            if (tenantRepository.findByDomain(request.getDomain())
                    .filter(t -> !t.getId().equals(id))
                    .isPresent()) {
                throw new RuntimeException("Tenant domain already exists");
            }
            changes.append("\"domain\":\"").append(tenant.getDomain()).append("->").append(request.getDomain()).append("\",");
            tenant.setDomain(request.getDomain());
        }
        
        if (request.getStatus() != null) {
            TenantStatus oldStatus = tenant.getStatus();
            tenant.setStatus(request.getStatus());
            
            if (request.getStatus() == TenantStatus.SUSPENDED && tenant.getSuspendedAt() == null) {
                tenant.setSuspendedAt(LocalDateTime.now());
            } else if (request.getStatus() != TenantStatus.SUSPENDED) {
                tenant.setSuspendedAt(null);
            }
            
            changes.append("\"status\":\"").append(oldStatus).append("->").append(request.getStatus()).append("\",");
        }
        
        if (request.getSettings() != null) {
            tenant.setSettings(request.getSettings());
            changes.append("\"settings\":\"updated\",");
        }
        
        if (request.getTrialEndsAt() != null) {
            changes.append("\"trialEndsAt\":\"").append(tenant.getTrialEndsAt()).append("->").append(request.getTrialEndsAt()).append("\",");
            tenant.setTrialEndsAt(request.getTrialEndsAt());
        }
        
        tenant = tenantRepository.save(tenant);
        
        String diffJson = changes.length() > 1 ? changes.substring(0, changes.length() - 1) + "}" : null;
        auditService.log("TENANT_UPDATED", "Tenant", id.toString(), diffJson, getCurrentUserId());
        
        return mapToTenantResponse(tenant);
    }
    
    public void deleteTenant(Long id) {
        Tenant tenant = tenantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tenant not found"));
        
        long userCount = userRepository.countByTenantId(id);
        if (userCount > 0) {
            throw new RuntimeException("Cannot delete tenant with existing users. Please reassign or delete users first.");
        }
        
        tenantRepository.delete(tenant);
        
        auditService.log("TENANT_DELETED", "Tenant", id.toString(), 
                String.format("{\"name\":\"%s\",\"slug\":\"%s\"}", tenant.getName(), tenant.getSlug()),
                getCurrentUserId());
    }
    
    public TenantResponse suspendTenant(Long id, String reason) {
        Tenant tenant = tenantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tenant not found"));
        
        tenant.setStatus(TenantStatus.SUSPENDED);
        tenant.setSuspendedAt(LocalDateTime.now());
        
        tenant = tenantRepository.save(tenant);
        
        auditService.log("TENANT_SUSPENDED", "Tenant", id.toString(),
                String.format("{\"reason\":\"%s\"}", reason != null ? reason : "No reason provided"),
                getCurrentUserId());
        
        return mapToTenantResponse(tenant);
    }
    
    public TenantResponse activateTenant(Long id) {
        Tenant tenant = tenantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tenant not found"));
        
        tenant.setStatus(TenantStatus.ACTIVE);
        tenant.setSuspendedAt(null);
        
        tenant = tenantRepository.save(tenant);
        
        auditService.log("TENANT_ACTIVATED", "Tenant", id.toString(), null, getCurrentUserId());
        
        return mapToTenantResponse(tenant);
    }
    
    private TenantResponse mapToTenantResponse(Tenant tenant) {
        long userCount = userRepository.countByTenantId(tenant.getId());
        
        return TenantResponse.builder()
                .id(tenant.getId())
                .name(tenant.getName())
                .slug(tenant.getSlug())
                .domain(tenant.getDomain())
                .status(tenant.getStatus())
                .createdAt(tenant.getCreatedAt())
                .suspendedAt(tenant.getSuspendedAt())
                .trialEndsAt(tenant.getTrialEndsAt())
                .userCount(userCount)
                .build();
    }
    
    private Long getCurrentUserId() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .map(User::getId)
                .orElse(null);
    }
}
