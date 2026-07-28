package com.ledgerscfo.musiccatalog.service;

import com.ledgerscfo.musiccatalog.dto.AnalyticsResponse;
import com.ledgerscfo.musiccatalog.entity.LibraryItem;
import com.ledgerscfo.musiccatalog.entity.User;
import com.ledgerscfo.musiccatalog.repository.LibraryItemRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AnalyticsServiceTest {

    @Mock
    private LibraryItemRepository libraryItemRepository;

    @InjectMocks
    private AnalyticsService analyticsService;

    private LibraryItem item(String artist, String genre, int year, int trackCount, Integer rating) {
        LibraryItem i = new LibraryItem();
        i.setArtistName(artist);
        i.setGenre(genre);
        i.setReleaseDate(LocalDate.of(year, 1, 1));
        i.setTrackCount(trackCount);
        i.setUserRating(rating);
        return i;
    }

    @Test
    void buildAnalytics_computesGenreDistributionAndAverages() {
        User user = new User("test@example.com", "hash");
        List<LibraryItem> items = List.of(
                item("Coldplay", "Alternative", 2000, 10, 5),
                item("Coldplay", "Alternative", 2002, 12, 4),
                item("Taylor Swift", "Pop", 2019, 18, 3)
        );
        when(libraryItemRepository.findByUserOrderByCreatedAtDesc(user)).thenReturn(items);

        AnalyticsResponse result = analyticsService.buildAnalytics(user);

        assertEquals(3, result.totalItems());
        assertEquals(2L, result.genreDistribution().get("Alternative"));
        assertEquals(1L, result.genreDistribution().get("Pop"));
        assertEquals(2L, result.topArtists().get("Coldplay"));
        assertEquals(4.0, result.averageRating(), 0.001);
        assertEquals(1L, result.releasesByYear().get(2019));
    }

    @Test
    void buildAnalytics_handlesEmptyLibrary() {
        User user = new User("empty@example.com", "hash");
        when(libraryItemRepository.findByUserOrderByCreatedAtDesc(user)).thenReturn(List.of());

        AnalyticsResponse result = analyticsService.buildAnalytics(user);

        assertEquals(0, result.totalItems());
        assertEquals(0.0, result.averageRating());
        assertTrue(result.genreDistribution().isEmpty());
    }

    @Test
    void buildAnalytics_handlesNullGenreAsUnknown() {
        User user = new User("test2@example.com", "hash");
        List<LibraryItem> items = List.of(item("Some Artist", null, 2010, 8, null));
        when(libraryItemRepository.findByUserOrderByCreatedAtDesc(user)).thenReturn(items);

        AnalyticsResponse result = analyticsService.buildAnalytics(user);

        assertEquals(1L, result.genreDistribution().get("Unknown"));
    }
}
