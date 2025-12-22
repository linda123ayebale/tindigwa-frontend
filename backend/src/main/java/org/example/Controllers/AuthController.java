package org.example.Controllers;

import org.example.Entities.User;
import org.example.Repositories.UserRepository;
import org.example.Services.CustomUserDetailsService;
import org.example.Services.UserSetupService;
import org.example.Services.OtpService;
import org.example.auth.AuthRequest;
import org.example.auth.AuthResponse;
import org.example.auth.SetupRequest;
import org.example.auth.SetupResponse;
import org.example.auth.OtpVerifyRequest;
import org.example.auth.OtpResponse;
import org.example.auth.ForgotPasswordRequest;
import org.example.auth.ResetPasswordRequest;
import org.example.config.JwtTokenService;
import jakarta.mail.MessagingException;
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
import java.security.Principal;
import org.example.Entities.Person;

@RestController
@RequestMapping("api/auth")
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final JwtTokenService jwtTokenService;
    private final CustomUserDetailsService userDetailsService;
    private final UserRepository userRepository;
    private final UserSetupService userSetupService;
    private final OtpService otpService;
    private final PasswordEncoder passwordEncoder;

    public AuthController(
            AuthenticationManager authenticationManager,
            JwtTokenService jwtTokenService,
            CustomUserDetailsService userDetailsService,
            UserRepository userRepository,
            UserSetupService userSetupService,
            OtpService otpService,
            PasswordEncoder passwordEncoder
    ) {
        this.authenticationManager = authenticationManager;
        this.jwtTokenService = jwtTokenService;
        this.userDetailsService = userDetailsService;
        this.userRepository = userRepository;
        this.userSetupService = userSetupService;
        this.otpService = otpService;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateAndGetToken(@RequestBody AuthRequest authRequest) {
        try {
            System.out.println("🔐 Login attempt for: " + authRequest.getUsername());
            
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(authRequest.getUsername(), authRequest.getPassword())
            );

            if (authentication.isAuthenticated()) {
                System.out.println("✅ Authentication successful for: " + authRequest.getUsername());
                
                // Find the user entity to get complete user information
                User user = userRepository.findByEmail(authRequest.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

                // Check if 2FA is enabled for this user
                if (user.isTwoFactorEnabled()) {
                    System.out.println("🔐 2FA enabled for user. Sending OTP email...");
                    
                    // Generate and send OTP
                    try {
                        otpService.generateAndSendLoginOtp(user);
                        
                        System.out.println("✅ OTP email sent successfully to: " + user.getEmail());
                        
                        OtpResponse otpResponse = new OtpResponse();
                        otpResponse.setRequiresOtp(true);
                        otpResponse.setUserId(user.getId());
                        otpResponse.setMessage("Verification code sent to your email. Please check your inbox.");
                        otpResponse.setExpiresIn(300L); // 5 minutes
                        
                        return ResponseEntity.ok(otpResponse);
                    } catch (MessagingException e) {
                        System.err.println("❌ Failed to send OTP email: " + e.getMessage());
                        e.printStackTrace();
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .body(Map.of("error", "Failed to send verification code: " + e.getMessage()));
                    }
                }

                System.out.println("ℹ️ 2FA not enabled. Returning JWT token.");
                
                // No 2FA required - return JWT token directly
                final String token = jwtTokenService.generateTokenWithUserInfo(user);

                AuthResponse authResponse = new AuthResponse();
                authResponse.setToken(token);
                authResponse.setMessage("Login successful!");

                return ResponseEntity.ok(authResponse);
            } else {
                System.err.println("❌ Authentication failed for: " + authRequest.getUsername());
                AuthResponse authResponse = new AuthResponse();
                authResponse.setMessage("Authentication failed. Please check your credentials.");
                return new ResponseEntity<>(authResponse, HttpStatus.UNAUTHORIZED);
            }
        } catch (BadCredentialsException e) {
            System.err.println("❌ Bad credentials for: " + authRequest.getUsername());
            AuthResponse authResponse = new AuthResponse();
            authResponse.setMessage("Invalid username or password.");
            return new ResponseEntity<>(authResponse, HttpStatus.UNAUTHORIZED);
        } catch (Exception e) {
            System.err.println("❌ Unexpected error during authentication: " + e.getMessage());
            e.printStackTrace();
            AuthResponse authResponse = new AuthResponse();
            authResponse.setMessage("An error occurred during authentication: " + e.getMessage());
            return new ResponseEntity<>(authResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/setup")
    public ResponseEntity<?> setupUser(@RequestBody SetupRequest setupRequest) {
        try {
            // Create user using UserSetupService (handles first-user-as-admin logic)
            User createdUser = userSetupService.createUser(setupRequest);
            
            // Generate JWT token with user information embedded
            String token = jwtTokenService.generateTokenWithUserInfo(createdUser);
            
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
    
    /**
     * Verify OTP and complete login
     */
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody OtpVerifyRequest request) {
        try {
            // Validate request
            if (request.getUserId() == null || request.getOtpCode() == null || request.getOtpCode().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "User ID and OTP code are required"));
            }
            
            // Find user
            User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Validate OTP
            boolean isValid = otpService.validateLoginOtp(request.getUserId(), request.getOtpCode().trim());
            
            if (!isValid) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid or expired verification code"));
            }
            
            // OTP is valid - generate JWT token
            final String token = jwtTokenService.generateTokenWithUserInfo(user);
            
            AuthResponse authResponse = new AuthResponse();
            authResponse.setToken(token);
            authResponse.setMessage("Login successful!");
            
            return ResponseEntity.ok(authResponse);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "An error occurred during verification: " + e.getMessage()));
        }
    }
    
    /**
     * Resend OTP code
     */
    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOtp(@RequestBody Map<String, Long> request) {
        try {
            Long userId = request.get("userId");
            if (userId == null) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "User ID is required"));
            }
            
            // Find user
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Check if 2FA is enabled
            if (!user.isTwoFactorEnabled()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Two-factor authentication is not enabled for this user"));
            }
            
            // Resend OTP (includes cooldown check)
            try {
                otpService.resendLoginOtp(user);
                
                OtpResponse response = new OtpResponse();
                response.setRequiresOtp(true);
                response.setUserId(user.getId());
                response.setMessage("New verification code sent to your email");
                response.setExpiresIn(300L);
                
                return ResponseEntity.ok(response);
            } catch (IllegalStateException e) {
                // Cooldown period not elapsed
                return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of("error", e.getMessage()));
            } catch (MessagingException e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to send verification code. Please try again."));
            }
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "An error occurred: " + e.getMessage()));
        }
    }

    /**
     * Forgot Password - Request password reset OTP
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        try {
            System.out.println("🔑 Password reset requested for: " + request.getEmail());
            
            // Validate email
            if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Email is required"));
            }
            
            // Find user by email
            User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Generate and send password reset OTP
            try {
                otpService.generateAndSendPasswordResetOtp(user);
                
                System.out.println("✅ Password reset OTP sent to: " + user.getEmail());
                
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Password reset code has been sent to your email",
                    "email", request.getEmail()
                ));
            } catch (MessagingException e) {
                System.err.println("❌ Failed to send password reset email: " + e.getMessage());
                e.printStackTrace();
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to send password reset email: " + e.getMessage()));
            }
            
        } catch (RuntimeException e) {
            // User not found - don't reveal this for security
            System.out.println("⚠️ Password reset attempted for non-existent email: " + request.getEmail());
            // Return success to avoid email enumeration
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "If an account exists with this email, a password reset code will be sent"
            ));
        } catch (Exception e) {
            System.err.println("❌ Unexpected error during forgot password: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "An error occurred. Please try again later."));
        }
    }
    
    /**
     * Reset Password - Verify OTP and set new password
     */
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        try {
            System.out.println("🔑 Password reset attempt for: " + request.getEmail());
            
            // Validate request
            if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Email is required"));
            }
            if (request.getOtpCode() == null || request.getOtpCode().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Verification code is required"));
            }
            if (request.getNewPassword() == null || request.getNewPassword().length() < 6) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Password must be at least 6 characters"));
            }
            
            // Find user
            User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Validate OTP
            boolean isValid = otpService.validatePasswordResetOtp(user.getId(), request.getOtpCode().trim());
            
            if (!isValid) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid or expired verification code"));
            }
            
            // Update password
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
            userRepository.save(user);
            
            System.out.println("✅ Password reset successful for: " + user.getEmail());
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Password has been reset successfully. You can now login with your new password."
            ));
            
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "User not found"));
        } catch (Exception e) {
            System.err.println("❌ Unexpected error during password reset: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "An error occurred during password reset: " + e.getMessage()));
        }
    }

}
