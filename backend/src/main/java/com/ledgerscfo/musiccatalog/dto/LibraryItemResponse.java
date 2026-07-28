package com.ledgerscfo.musiccatalog.dto;

import com.ledgerscfo.musiccatalog.entity.LibraryItem;

import java.time.Instant;
import java.time.LocalDate;

public record LibraryItemResponse(
        Long id,
        Long appleCatalogId,
        String title,
        String artistName,
        String genre,
        LocalDate releaseDate,
        Integer trackCount,
        String artworkUrl,
        Integer userRating,
        String userNotes,
        Instant createdAt,
        Instant updatedAt
) {
    public static LibraryItemResponse from(LibraryItem item) {
        return new LibraryItemResponse(
                item.getId(),
                item.getAppleCatalogId(),
                item.getTitle(),
                item.getArtistName(),
                item.getGenre(),
                item.getReleaseDate(),
                item.getTrackCount(),
                item.getArtworkUrl(),
                item.getUserRating(),
                item.getUserNotes(),
                item.getCreatedAt(),
                item.getUpdatedAt()
        );
    }
}
