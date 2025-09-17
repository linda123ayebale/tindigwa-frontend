package org.example.Entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "clients_profile")
public class ClientsProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;
    String surname;
    String givenName;
    int age;
    String nationalIdNumber;
    String village;
    String parish;
    String district;
    int lengthOfStayYears;
    String sourceOfIncome;
    String passportPhotoUrl;
    String spouseName;
    String spouseId;
    String phoneNumber;
    String guarantorName;
    int guarantorAge;
    String guarantorContact;
    String guarantorNationalId;
    String guarantorVillage;
    String guarantorParish;
    String guarantorDistrict;
    String guarantorIncomeSource;

}
