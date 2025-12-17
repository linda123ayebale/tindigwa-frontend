package org.example.Services;

import org.example.DTO.StaffRegistrationRequest;
import org.example.DTO.StaffResponse;
import org.example.Entities.User;
import org.example.Entities.Person;
import org.example.Entities.NextOfKin;
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
public class StaffService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional
    public StaffResponse createStaff(StaffRegistrationRequest request) {
        // Normalize the request data
        request.normalize();
        
        // Validate the request
        validateStaffRequest(request);
        
        // Check if user already exists
        if (request.getEmail() != null && userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("A staff member with this email already exists");
        }
        
        if (request.getNationalId() != null && userRepository.existsByPersonNationalId(request.getNationalId())) {
            throw new IllegalArgumentException("A person with this National ID already exists");
        }
        
        // Create Person entity
        Person person = new Person();
        person.setFirstName(request.getFirstName());
        person.setGivenName(request.getMiddleName()); // Using givenName for middleName
        person.setLastName(request.getLastName());
        person.setAge(request.getAge() != null ? request.getAge() : 0);
        person.setGender(request.getGender() != null ? request.getGender().trim().toUpperCase() : "");
        person.setNationalId(normalizeNationalId(request.getNationalId())); // Use correct method name
        person.setContact(request.getPhoneNumber() != null ? request.getPhoneNumber() : ""); // Use correct method name
        person.setVillage(request.getVillage() != null ? request.getVillage() : "");
        person.setParish(request.getParish() != null ? request.getParish() : "");
        person.setDistrict(request.getDistrict() != null ? request.getDistrict() : "");

        // Create Next of Kin if provided (only if fields are not empty)
        NextOfKin nextOfKin = null;
        if ((request.getNextOfKinFirstName() != null && !request.getNextOfKinFirstName().trim().isEmpty()) || 
            (request.getNextOfKinLastName() != null && !request.getNextOfKinLastName().trim().isEmpty())) {
            nextOfKin = createNextOfKin(request);
        }

        // Create User entity
        User user = new User();
        user.setPerson(person);
        user.setUsername(request.getEmail()); // Use email as username
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode("tempPassword123")); // Generate temporary password
        user.setRole(User.UserRole.valueOf(request.getRole()));
        user.setBranch(request.getBranch());
        user.setNextOfKin(nextOfKin);
        user.setCreatedAt(LocalDateTime.now());

        // Save user (cascade will save person and nextOfKin)
        User savedUser = userRepository.save(user);

        return mapToStaffResponse(savedUser);
    }

    public List<StaffResponse> getAllStaff() {
        // Get all users who are staff (not clients)
        List<User> staffUsers = userRepository.findAll().stream()
                .filter(user -> user.getRole() != User.UserRole.CLIENT)
                .collect(Collectors.toList());

        return staffUsers.stream()
                .map(this::mapToStaffResponse)
                .collect(Collectors.toList());
    }

    public Optional<StaffResponse> getStaffById(Long id) {
        Optional<User> user = userRepository.findById(id);
        if (user.isPresent() && user.get().getRole() != User.UserRole.CLIENT) {
            return Optional.of(mapToStaffResponse(user.get()));
        }
        return Optional.empty();
    }

    @Transactional
    public StaffResponse updateStaff(Long id, StaffRegistrationRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Staff member not found with id: " + id));

        // Ensure this is a staff member
        if (user.getRole() == User.UserRole.CLIENT) {
            throw new IllegalArgumentException("Cannot update client as staff member");
        }

        // Validate staff role
        validateStaffRole(request.getRole());

        // Update Person
        Person person = user.getPerson();
        if (person == null) {
            person = new Person();
            user.setPerson(person);
        }
        
        person.setFirstName(request.getFirstName());
        person.setGivenName(request.getMiddleName());
        person.setLastName(request.getLastName());
        if (request.getAge() != null) person.setAge(request.getAge());
        if (request.getGender() != null) person.setGender(request.getGender().trim().toUpperCase());
        if (request.getNationalId() != null) person.setNationalId(normalizeNationalId(request.getNationalId()));
        if (request.getPhoneNumber() != null) person.setContact(request.getPhoneNumber());
        if (request.getVillage() != null) person.setVillage(request.getVillage());
        if (request.getParish() != null) person.setParish(request.getParish());
        if (request.getDistrict() != null) person.setDistrict(request.getDistrict());

        // Update NextOfKin if provided
        if (request.getNextOfKinFirstName() != null || request.getNextOfKinLastName() != null) {
            if (user.getNextOfKin() == null) {
                user.setNextOfKin(createNextOfKin(request));
            } else {
                Person nokPerson = user.getNextOfKin().getPerson();
                if (nokPerson == null) {
                    nokPerson = new Person();
                    user.getNextOfKin().setPerson(nokPerson);
                }
                nokPerson.setFirstName(request.getNextOfKinFirstName());
                nokPerson.setLastName(request.getNextOfKinLastName());
                nokPerson.setContact(request.getNextOfKinPhone());
                nokPerson.setVillage(request.getNextOfKinVillage());
                nokPerson.setParish(request.getNextOfKinParish());
                nokPerson.setDistrict(request.getNextOfKinDistrict());
                
                if (request.getNextOfKinGender() != null && !request.getNextOfKinGender().trim().isEmpty()) {
                    String nokGender = request.getNextOfKinGender().trim().toUpperCase();
                    if ("MALE".equals(nokGender) || "FEMALE".equals(nokGender)) {
                        nokPerson.setGender(nokGender);
                    }
                }
            }
        }

        // Update User
        user.setEmail(request.getEmail());
        user.setUsername(request.getEmail());
        user.setRole(User.UserRole.valueOf(request.getRole()));
        user.setBranch(request.getBranch());

        User savedUser = userRepository.save(user);
        return mapToStaffResponse(savedUser);
    }

    @Transactional
    public void deleteStaff(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Staff member not found with id: " + id));

        // Ensure this is a staff member
        if (user.getRole() == User.UserRole.CLIENT) {
            throw new IllegalArgumentException("Cannot delete client as staff member");
        }

        userRepository.delete(user);
    }

    private void validateStaffRequest(StaffRegistrationRequest request) {
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
        
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("Email is required for staff members");
        }
        
        if (request.getRole() == null || request.getRole().trim().isEmpty()) {
            throw new IllegalArgumentException("Role is required");
        }
        
        // Validate staff role
        validateStaffRole(request.getRole());
        
        // Validate gender values
        String gender = request.getGender().trim().toUpperCase();
        if (!"MALE".equals(gender) && !"FEMALE".equals(gender)) {
            throw new IllegalArgumentException("Gender must be either MALE or FEMALE");
        }
        
        if (request.getAge() != null && (request.getAge() < 18 || request.getAge() > 70)) {
            throw new IllegalArgumentException("Age must be between 18 and 70 for staff members");
        }
        
        if (request.getEmail() != null && !request.getEmail().contains("@")) {
            throw new IllegalArgumentException("Please provide a valid email address");
        }
    }
    
    private void validateStaffRole(String role) {
        try {
            User.UserRole userRole = User.UserRole.valueOf(role);
            if (userRole == User.UserRole.CLIENT) {
                throw new IllegalArgumentException("Invalid staff role. CLIENT role not allowed for staff");
            }
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid staff role. Must be LOAN_OFFICER, CASHIER, SUPERVISOR, or ADMIN");
        }
    }
    
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
    
    private NextOfKin createNextOfKin(StaffRegistrationRequest request) {
        Person nextOfKinPerson = new Person();
        nextOfKinPerson.setFirstName(request.getNextOfKinFirstName());
        nextOfKinPerson.setLastName(request.getNextOfKinLastName());
        nextOfKinPerson.setContact(request.getNextOfKinPhone() != null ? request.getNextOfKinPhone() : "");
        nextOfKinPerson.setVillage(request.getNextOfKinVillage() != null ? request.getNextOfKinVillage() : "");
        nextOfKinPerson.setParish(request.getNextOfKinParish() != null ? request.getNextOfKinParish() : "");
        nextOfKinPerson.setDistrict(request.getNextOfKinDistrict() != null ? request.getNextOfKinDistrict() : "");
        
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

    private StaffResponse mapToStaffResponse(User user) {
        StaffResponse response = new StaffResponse();
        response.setId(user.getId());
        response.setPersonId(user.getPerson().getId());

        // Basic Information
        Person person = user.getPerson();
        response.setFirstName(person.getFirstName());
        response.setMiddleName(person.getGivenName());
        response.setLastName(person.getLastName());
        response.setGender(person.getGender());
        response.setAge(person.getAge());
        response.setNationalId(person.getNationalId());
        response.setPhoneNumber(person.getContact());
        response.setEmail(user.getEmail());

        // Address Information
        response.setVillage(person.getVillage());
        response.setParish(person.getParish());
        response.setDistrict(person.getDistrict());

        // Role and System Information
        response.setRole(user.getRole().name());
        response.setBranch(user.getBranch());
        response.setStatus("active"); // Default status
        response.setCreatedAt(user.getCreatedAt());

        // Next of Kin Information
        if (user.getNextOfKin() != null && user.getNextOfKin().getPerson() != null) {
            Person nokPerson = user.getNextOfKin().getPerson();
            StaffResponse.NextOfKinInfo nokInfo = new StaffResponse.NextOfKinInfo();
            nokInfo.setId(user.getNextOfKin().getId());
            nokInfo.setFirstName(nokPerson.getFirstName());
            nokInfo.setLastName(nokPerson.getLastName());
            nokInfo.setFullName((nokPerson.getFirstName() + " " + nokPerson.getLastName()).trim());
            nokInfo.setGender(nokPerson.getGender());
            nokInfo.setPhoneNumber(nokPerson.getContact());
            nokInfo.setVillage(nokPerson.getVillage());
            nokInfo.setParish(nokPerson.getParish());
            nokInfo.setDistrict(nokPerson.getDistrict());
            response.setNextOfKin(nokInfo);
        }

        // Compute full name
        response.computeFullName();

        return response;
    }
}