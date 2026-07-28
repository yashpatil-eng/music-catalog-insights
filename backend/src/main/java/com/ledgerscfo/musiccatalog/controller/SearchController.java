package com.ledgerscfo.musiccatalog.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.ledgerscfo.musiccatalog.service.ItunesSearchService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api")
public class SearchController {

    private final ItunesSearchService itunesSearchService;

    public SearchController(ItunesSearchService itunesSearchService) {
        this.itunesSearchService = itunesSearchService;
    }

    // GET /api/search?query=coldplay&type=album&limit=20
    @GetMapping("/search")
    public Mono<JsonNode> search(
            @RequestParam String query,
            @RequestParam(defaultValue = "album") String type,
            @RequestParam(defaultValue = "20") int limit
    ) {
        return itunesSearchService.search(query, type, Math.min(limit, 50));
    }
}
