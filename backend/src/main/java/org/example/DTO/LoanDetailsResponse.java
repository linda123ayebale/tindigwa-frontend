package org.example.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Complete DTO for loan details view page
 * Contains all loan information including interest, repayment, fees, and metadata
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoanDetailsResponse {
    // Identification
    private Long id;
    private String loanNumber;
    private String loanTitle;
    private String description;
    
    // Client & Product
    private Long clientId;
    private String clientName;
    private Long productId;
    private String loanProductName;
    private String lendingBranch;
    
    // Principal & Disbursement
    private Double principalAmount;
    private LocalDate releaseDate;
    private String disbursedBy;
    private String cashBankAccount;
    private LocalDateTime disbursedAt;
    
    // Interest Configuration
    private String interestMethod;      // flat, reducing, compound
    private String interestType;        // percentage, fixed
    private Double interestRate;
    private Double fixedInterestAmount;
    private String ratePer;             // month, year, day
    private Double effectiveInterestRate;
    
    // Duration
    private Integer loanDuration;
    private String durationUnit;        // days, weeks, months, years
    private Integer loanDurationDays;
    
    // Repayment Configuration
    private String repaymentFrequency;  // daily, weekly, monthly
    private Integer numberOfRepayments;
    private Integer gracePeriodDays;
    private LocalDate paymentStartDate;
    private LocalDate paymentEndDate;
    private LocalDate firstRepaymentDate;
    private Double firstRepaymentAmount;
    
    // Fees & Charges
    private Double processingFee;
    private Double lateFee;
    private Double defaultFee;
    
    // Calculated Amounts
    private Double totalPayable;
    
    // Status & Workflow
    private String loanStatus;          // pending, approved, disbursed, active, completed, defaulted
    private String workflowStatus;      // PENDING_APPROVAL, APPROVED, REJECTED
    private Boolean agreementSigned;
    
    // Audit & Workflow Details
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long createdById;
    private String createdBy;
    private Long approvedById;
    private String approvedBy;
    private LocalDateTime approvalDate;
    private Long rejectedById;
    private String rejectedBy;
    private String rejectionReason;
}
