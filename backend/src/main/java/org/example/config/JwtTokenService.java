package org.example.config;


import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.example.Entities.User;
import org.example.Entities.Person;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtTokenService {
    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long jwtExpirationInMs;


    public Boolean validateToken(String token, UserDetails userDetails) {
        final String username = getUsernameFromToken(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

    public String getUsernameFromToken(String token) {
        return getClaimFromToken(token, Claims::getSubject);
    }

    public Date getExpirationDateFromToken(String token) {
        return getClaimFromToken(token, Claims::getExpiration);
    }

    public <T> T getClaimFromToken(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = getAllClaimsFromToken(token);
        return claimsResolver.apply(claims);
    }

    private Claims getAllClaimsFromToken(String token) {
        return Jwts.parser()
                .setSigningKey(getSignKey())
                .parseClaimsJws(token)
                .getBody();
    }

    private Boolean isTokenExpired(String token) {
        final Date expiration = getExpirationDateFromToken(token);
        return expiration.before(new Date());
    }

    private Key getSignKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String createToken(Map<String,Object> claims, String subject) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationInMs))
                .signWith(SignatureAlgorithm.HS512, secret)
                .compact();
    }

    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        return createToken(claims, userDetails.getUsername());
    }
    
    /**
     * Generate JWT token with additional user information
     */
    public String generateTokenWithUserInfo(User user) {
        Map<String, Object> claims = new HashMap<>();
        
        // Add user information to claims
        Person person = user.getPerson();
        if (person != null) {
            claims.put("firstName", person.getFirstName());
            claims.put("lastName", person.getLastName());
            claims.put("fullName", person.getFirstName() + " " + person.getLastName());
        }
        claims.put("role", user.getRole().name());
        claims.put("userId", user.getId());
        
        return createToken(claims, user.getEmail());
    }
    
    /**
     * Extract firstName from JWT token
     */
    public String getFirstNameFromToken(String token) {
        return getClaimFromToken(token, claims -> (String) claims.get("firstName"));
    }
    
    /**
     * Extract lastName from JWT token
     */
    public String getLastNameFromToken(String token) {
        return getClaimFromToken(token, claims -> (String) claims.get("lastName"));
    }
    
    /**
     * Extract full name from JWT token
     */
    public String getFullNameFromToken(String token) {
        return getClaimFromToken(token, claims -> (String) claims.get("fullName"));
    }
    
    /**
     * Extract role from JWT token
     */
    public String getRoleFromToken(String token) {
        return getClaimFromToken(token, claims -> (String) claims.get("role"));
    }
    
    /**
     * Extract userId from JWT token
     */
    public Long getUserIdFromToken(String token) {
        return getClaimFromToken(token, claims -> {
            Object userId = claims.get("userId");
            return userId != null ? Long.valueOf(userId.toString()) : null;
        });
    }
}
