package org.example.DTO;

import lombok.Data;

@Data
public class ClientRegistrationRequest {
    
    // Basic Information (maps to Person entity)
    private String firstName;
    private String middleName;  // This will be stored as givenName in Person
    private String lastName;
    private String gender;      // MALE or FEMALE
    private Integer age;
    private String nationalId;
    private String phoneNumber;
    private String email;
    
    // Marital Information (maps to Person entity)
    private String maritalStatus;  // SINGLE or MARRIED
    private String spousePhone;
    
    // Address Information (maps to Person entity)
    private String village;
    private String parish;
    private String district;
    
    // Next of Kin Information (maps to NextOfKin -> Person)
    private String nextOfKinFirstName;
    private String nextOfKinLastName;
    private String nextOfKinGender;    // MALE or FEMALE
    private String nextOfKinPhone;
    private String nextOfKinRelationship;
    
    // Employment Information 
    private String employmentStatus;
    private String occupation;
    private String monthlyIncome;
    
    // System Information
    private String branch;
    private Boolean agreementSigned;
    
    // New Guarantor Fields (from frontend GuarantorStep)
    private String guarantorFirstName;
    private String guarantorLastName;
    private String guarantorGender;
    private String guarantorPhone;
    private String guarantorRelationship;
    
    // Legacy field names (for backwards compatibility with old frontend)
    private String surname;          // Will map to lastName
    private String givenName;        // Will map to middleName  
    private String nationalIdNumber; // Will map to nationalId
    private Integer lengthOfStayYears;
    private String sourceOfIncome;   // Will map to occupation
    private String passportPhotoUrl;
    private String spouseName;
    private String spouseId;
    private String guarantorName;
    private Integer guarantorAge;
    private String guarantorContact;
    private String guarantorNationalId;
    private String guarantorVillage;
    private String guarantorParish;
    private String guarantorDistrict;
    private String guarantorIncomeSource;
    
    // Helper method to normalize the data
    public void normalize() {
        // Handle the mapping between old and new field names
        if (surname != null && lastName == null) {
            lastName = surname;
        }
        if (givenName != null && middleName == null) {
            middleName = givenName;
        }
        if (nationalIdNumber != null && nationalId == null) {
            nationalId = nationalIdNumber;
        }
        if (sourceOfIncome != null && occupation == null) {
            occupation = sourceOfIncome;
        }
        
        // Set defaults
        if (agreementSigned == null) {
            agreementSigned = true; // Assume agreement is signed if not specified
        }
        if (branch == null) {
            branch = "Main";
        }
    }
}