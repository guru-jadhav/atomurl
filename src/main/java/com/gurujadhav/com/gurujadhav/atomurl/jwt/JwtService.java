package com.gurujadhav.com.gurujadhav.atomurl.jwt;

import com.gurujadhav.com.gurujadhav.atomurl.user.User;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.nio.charset.StandardCharsets;
import javax.crypto.SecretKey;
import java.util.Date;
import java.util.concurrent.TimeUnit;
import io.jsonwebtoken.Jwts;


@Service
public class JwtService {

    @Value("${jwt.secret:404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970}")
    private String secretKeyString;

    private SecretKey getSigningKey() {
        byte[] keyBytes = secretKeyString.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    private long expirationMS() {
        return TimeUnit.DAYS.toMillis(7);
    }

    public String getJWTToken(User user){

        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationMS());

        return Jwts.builder()
                .subject(user.getId().toString())
                .claim("email", user.getEmail())
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }
}
