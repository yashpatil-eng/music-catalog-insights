package com.ledgerscfo.musiccatalog.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ledgerscfo.musiccatalog.dto.AiInsightResponse;
import com.ledgerscfo.musiccatalog.entity.LibraryItem;
import com.ledgerscfo.musiccatalog.entity.User;
import com.ledgerscfo.musiccatalog.repository.LibraryItemRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

/**
 * AI feature: "Trend summary + recommendations".
 *
 * Two layers:
 *  1. Rule-based analysis (always runs, deterministic, free): genre affinity,
 *     era clustering, and "you might also like" suggestions based on the user's
 *     most-saved genre/artist combined with a fresh iTunes lookup.
 *  2. Optional LLM layer: if ANTHROPIC_API_KEY is configured, the rule-based
 *     stats are handed to Claude to produce a natural-language summary.
 *     If no key is set, a template-based summary is generated instead so the
 *     feature still works end-to-end without any paid dependency.
 */
@Service
public class AiInsightService {

    private final LibraryItemRepository libraryItemRepository;
    private final ItunesSearchService itunesSearchService;
    private final WebClient anthropicWebClient;
    private final ObjectMapper objectMapper;

    @Value("${app.ai.anthropic-api-key}")
    private String anthropicApiKey;

    @Value("${app.ai.anthropic-model}")
    private String anthropicModel;

    public AiInsightService(
            LibraryItemRepository libraryItemRepository,
            ItunesSearchService itunesSearchService,
            WebClient anthropicWebClient,
            ObjectMapper objectMapper
    ) {
        this.libraryItemRepository = libraryItemRepository;
        this.itunesSearchService = itunesSearchService;
        this.anthropicWebClient = anthropicWebClient;
        this.objectMapper = objectMapper;
    }

    public AiInsightResponse generateInsights(User user) {
        List<LibraryItem> items = libraryItemRepository.findByUserOrderByCreatedAtDesc(user);

        if (items.isEmpty()) {
            return new AiInsightResponse(
                    "Your library is empty. Save a few albums first and I'll surface patterns in your taste.",
                    List.of(),
                    "rule-based"
            );
        }

        // --- Rule-based stats ---
        Map<String, Long> genreCounts = items.stream()
                .map(i -> i.getGenre() == null || i.getGenre().isBlank() ? "Unknown" : i.getGenre())
                .collect(Collectors.groupingBy(g -> g, Collectors.counting()));

        String topGenre = genreCounts.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("Unknown");

        double avgYear = items.stream()
                .map(LibraryItem::getReleaseDate)
                .filter(Objects::nonNull)
                .mapToInt(LocalDate::getYear)
                .average()
                .orElse(LocalDate.now().getYear());

        String topArtist = items.stream()
                .collect(Collectors.groupingBy(LibraryItem::getArtistName, Collectors.counting()))
                .entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(items.get(0).getArtistName());

        // --- Recommendations: search iTunes for more from the user's top genre/artist ---
        List<String> recommendations = buildRecommendations(items, topGenre, topArtist);

        // --- Summary: LLM if configured, else deterministic template ---
        if (anthropicApiKey != null && !anthropicApiKey.isBlank()) {
            try {
                String llmSummary = callAnthropic(items.size(), topGenre, topArtist, (int) avgYear);
                return new AiInsightResponse(llmSummary, recommendations, "llm");
            } catch (Exception e) {
                // Fall through to rule-based summary on any LLM/network failure
            }
        }

        String templateSummary = String.format(
                "Your library leans heavily on %s, with %s as your most-saved artist. " +
                "On average, your saved albums were released around %d, and you've saved %d albums so far.",
                topGenre, topArtist, (int) avgYear, items.size()
        );

        return new AiInsightResponse(templateSummary, recommendations, "rule-based");
    }

    private List<String> buildRecommendations(List<LibraryItem> items, String topGenre, String topArtist) {
        Set<Long> alreadySaved = items.stream()
                .map(LibraryItem::getAppleCatalogId)
                .collect(Collectors.toSet());

        try {
            JsonNode result = itunesSearchService.search(topArtist, "album", 15).block();
            if (result == null || !result.has("results")) return List.of();

            List<String> recs = new ArrayList<>();
            for (JsonNode r : result.get("results")) {
                long id = r.path("collectionId").asLong();
                if (alreadySaved.contains(id)) continue;
                String name = r.path("collectionName").asText(null);
                String artist = r.path("artistName").asText(null);
                if (name != null && artist != null) {
                    recs.add(name + " — " + artist);
                }
                if (recs.size() >= 5) break;
            }
            return recs;
        } catch (Exception e) {
            return List.of();
        }
    }

    private String callAnthropic(int totalItems, String topGenre, String topArtist, int avgYear) {
        String prompt = String.format(
                "Write a warm, 2-3 sentence natural-language summary of a music listener's saved library. " +
                "Facts: %d albums saved, most common genre is %s, most-saved artist is %s, " +
                "average release year is %d. Do not invent additional facts.",
                totalItems, topGenre, topArtist, avgYear
        );

        Map<String, Object> body = Map.of(
                "model", anthropicModel,
                "max_tokens", 300,
                "messages", List.of(Map.of("role", "user", "content", prompt))
        );

        JsonNode response = anthropicWebClient.post()
                .uri("/messages")
                .header("x-api-key", anthropicApiKey)
                .header("content-type", "application/json")
                .bodyValue(body)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .block();

        if (response == null || !response.has("content")) {
            throw new IllegalStateException("Empty response from Anthropic API");
        }

        StringBuilder text = new StringBuilder();
        for (JsonNode block : response.get("content")) {
            if ("text".equals(block.path("type").asText())) {
                text.append(block.path("text").asText());
            }
        }
        return text.toString();
    }
}
