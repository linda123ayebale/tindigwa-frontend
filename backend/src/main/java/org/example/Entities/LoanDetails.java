package org.example.Entities;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "loan_details")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoanDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // CLIENT & PRODUCT RELATIONSHIPS
    @Column(name = "client_id", nullable = false)
    private Long clientId;                    // Reference to User.id where role = CLIENT

    @Column(name = "product_id")
    private Long productId;                   // Reference to LoanProduct.id

    // LOAN IDENTIFICATION
    @Column(name = "loan_number", unique = true)
    private String loanNumber;                // Auto-generated loan number

    @Column(name = "loan_title")
    private String loanTitle;                 // Optional descriptive title

    @Column(name = "description")
    private String description;               // Loan purpose/description

    // AMOUNTS & DISBURSEMENT
    @Column(name = "principal_amount")        // Renamed from amountDisbursed
    private double principalAmount;

    @Column(name = "release_date")
    private LocalDate releaseDate;            // Date loan was/will be disbursed

    @Column(name = "disbursed_by")
    private String disbursedBy;               // "Cash", "Bank Transfer", "Mobile Money"

    @Column(name = "cash_bank_account")
    private String cashBankAccount;           // Account used for disbursement

    // INTEREST & TERMS CONFIGURATION
    @Column(name = "interest_method")
    private String interestMethod;            // "flat", "reducing", "compound"

    @Column(name = "interest_type")
    private String interestType;              // "percentage", "fixed"

    @Column(name = "interest_rate")
    private double interestRate;              // Interest rate (15.5 for 15.5%)

    @Column(name = "fixed_interest_amount")
    private Double fixedInterestAmount;       // Used when interestType = "fixed"

    @Column(name = "rate_per")
    private String ratePer;                   // "month", "year", "day"

    // LOAN DURATION
    @Column(name = "loan_duration")
    private int loanDuration;                 // Duration value (e.g., 6)

    @Column(name = "duration_unit")
    private String durationUnit;              // "days", "weeks", "months", "years"

    @Column(name = "loan_duration_days")      // Calculated field for backend use
    private int loanDurationDays;

    // REPAYMENT CONFIGURATION
    @Column(name = "repayment_frequency")
    private String repaymentFrequency;        // "daily", "weekly", "monthly"

    @Column(name = "number_of_repayments")
    private int numberOfRepayments;           // Total number of payments

    @Column(name = "grace_period_days")
    private int gracePeriodDays;              // Grace period before first payment

    // PAYMENT DATES
    @Column(name = "payment_start_date")
    private LocalDate paymentStartDate;       // When payments start

    @Column(name = "payment_end_date")
    private LocalDate paymentEndDate;         // When loan should be fully paid

    @Column(name = "first_repayment_date")
    private LocalDate firstRepaymentDate;     // Date of first payment

    @Column(name = "first_repayment_amount")
    private Double firstRepaymentAmount;      // Amount of first payment (if different)

    // FEES & CHARGES
    @Column(name = "processing_fee")          // Renamed from loanProcessingFee
    private double processingFee;

    @Column(name = "late_fee")
    private double lateFee;                   // Fee for late payments

    @Column(name = "default_fee")
    private double defaultFee;                // Fee for defaulting

    // CALCULATED AMOUNTS
    @Column(name = "total_payable")
    private double totalPayable;              // Total amount client must pay back

    // STATUS & BRANCH
    @Column(name = "loan_status")
    private String loanStatus;                // "pending", "approved", "disbursed", "active", "completed", "defaulted"

    @Column(name = "lending_branch")
    private String lendingBranch;             // Branch that issued the loan

    // AGREEMENTS & APPROVALS
    @Column(name = "agreement_signed")
    private boolean agreementSigned;          // Whether loan agreement is signed

    // SYSTEM FIELDS
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // WORKFLOW FIELDS
    @Column(name = "created_by_id")
    private Long createdById;                 // ID of loan officer who created this loan
    
    @Column(name = "approved_by_id")
    private Long approvedById;                // ID of cashier who approved this loan
    
    @Column(name = "approval_date")
    private LocalDateTime approvalDate;       // When loan was approved
    
    @Column(name = "disbursed_at")
    private LocalDateTime disbursedAt;        // When loan was disbursed
    
    @Column(name = "rejected_by_id")
    private Long rejectedById;                // ID of user who rejected this loan
    
    @Column(name = "workflow_status")
    private String workflowStatus;            // "PENDING_APPROVAL", "APPROVED", "REJECTED"
    
    @Column(name = "rejection_reason")
    private String rejectionReason;           // Reason for rejection if applicable
    
    @Column(name = "created_by")
    private String createdBy;                 // Legacy field - kept for compatibility
    
    // ARCHIVE FIELDS
    @Column(name = "archived")
    private boolean archived = false;         // Whether loan is archived
    
    @Column(name = "archived_date")
    private LocalDateTime archivedDate;       // When loan was archived

    // LIFECYCLE METHODS
    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        
        // ✅ FIXED: Set correct initial values - workflowStatus = PENDING_APPROVAL, loanStatus = OPEN
        if (this.workflowStatus == null) this.workflowStatus = "PENDING_APPROVAL";
        if (this.loanStatus == null) this.loanStatus = "OPEN";
        if (this.disbursedBy == null) this.disbursedBy = "Cash";
        if (this.interestMethod == null) this.interestMethod = "flat";
        if (this.interestType == null) this.interestType = "percentage";
        if (this.ratePer == null) this.ratePer = "month";
        if (this.durationUnit == null) this.durationUnit = "months";
        if (this.repaymentFrequency == null) this.repaymentFrequency = "monthly";
        if (this.lendingBranch == null) this.lendingBranch = "Main Branch";
        
        // Auto-generate loan number if not provided
        if (this.loanNumber == null || this.loanNumber.trim().isEmpty()) {
            this.loanNumber = "LN-" + System.currentTimeMillis();
        }
        
        // Calculate loan duration in days
        calculateLoanDurationDays();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
        calculateLoanDurationDays();
    }

    // HELPER METHODS
    private void calculateLoanDurationDays() {
        if (loanDuration > 0 && durationUnit != null) {
            switch (durationUnit.toLowerCase()) {
                case "days":
                    this.loanDurationDays = loanDuration;
                    break;
                case "weeks":
                    this.loanDurationDays = loanDuration * 7;
                    break;
                case "months":
                    this.loanDurationDays = loanDuration * 30; // Approximate
                    break;
                case "years":
                    this.loanDurationDays = loanDuration * 365;
                    break;
                default:
                    this.loanDurationDays = loanDuration * 30; // Default to months
            }
        }
    }

    // Calculate payment end date based on start date and duration
    public void calculatePaymentEndDate() {
        if (paymentStartDate != null && loanDurationDays > 0) {
            this.paymentEndDate = paymentStartDate.plusDays(loanDurationDays);
        }
    }

    // Get the effective interest rate (handles both percentage and fixed amounts)
    public double getEffectiveInterestRate() {
        if ("fixed".equalsIgnoreCase(interestType) && fixedInterestAmount != null && principalAmount > 0) {
            return (fixedInterestAmount / principalAmount) * 100; // Convert to percentage
        }
        return interestRate;
    }
}



