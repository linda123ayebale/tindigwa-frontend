package org.example.config;


import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.example.Services.CustomUserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
@Component
public class  JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private final JwtTokenService jwtService;
    private final CustomUserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtTokenService jwtService, CustomUserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }


//    CODE TO ADD FOR PRODUCTION
@Override
protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
    String path = request.getRequestURI();

    // Add logging to debug
    System.out.println("🔍 JWT Filter - Checking path: " + path);

    boolean skip = path.startsWith("/auth/") ||
            path.startsWith("/api/auth/") ||
            path.startsWith("/expense-categories") ||
            path.equals("/actuator/health") ||
            path.startsWith("/swagger-ui/") ||
            path.startsWith("/v3/api-docs/");

    System.out.println("   Should skip JWT filter: " + skip);

    return skip;
}

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException, IOException {

        String authHeader = request.getHeader("Authorization");
        String token = null;
        String username = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
            try {
                username = jwtService.getUsernameFromToken(token);
            } catch (Exception e) {
                // Invalid token format or expired - continue without authentication
                // This allows permitted endpoints to work even with bad tokens
                System.out.println("Invalid token provided, continuing without authentication: " + e.getMessage());
            }
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                if (jwtService.validateToken(token, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            } catch (Exception e) {
                // User not found or token validation failed - continue without authentication
                System.out.println("Token validation failed, continuing without authentication: " + e.getMessage());
            }
        }

        filterChain.doFilter(request, response);
    }

}
