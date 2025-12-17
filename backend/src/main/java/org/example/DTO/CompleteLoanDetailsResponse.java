package org.example.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Complete loan details response for frontend loan details page
 * Consolidates all loan-related data in a single optimized endpoint
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompleteLoanDetailsResponse {
    private LoanDTO loan;
    private LoanClientDTO client;
    private LoanOfficerDTO loanOfficer;
    private LoanTrackingDTO tracking;
    private List<LoanPaymentDTO> payments;
    private List<WorkflowHistoryDTO> workflowHistory;
    
    /**
     * Core loan information
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoanDTO {
        private Long id;
        private String loanNumber;
        private Double principalAmount;
        private Double totalPayable;
        private Double interestRate;
        private Integer duration;
        private String durationUnit;
        private String repaymentFrequency;
        private Integer numberOfRepayments;
        private String workflowStatus;
        private String loanStatus;
        private LocalDateTime createdAt;
        private LocalDateTime approvalDate;
        private LocalDateTime disbursedAt;
        private String rejectionReason;
        private String rejectedBy;
        private String lendingBranch;
        private Integer gracePeriodDays;
        private String productName;
        private String interestMethod;
        private LocalDate releaseDate;
        private LocalDate paymentStartDate;
        private LocalDate paymentEndDate;
        private Double processingFee;
        private Double lateFee;
    }
    
    /**
     * Client information
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoanClientDTO {
        private Long id;
        private String fullName;
        private String email;
        private String phone;
        private String address;
        private String district;
        private String nationalId;
    }
    
    /**
     * Loan officer information
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoanOfficerDTO {
        private Long id;
        private String fullName;
        private String email;
        private String phone;
        private String branch;
        private String role;
    }
    
    /**
     * Loan tracking and payment progress
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoanTrackingDTO {
        private Double amountPaid;
        private Double balance;
        private Integer installmentsPaid;
        private Integer totalInstallments;
        private Double penalty;
        private String status;
        private LocalDate lastPaymentDate;
        private LocalDate nextPaymentDate;
        private Double nextPaymentAmount;
    }
    
    /**
     * Individual payment record
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoanPaymentDTO {
        private Long id;
        private LocalDate paymentDate;
        private Double amount;
        private String method;
        private String reference;
        private String status;
        private String notes;
        private String recordedBy;
    }
    
    /**
     * Workflow history entry
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WorkflowHistoryDTO {
        private String action;
        private String performedBy;
        private LocalDateTime timestamp;
        private String notes;
    }
}
