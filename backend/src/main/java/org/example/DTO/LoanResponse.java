package org.example.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Lightweight DTO for loan list tables
 * Used by: Pending Approvals, Approved Loans, Rejected Loans, All Loans
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoanResponse {
    private Long id;
    private String loanNumber;
    private String clientName;
    private String loanProductName;
    private String loanOfficerName;     // Name of loan officer who created the loan
    private Double principalAmount;
    private String workflowStatus;      // PENDING_APPROVAL, APPROVED, REJECTED
    private String loanStatus;          // pending, approved, active, closed, defaulted
    private LocalDate createdAt;
    private LocalDate releaseDate;
    private String rejectionReason;     // For rejected loans table
}
