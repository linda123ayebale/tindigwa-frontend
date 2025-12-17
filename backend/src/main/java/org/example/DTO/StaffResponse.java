package org.example.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StaffResponse {
    
    // ID Information
    private Long id;
    private Long personId;
    
    // Basic Information
    private String firstName;
    private String middleName;
    private String lastName;
    private String fullName; // Computed field
    private String gender;
    private String role; // LOAN_OFFICER, CASHIER, SUPERVISOR, ADMIN
    private Integer age;
    private String nationalId;
    private String phoneNumber;
    private String email;
    
    // Address Information
    private String village;
    private String parish;
    private String district;
    
    // Next of Kin Information
    private NextOfKinInfo nextOfKin;
    
    // System Information
    private String branch;
    private String status;
    private LocalDateTime createdAt;
    
    // Photo Information
    private String passportPhotoUrl;
    
    // Nested class for Next of Kin information
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class NextOfKinInfo {
        private Long id;
        private String firstName;
        private String lastName;
        private String fullName;
        private String gender;
        private String phoneNumber;
        private String relationship;
        private String village;
        private String parish;
        private String district;
    }
    
    // Helper method to compute full name
    public void computeFullName() {
        if (firstName != null || middleName != null || lastName != null) {
            StringBuilder name = new StringBuilder();
            if (firstName != null && !firstName.trim().isEmpty()) {
                name.append(firstName.trim());
            }
            if (middleName != null && !middleName.trim().isEmpty()) {
                if (name.length() > 0) name.append(" ");
                name.append(middleName.trim());
            }
            if (lastName != null && !lastName.trim().isEmpty()) {
                if (name.length() > 0) name.append(" ");
                name.append(lastName.trim());
            }
            this.fullName = name.length() > 0 ? name.toString() : "Unknown";
        } else {
            this.fullName = "Unknown";
        }
    }
}