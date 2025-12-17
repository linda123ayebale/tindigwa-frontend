package org.example.Services;

import org.example.DTO.ClientRegistrationRequest;
import org.example.DTO.ClientResponse;
import org.example.Entities.Person;
import org.example.Entities.User;
import org.example.Entities.NextOfKin;
import org.example.Entities.Guarantor;
import org.example.Repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class ClientService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    /**
     * Create a new client
     */
    public ClientResponse createClient(ClientRegistrationRequest request) {
        // Normalize the request data
        request.normalize();
        
        // Validate the request
        validateClientRequest(request);
        
        // Check if user already exists
        if (request.getEmail() != null && userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("A user with this email already exists");
        }
        
        if (request.getNationalId() != null && userRepository.existsByPersonNationalId(request.getNationalId())) {
            throw new IllegalArgumentException("A person with this National ID already exists");
        }
        
        // Create the client entities
        User client = buildClientUser(request);
        
        // Save the client
        User savedClient = userRepository.save(client);
        
        // Convert to response and return
        return convertToClientResponse(savedClient);
    }
    
    /**
     * Get all clients
     */
    public List<ClientResponse> getAllClients() {
        List<User> clients = userRepository.findByRole(User.UserRole.CLIENT);
        return clients.stream()
                .map(this::convertToClientResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Get client by ID
     */
    public Optional<ClientResponse> getClientById(Long id) {
        return userRepository.findById(id)
                .filter(user -> User.UserRole.CLIENT.equals(user.getRole()))
                .map(this::convertToClientResponse);
    }
    
    /**
     * Update client
     */
    public ClientResponse updateClient(Long id, ClientRegistrationRequest request) {
        request.normalize();
        
        User existingClient = userRepository.findById(id)
                .filter(user -> User.UserRole.CLIENT.equals(user.getRole()))
                .orElseThrow(() -> new RuntimeException("Client not found with id: " + id));
        
        // Update the client with new information
        updateClientFromRequest(existingClient, request);
        
        // Save and return
        User updatedClient = userRepository.save(existingClient);
        return convertToClientResponse(updatedClient);
    }
    
    /**
     * Delete client
     */
    public void deleteClient(Long id) {
        User client = userRepository.findById(id)
                .filter(user -> User.UserRole.CLIENT.equals(user.getRole()))
                .orElseThrow(() -> new RuntimeException("Client not found with id: " + id));
        
        userRepository.delete(client);
    }
    
    // Private helper methods
    
    /**
     * Helper method to normalize nationalId - converts empty strings to null
     * to avoid unique constraint violations in the database
     */
    private String normalizeNationalId(String nationalId) {
        if (nationalId == null || nationalId.trim().isEmpty()) {
            return null;
        }
        return nationalId.trim();
    }
    
    private void validateClientRequest(ClientRegistrationRequest request) {
        if (request.getFirstName() == null || request.getFirstName().trim().isEmpty()) {
            throw new IllegalArgumentException("First name is required");
        }
        
        if (request.getLastName() == null || request.getLastName().trim().isEmpty()) {
            throw new IllegalArgumentException("Last name is required");
        }
        
        if (request.getPhoneNumber() == null || request.getPhoneNumber().trim().isEmpty()) {
            throw new IllegalArgumentException("Phone number is required");
        }
        
        if (request.getNationalId() == null || request.getNationalId().trim().isEmpty()) {
            throw new IllegalArgumentException("National ID is required");
        }
        
        if (request.getGender() == null || request.getGender().trim().isEmpty()) {
            throw new IllegalArgumentException("Gender is required");
        }
        
        // Validate gender values
        String gender = request.getGender().trim().toUpperCase();
        if (!"MALE".equals(gender) && !"FEMALE".equals(gender)) {
            throw new IllegalArgumentException("Gender must be either MALE or FEMALE");
        }
        
        if (request.getAge() != null && (request.getAge() < 18 || request.getAge() > 100)) {
            throw new IllegalArgumentException("Age must be between 18 and 100");
        }
        
        if (request.getEmail() != null && !request.getEmail().contains("@")) {
            throw new IllegalArgumentException("Please provide a valid email address");
        }
    }
    
    private User buildClientUser(ClientRegistrationRequest request) {
        // Create Person entity for the client
        Person clientPerson = new Person();
        clientPerson.setFirstName(request.getFirstName());
        clientPerson.setGivenName(request.getMiddleName()); // middleName maps to givenName
        clientPerson.setLastName(request.getLastName());
        clientPerson.setAge(request.getAge() != null ? request.getAge() : 0);
        clientPerson.setContact(request.getPhoneNumber());
        clientPerson.setNationalId(normalizeNationalId(request.getNationalId()));
        clientPerson.setGender(request.getGender().trim().toUpperCase()); // Set gender
        clientPerson.setVillage(request.getVillage() != null ? request.getVillage() : "");
        clientPerson.setParish(request.getParish() != null ? request.getParish() : "");
        clientPerson.setDistrict(request.getDistrict() != null ? request.getDistrict() : "");
        
        // Marital Information
        clientPerson.setMaritalStatus(request.getMaritalStatus() != null ? request.getMaritalStatus().trim().toUpperCase() : "SINGLE");
        clientPerson.setSpouseName(request.getSpouseName() != null ? request.getSpouseName() : "");
        clientPerson.setSpousePhone(request.getSpousePhone() != null ? request.getSpousePhone() : "");
        
        // Employment Information
        clientPerson.setOccupation(request.getOccupation() != null ? request.getOccupation() : "");
        clientPerson.setEmploymentStatus(request.getEmploymentStatus() != null ? request.getEmploymentStatus() : "");
        clientPerson.setMonthlyIncome(request.getMonthlyIncome() != null ? request.getMonthlyIncome() : "");
        
        // Create User entity
        User client = new User();
        client.setPerson(clientPerson);
        client.setRole(User.UserRole.CLIENT);
        client.setBranch(request.getBranch() != null ? request.getBranch() : "Main");
        client.setCreatedAt(LocalDateTime.now());
        client.setSetupUser(false);
        
        // Set authentication fields (clients don't log in, so these are optional/minimal)
        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            client.setEmail(request.getEmail().toLowerCase().trim());
            client.setUsername(request.getEmail().toLowerCase().trim());
        } else {
            // Generate a system username for database consistency (not for login)
            String systemUsername = (request.getFirstName() + "_" + request.getLastName() + "_" + 
                              System.currentTimeMillis()).toLowerCase().replaceAll("\\s+", "_");
            client.setUsername(systemUsername);
            client.setEmail(systemUsername + "@system.local"); // System-generated email
        }
        
        // Set a default password (clients don't log in, but User entity requires it)
        client.setPassword(passwordEncoder.encode("NO_LOGIN_REQUIRED_" + System.currentTimeMillis()));
        
        // Create NextOfKin if provided (only if fields are not empty)
        if ((request.getNextOfKinFirstName() != null && !request.getNextOfKinFirstName().trim().isEmpty()) || 
            (request.getNextOfKinLastName() != null && !request.getNextOfKinLastName().trim().isEmpty())) {
            NextOfKin nextOfKin = createNextOfKin(request);
            client.setNextOfKin(nextOfKin);
        }
        
        // Create Guarantor if provided - handle both old and new field formats
        if (shouldCreateGuarantor(request)) {
            Guarantor guarantor = createGuarantor(request);
            client.setGuarantor(guarantor);
        }
        
        return client;
    }
    
    private NextOfKin createNextOfKin(ClientRegistrationRequest request) {
        Person nextOfKinPerson = new Person();
        nextOfKinPerson.setFirstName(request.getNextOfKinFirstName());
        nextOfKinPerson.setLastName(request.getNextOfKinLastName());
        nextOfKinPerson.setContact(request.getNextOfKinPhone() != null ? request.getNextOfKinPhone() : "");
        
        // Use helper method to normalize nationalId (will be null since we don't collect national_id for next of kin)
        nextOfKinPerson.setNationalId(null);
        
        // Set gender for next of kin if provided
        if (request.getNextOfKinGender() != null && !request.getNextOfKinGender().trim().isEmpty()) {
            String nokGender = request.getNextOfKinGender().trim().toUpperCase();
            if ("MALE".equals(nokGender) || "FEMALE".equals(nokGender)) {
                nextOfKinPerson.setGender(nokGender);
            }
        }
        
        NextOfKin nextOfKin = new NextOfKin();
        nextOfKin.setPerson(nextOfKinPerson);
        
        return nextOfKin;
    }
    
    private boolean shouldCreateGuarantor(ClientRegistrationRequest request) {
        // Check new format fields (from GuarantorStep)
        boolean hasNewFields = (request.getGuarantorFirstName() != null && !request.getGuarantorFirstName().trim().isEmpty()) ||
                              (request.getGuarantorLastName() != null && !request.getGuarantorLastName().trim().isEmpty());
        
        // Check old format fields (legacy)
        boolean hasOldFields = (request.getGuarantorName() != null && !request.getGuarantorName().trim().isEmpty());
        
        return hasNewFields || hasOldFields;
    }
    
    private Guarantor createGuarantor(ClientRegistrationRequest request) {
        Person guarantorPerson = new Person();
        
        // Handle new format fields (from GuarantorStep) - preferred
        if ((request.getGuarantorFirstName() != null && !request.getGuarantorFirstName().trim().isEmpty()) ||
            (request.getGuarantorLastName() != null && !request.getGuarantorLastName().trim().isEmpty())) {
            
            guarantorPerson.setFirstName(request.getGuarantorFirstName() != null ? request.getGuarantorFirstName().trim() : "");
            guarantorPerson.setLastName(request.getGuarantorLastName() != null ? request.getGuarantorLastName().trim() : "");
            guarantorPerson.setGender(request.getGuarantorGender() != null ? request.getGuarantorGender().trim() : "");
            guarantorPerson.setContact(request.getGuarantorPhone() != null ? request.getGuarantorPhone().trim() : "");
            
        } else if (request.getGuarantorName() != null && !request.getGuarantorName().trim().isEmpty()) {
            // Handle legacy format (guarantorName as single field)
            String guarantorName = request.getGuarantorName().trim();
            String[] nameParts = guarantorName.split("\\s+", 2);
            
            guarantorPerson.setFirstName(nameParts[0]);
            if (nameParts.length > 1) {
                guarantorPerson.setLastName(nameParts[1]);
            }
            guarantorPerson.setContact(request.getGuarantorContact() != null ? request.getGuarantorContact() : "");
        }
        
        // Set other common fields (from legacy or new format)
        guarantorPerson.setAge(request.getGuarantorAge() != null ? request.getGuarantorAge() : 0);
        
        // Use helper method to normalize nationalId
        guarantorPerson.setNationalId(normalizeNationalId(request.getGuarantorNationalId()));
        
        guarantorPerson.setVillage(request.getGuarantorVillage() != null ? request.getGuarantorVillage() : "");
        guarantorPerson.setParish(request.getGuarantorParish() != null ? request.getGuarantorParish() : "");
        guarantorPerson.setDistrict(request.getGuarantorDistrict() != null ? request.getGuarantorDistrict() : "");
        
        Guarantor guarantor = new Guarantor();
        guarantor.setPerson(guarantorPerson);
        guarantor.setRelationship(request.getGuarantorRelationship() != null ? request.getGuarantorRelationship() : "");
        
        return guarantor;
    }
    
    private void updateClientFromRequest(User client, ClientRegistrationRequest request) {
        // Update Person information
        Person person = client.getPerson();
        if (person == null) {
            person = new Person();
            client.setPerson(person);
        }
        
        person.setFirstName(request.getFirstName());
        person.setGivenName(request.getMiddleName());
        person.setLastName(request.getLastName());
        if (request.getAge() != null) person.setAge(request.getAge());
        if (request.getPhoneNumber() != null) person.setContact(request.getPhoneNumber());
        if (request.getNationalId() != null) person.setNationalId(request.getNationalId());
        if (request.getVillage() != null) person.setVillage(request.getVillage());
        if (request.getParish() != null) person.setParish(request.getParish());
        if (request.getDistrict() != null) person.setDistrict(request.getDistrict());
        
        // Update Marital Information
        if (request.getMaritalStatus() != null) person.setMaritalStatus(request.getMaritalStatus().trim().toUpperCase());
        if (request.getSpouseName() != null) person.setSpouseName(request.getSpouseName());
        if (request.getSpousePhone() != null) person.setSpousePhone(request.getSpousePhone());
        
        // Update Employment Information
        if (request.getOccupation() != null) person.setOccupation(request.getOccupation());
        if (request.getEmploymentStatus() != null) person.setEmploymentStatus(request.getEmploymentStatus());
        if (request.getMonthlyIncome() != null) person.setMonthlyIncome(request.getMonthlyIncome());
        
        // Update User information
        if (request.getEmail() != null) {
            client.setEmail(request.getEmail().toLowerCase().trim());
            client.setUsername(request.getEmail().toLowerCase().trim());
        }
        if (request.getBranch() != null) {
            client.setBranch(request.getBranch());
        }
        
        // Update NextOfKin if provided
        if (request.getNextOfKinFirstName() != null || request.getNextOfKinLastName() != null) {
            if (client.getNextOfKin() == null) {
                client.setNextOfKin(createNextOfKin(request));
            } else {
                Person nokPerson = client.getNextOfKin().getPerson();
                if (nokPerson == null) {
                    nokPerson = new Person();
                    client.getNextOfKin().setPerson(nokPerson);
                }
                nokPerson.setFirstName(request.getNextOfKinFirstName());
                nokPerson.setLastName(request.getNextOfKinLastName());
                nokPerson.setContact(request.getNextOfKinPhone());
            }
        }
        
        // Update Guarantor if provided
        if (shouldCreateGuarantor(request)) {
            if (client.getGuarantor() == null) {
                client.setGuarantor(createGuarantor(request));
            } else {
                // Update existing guarantor
                Person guarantorPerson = client.getGuarantor().getPerson();
                if (guarantorPerson == null) {
                    guarantorPerson = new Person();
                    client.getGuarantor().setPerson(guarantorPerson);
                }
                
                // Handle new format fields (from GuarantorStep) - preferred
                if ((request.getGuarantorFirstName() != null && !request.getGuarantorFirstName().trim().isEmpty()) ||
                    (request.getGuarantorLastName() != null && !request.getGuarantorLastName().trim().isEmpty())) {
                    
                    guarantorPerson.setFirstName(request.getGuarantorFirstName() != null ? request.getGuarantorFirstName().trim() : "");
                    guarantorPerson.setLastName(request.getGuarantorLastName() != null ? request.getGuarantorLastName().trim() : "");
                    guarantorPerson.setGender(request.getGuarantorGender() != null ? request.getGuarantorGender().trim() : "");
                    guarantorPerson.setContact(request.getGuarantorPhone() != null ? request.getGuarantorPhone().trim() : "");
                    
                } else if (request.getGuarantorName() != null && !request.getGuarantorName().trim().isEmpty()) {
                    // Handle legacy format (guarantorName as single field)
                    String guarantorName = request.getGuarantorName().trim();
                    String[] nameParts = guarantorName.split("\\s+", 2);
                    
                    guarantorPerson.setFirstName(nameParts[0]);
                    if (nameParts.length > 1) {
                        guarantorPerson.setLastName(nameParts[1]);
                    }
                    guarantorPerson.setContact(request.getGuarantorContact() != null ? request.getGuarantorContact() : "");
                }
                
                // Update other guarantor fields
                if (request.getGuarantorAge() != null) guarantorPerson.setAge(request.getGuarantorAge());
                if (request.getGuarantorNationalId() != null) guarantorPerson.setNationalId(normalizeNationalId(request.getGuarantorNationalId()));
                if (request.getGuarantorVillage() != null) guarantorPerson.setVillage(request.getGuarantorVillage());
                if (request.getGuarantorParish() != null) guarantorPerson.setParish(request.getGuarantorParish());
                if (request.getGuarantorDistrict() != null) guarantorPerson.setDistrict(request.getGuarantorDistrict());
                
                // Update relationship
                if (request.getGuarantorRelationship() != null) {
                    client.getGuarantor().setRelationship(request.getGuarantorRelationship());
                }
            }
        }
    }
    
    private ClientResponse convertToClientResponse(User user) {
        ClientResponse.ClientResponseBuilder builder = ClientResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole().name())
                .branch(user.getBranch())
                .createdAt(user.getCreatedAt());
        
        // Add Person information
        if (user.getPerson() != null) {
            Person person = user.getPerson();
            builder.firstName(person.getFirstName())
                   .middleName(person.getGivenName())
                   .lastName(person.getLastName())
                   .age(person.getAge())
                   .gender(person.getGender()) // Add missing gender field
                   .nationalId(person.getNationalId())
                   .phoneNumber(person.getContact())
                   .village(person.getVillage())
                   .parish(person.getParish())
                   .district(person.getDistrict())
                   .maritalStatus(person.getMaritalStatus())
                   .spouseName(person.getSpouseName())
                   .spousePhone(person.getSpousePhone())
                   .occupation(person.getOccupation())
                   .employmentStatus(person.getEmploymentStatus())
                   .monthlyIncome(person.getMonthlyIncome());
        }
        
        // Add NextOfKin information
        if (user.getNextOfKin() != null && user.getNextOfKin().getPerson() != null) {
            Person nokPerson = user.getNextOfKin().getPerson();
            ClientResponse.NextOfKinInfo nextOfKinInfo = ClientResponse.NextOfKinInfo.builder()
                    .firstName(nokPerson.getFirstName())
                    .lastName(nokPerson.getLastName())
                    .phoneNumber(nokPerson.getContact())
                    .nationalId(nokPerson.getNationalId())
                    .village(nokPerson.getVillage())
                    .parish(nokPerson.getParish())
                    .district(nokPerson.getDistrict())
                    .build();
            
            // Build full name for next of kin
            StringBuilder nokName = new StringBuilder();
            if (nokPerson.getFirstName() != null) nokName.append(nokPerson.getFirstName());
            if (nokPerson.getLastName() != null) {
                if (nokName.length() > 0) nokName.append(" ");
                nokName.append(nokPerson.getLastName());
            }
            nextOfKinInfo.setFullName(nokName.toString());
            
            builder.nextOfKin(nextOfKinInfo);
        }
        
        // Add Guarantor information
        if (user.getGuarantor() != null && user.getGuarantor().getPerson() != null) {
            Person guarantorPerson = user.getGuarantor().getPerson();
            ClientResponse.GuarantorInfo guarantorInfo = ClientResponse.GuarantorInfo.builder()
                    .firstName(guarantorPerson.getFirstName())
                    .lastName(guarantorPerson.getLastName())
                    .phoneNumber(guarantorPerson.getContact())
                    .nationalId(guarantorPerson.getNationalId())
                    .village(guarantorPerson.getVillage())
                    .parish(guarantorPerson.getParish())
                    .district(guarantorPerson.getDistrict())
                    .age(guarantorPerson.getAge())
                    .relationship(user.getGuarantor().getRelationship())
                    .build();
            
            // Build full name for guarantor
            StringBuilder guarantorName = new StringBuilder();
            if (guarantorPerson.getFirstName() != null) guarantorName.append(guarantorPerson.getFirstName());
            if (guarantorPerson.getLastName() != null) {
                if (guarantorName.length() > 0) guarantorName.append(" ");
                guarantorName.append(guarantorPerson.getLastName());
            }
            guarantorInfo.setFullName(guarantorName.toString());
            
            builder.guarantor(guarantorInfo);
        }
        
        ClientResponse response = builder.build();
        response.buildFullName(); // Build the full name for the client
        return response;
    }
    
}
