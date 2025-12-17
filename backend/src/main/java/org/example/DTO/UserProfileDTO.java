package org.example.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Unified DTO for representing any person in the system
 * Works for: Users, Clients, Guarantors, Next of Kin, Loan Officers, etc.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDTO {
    // Identity
    private Long id;
    private String userCode;
    private String fullName;
    private String firstName;
    private String lastName;
    
    // Contact Information
    private String username;
    private String email;
    private String phone;
    private String contact;
    
    // Location
    private String address;
    private String village;
    private String parish;
    private String district;
    
    // Identification
    private String nationalId;
    private String gender;
    private Integer age;
    
    // Employment
    private String occupation;
    private String employmentStatus;
    private String monthlyIncome;
    
    // System Role & Context
    private String role;           // CLIENT, LOAN_OFFICER, CASHIER, GUARANTOR, NEXT_OF_KIN
    private String branch;
    private String relationType;   // "Client", "Guarantor", "Next of Kin", "Loan Officer"
    
    // Relationship-specific fields (for guarantors/next of kin)
    private String relationship;   // "Brother", "Father", "Friend", etc.
}
