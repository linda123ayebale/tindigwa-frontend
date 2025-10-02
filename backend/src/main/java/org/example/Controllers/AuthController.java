package org.example.Controllers;

import org.example.Entities.User;
import org.example.Repositories.UserRepository;
import org.example.Services.CustomUserDetailsService;
import org.example.Services.UserSetupService;
import org.example.auth.AuthRequest;
import org.example.auth.AuthResponse;
import org.example.auth.SetupRequest;
import org.example.auth.SetupResponse;
import org.example.config.JwtTokenService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("api/auth")
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final JwtTokenService jwtTokenService;
    private final CustomUserDetailsService userDetailsService;
    private final UserRepository userRepository;
    private final UserSetupService userSetupService;

    public AuthController(
            AuthenticationManager authenticationManager,
            JwtTokenService jwtTokenService,
            CustomUserDetailsService userDetailsService,
            UserRepository userRepository,
            UserSetupService userSetupService
    ) {
        this.authenticationManager = authenticationManager;
        this.jwtTokenService = jwtTokenService;
        this.userDetailsService = userDetailsService;
        this.userRepository = userRepository;
        this.userSetupService = userSetupService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateAndGetToken(@RequestBody AuthRequest authRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(authRequest.getUsername(), authRequest.getPassword())
            );

            if (authentication.isAuthenticated()) {
                // CORRECTED: loadUserByUsername returns a UserDetails object.
                // We use that object directly, without casting it to the service.
                final UserDetails userDetails = userDetailsService.loadUserByUsername(authRequest.getUsername());

                // CORRECTED: Pass the UserDetails object to generateToken.
                final String token = jwtTokenService.generateToken(userDetails);

                AuthResponse authResponse = new AuthResponse();
                authResponse.setToken(token);
                authResponse.setMessage("Login successful!");

                return ResponseEntity.ok(authResponse);
            } else {
                AuthResponse authResponse = new AuthResponse();
                authResponse.setMessage("Authentication failed. Please check your credentials.");
                return new ResponseEntity<>(authResponse, HttpStatus.UNAUTHORIZED);
            }
        } catch (BadCredentialsException e) {
            AuthResponse authResponse = new AuthResponse();
            authResponse.setMessage("Invalid username or password.");
            return new ResponseEntity<>(authResponse, HttpStatus.UNAUTHORIZED);
        } catch (Exception e) {
            AuthResponse authResponse = new AuthResponse();
            authResponse.setMessage("An error occurred during authentication.");
            return new ResponseEntity<>(authResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/setup")
    public ResponseEntity<?> setupUser(@RequestBody SetupRequest setupRequest) {
        try {
            // Create user using UserSetupService (handles first-user-as-admin logic)
            User createdUser = userSetupService.createUser(setupRequest);
            
            // Generate JWT token for the new user
            UserDetails userDetails = org.springframework.security.core.userdetails.User.withUsername(createdUser.getEmail())
                    .password(createdUser.getPassword())
                    .authorities("ROLE_" + createdUser.getRole().name())
                    .build();
            
            String token = jwtTokenService.generateToken(userDetails);
            
            // Prepare response
            SetupResponse response = new SetupResponse();
            response.setToken(token);
            
            // Customize message based on role
            if (createdUser.isAdmin()) {
                response.setMessage("Admin account created successfully! You are the first user in the system.");
            } else {
                response.setMessage("User account created successfully!");
            }
            
            // Create user info for response
            SetupResponse.UserInfo userInfo = new SetupResponse.UserInfo();
            userInfo.setId(createdUser.getId());
            userInfo.setName(createdUser.getName());
            userInfo.setEmail(createdUser.getEmail());
            userInfo.setRole(createdUser.getRole().name());
            userInfo.setBranch(createdUser.getBranch());
            
            response.setUser(userInfo);
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalStateException e) {
            // Handle validation errors from UserSetupService
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            // Handle unexpected errors
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "An error occurred during setup: " + e.getMessage()));
        }
    }
    
    /**
     * Get system setup status - useful for frontend to know if setup is required
     */
    @GetMapping("/setup-status")
    public ResponseEntity<?> getSetupStatus() {
        try {
            boolean isSetupCompleted = userSetupService.isSetupCompleted();
            boolean hasAdminUsers = userSetupService.hasAdminUsers();
            long totalUsers = userSetupService.getTotalUserCount();
            
            Map<String, Object> status = Map.of(
                "setupCompleted", isSetupCompleted,
                "hasAdminUsers", hasAdminUsers,
                "totalUsers", totalUsers,
                "nextUserWillBe", totalUsers == 0 ? "ADMIN" : "CLIENT"
            );
            
            return ResponseEntity.ok(status);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Unable to get setup status: " + e.getMessage()));
        }
    }

}
