package com.urp.management.controller;

import com.urp.management.dto.response.DashboardStatsResponse;
import com.urp.management.dto.response.RecentActivityResponse;
import com.urp.management.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
public class DashboardController {
    
    private final DashboardService dashboardService;
    
    @GetMapping("/stats")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats() {
        DashboardStatsResponse stats = dashboardService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }
    
    @GetMapping("/recent-activity")
    @PreAuthorize("hasAuthority('audit.read')")
    public ResponseEntity<List<RecentActivityResponse>> getRecentActivity(
            @RequestParam(defaultValue = "10") int limit) {
        List<RecentActivityResponse> activities = dashboardService.getRecentActivity(limit);
        return ResponseEntity.ok(activities);
    }
}
