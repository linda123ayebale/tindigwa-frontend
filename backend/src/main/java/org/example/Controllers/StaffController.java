package org.example.Controllers;

import org.example.DTO.StaffRegistrationRequest;
import org.example.DTO.StaffResponse;
import org.example.Services.StaffService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/staff")
public class StaffController {
    
    @Autowired
    private StaffService staffService;
    
    /**
     * Save a new staff member
     */
    @PostMapping("/save-staff")
    public ResponseEntity<?> saveStaff(@RequestBody StaffRegistrationRequest request) {
        try {
            StaffResponse staff = staffService.createStaff(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(staff);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                new ErrorResponse("Validation Error", e.getMessage())
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                new ErrorResponse("Server Error", "An error occurred while creating the staff member: " + e.getMessage())
            );
        }
    }
    
    /**
     * Get all staff members
     */
    @GetMapping
    public ResponseEntity<?> getAllStaff() {
        try {
            List<StaffResponse> staff = staffService.getAllStaff();
            return ResponseEntity.ok(staff);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                new ErrorResponse("Server Error", "An error occurred while fetching staff members: " + e.getMessage())
            );
        }
    }
    
    /**
     * Get staff member by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getStaffById(@PathVariable Long id) {
        try {
            Optional<StaffResponse> staff = staffService.getStaffById(id);
            if (staff.isPresent()) {
                return ResponseEntity.ok(staff.get());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new ErrorResponse("Not Found", "Staff member not found with id: " + id)
                );
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                new ErrorResponse("Server Error", "An error occurred while fetching the staff member: " + e.getMessage())
            );
        }
    }
    
    /**
     * Update staff member
     */
    @PutMapping("/update-staff/{id}")
    public ResponseEntity<?> updateStaff(@PathVariable Long id, @RequestBody StaffRegistrationRequest request) {
        try {
            StaffResponse staff = staffService.updateStaff(id, request);
            return ResponseEntity.ok(staff);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                new ErrorResponse("Validation Error", e.getMessage())
            );
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                new ErrorResponse("Not Found", e.getMessage())
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                new ErrorResponse("Server Error", "An error occurred while updating the staff member: " + e.getMessage())
            );
        }
    }
    
    /**
     * Delete staff member
     */
    @DeleteMapping("/delete-staff/{id}")
    public ResponseEntity<?> deleteStaff(@PathVariable Long id) {
        try {
            staffService.deleteStaff(id);
            return ResponseEntity.ok().body(
                new SuccessResponse("Staff member deleted successfully")
            );
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                new ErrorResponse("Not Found", e.getMessage())
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                new ErrorResponse("Server Error", "An error occurred while deleting the staff member: " + e.getMessage())
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