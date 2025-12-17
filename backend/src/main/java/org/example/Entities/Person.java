package org.example.Entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "persons")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Person {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String firstName;
    private String givenName;
    private String lastName;
    private String gender; // MALE or FEMALE

    private int age;
    private String contact;
    private String nationalId;

    private String village;
    private String parish;
    private String district;
    
    // Marital Information
    private String maritalStatus; // SINGLE or MARRIED
    private String spouseName;
    private String spousePhone;
    
    // Employment Information
    private String occupation;
    private String employmentStatus;
    private String monthlyIncome;
}

