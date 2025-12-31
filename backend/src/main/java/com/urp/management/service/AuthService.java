package com.urp.management.service;

import com.urp.management.domain.entity.Session;
import com.urp.management.domain.entity.User;
import com.urp.management.dto.request.LoginRequest;
import com.urp.management.dto.response.AuthResponse;
import com.urp.management.dto.response.UserResponse;
import com.urp.management.repository.SessionRepository;
import com.urp.management.repository.UserRepository;
import com.urp.management.security.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {
    
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final SessionRepository sessionRepository;
    private final JwtTokenProvider tokenProvider;
    private final AuditService auditService;
    
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // TODO: Check MFA if enabled
        if (user.getMfaEnabled() && request.getMfaCode() == null) {
            throw new RuntimeException("MFA code required");
        }
        
        String accessToken = tokenProvider.generateToken(userDetails);
        String refreshToken = tokenProvider.generateRefreshToken(userDetails);
        
        // Create session
        HttpServletRequest httpRequest = getCurrentRequest();
        Session session = Session.builder()
                .sessionId(UUID.randomUUID().toString())
                .user(user)
                .lastSeenAt(LocalDateTime.now())
                .ipAddress(httpRequest != null ? getClientIp(httpRequest) : null)
                .userAgent(httpRequest != null ? httpRequest.getHeader("User-Agent") : null)
                .refreshToken(refreshToken)
                .refreshTokenExpiresAt(LocalDateTime.now().plusDays(7))
                .build();
        
        sessionRepository.save(session);
        
        // Update last login
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);
        
        auditService.log("USER_LOGIN", "User", user.getId().toString(), null, user.getId());
        
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .expiresIn(86400L)
                .user(mapToUserResponse(user))
                .build();
    }
    
    public void logout(String sessionId) {
        sessionRepository.findBySessionId(sessionId)
                .ifPresent(session -> {
                    session.setRevokedAt(LocalDateTime.now());
                    sessionRepository.save(session);
                    auditService.log("USER_LOGOUT", "Session", sessionId, 
                            null, session.getUser().getId());
                });
    }
    
    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .username(user.getUsername())
                .displayName(user.getDisplayName())
                .avatar(user.getAvatar())
                .status(user.getStatus())
                .emailVerified(user.getEmailVerified())
                .mfaEnabled(user.getMfaEnabled())
                .createdAt(user.getCreatedAt())
                .lastLoginAt(user.getLastLoginAt())
                .tenantId(user.getTenant() != null ? user.getTenant().getId() : null)
                .tenantName(user.getTenant() != null ? user.getTenant().getName() : null)
                .build();
    }
    
    private HttpServletRequest getCurrentRequest() {
        ServletRequestAttributes attributes = 
                (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        return attributes != null ? attributes.getRequest() : null;
    }
    
    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty()) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isEmpty()) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }
}
