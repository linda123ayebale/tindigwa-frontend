package org.example.DTOs;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OperationalExpenseResponseDTO {
    private Long id;
    private String expenseReference;
    private ExpenseCategoryResponseDTO category;
    private String expenseName;
    private String description;
    private Double amount;
    private LocalDate expenseDate;
    private String paymentMethod;
    private String vendor;
    private String referenceNumber;
    private String receiptUrl;
    private String status;
    private String notes;
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Approval fields
    private String approvalStatus; // PENDING, APPROVED, REJECTED
    private String approvalComment;
    private LocalDateTime approvedAt;
    
    // Payment fields  
    private String paymentStatus; // UNPAID, PAID
    private LocalDateTime paidAt;
    
    // User ID fields (for frontend to lookup user details from token)
    private Long requestedByUserId;
    private Long approvedByUserId;
    private Long paidByUserId;
}
