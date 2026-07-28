package com.ledgerscfo.musiccatalog.service;

import com.ledgerscfo.musiccatalog.dto.AnalyticsResponse;
import com.ledgerscfo.musiccatalog.entity.LibraryItem;
import com.ledgerscfo.musiccatalog.entity.User;
import com.ledgerscfo.musiccatalog.repository.LibraryItemRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final LibraryItemRepository libraryItemRepository;

    // Fixed bucket edges (in track count) for the histogram chart
    private static final int[] HISTOGRAM_EDGES = {0, 5, 10, 15, 20, 25, 30};

    public AnalyticsService(LibraryItemRepository libraryItemRepository) {
        this.libraryItemRepository = libraryItemRepository;
    }

    public AnalyticsResponse buildAnalytics(User user) {
        List<LibraryItem> items = libraryItemRepository.findByUserOrderByCreatedAtDesc(user);

        int total = items.size();

        double avgRating = items.stream()
                .map(LibraryItem::getUserRating)
                .filter(Objects::nonNull)
                .mapToInt(Integer::intValue)
                .average()
                .orElse(0.0);

        Map<String, Long> genreDistribution = items.stream()
                .map(i -> i.getGenre() == null || i.getGenre().isBlank() ? "Unknown" : i.getGenre())
                .collect(Collectors.groupingBy(g -> g, LinkedHashMap::new, Collectors.counting()));

        Map<String, Long> topArtists = items.stream()
                .collect(Collectors.groupingBy(LibraryItem::getArtistName, Collectors.counting()))
                .entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(10)
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue,
                        (a, b) -> a, LinkedHashMap::new));

        Map<Integer, Long> releasesByYear = items.stream()
                .map(LibraryItem::getReleaseDate)
                .filter(Objects::nonNull)
                .map(LocalDate::getYear)
                .collect(Collectors.groupingBy(y -> y, TreeMap::new, Collectors.counting()));

        long[] histogramCounts = new long[HISTOGRAM_EDGES.length - 1];
        for (LibraryItem item : items) {
            Integer tc = item.getTrackCount();
            if (tc == null) continue;
            for (int b = 0; b < HISTOGRAM_EDGES.length - 1; b++) {
                if (tc >= HISTOGRAM_EDGES[b] && tc < HISTOGRAM_EDGES[b + 1]) {
                    histogramCounts[b]++;
                    break;
                }
                if (b == HISTOGRAM_EDGES.length - 2 && tc >= HISTOGRAM_EDGES[b + 1]) {
                    histogramCounts[b]++; // overflow bucket
                }
            }
        }

        List<Integer> edges = Arrays.stream(HISTOGRAM_EDGES).boxed().collect(Collectors.toList());
        List<Long> counts = Arrays.stream(histogramCounts).boxed().collect(Collectors.toList());

        return new AnalyticsResponse(total, avgRating, genreDistribution, topArtists, releasesByYear, edges, counts);
    }
}
