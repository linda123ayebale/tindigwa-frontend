package org.example.Services;

import org.example.Entities.Person;
import org.example.Entities.User;
import org.example.Repositories.UserRepository;
import org.example.auth.SetupRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@Transactional
public class UserSetupService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    public UserSetupService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }
    
    /**
     * Creates a new user with automatic role assignment:
     * - First user in the system gets ADMIN role automatically
     * - Subsequent users get CLIENT role by default (can be overridden)
     * 
     * @param setupRequest The setup request containing user details
     * @return The created user
     * @throws IllegalStateException if setup validation fails
     */
    public User createUser(SetupRequest setupRequest) throws IllegalStateException {
        return createUser(setupRequest, null);
    }
    
    /**
     * Creates a new user with optional role specification
     * 
     * @param setupRequest The setup request containing user details
     * @param specifiedRole Optional role specification (null for auto-assignment)
     * @return The created user
     * @throws IllegalStateException if setup validation fails
     */
    public User createUser(SetupRequest setupRequest, User.UserRole specifiedRole) throws IllegalStateException {
        // Validation
        validateSetupRequest(setupRequest);
        
        // Check if user already exists
        if (userRepository.existsByEmail(setupRequest.getEmail())) {
            throw new IllegalStateException("User with this email already exists");
        }
        
        // Determine role assignment
        User.UserRole assignedRole = determineUserRole(specifiedRole);
        
        // Create Person entity
        Person person = createPersonFromSetupRequest(setupRequest);
        
        // Create User entity
        User user = new User();
        user.setPerson(person);
        user.setEmail(setupRequest.getEmail().toLowerCase().trim());
        user.setUsername(setupRequest.getEmail().toLowerCase().trim()); // Username = email
        user.setPassword(passwordEncoder.encode(setupRequest.getPassword()));
        user.setRole(assignedRole);
        user.setBranch("Main"); // Default branch
        user.setCreatedAt(LocalDateTime.now());
        
        // Mark as setup user only if this is the first admin
        user.setSetupUser(assignedRole == User.UserRole.ADMIN && isFirstUser());
        
        // Save and return
        return userRepository.save(user);
    }
    
    /**
     * Checks if setup has already been completed (first user created)
     */
    public boolean isSetupCompleted() {
        return userRepository.countTotalUsers() > 0;
    }
    
    /**
     * Checks if there are any admin users in the system
     */
    public boolean hasAdminUsers() {
        return !userRepository.findByRole(User.UserRole.ADMIN).isEmpty();
    }
    
    /**
     * Gets the total count of users in the system
     */
    public long getTotalUserCount() {
        return userRepository.countTotalUsers();
    }
    
    // Private helper methods
    
    private void validateSetupRequest(SetupRequest setupRequest) throws IllegalStateException {
        if (setupRequest.getAdminName() == null || setupRequest.getAdminName().trim().isEmpty()) {
            throw new IllegalStateException("Name is required");
        }
        
        if (setupRequest.getEmail() == null || setupRequest.getEmail().trim().isEmpty()) {
            throw new IllegalStateException("Email is required");
        }
        
        if (setupRequest.getPassword() == null || setupRequest.getPassword().length() < 6) {
            throw new IllegalStateException("Password must be at least 6 characters long");
        }
        
        if (!setupRequest.getPassword().equals(setupRequest.getConfirmPassword())) {
            throw new IllegalStateException("Passwords do not match");
        }
        
        // Basic email validation
        if (!setupRequest.getEmail().contains("@") || !setupRequest.getEmail().contains(".")) {
            throw new IllegalStateException("Please provide a valid email address");
        }
    }
    
    private User.UserRole determineUserRole(User.UserRole specifiedRole) {
        // If role is specified, use it
        if (specifiedRole != null) {
            return specifiedRole;
        }
        
        // Auto-assignment logic: First user becomes ADMIN
        if (isFirstUser()) {
            return User.UserRole.ADMIN;
        }
        
        // Default role for subsequent users
        return User.UserRole.CLIENT;
    }
    
    private boolean isFirstUser() {
        return userRepository.countTotalUsers() == 0;
    }
    
    private Person createPersonFromSetupRequest(SetupRequest setupRequest) {
        Person person = new Person();
        
        // Parse the name - split by spaces to get first/last names
        String fullName = setupRequest.getAdminName().trim();
        String[] nameParts = fullName.split("\\s+", 3); // Split into max 3 parts
        
        if (nameParts.length >= 1) {
            person.setFirstName(nameParts[0]);
        }
        
        if (nameParts.length >= 2) {
            person.setLastName(nameParts[nameParts.length - 1]); // Last part is last name
        }
        
        // If there are 3+ parts, middle parts become given name
        if (nameParts.length >= 3) {
            StringBuilder givenName = new StringBuilder();
            for (int i = 1; i < nameParts.length - 1; i++) {
                if (givenName.length() > 0) givenName.append(" ");
                givenName.append(nameParts[i]);
            }
            person.setGivenName(givenName.toString());
        }
        
        // Set other fields to defaults (can be updated later)
        person.setContact(""); // Will be updated in profile
        person.setNationalId(""); // Will be updated in profile
        person.setVillage("");
        person.setParish("");
        person.setDistrict("");
        person.setAge(0); // Will be updated in profile
        
        return person;
    }
    
    /**
     * Role-based user creation methods for different scenarios
     */
    
    public User createAdminUser(SetupRequest setupRequest) throws IllegalStateException {
        return createUser(setupRequest, User.UserRole.ADMIN);
    }
    
    public User createLoanOfficer(SetupRequest setupRequest) throws IllegalStateException {
        return createUser(setupRequest, User.UserRole.LOAN_OFFICER);
    }
    
    public User createClient(SetupRequest setupRequest) throws IllegalStateException {
        return createUser(setupRequest, User.UserRole.CLIENT);
    }
}