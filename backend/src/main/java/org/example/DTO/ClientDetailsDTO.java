package org.example.DTO;
public class ClientDetailsDTO {

    private String firstName;
    private String givenName;
    private String lastName;
    private String nationalId;
    private String contact;
    private String district;
    private String village;
    private String parish;
    private String loanOfficer;
    private String guarantorName;
    private String nextOfKinName;
    private String status;

    public ClientDetailsDTO(String firstName, String givenName, String lastName, String nationalId,
                            String contact, String district, String village, String parish,
                            String loanOfficer, String guarantorName, String nextOfKinName,
                            String status) {
        this.firstName = firstName;
        this.givenName = givenName;
        this.lastName = lastName;
        this.nationalId = nationalId;
        this.contact = contact;
        this.district = district;
        this.village = village;
        this.parish = parish;
        this.loanOfficer = loanOfficer;
        this.guarantorName = guarantorName;
        this.nextOfKinName = nextOfKinName;
        this.status = status;
    }

    // Getters and setters (or use Lombok @Data)
}

