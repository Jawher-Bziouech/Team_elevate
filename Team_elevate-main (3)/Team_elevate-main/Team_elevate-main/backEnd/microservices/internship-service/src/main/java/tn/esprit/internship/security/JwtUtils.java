package tn.esprit.internship.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class JwtUtils {

    @Value("${jwt.secret}")
    private String jwtSecret;

    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException ex) {
            return false;
        }
    }

    public Long extractUserId(String token) {
        Object userIdClaim = parseClaims(token).get("id");
        if (userIdClaim == null) {
            return null;
        }
        if (userIdClaim instanceof Integer userId) {
            return userId.longValue();
        }
        if (userIdClaim instanceof Long userId) {
            return userId;
        }
        if (userIdClaim instanceof String userIdText) {
            try {
                return Long.parseLong(userIdText);
            } catch (NumberFormatException ex) {
                return null;
            }
        }
        return null;
    }

    public List<String> extractRoles(String token) {
        Claims claims = parseClaims(token);

        Object rolesClaim = claims.get("roles");
        if (rolesClaim instanceof Collection<?> rolesCollection) {
            List<String> roles = new ArrayList<>();
            for (Object role : rolesCollection) {
                if (role != null) {
                    roles.add(role.toString());
                }
            }
            return roles;
        }

        if (rolesClaim instanceof String rolesText && !rolesText.isBlank()) {
            return List.of(rolesText.split(","));
        }

        Object roleClaim = claims.get("role");
        if (roleClaim != null && !roleClaim.toString().isBlank()) {
            return Collections.singletonList(roleClaim.toString());
        }

        return Collections.emptyList();
    }

    private Claims parseClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private Key getSigningKey() {
        // Keep signing-key derivation identical to user-service token generation.
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }
}
