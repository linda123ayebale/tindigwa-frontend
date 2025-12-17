package org.example.Mappers;

import org.example.DTO.UserProfileDTO;
import org.example.Entities.*;
import org.springframework.stereotype.Component;

/**
 * Unified mapper for converting User, Person, Guarantor, and NextOfKin entities
 * into a standardized UserProfileDTO
 */
@Component
public class PersonMapper {
    
    /**
     * Convert a User entity (with associated Person) to UserProfileDTO
     * @param user The user entity
     * @param relationType Descriptive type like "Client", "Loan Officer", "Cashier"
     * @return UserProfileDTO with all available data
     */
    public UserProfileDTO toUserProfile(User user, String relationType) {
        if (user == null) {
            return createUnknownProfile(relationType);
        }
        
        Person person = user.getPerson();
        
        return UserProfileDTO.builder()
                .id(user.getId())
                .userCode(defaultValue(user.getUserCode(), "N/A"))
                .fullName(defaultValue(user.getFullName(), "Unknown"))
                .firstName(person != null ? defaultValue(person.getFirstName(), "N/A") : "N/A")
                .lastName(person != null ? defaultValue(person.getLastName(), "N/A") : "N/A")
                .username(defaultValue(user.getUsername(), "N/A"))
                .email(defaultValue(user.getEmail(), "N/A"))
                .phone(person != null ? defaultValue(person.getContact(), "N/A") : "N/A")
                .contact(person != null ? defaultValue(person.getContact(), "N/A") : "N/A")
                .address(person != null ? buildAddress(person) : "N/A")
                .village(person != null ? defaultValue(person.getVillage(), "N/A") : "N/A")
                .parish(person != null ? defaultValue(person.getParish(), "N/A") : "N/A")
                .district(person != null ? defaultValue(person.getDistrict(), "N/A") : "N/A")
                .nationalId(person != null ? defaultValue(person.getNationalId(), "N/A") : "N/A")
                .gender(person != null ? defaultValue(person.getGender(), "N/A") : "N/A")
                .age(person != null ? person.getAge() : null)
                .occupation(person != null ? defaultValue(person.getOccupation(), "N/A") : "N/A")
                .employmentStatus(person != null ? defaultValue(person.getEmploymentStatus(), "N/A") : "N/A")
                .monthlyIncome(person != null ? defaultValue(person.getMonthlyIncome(), "N/A") : "N/A")
                .role(user.getRole() != null ? user.getRole().name() : "N/A")
                .branch(defaultValue(user.getBranch(), "N/A"))
                .relationType(defaultValue(relationType, "User"))
                .relationship(null)
                .build();
    }
    
    /**
     * Convert a Person entity directly to UserProfileDTO (for non-system users)
     * @param person The person entity
     * @param role Role description like "GUARANTOR", "NEXT_OF_KIN"
     * @param relationType Descriptive type like "Guarantor", "Next of Kin"
     * @return UserProfileDTO with person data
     */
    public UserProfileDTO toUserProfile(Person person, String role, String relationType) {
        if (person == null) {
            return createUnknownProfile(relationType);
        }
        
        String fullName = buildFullName(person);
        
        return UserProfileDTO.builder()
                .id(person.getId())
                .userCode("N/A")
                .fullName(fullName)
                .firstName(defaultValue(person.getFirstName(), "N/A"))
                .lastName(defaultValue(person.getLastName(), "N/A"))
                .username("N/A")
                .email("N/A")
                .phone(defaultValue(person.getContact(), "N/A"))
                .contact(defaultValue(person.getContact(), "N/A"))
                .address(buildAddress(person))
                .village(defaultValue(person.getVillage(), "N/A"))
                .parish(defaultValue(person.getParish(), "N/A"))
                .district(defaultValue(person.getDistrict(), "N/A"))
                .nationalId(defaultValue(person.getNationalId(), "N/A"))
                .gender(defaultValue(person.getGender(), "N/A"))
                .age(person.getAge())
                .occupation(defaultValue(person.getOccupation(), "N/A"))
                .employmentStatus(defaultValue(person.getEmploymentStatus(), "N/A"))
                .monthlyIncome(defaultValue(person.getMonthlyIncome(), "N/A"))
                .role(defaultValue(role, "N/A"))
                .branch("N/A")
                .relationType(defaultValue(relationType, "Person"))
                .relationship(null)
                .build();
    }
    
