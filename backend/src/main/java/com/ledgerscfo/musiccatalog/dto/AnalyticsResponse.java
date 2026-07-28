package com.ledgerscfo.musiccatalog.dto;

import java.util.List;
import java.util.Map;

public record AnalyticsResponse(
        int totalItems,
        double averageRating,
        Map<String, Long> genreDistribution,      // for Bar / Pie chart
        Map<String, Long> topArtists,             // for Horizontal Bar chart
        Map<Integer, Long> releasesByYear,         // for Line chart
        List<Integer> trackCountHistogramBuckets,  // histogram bucket edges
        List<Long> trackCountHistogramCounts       // histogram bucket counts
) {}
