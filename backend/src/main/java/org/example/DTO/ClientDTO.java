package org.example.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClientDTO {
    private Long id;
    private String userCode;
    private String fullName;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String contact;
    private String address;
    private String village;
    private String parish;
    private String district;
    private String nationalId;
    private String gender;
    private Integer age;
    private String occupation;
    private String employmentStatus;
    private String monthlyIncome;
    
    // Next of Kin information
    private String nextOfKinName;
    private String nextOfKinContact;
    private String nextOfKinRelationship;
    
    // Guarantor information
    private String guarantorName;
    private String guarantorContact;
    private String guarantorRelationship;
}