    /**
     * Convert a Guarantor entity to UserProfileDTO
     * @param guarantor The guarantor entity
     * @return UserProfileDTO for the guarantor
     */
    public UserProfileDTO toUserProfile(Guarantor guarantor) {
        if (guarantor == null || guarantor.getPerson() == null) {
            return createUnknownProfile("Guarantor");
        }
        
        UserProfileDTO profile = toUserProfile(guarantor.getPerson(), "GUARANTOR", "Guarantor");
        profile.setRelationship(defaultValue(guarantor.getRelationship(), "N/A"));
        return profile;
    }
    
    /**
     * Convert a NextOfKin entity to UserProfileDTO
     * @param nextOfKin The next of kin entity
     * @return UserProfileDTO for the next of kin
     */
    public UserProfileDTO toUserProfile(NextOfKin nextOfKin) {
        if (nextOfKin == null || nextOfKin.getPerson() == null) {
            return createUnknownProfile("Next of Kin");
        }
        
        UserProfileDTO profile = toUserProfile(nextOfKin.getPerson(), "NEXT_OF_KIN", "Next of Kin");
        // NextOfKin doesn't have relationship field in current schema
        return profile;
    }
    
    /**
     * Build full address from person location fields
     */
    private String buildAddress(Person person) {
        if (person == null) return "N/A";
        
        StringBuilder address = new StringBuilder();
        
        if (person.getVillage() != null && !person.getVillage().trim().isEmpty()) {
            address.append(person.getVillage());
        }
        
        if (person.getParish() != null && !person.getParish().trim().isEmpty()) {
            if (address.length() > 0) address.append(", ");
            address.append(person.getParish());
        }
        
        if (person.getDistrict() != null && !person.getDistrict().trim().isEmpty()) {
            if (address.length() > 0) address.append(", ");
            address.append(person.getDistrict());
        }
        
        return address.length() > 0 ? address.toString() : "N/A";
    }
    
    /**
     * Build full name from person fields
     */
    private String buildFullName(Person person) {
        if (person == null) return "Unknown";
        
        StringBuilder name = new StringBuilder();
        
        if (person.getFirstName() != null && !person.getFirstName().trim().isEmpty()) {
            name.append(person.getFirstName());
        }
        
        if (person.getGivenName() != null && !person.getGivenName().trim().isEmpty()) {
            if (name.length() > 0) name.append(" ");
            name.append(person.getGivenName());
        }
        
        if (person.getLastName() != null && !person.getLastName().trim().isEmpty()) {
            if (name.length() > 0) name.append(" ");
            name.append(person.getLastName());
        }
        
        return name.length() > 0 ? name.toString() : "Unknown";
    }
    
    /**
     * Create a placeholder profile for unknown/missing entities
     */
    private UserProfileDTO createUnknownProfile(String relationType) {
        return UserProfileDTO.builder()
                .id(null)
                .userCode("N/A")
                .fullName("Unknown")
                .firstName("N/A")
                .lastName("N/A")
                .username("N/A")
                .email("N/A")
                .phone("N/A")
                .contact("N/A")
                .address("N/A")
                .village("N/A")
                .parish("N/A")
                .district("N/A")
                .nationalId("N/A")
                .gender("N/A")
                .age(null)
                .occupation("N/A")
                .employmentStatus("N/A")
                .monthlyIncome("N/A")
                .role("N/A")
                .branch("N/A")
                .relationType(defaultValue(relationType, "Unknown"))
                .relationship("N/A")
                .build();
    }
    
    /**
     * Return default value if input is null or empty
     */
    private String defaultValue(String value, String defaultValue) {
        return (value == null || value.trim().isEmpty()) ? defaultValue : value;
    }
}
