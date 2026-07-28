package com.ledgerscfo.musiccatalog.controller;

import com.ledgerscfo.musiccatalog.dto.LibraryItemRequest;
import com.ledgerscfo.musiccatalog.dto.LibraryItemResponse;
import com.ledgerscfo.musiccatalog.entity.User;
import com.ledgerscfo.musiccatalog.service.LibraryService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/library")
public class LibraryController {

    private final LibraryService libraryService;

    public LibraryController(LibraryService libraryService) {
        this.libraryService = libraryService;
    }

    @GetMapping
    public List<LibraryItemResponse> getLibrary(@AuthenticationPrincipal User user) {
        return libraryService.getLibrary(user).stream()
                .map(LibraryItemResponse::from)
                .toList();
    }

    @PostMapping
    public ResponseEntity<LibraryItemResponse> addItem(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody LibraryItemRequest request
    ) {
        var saved = libraryService.addItem(user, request);
        return ResponseEntity.ok(LibraryItemResponse.from(saved));
    }

    @PutMapping("/{id}")
    public LibraryItemResponse updateItem(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @Valid @RequestBody LibraryItemRequest request
    ) {
        return LibraryItemResponse.from(libraryService.updateItem(user, id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(@AuthenticationPrincipal User user, @PathVariable Long id) {
        libraryService.deleteItem(user, id);
        return ResponseEntity.noContent().build();
    }
}
