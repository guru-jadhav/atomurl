package com.gurujadhav.com.gurujadhav.atomurl.jwt;

import com.gurujadhav.com.gurujadhav.atomurl.user.User;
import com.gurujadhav.com.gurujadhav.atomurl.admin.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.nio.charset.StandardCharsets;
import javax.crypto.SecretKey;
import java.util.Date;
import java.util.concurrent.TimeUnit;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;

@Service
public class JwtService {

    @Value("${jwt.secret:dev-jwt-secret-key-must-be-at-least-32-bytes-long}")
    private String secretKeyString;

    @Autowired
    private AdminService adminService;

    private SecretKey getSigningKey() {
        byte[] keyBytes = secretKeyString.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    private long expirationMS() {
        return TimeUnit.DAYS.toMillis(7);
    }

    public String getJWTToken(User user) {

        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationMS());

        boolean isAdmin = adminService.isAdmin(user.getEmail());
        return Jwts.builder()
                .subject(user.getId().toString())
                .claim("email", user.getEmail())
                .claim("isAdmin", isAdmin)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }

    public Claims extractAllClaims(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (JwtException | IllegalArgumentException e) {
            throw new InvalidTokenException("Invalid or expired JWT token");
        }
    }

    public Long extractUserId(String token) {
        Claims claims = extractAllClaims(token);
        String subject = claims.getSubject();

        if (subject == null || subject.isBlank()) {
            throw new InvalidTokenException("Invalid or expired JWT token");
        }

        try {
            return Long.parseLong(subject);
        } catch (NumberFormatException e) {
            throw new InvalidTokenException("Invalid or expired JWT token");
        }
    }

    public Boolean isTokenValid(String token) {
        try {
            extractAllClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
