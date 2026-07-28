package com.ledgerscfo.musiccatalog.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record LibraryItemRequest(
        @NotNull Long appleCatalogId,
        @NotBlank String title,
        @NotBlank String artistName,
        String genre,
        LocalDate releaseDate,
        Integer trackCount,
        String artworkUrl,
        @Min(1) @Max(5) Integer userRating,
        String userNotes
) {}
