package org.example.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StaffRegistrationRequest {
    
    // Basic Information
    private String firstName;
    private String middleName;
    private String lastName;
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
    
    // Next of Kin Information (Staff use next of kin instead of guarantors)
    private String nextOfKinFirstName;
    private String nextOfKinLastName;
    private String nextOfKinGender;
    private String nextOfKinPhone;
    private String nextOfKinRelationship;
    private String nextOfKinVillage;
    private String nextOfKinParish;
    private String nextOfKinDistrict;
    
    // System Information
    private String branch = "Main";
    private String status = "active";
    
    // Photo (if needed for future implementation)
    private String passportPhotoUrl;
    
    // Helper method to normalize the data (for consistency with ClientRegistrationRequest)
    public void normalize() {
        // Set defaults
        if (branch == null || branch.trim().isEmpty()) {
            branch = "Main";
        }
        if (status == null || status.trim().isEmpty()) {
            status = "active";
        }
        
        // Trim whitespace from string fields
        if (firstName != null) firstName = firstName.trim();
        if (middleName != null) middleName = middleName.trim();
        if (lastName != null) lastName = lastName.trim();
        if (gender != null) gender = gender.trim().toUpperCase();
        if (role != null) role = role.trim().toUpperCase();
        if (nationalId != null) nationalId = nationalId.trim();
        if (phoneNumber != null) phoneNumber = phoneNumber.trim();
        if (email != null) email = email.trim().toLowerCase();
        if (village != null) village = village.trim();
        if (parish != null) parish = parish.trim();
        if (district != null) district = district.trim();
        
        // Next of Kin normalization
        if (nextOfKinFirstName != null) nextOfKinFirstName = nextOfKinFirstName.trim();
        if (nextOfKinLastName != null) nextOfKinLastName = nextOfKinLastName.trim();
        if (nextOfKinGender != null) nextOfKinGender = nextOfKinGender.trim().toUpperCase();
        if (nextOfKinPhone != null) nextOfKinPhone = nextOfKinPhone.trim();
        if (nextOfKinRelationship != null) nextOfKinRelationship = nextOfKinRelationship.trim();
        if (nextOfKinVillage != null) nextOfKinVillage = nextOfKinVillage.trim();
        if (nextOfKinParish != null) nextOfKinParish = nextOfKinParish.trim();
        if (nextOfKinDistrict != null) nextOfKinDistrict = nextOfKinDistrict.trim();
    }
}
