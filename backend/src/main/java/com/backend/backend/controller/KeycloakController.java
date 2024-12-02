package com.backend.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.backend.backend.service.KeycloakService;

import java.util.Map;

@RestController
@RequestMapping("/token")
public class KeycloakController {
    private final KeycloakService keycloakService;

    @Autowired
    public KeycloakController(KeycloakService keycloakService) {
        this.keycloakService = keycloakService;
    }

    @PostMapping
    public Map<String, Object> getToken(@RequestParam String code) {
        try {
            return keycloakService.getToken(code);
        } catch (Exception e) {
            e.printStackTrace();
            return Map.of("error", "Failed to get token: " + e.getMessage());
        }
    }

    @PostMapping("/refresh")
    public Map<String, Object> refreshToken(@RequestParam String refreshToken) {
        try {
            return keycloakService.refreshToken(refreshToken);
        } catch (Exception e) {
            e.printStackTrace();
            return Map.of("error", "Failed to refresh token: " + e.getMessage());
        }
    }
}
