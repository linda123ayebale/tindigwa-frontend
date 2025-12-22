package org.example.Entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_code", unique = true, length = 8)
    private String userCode;  // Universal user ID (e.g., US250001)

    // Core identity - Person contains all personal details
    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "person_id", referencedColumnName = "id")
    private Person person;

    // Authentication fields
    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    // Role management
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private UserRole role;

    // System fields
    private String branch;
    private LocalDateTime createdAt;
    private boolean isSetupUser;
    
    // Two-Factor Authentication
    @Column(nullable = false)
    private boolean twoFactorEnabled = false;

    // Optional role-specific relationships (primarily for CLIENT role)
    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "next_of_kin_id")
    private NextOfKin nextOfKin;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "guarantor_id")
    private Guarantor guarantor;

    // Convenience methods
    public String getName() {
        if (person == null) return "Unknown";
        
        StringBuilder name = new StringBuilder();
        if (person.getFirstName() != null) {
            name.append(person.getFirstName());
        }
        if (person.getGivenName() != null && !person.getGivenName().isEmpty()) {
            if (name.length() > 0) name.append(" ");
            name.append(person.getGivenName());
        }
        if (person.getLastName() != null && !person.getLastName().isEmpty()) {
            if (name.length() > 0) name.append(" ");
            name.append(person.getLastName());
        }
        
        return name.length() > 0 ? name.toString() : "Unknown";
    }

    public String getFullName() {
        return getName();
    }

    // Role-based helper methods
    public boolean isAdmin() {
        return UserRole.ADMIN.equals(role);
    }

    public boolean isLoanOfficer() {
        return UserRole.LOAN_OFFICER.equals(role);
    }

    public boolean isClient() {
        return UserRole.CLIENT.equals(role);
    }
    
    public boolean isCashier() {
        return UserRole.CASHIER.equals(role);
    }
    
    public boolean isSupervisor() {
        return UserRole.SUPERVISOR.equals(role);
    }
    
    public boolean isAuditor() {
        return UserRole.AUDITOR.equals(role);
    }
    
    public boolean isStaff() {
        return UserRole.LOAN_OFFICER.equals(role) || 
               UserRole.CASHIER.equals(role) || 
               UserRole.SUPERVISOR.equals(role) ||
               UserRole.AUDITOR.equals(role);
    }

    // Role-based validation
    @PrePersist
    @PreUpdate
    public void validateRoleRelationships() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (branch == null) branch = "Main";
        if (role == null) role = UserRole.CLIENT;
        
        // Validation for role-specific relationships:
        // - CLIENT users can have both NextOfKin and Guarantor
        // - STAFF users (LOAN_OFFICER, CASHIER, SUPERVISOR) can have NextOfKin but not Guarantor
        // - ADMIN users have neither
        if (UserRole.ADMIN.equals(role)) {
            this.nextOfKin = null;
            this.guarantor = null;
        } else if (isStaff()) {
            // Staff can have NextOfKin but not Guarantor
            this.guarantor = null;
        }
        // CLIENT users can keep both relationships as is
        
        // Set username as email if not provided
        if (username == null && email != null) {
            username = email;
        }
    }

    // Enum for roles
    public enum UserRole {
        ADMIN("Administrator"),
        LOAN_OFFICER("Loan Officer"),
        CASHIER("Cashier"),
        SUPERVISOR("Supervisor"),
        AUDITOR("Auditor"),
        CLIENT("Client");
        
        private final String displayName;
        
        UserRole(String displayName) {
            this.displayName = displayName;
        }
        
        public String getDisplayName() {
            return displayName;
        }
    }
}



























