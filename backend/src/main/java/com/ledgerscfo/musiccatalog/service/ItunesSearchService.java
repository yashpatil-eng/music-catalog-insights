package com.ledgerscfo.musiccatalog.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
public class ItunesSearchService {

    private final WebClient itunesWebClient;
    private final ObjectMapper objectMapper;

    public ItunesSearchService(WebClient itunesWebClient, ObjectMapper objectMapper) {
        this.itunesWebClient = itunesWebClient;
        this.objectMapper = objectMapper;
    }

    /**
     * Proxies a search request to the iTunes Search API.
     * type maps to iTunes' `entity` param: album -> entity=album, song -> entity=song, artist -> entity=musicArtist
     *
     * Note: the iTunes API responds with Content-Type "text/javascript" (a legacy JSONP-era
     * default) rather than "application/json", which Spring's WebClient won't auto-decode as
     * JSON. We read the body as a raw String and parse it manually to sidestep that.
     */
    public Mono<JsonNode> search(String query, String type, int limit) {
        String entity = switch (type == null ? "album" : type.toLowerCase()) {
            case "song", "track" -> "song";
            case "artist" -> "musicArtist";
            default -> "album";
        };

        return itunesWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/search")
                        .queryParam("term", query)
                        .queryParam("entity", entity)
                        .queryParam("limit", limit)
                        .build())
                .retrieve()
                .bodyToMono(String.class)
                .map(this::parseJson);
    }

    /** Looks up a single catalog entity by its Apple ID, e.g. to refresh metadata for recommendations. */
    public Mono<JsonNode> lookup(long appleCatalogId) {
        return itunesWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/lookup")
                        .queryParam("id", appleCatalogId)
                        .build())
                .retrieve()
                .bodyToMono(String.class)
                .map(this::parseJson);
    }

    private JsonNode parseJson(String rawBody) {
        try {
            return objectMapper.readTree(rawBody);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to parse iTunes API response as JSON", e);
        }
    }
}