package com.ledgerscfo.musiccatalog.controller;

import com.ledgerscfo.musiccatalog.dto.AuthResponse;
import com.ledgerscfo.musiccatalog.dto.LoginRequest;
import com.ledgerscfo.musiccatalog.dto.RegisterRequest;
import com.ledgerscfo.musiccatalog.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}
