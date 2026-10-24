package com.planner.controller;

import com.planner.dto.AuthRequest;
import com.planner.dto.AuthResponse;
import com.planner.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        try {
            AuthResponse response = authService.authenticate(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/update-pin")
    public ResponseEntity<?> updatePin(@RequestBody Map<String, String> body) {
        try {
            String oldPin = body.get("currentPin");
            String newPin = body.get("newPin");
            authService.updatePin(oldPin, newPin);
            return ResponseEntity.ok(Map.of("message", "PIN успешно обновлен"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/verify")
    public ResponseEntity<?> verify() {
        return ResponseEntity.ok(Map.of("valid", true));
    }
}
