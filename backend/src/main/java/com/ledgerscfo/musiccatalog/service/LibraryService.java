package com.ledgerscfo.musiccatalog.service;

import com.ledgerscfo.musiccatalog.dto.LibraryItemRequest;
import com.ledgerscfo.musiccatalog.entity.LibraryItem;
import com.ledgerscfo.musiccatalog.entity.User;
import com.ledgerscfo.musiccatalog.exception.DuplicateResourceException;
import com.ledgerscfo.musiccatalog.exception.ResourceNotFoundException;
import com.ledgerscfo.musiccatalog.repository.LibraryItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class LibraryService {

    private final LibraryItemRepository libraryItemRepository;

    public LibraryService(LibraryItemRepository libraryItemRepository) {
        this.libraryItemRepository = libraryItemRepository;
    }

    public List<LibraryItem> getLibrary(User user) {
        return libraryItemRepository.findByUserOrderByCreatedAtDesc(user);
    }

    @Transactional
    public LibraryItem addItem(User user, LibraryItemRequest req) {
        if (libraryItemRepository.existsByUserAndAppleCatalogId(user, req.appleCatalogId())) {
            throw new DuplicateResourceException("This item is already in your library");
        }
        LibraryItem item = new LibraryItem();
        item.setUser(user);
        applyRequest(item, req);
        return libraryItemRepository.save(item);
    }

    @Transactional
    public LibraryItem updateItem(User user, Long id, LibraryItemRequest req) {
        LibraryItem item = libraryItemRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Library item not found"));
        applyRequest(item, req);
        return libraryItemRepository.save(item);
    }

    @Transactional
    public void deleteItem(User user, Long id) {
        LibraryItem item = libraryItemRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Library item not found"));
        libraryItemRepository.delete(item);
    }

    private void applyRequest(LibraryItem item, LibraryItemRequest req) {
        item.setAppleCatalogId(req.appleCatalogId());
        item.setTitle(req.title());
        item.setArtistName(req.artistName());
        item.setGenre(req.genre());
        item.setReleaseDate(req.releaseDate());
        item.setTrackCount(req.trackCount());
        item.setArtworkUrl(req.artworkUrl());
        item.setUserRating(req.userRating());
        item.setUserNotes(req.userNotes());
    }
}
