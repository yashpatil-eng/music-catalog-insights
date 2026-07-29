package com.ledgerscfo.musiccatalog.service;

import com.ledgerscfo.musiccatalog.dto.AuthResponse;
import com.ledgerscfo.musiccatalog.dto.LoginRequest;
import com.ledgerscfo.musiccatalog.dto.RegisterRequest;
import com.ledgerscfo.musiccatalog.entity.User;
import com.ledgerscfo.musiccatalog.exception.BadCredentialsCustomException;
import com.ledgerscfo.musiccatalog.exception.DuplicateResourceException;
import com.ledgerscfo.musiccatalog.repository.UserRepository;
import com.ledgerscfo.musiccatalog.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new DuplicateResourceException("An account with this email already exists");
        }
        User user = new User(request.email(), request.name(), passwordEncoder.encode(request.password()));
        userRepository.save(user);
        String token = jwtService.generateToken(user.getEmail());
        return new AuthResponse(token, user.getEmail(), user.getName());
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BadCredentialsCustomException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadCredentialsCustomException("Invalid email or password");
        }

        String token = jwtService.generateToken(user.getEmail());
        return new AuthResponse(token, user.getEmail(), user.getName());
    }
}
