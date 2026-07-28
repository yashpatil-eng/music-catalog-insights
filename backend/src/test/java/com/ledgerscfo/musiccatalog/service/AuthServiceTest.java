package com.ledgerscfo.musiccatalog.service;

import com.ledgerscfo.musiccatalog.dto.LoginRequest;
import com.ledgerscfo.musiccatalog.dto.RegisterRequest;
import com.ledgerscfo.musiccatalog.entity.User;
import com.ledgerscfo.musiccatalog.exception.BadCredentialsCustomException;
import com.ledgerscfo.musiccatalog.exception.DuplicateResourceException;
import com.ledgerscfo.musiccatalog.repository.UserRepository;
import com.ledgerscfo.musiccatalog.security.JwtService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtService jwtService;

    @InjectMocks
    private AuthService authService;

    @Test
    void register_throwsWhenEmailAlreadyExists() {
        when(userRepository.existsByEmail("taken@example.com")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () ->
                authService.register(new RegisterRequest("taken@example.com", "password123"))
        );
    }

    @Test
    void register_createsUserAndReturnsToken() {
        when(userRepository.existsByEmail("new@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("hashed");
        when(jwtService.generateToken("new@example.com")).thenReturn("fake-jwt");

        var response = authService.register(new RegisterRequest("new@example.com", "password123"));

        assertEquals("fake-jwt", response.token());
        assertEquals("new@example.com", response.email());
    }

    @Test
    void login_throwsWhenUserNotFound() {
        when(userRepository.findByEmail("ghost@example.com")).thenReturn(Optional.empty());

        assertThrows(BadCredentialsCustomException.class, () ->
                authService.login(new LoginRequest("ghost@example.com", "password123"))
        );
    }

    @Test
    void login_throwsWhenPasswordDoesNotMatch() {
        User user = new User("test@example.com", "hashed");
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongpass", "hashed")).thenReturn(false);

        assertThrows(BadCredentialsCustomException.class, () ->
                authService.login(new LoginRequest("test@example.com", "wrongpass"))
        );
    }

    @Test
    void login_returnsTokenOnValidCredentials() {
        User user = new User("test@example.com", "hashed");
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("correctpass", "hashed")).thenReturn(true);
        when(jwtService.generateToken("test@example.com")).thenReturn("fake-jwt");

        var response = authService.login(new LoginRequest("test@example.com", "correctpass"));

        assertEquals("fake-jwt", response.token());
    }
}
