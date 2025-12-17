package org.example.DTOs;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OperationalExpenseRequestDTO {
    
    @NotNull(message = "Category ID is required")
    private Long categoryId;
    
    @NotBlank(message = "Expense name is required")
    @Size(min = 3, max = 255, message = "Expense name must be between 3 and 255 characters")
    private String expenseName;
    
    @NotBlank(message = "Description is required")
    @Size(min = 3, max = 1000, message = "Description must be between 3 and 1000 characters")
    private String description;
    
    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    private Double amount;
    
    @NotNull(message = "Expense date is required")
    private LocalDate expenseDate;
    
    @Size(max = 100, message = "Payment method must not exceed 100 characters")
    private String paymentMethod;
    
    @Size(max = 255, message = "Vendor name must not exceed 255 characters")
    private String vendor;
    
    @Size(max = 255, message = "Reference number must not exceed 255 characters")
    private String referenceNumber;
    
    @Size(max = 50, message = "Status must not exceed 50 characters")
    private String status = "pending";
    
    @Size(max = 2000, message = "Notes must not exceed 2000 characters")
    private String notes;
    
    private String createdBy;
    
    // Approval control - if true, expense requires approval (default), if false, auto-approved
    private Boolean needsApproval = true;
}
