package com.ledgerscfo.musiccatalog.repository;

import com.ledgerscfo.musiccatalog.entity.LibraryItem;
import com.ledgerscfo.musiccatalog.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LibraryItemRepository extends JpaRepository<LibraryItem, Long> {
    List<LibraryItem> findByUserOrderByCreatedAtDesc(User user);
    Optional<LibraryItem> findByIdAndUser(Long id, User user);
    boolean existsByUserAndAppleCatalogId(User user, Long appleCatalogId);
}
