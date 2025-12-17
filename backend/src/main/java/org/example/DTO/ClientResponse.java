package org.example.DTO;

import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ClientResponse {
    
    // User/System Information
    private Long id;
    private String username;
    private String email;
    private String role;
    private String branch;
    private LocalDateTime createdAt;
    
    // Personal Information (from Person entity)
    private String firstName;
    private String middleName;
    private String lastName;
    private String fullName;
    private Integer age;
    private String nationalId;
    private String phoneNumber;
    private String gender;
    
    // Address Information
    private String village;
    private String parish;
    private String district;
    
    // Marital Information
    private String maritalStatus;
    private String spouseName;
    private String spousePhone;
    
    // Next of Kin Information
    private NextOfKinInfo nextOfKin;
    
    // Guarantor Information  
    private GuarantorInfo guarantor;
    
    // Employment/Financial Information
    private String occupation;
    private String monthlyIncome;
    private String employmentStatus;
    
    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class NextOfKinInfo {
        private String firstName;
        private String lastName;
        private String fullName;
        private String phoneNumber;
        private String relationship;
        private String nationalId;
        private String village;
        private String parish;
        private String district;
    }
    
    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class GuarantorInfo {
        private String firstName;
        private String lastName;
        private String fullName;
        private String phoneNumber;
        private String nationalId;
        private String village;
        private String parish;
        private String district;
        private String occupation;
        private Integer age;
        private String relationship;
    }
    
    // Helper method to build full name
    public void buildFullName() {
        StringBuilder name = new StringBuilder();
        if (firstName != null) name.append(firstName);
        if (middleName != null) {
            if (name.length() > 0) name.append(" ");
            name.append(middleName);
        }
        if (lastName != null) {
            if (name.length() > 0) name.append(" ");
            name.append(lastName);
        }
        this.fullName = name.length() > 0 ? name.toString() : "Unknown";
    }
}