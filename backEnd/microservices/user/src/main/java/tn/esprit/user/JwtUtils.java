package tn.esprit.user;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtils {

    // 1. Create a secure key for signing the token
    private static final Key key = Keys.secretKeyFor(SignatureAlgorithm.HS256);

    // 2. Generate a token for a specific username

    // Updated to accept Role
    public String generateToken(String username, Role role, Long userId) {
        return Jwts.builder()
                .setSubject(username)
                .claim("role", role.name())
                .claim("id", userId) // <--- Add this line!
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 86400000))
                .signWith(key)
                .compact();
    }
}