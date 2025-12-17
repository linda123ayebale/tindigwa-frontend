package org.example.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.Entities.LoanDetails;
import org.example.Entities.LoanTracking;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Enhanced complete loan response using unified UserProfileDTO
 * Replaces all person-related DTOs with the standardized UserProfileDTO
 * Includes comprehensive financial, contractual, and balance details
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnhancedCompleteLoanResponse {
    // Core loan data
    private LoanDetails loan;
    
    // Unified person representations
    private UserProfileDTO client;
    private UserProfileDTO loanOfficer;
    private UserProfileDTO approvedBy;
    private UserProfileDTO rejectedBy;
    private UserProfileDTO disbursedBy;
    
    // Related persons
    private List<UserProfileDTO> guarantors;
    private List<UserProfileDTO> nextOfKin;
    
    // Tracking and payments
    private LoanTracking tracking;
    private List<PaymentDTO> payments;
    
    // Workflow
    private List<WorkflowEventDTO> workflowHistory;
    
    // ===== ENHANCED FINANCIAL SUMMARY =====
    // Fees
    private BigDecimal processingFee;
    private BigDecimal lateFee;
    private BigDecimal insuranceFee;
    private BigDecimal penaltyFee;
    
    // Payment totals
    private BigDecimal totalPaid;
    private BigDecimal principalPaid;
    private BigDecimal interestPaid;
    private BigDecimal feesPaid;
    
    // Outstanding balances
    private BigDecimal outstandingBalance;
    private BigDecimal outstandingPrincipal;
    private BigDecimal outstandingInterest;
    
    // Next payment
    private BigDecimal nextPaymentAmount;
    private LocalDate nextPaymentDue;
    
    // ===== KEY DATES =====
    private LocalDate applicationDate;
    private LocalDate approvalDate;
    private LocalDate disbursementDate;
    private LocalDate firstRepaymentDate;
    private LocalDate maturityDate;
    private LocalDate lastPaymentDate;
    
    // ===== LOAN TERMS =====
    private String repaymentFrequency;
    private Integer numberOfInstallments;
    private Integer installmentsPaid;
    private Integer installmentsRemaining;
    private Integer gracePeriodDays;
    private String interestMethod;  // flat or reducing
    private Double interestRate;
    
    // ===== LOAN CLASSIFICATION =====
    private String loanProduct;
    private String loanCategory;
    private String loanType;
    private String loanPurpose;
    
    // ===== DISBURSEMENT INFO =====
    private String disbursedByUser;  // User name who disbursed
    private String disbursedAccount;  // Account used
    
    // ===== COLLATERAL INFO =====
    private String collateralDescription;
    private BigDecimal collateralValue;
    
    /**
     * Payment DTO with enhanced user information
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentDTO {
        private Long id;
        private String paymentNumber;
        private LocalDate paymentDate;
        private Double amountPaid;
        private String paymentMethod;
        private String referenceNumber;
        private String notes;
        private Double principalPaid;
        private Double interestPaid;
        private Double feesPaid;
        private Double fine;
        private Double outstandingBalance;
        private String paymentStatus;
        private Boolean late;
        private Integer daysLate;
        private String recordedBy;       // User's full name
        private LocalDateTime createdAt;
    }
    
    /**
     * Workflow event with complete user data
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WorkflowEventDTO {
        private String action;
        private String performedBy;      // Full name
        private UserProfileDTO performer; // Complete user data (optional)
        private LocalDateTime timestamp;
        private String notes;
    }
}
