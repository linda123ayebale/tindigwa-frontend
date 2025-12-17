package org.example.Controllers;

import org.example.DTO.ClientRegistrationRequest;
import org.example.DTO.ClientResponse;
import org.example.DTO.GuarantorResponse;
import org.example.Services.ClientService;
import org.example.Entities.User;
import org.example.Entities.Guarantor;
import org.example.Entities.Person;
import org.example.Repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/clients")
public class ClientProfileController {
    
    @Autowired
    private ClientService clientService;
    
    @Autowired
    private UserRepository userRepository;

    /**
     * Save a new client
     */
    @PostMapping("/save-client")
    public ResponseEntity<?> saveClient(@RequestBody ClientRegistrationRequest request) {
        try {
            ClientResponse client = clientService.createClient(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(client);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                new ErrorResponse("Validation Error", e.getMessage())
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                new ErrorResponse("Server Error", "An error occurred while creating the client: " + e.getMessage())
            );
        }
    }

    /**
     * Get all clients
     */
    @GetMapping
    public ResponseEntity<List<ClientResponse>> getAllClients() {
        try {
            List<ClientResponse> clients = clientService.getAllClients();
            return ResponseEntity.ok(clients);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get client by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getClientById(@PathVariable Long id) {
        try {
            Optional<ClientResponse> client = clientService.getClientById(id);
            if (client.isPresent()) {
                return ResponseEntity.ok(client.get());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new ErrorResponse("Not Found", "Client not found with id: " + id)
                );
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                new ErrorResponse("Server Error", "An error occurred while fetching the client: " + e.getMessage())
            );
        }
    }

    /**
     * Update client
     */
    @PutMapping("/update-client/{id}")
    public ResponseEntity<?> updateClient(@PathVariable Long id, @RequestBody ClientRegistrationRequest request) {
        try {
            ClientResponse client = clientService.updateClient(id, request);
            return ResponseEntity.ok(client);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                new ErrorResponse("Validation Error", e.getMessage())
            );
        } catch (RuntimeException e) {
            // This will catch other RuntimeExceptions like "Client not found"
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                new ErrorResponse("Not Found", e.getMessage())
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                new ErrorResponse("Server Error", "An error occurred while updating the client: " + e.getMessage())
            );
        }
    }

    /**
     * Delete client
     */
    @DeleteMapping("/delete-client/{id}")
    public ResponseEntity<?> deleteClient(@PathVariable Long id) {
        try {
            clientService.deleteClient(id);
            return ResponseEntity.ok().body(
                new SuccessResponse("Client deleted successfully")
            );
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                new ErrorResponse("Not Found", e.getMessage())
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                new ErrorResponse("Server Error", "An error occurred while deleting the client: " + e.getMessage())
            );
        }
    }
    
    /**
     * Get guarantor information for a specific client
     */
    @GetMapping("/{clientId}/guarantor")
    public ResponseEntity<?> getClientGuarantor(@PathVariable Long clientId) {
        try {
            // Find the client user by ID and role
            Optional<User> clientUser = userRepository.findById(clientId);
            
            if (clientUser.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new ErrorResponse("Not Found", "Client not found with id: " + clientId)
                );
            }
            
            User client = clientUser.get();
            
            // Check if user is actually a client
            if (!client.isClient()) {
                return ResponseEntity.badRequest().body(
                    new ErrorResponse("Invalid Request", "User with id " + clientId + " is not a client")
                );
            }
            
            // Get guarantor information
            Guarantor guarantor = client.getGuarantor();
            if (guarantor == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new ErrorResponse("Not Found", "No guarantor found for client with id: " + clientId)
                );
            }
            
            // Build guarantor response
            Person guarantorPerson = guarantor.getPerson();
            GuarantorResponse response = GuarantorResponse.builder()
                .id(guarantor.getId())
                .firstName(guarantorPerson.getFirstName())
                .lastName(guarantorPerson.getLastName())
                .phoneNumber(guarantorPerson.getContact())
                .nationalId(guarantorPerson.getNationalId())
                .relationship(guarantor.getRelationship())
                .village(guarantorPerson.getVillage())
                .parish(guarantorPerson.getParish())
                .district(guarantorPerson.getDistrict())
                .occupation(guarantorPerson.getOccupation())
                .employmentStatus(guarantorPerson.getEmploymentStatus())
                .monthlyIncome(guarantorPerson.getMonthlyIncome())
                .gender(guarantorPerson.getGender())
                .age(guarantorPerson.getAge())
                .build();
            
            // Build computed fields
            response.buildFullName();
            response.buildFullAddress();
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                new ErrorResponse("Server Error", "An error occurred while fetching guarantor information: " + e.getMessage())
            );
        }
    }
    
    // Helper response classes
    public static class ErrorResponse {
        private String error;
        private String message;
        
        public ErrorResponse(String error, String message) {
            this.error = error;
            this.message = message;
        }
        
        public String getError() { return error; }
        public String getMessage() { return message; }
    }
    
    public static class SuccessResponse {
        private String message;
        
        public SuccessResponse(String message) {
            this.message = message;
        }
        
        public String getMessage() { return message; }
    }
}
