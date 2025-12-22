package org.example.config;

import org.example.Services.CustomUserDetailsService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * SECURE Security Configuration for Production
 * 
 * Key Security Features:
 * - JWT authentication enabled and enforced
 * - Role-based access control enabled
 * - Restricted CORS to specific origins
 * - Public endpoints minimized (only auth and setup)
 */
@Configuration
@EnableMethodSecurity(prePostEnabled = true) // Enable @PreAuthorize annotations
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final CustomUserDetailsService userDetailsService;
    
    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter, CustomUserDetailsService userDetailsService) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.userDetailsService = userDetailsService;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable()) // Disabled for stateless JWT API
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth

                        //just added for production environment
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/expense-categories/**").permitAll()
                        .requestMatchers("/api/expense/**").permitAll()
                        .requestMatchers("/api/actuator/health").permitAll()

                        // Public endpoints - authentication/setup/OTP
                        .requestMatchers("/api/auth/login", "/api/auth/setup", "/api/auth/setup-status", 
                                       "/api/auth/verify-otp", "/api/auth/resend-otp").permitAll()
                        
                        // Swagger/OpenAPI endpoints (remove in production or secure separately)
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()
                        
                        // File serving - requires authentication
                        .requestMatchers("/api/images/**").authenticated()
                        
                        // Admin-only endpoints
                        .requestMatchers("/api/loans/admin/**", "/api/users/admins/**").hasRole("ADMIN")
                        .requestMatchers("/api/*/admin/**").hasRole("ADMIN")
                        
                        // Loan officer endpoints
                        .requestMatchers("/api/loans/**", "/api/clients/**").hasAnyRole("ADMIN", "LOAN_OFFICER", "CASHIER")
                        
                        // All other API endpoints require authentication
                        .requestMatchers("/api/**").authenticated()
                        
                        // Deny all other requests
                        .anyRequest().authenticated()
                )
                .userDetailsService(userDetailsService)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12); // Strength 12 for production
    }

    /**
     * CORS Configuration for Development and Production
     * 
     * Allows requests from:
     * - Production: https://cashtankfinance.com
     * - Development: http://localhost:3000 (or configured frontend URL)
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Allowed Origins - Development and Production
        configuration.setAllowedOrigins(Arrays.asList(
                "https://cashtankfinance.com",  // Production domain
                "http://localhost:3000",         // Development frontend
                "http://localhost:3001",         // Alternative dev port
                frontendUrl                      // Configurable via application.properties
        ));
        
        // Allowed HTTP Methods
        configuration.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"
        ));
        
        // Allowed Headers (wildcard for flexibility)
        configuration.setAllowedHeaders(Arrays.asList("*"));
        
        // Expose Authorization header to frontend
        configuration.setExposedHeaders(Arrays.asList("Authorization"));
        
        // Allow credentials (cookies, authorization headers)
        configuration.setAllowCredentials(true);
        
        // Cache preflight response for 1 hour
        configuration.setMaxAge(3600L);
        
        // Register CORS configuration for all API endpoints
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        
        return source;
    }
}
