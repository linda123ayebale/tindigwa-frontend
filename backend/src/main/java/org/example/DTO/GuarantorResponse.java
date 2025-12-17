package org.example.DTO;

import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class GuarantorResponse {
    
    private Long id;
    private String firstName;
    private String lastName;
    private String fullName;
    private String phoneNumber;
    private String nationalId;
    private String relationship;
    
    // Address information
    private String village;
    private String parish;
    private String district;
    private String fullAddress;
    
    // Employment information
    private String occupation;
    private String employmentStatus;
    private String monthlyIncome;
    
    // Personal details
    private String gender;
    private Integer age;
    
    // Helper method to build full name
    public void buildFullName() {
        StringBuilder name = new StringBuilder();
        if (firstName != null) name.append(firstName);
        if (lastName != null) {
            if (name.length() > 0) name.append(" ");
            name.append(lastName);
        }
        this.fullName = name.length() > 0 ? name.toString() : "Unknown";
    }
    
    // Helper method to build full address
    public void buildFullAddress() {
        StringBuilder address = new StringBuilder();
        if (village != null) address.append(village);
        if (parish != null) {
            if (address.length() > 0) address.append(", ");
            address.append(parish);
        }
        if (district != null) {
            if (address.length() > 0) address.append(", ");
            address.append(district);
        }
        this.fullAddress = address.length() > 0 ? address.toString() : "Address not provided";
    }
}