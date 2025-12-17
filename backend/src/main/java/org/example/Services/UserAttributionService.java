package org.example.Services;

import jakarta.servlet.http.HttpServletRequest;
import org.example.Entities.User;
import org.example.Repositories.UserRepository;
import org.example.config.JwtTokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Service
public class UserAttributionService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private JwtTokenService jwtTokenService;
    
    /**
     * Get the full name of the currently authenticated user from JWT token
     * @return Full name in format "FirstName LastName"
     */
    public String getCurrentUserFullName() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        System.out.println("DEBUG: Authentication object: " + auth);
        
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            String username = auth.getName();
            System.out.println("DEBUG: Authenticated username: " + username);
            String fullName = getUserFullName(username);
            System.out.println("DEBUG: Resolved full name: " + fullName);
            return fullName;
        }
        
        System.out.println("DEBUG: No authenticated user found, returning 'System'");
        return "System";
    }
    
    /**
     * Get full name for a specific username
     * @param username The username to look up
     * @return Full name in format "FirstName LastName"
     */
    public String getUserFullName(String username) {
        if (username == null || username.isEmpty()) {
            return "System";
        }
        
        try {
            User user = userRepository.findByUsername(username).orElse(null);
            
            if (user == null) {
                return username; // Fallback to username if user not found
            }
            
            // Use the User entity's built-in getFullName() method
            String fullName = user.getFullName();
            
            // If no name available, fallback to username
            return (fullName != null && !fullName.trim().isEmpty() && !"Unknown".equals(fullName)) 
                ? fullName.trim() 
                : username;
                
        } catch (Exception e) {
            System.err.println("Error getting user full name for username: " + username);
            e.printStackTrace();
            return username;
        }
    }
    
    /**
     * Get the ID of the currently authenticated user
     * Extracts userId directly from JWT token claims
     * @return User ID or null if not found
     */
    public Long getCurrentUserId() {
        try {
            // Get JWT token from request header
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                String authHeader = request.getHeader("Authorization");
                
                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                    String token = authHeader.substring(7);
                    return jwtTokenService.getUserIdFromToken(token);
                }
            }
        } catch (Exception e) {
            System.err.println("Error extracting user ID from JWT: " + e.getMessage());
        }
        
        return null;
    }
    
    /**
     * Get the username of the currently authenticated user
     * @return Username or "system" if not authenticated
     */
    public String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            return auth.getName();
        }
        
        return "system";
    }
    
    /**
     * Check if a user is currently authenticated
     * @return true if user is authenticated, false otherwise
     */
    public boolean isUserAuthenticated() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal());
    }
}
