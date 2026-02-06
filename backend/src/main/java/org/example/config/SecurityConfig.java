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

/**
 * Security Configuration for Tindigwa Loan Management System
 * 
 * Current State:
 * - JWT authentication enabled and enforced
 * - All authenticated endpoints accessible to any logged-in user
 * - Role-based access control NOT YET IMPLEMENTED (TODO)
 * 
 * TODO: Add role-based restrictions when role management module is built
 */
@Configuration
@EnableMethodSecurity(prePostEnabled = true)
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
                .csrf(csrf -> csrf.disable())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth

                        // ================================================================
                        //                    PUBLIC ENDPOINTS
                        //            (No authentication required)
                        // ================================================================
                        
                        // --- Authentication Module ---
                        .requestMatchers("/api/auth/**").permitAll()
                        
                        // --- Health Check ---
                        .requestMatchers("/api/actuator/health").permitAll()
                        
                        // --- Swagger/OpenAPI Documentation ---
                        .requestMatchers("/swagger-ui/**").permitAll()
                        .requestMatchers("/v3/api-docs/**").permitAll()
                        .requestMatchers("/swagger-ui.html").permitAll()

                        // ================================================================
                        //                 AUTHENTICATED ENDPOINTS
                        //     (Login required - Any authenticated user can access)
                        //     TODO: Add role restrictions when role management is built
                        // ================================================================
                        
                        // --- Loans Module ---
                        .requestMatchers("/api/loans/**").authenticated()
                        
                        // --- Clients Module ---
                        .requestMatchers("/api/clients/**").authenticated()
                        
                        // --- Payments Module ---
                        .requestMatchers("/api/payments/**").authenticated()
                        
                        // --- Loan Tracking Module ---
                        .requestMatchers("/api/loan-tracking/**").authenticated()
                        
                        // --- Loan Analytics Module ---
                        .requestMatchers("/api/loan-analytics/**").authenticated()
                        
                        // --- Loan Products Module ---
                        .requestMatchers("/api/loan-products/**").authenticated()
                        
                        // --- Loan Officers Module ---
                        .requestMatchers("/api/loan-officers/**").authenticated()
                        
                        // --- Installment Schedule Module ---
                        .requestMatchers("/api/installments/**").authenticated()
                        
                        // --- Branches Module ---
                        .requestMatchers("/api/branches/**").authenticated()
                        
                        // --- Dashboard Module ---
                        .requestMatchers("/api/dashboard/**").authenticated()
                        
                        // --- Financial Analytics Module ---
                        .requestMatchers("/api/financial-analytics/**").authenticated()
                        
                        // --- Operational Expenses Module ---
                        .requestMatchers("/api/expense/**").authenticated()
                        
                        // --- Expense Categories Module ---
                        .requestMatchers("/api/expense-categories/**").authenticated()
                        
                        // --- Staff Module ---
                        .requestMatchers("/api/staff/**").authenticated()
                        
                        // --- Users Module ---
                        .requestMatchers("/api/users/**").authenticated()
                        
                        // --- Roles Module ---
                        .requestMatchers("/api/roles/**").authenticated()
                        
                        // --- Migration Module ---
                        .requestMatchers("/api/migration/**").authenticated()
                        
                        // --- Admin Operations ---
                        .requestMatchers("/api/admin/**").authenticated()
                        
                        // --- File/Image Serving ---
                        .requestMatchers("/api/images/**").authenticated()

                        // ================================================================
                        //                      CATCH-ALL
                        // ================================================================
                        
                        // Any remaining /api/** endpoints require authentication
                        .requestMatchers("/api/**").authenticated()
                        
                        // All other requests require authentication
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
        return new BCryptPasswordEncoder(12);
    }

    /**
     * CORS Configuration for Development and Production
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        configuration.setAllowedOrigins(Arrays.asList(
                "https://cashtankfinance.com",
                "http://localhost:3000",
                "http://localhost:3001",
                frontendUrl
        ));
        
        configuration.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"
        ));
        
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setExposedHeaders(Arrays.asList("Authorization"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        
        return source;
    }
}


/*
 * ================================================================================
 *                    COMMENTED OUT - PREVIOUS CONFIGURATION
 *                         (Kept for reference only)
 * ================================================================================
 *
 * package org.example.config;
 *
 * import org.example.Services.CustomUserDetailsService;
 * import org.springframework.beans.factory.annotation.Value;
 * import org.springframework.context.annotation.Bean;
 * import org.springframework.context.annotation.Configuration;
 * import org.springframework.security.authentication.AuthenticationManager;
 * import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
 * import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
 * import org.springframework.security.config.annotation.web.builders.HttpSecurity;
 * import org.springframework.security.config.http.SessionCreationPolicy;
 * import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
 * import org.springframework.security.crypto.password.PasswordEncoder;
 * import org.springframework.security.web.SecurityFilterChain;
 * import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
 * import org.springframework.web.cors.CorsConfiguration;
 * import org.springframework.web.cors.CorsConfigurationSource;
 * import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
 *
 * import java.util.Arrays;
 * import java.util.List;
 *
 * @Configuration
 * @EnableMethodSecurity(prePostEnabled = true)
 * public class SecurityConfig {
 *
 *     private final JwtAuthenticationFilter jwtAuthFilter;
 *     private final CustomUserDetailsService userDetailsService;
 *     
 *     @Value("${app.frontend.url:http://localhost:3000}")
 *     private String frontendUrl;
 *
 *     public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter, CustomUserDetailsService userDetailsService) {
 *         this.jwtAuthFilter = jwtAuthFilter;
 *         this.userDetailsService = userDetailsService;
 *     }
 *
 *     @Bean
 *     public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
 *         return http
 *                 .cors(cors -> cors.configurationSource(corsConfigurationSource()))
 *                 .csrf(csrf -> csrf.disable())
 *                 .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
 *                 .authorizeHttpRequests(auth -> auth
 *
 *                         //just added for production environment
 *                         .requestMatchers("/api/auth/**").permitAll()
 *                         .requestMatchers("/api/auth/forgot-password").permitAll()
 *                         .requestMatchers("/api/auth/reset-password").permitAll()
 *                         .requestMatchers("/api/expense-categories/**").permitAll()
 *                         .requestMatchers("/api/expense/**").permitAll()
 *                         .requestMatchers("/api/actuator/health").permitAll()
 *                         .requestMatchers("/api/loan-tracking/**").permitAll()
 *                         .requestMatchers("/api/payments/receipts/**").permitAll()
 *                         .requestMatchers("/api/staff/**").permitAll()
 *
 *                         // Public endpoints - authentication/setup/OTP
 *                         .requestMatchers("/api/auth/login", "/api/auth/setup", "/api/auth/setup-status", 
 *                                        "/api/auth/verify-otp", "/api/auth/resend-otp").permitAll()
 *                         
 *                         // Swagger/OpenAPI endpoints
 *                         .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()
 *                         
 *                         // File serving - requires authentication
 *                         .requestMatchers("/api/images/**").authenticated()
 *                         
 *                         // Admin-only endpoints
 *                         .requestMatchers("/api/loans/admin/**", "/api/users/admins/**").authenticated()
 *
 *                         // .hasRole("ADMIN")
 *                         
 *                         // Loan officer endpoints
 *                         .requestMatchers("/api/loans/**", "/api/clients/**").authenticated()
 *                         // .hasAnyRole("ADMIN", "LOAN_OFFICER", "CASHIER")
 *
 *                         //Branches endpoints
 *                         .requestMatchers("/api/branches/**").authenticated()
 *
 *                         //Dashboard endpoints
 *                         .requestMatchers("/api/dashboard/**").authenticated()
 *
 *                         //Financial analytics endpoints
 *                         .requestMatchers("/api/financial-analytics/**").authenticated()
 *
 *                         //ID migration endpoints
 *                         .requestMatchers("/api/migration/**").authenticated()
 *
 *                         //Installment schedule endpoints
 *                         .requestMatchers("/api/installments/**").authenticated()
 *
 *                         //Loan analytics endpoints
 *                         .requestMatchers("/api/loan-analytics/**").authenticated()
 *
 *                         //loan officers endpoints
 *                         .requestMatchers("/api/loan-officers/**").authenticated()
 *
 *                         //loan payments endpoints
 *                         .requestMatchers("/api/payments/**").authenticated()
 *
 *                         //loan products endpoints
 *                         .requestMatchers("/api/loan-products/**").authenticated()
 *
 *                         //loan tracking endpoints
 *                         .requestMatchers("/api/loan-tracking/**").authenticated()
 *
 *                         //operational expenses endpoints
 *                         .requestMatchers("/api/expense/**").authenticated()
 *
 *                         //expense categories endpoints
 *                         .requestMatchers("/api/expense-categories/**").authenticated()
 *
 *                         //payment receipts endpoints
 *                         .requestMatchers("/api/payments/receipts/**").authenticated()
 *
 *                         //payment validation endpoints
 *                         .requestMatchers("/api/payments/validate/**").authenticated()
 *
 *                         //payment analytics endpoints
 *                         .requestMatchers("/api/payments/analytics").authenticated()
 *
 *                         //roles management endpoints
 *                         .requestMatchers("/api/roles/**").authenticated()
 *
 *                         //staff management endpoints
 *                         .requestMatchers("/api/staff/**").authenticated()
 *
 *                         //user management endpoints
 *                         .requestMatchers("/api/users/**").authenticated()
 *
 *                         // All other API endpoints require authentication
 *                         .requestMatchers("/api/**").authenticated()
 *                         
 *                         // Deny all other requests
 *                         .anyRequest().authenticated()
 *                 )
 *                 .userDetailsService(userDetailsService)
 *                 .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
 *                 .build();
 *     }
 *
 *     @Bean
 *     public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
 *         return config.getAuthenticationManager();
 *     }
 *
 *     @Bean
 *     public PasswordEncoder passwordEncoder() {
 *         return new BCryptPasswordEncoder(12);
 *     }
 *
 *     @Bean
 *     public CorsConfigurationSource corsConfigurationSource() {
 *         CorsConfiguration configuration = new CorsConfiguration();
 *         
 *         configuration.setAllowedOrigins(Arrays.asList(
 *                 "https://cashtankfinance.com",
 *                 "http://localhost:3000",
 *                 "http://localhost:3001",
 *                 frontendUrl
 *         ));
 *         
 *         configuration.setAllowedMethods(Arrays.asList(
 *                 "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"
 *         ));
 *         
 *         configuration.setAllowedHeaders(Arrays.asList("*"));
 *         configuration.setExposedHeaders(Arrays.asList("Authorization"));
 *         configuration.setAllowCredentials(true);
 *         configuration.setMaxAge(3600L);
 *         
 *         UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
 *         source.registerCorsConfiguration("/**", configuration);
 *         
 *         return source;
 *     }
 * }
 *
 * ================================================================================
 */
