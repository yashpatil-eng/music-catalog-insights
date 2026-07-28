package com.ledgerscfo.musiccatalog.controller;

import com.ledgerscfo.musiccatalog.dto.AiInsightResponse;
import com.ledgerscfo.musiccatalog.entity.User;
import com.ledgerscfo.musiccatalog.service.AiInsightService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
public class AiInsightController {

    private final AiInsightService aiInsightService;

    public AiInsightController(AiInsightService aiInsightService) {
        this.aiInsightService = aiInsightService;
    }

    @GetMapping("/insights")
    public AiInsightResponse getInsights(@AuthenticationPrincipal User user) {
        return aiInsightService.generateInsights(user);
    }
}
