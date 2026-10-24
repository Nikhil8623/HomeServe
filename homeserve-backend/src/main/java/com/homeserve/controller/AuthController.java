package com.homeserve.controller;

import com.homeserve.dto.AuthResponse;
import com.homeserve.dto.LoginRequest;
import com.homeserve.dto.RegisterRequest;
import com.homeserve.dto.UserResponse;
import com.homeserve.model.AppUser;
import com.homeserve.repository.UserRepository;
import com.homeserve.service.SessionTokenService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final SessionTokenService tokens;

    public AuthController(UserRepository users, PasswordEncoder encoder, SessionTokenService tokens) {
        this.users = users;
        this.encoder = encoder;
        this.tokens = tokens;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
        String email = req.email().trim().toLowerCase();
        if (users.existsByEmail(email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Email is already registered"));
        }

        AppUser user = new AppUser();
        user.setFullName(req.fullName().trim());
        user.setEmail(email);
        user.setPasswordHash(encoder.encode(req.password()));
        user.setPhone(req.phone() == null || req.phone().isBlank() ? null : req.phone().trim());
        // Public registration must never allow clients to choose admin/worker roles.
        user.setRole("CUSTOMER");

        AppUser saved = users.save(user);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new AuthResponse(tokens.createToken(saved.getId()), UserResponse.from(saved)));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        String email = req.email().trim().toLowerCase();
        AppUser user = users.findByEmail(email).orElse(null);
        if (user == null || !encoder.matches(req.password(), user.getPasswordHash())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid email or password"));
        }
        if (!"CUSTOMER".equalsIgnoreCase(user.getRole()) && !"USER".equalsIgnoreCase(user.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "This login is for user accounts only"));
        }
        return ResponseEntity.ok(new AuthResponse(tokens.createToken(user.getId()), UserResponse.from(user)));
    }
}
