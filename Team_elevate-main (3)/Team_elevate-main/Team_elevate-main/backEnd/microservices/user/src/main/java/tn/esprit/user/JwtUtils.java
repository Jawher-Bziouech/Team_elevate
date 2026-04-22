package tn.esprit.user;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Base64;
import java.util.Date;

@Component
public class JwtUtils {

    // Fixed secret key — must be at least 256 bits for HS256
    private static final String SECRET = "ZXNwcml0LXNraWxsdXAtand0LXNlY3JldC1rZXktMjAyNA==";
    private static final Key key = Keys.hmacShaKeyFor(Base64.getDecoder().decode(SECRET));

    // 2. Generate a token for a specific username

    // Updated to accept Role
    public String generateToken(String username, Role role, Long userId, Plan plan) {
        return Jwts.builder()
                .setSubject(username)
                .claim("role", role.name())
                .claim("id", userId)
                .claim("plan", plan != null ? plan.name() : Plan.FREE.name())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 86400000))
                .signWith(key)
                .compact();
    }
}