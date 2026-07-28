package com.ledgerscfo.musiccatalog.controller;

import com.ledgerscfo.musiccatalog.dto.AnalyticsResponse;
import com.ledgerscfo.musiccatalog.entity.User;
import com.ledgerscfo.musiccatalog.service.AnalyticsService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping
    public AnalyticsResponse getAnalytics(@AuthenticationPrincipal User user) {
        return analyticsService.buildAnalytics(user);
    }
}
