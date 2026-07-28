package com.ledgerscfo.musiccatalog.service;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
public class ItunesSearchService {

    private final WebClient itunesWebClient;

    public ItunesSearchService(WebClient itunesWebClient) {
        this.itunesWebClient = itunesWebClient;
    }

    /**
     * Proxies a search request to the iTunes Search API.
     * type maps to iTunes' `entity` param: album -> entity=album, song -> entity=song, artist -> entity=musicArtist
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
                .bodyToMono(JsonNode.class);
    }

    /** Looks up a single catalog entity by its Apple ID, e.g. to refresh metadata for recommendations. */
    public Mono<JsonNode> lookup(long appleCatalogId) {
        return itunesWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/lookup")
                        .queryParam("id", appleCatalogId)
                        .build())
                .retrieve()
                .bodyToMono(JsonNode.class);
    }
}
