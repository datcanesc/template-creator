package com.backend.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class KeycloakService {

    @Value("${BASE_URL}:${FRONTEND_HOST}/home")
    private String frontendHomeURL;

    @Value("http://keycloak:${KEYCLOAK_PORT}/realms/template/protocol/openid-connect/token")
    private String keycloakPort;

    @Value("${KEYCLOAK_CLIENT}")
    private String keycloakClient;

    @Value("${KEYCLOAK_CREDENTIALS_SECRET}")
    private String keycloakCredentialsSecret;

    private static final Logger logger = LoggerFactory.getLogger(KeycloakService.class);
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    private Map<String, Object> decodeJwt(String token) {
        try {
            String[] parts = token.split("\\."); // Split JWT into parts
            String payload = new String(java.util.Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
            return objectMapper.readValue(payload, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            logger.error("Failed to decode JWT token: {}", e.getMessage());
            throw new RuntimeException("Failed to decode JWT token: " + e.getMessage(), e);
        }
    }

    private String[] extractRoles(Map<String, Object> tokenClaims) {
        List<String> roles = new ArrayList<>();
        try {
            if (tokenClaims.containsKey("realm_access")) {
                Map<String, Object> realmAccess = (Map<String, Object>) tokenClaims.get("realm_access");
                if (realmAccess.containsKey("roles")) {
                    roles.addAll((List<String>) realmAccess.get("roles"));
                }
            }
        } catch (ClassCastException e) {
            logger.warn("Unexpected structure in token claims: {}", e.getMessage());
        }
        return roles.toArray(new String[0]);
    }

    private Map<String, Object> sendTokenRequest(String form) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(keycloakPort))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(form))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() == 200) {
            return objectMapper.readValue(response.body(), new TypeReference<Map<String, Object>>() {});
        } else {
            logger.error("Failed to communicate with Keycloak: {}", response.body());
            throw new RuntimeException("Failed to communicate with Keycloak: " + response.body());
        }
    }

    public Map<String, Object> getToken(String code) throws Exception {
        String form = "client_id=" + URLEncoder.encode(keycloakClient, StandardCharsets.UTF_8) +
                "&client_secret=" + URLEncoder.encode(keycloakCredentialsSecret, StandardCharsets.UTF_8) +
                "&grant_type=" + URLEncoder.encode("authorization_code", StandardCharsets.UTF_8) +
                "&code=" + URLEncoder.encode(code, StandardCharsets.UTF_8) +
                "&redirect_uri=" + URLEncoder.encode(frontendHomeURL, StandardCharsets.UTF_8);

        Map<String, Object> responseBody = sendTokenRequest(form);
        String token = (String) responseBody.get("access_token");

        if (token != null) {
            Map<String, Object> tokenClaims = decodeJwt(token);
            responseBody.put("roles", extractRoles(tokenClaims));
        }
        return responseBody;
    }

    public Map<String, Object> refreshToken(String refreshToken) throws Exception {
        String form = "client_id=" + URLEncoder.encode(keycloakClient, StandardCharsets.UTF_8) +
                "&client_secret=" + URLEncoder.encode(keycloakCredentialsSecret, StandardCharsets.UTF_8) +
                "&grant_type=" + URLEncoder.encode("refresh_token", StandardCharsets.UTF_8) +
                "&refresh_token=" + URLEncoder.encode(refreshToken, StandardCharsets.UTF_8);

        return sendTokenRequest(form);
    }
}
