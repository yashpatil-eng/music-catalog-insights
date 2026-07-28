package com.ledgerscfo.musiccatalog.dto;

import java.util.List;

public record AiInsightResponse(
        String summary,
        List<String> recommendations,
        String source // "llm" or "rule-based" - transparency about how the insight was generated
) {}
