package org.example.Entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * LoanTracking Entity
 * 
 * This entity maintains a real-time snapshot of loan state and financial metrics.
 * It is automatically updated via triggers and event listeners when:
 * - A loan is created
 * - A payment is made
 * 
 * This provides a single source of truth for loan status, balances, and performance metrics.
 */
@Entity
@Table(name = "loan_tracking")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LoanTracking {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // ===== LOAN REFERENCE =====
    @Column(name = "loan_id", nullable = false, unique = true)
    private Long loanId;                        // Reference to LoanDetails.id
    
    @Column(name = "loan_number")
    private String loanNumber;                  // Denormalized for quick lookup
    
    @Column(name = "client_id", nullable = false)
    private Long clientId;                      // Reference to client
    
    // ===== ORIGINAL LOAN AMOUNTS =====
    @Column(name = "original_principal", nullable = false)
    private Double originalPrincipal;           // Initial principal amount
    
    @Column(name = "original_interest")
    private Double originalInterest;            // Total interest calculated at loan creation
    
    @Column(name = "processing_fee")
    private Double processingFee;               // Processing fee
    
    @Column(name = "total_due", nullable = false)
    private Double totalDue;                    // Total amount to be repaid (principal + interest + fees)
    
    // ===== CUMULATIVE PAYMENT TRACKING =====
    @Column(name = "cumulative_payment")
    private Double cumulativePayment;     // Total amount paid so far
    
    @Column(name = "cumulative_principal_paid")
    private Double cumulativePrincipalPaid;   // Total principal paid
    
    @Column(name = "cumulative_interest_paid")
    private Double cumulativeInterestPaid;    // Total interest paid
    
    @Column(name = "cumulative_fees_paid")
    private Double cumulativeFeesPaid;        // Total fees paid
    
    @Column(name = "cumulative_penalty")
    private Double cumulativePenalty;         // Total penalties assessed
    
    @Column(name = "cumulative_penalty_paid")
    private Double cumulativePenaltyPaid;     // Total penalties actually paid
    
    // ===== OUTSTANDING BALANCES =====
    @Column(name = "outstanding_balance", nullable = false)
    private Double outstandingBalance;          // Total remaining to be paid
    
    @Column(name = "outstanding_principal")
    private Double outstandingPrincipal;        // Remaining principal
    
    @Column(name = "outstanding_interest")
    private Double outstandingInterest;         // Remaining interest
    
    @Column(name = "outstanding_fees")
    private Double outstandingFees;             // Remaining fees
    
    @Column(name = "outstanding_penalty")
    private Double outstandingPenalty;          // Remaining penalties
    
    // ===== PAYMENT SCHEDULE & STATUS =====
    @Column(name = "expected_payment_amount")
    private Double expectedPaymentAmount;       // Regular installment amount
    
    @Column(name = "payment_frequency")
    private String paymentFrequency;            // daily, weekly, monthly
    
    @Column(name = "total_installments")
    private Integer totalInstallments;          // Total number of payments expected
    
    @Column(name = "installments_paid")
    private Integer installmentsPaid;       // Number of payments made
    
    @Column(name = "installments_remaining")
    private Integer installmentsRemaining;      // Payments left
    
    @Column(name = "next_payment_due_date")
    private LocalDate nextPaymentDueDate;       // When next payment is due
    
    @Column(name = "last_payment_date")
    private LocalDate lastPaymentDate;          // Date of most recent payment
    
    @Column(name = "last_payment_amount")
    private Double lastPaymentAmount;           // Amount of most recent payment
    
    // ===== LATE PAYMENT TRACKING =====
    @Column(name = "is_late")
    private Boolean isLate;             // Is loan currently late?
    
    @Column(name = "days_late")
    private Integer daysLate;               // How many days past due
    
    @Column(name = "months_overdue")
    private Integer monthsOverdue;          // How many months overdue
    
    @Column(name = "late_payment_count")
    private Integer latePaymentCount;       // Number of late payments made
    
    @Column(name = "missed_payment_count")
    private Integer missedPaymentCount;     // Number of completely missed payments
    
    @Column(name = "grace_period_days")
    private Integer gracePeriodDays;            // Grace period before penalties
    
    @Column(name = "fine_trigger_date")
    private LocalDate fineTriggerDate;          // When penalties start applying
    
    // ===== PAYMENT CHARACTERISTICS =====
    @Column(name = "payment_status")
    private String paymentStatus;               // ON_TIME, LATE, DEFAULTED, GRACE_PERIOD
    
    @Column(name = "payment_pattern")
    private String paymentPattern;              // CONSISTENT, IRREGULAR, DETERIORATING
    
    @Column(name = "payment_behavior_score")
    private Double paymentBehaviorScore;        // 0-100 score based on payment history
    
    @Column(name = "has_partial_payments")
    private Boolean hasPartialPayments; // Has made partial payments
    
    @Column(name = "has_overpayments")
    private Boolean hasOverpayments;    // Has made overpayments
    
    @Column(name = "early_payment_count")
    private Integer earlyPaymentCount;      // Number of early payments
    
    @Column(name = "on_time_payment_count")
    private Integer onTimePaymentCount;     // Number of on-time payments
    
    // ===== FINANCIAL METRICS =====
    @Column(name = "payment_to_principal_ratio")
    private Double paymentToPrincipalRatio;     // What portion goes to principal
    
    @Column(name = "interest_coverage_ratio")
    private Double interestCoverageRatio;       // How well interest is being paid
    
    @Column(name = "default_risk_score")
    private Double defaultRiskScore;            // 0-100 risk score (higher = more risk)
    
    @Column(name = "profitability_index")
    private Double profitabilityIndex;          // Interest+fees collected / principal
    
    @Column(name = "recovery_rate")
    private Double recoveryRate;                // Amount recovered / total due
    
    @Column(name = "expected_profit")
    private Double expectedProfit;              // Expected total profit from loan
    
    @Column(name = "actual_profit")
    private Double actualProfit;                // Actual profit so far
    
    @Column(name = "expected_vs_actual_variance")
    private Double expectedVsActualVariance;    // Difference between expected and actual
    
    // ===== LOAN DATES =====
    @Column(name = "loan_release_date")
    private LocalDate loanReleaseDate;          // When loan was disbursed
    
    @Column(name = "loan_maturity_date")
    private LocalDate loanMaturityDate;         // When loan should be fully paid
    
    @Column(name = "expected_completion_date")
    private LocalDate expectedCompletionDate;   // Projected completion based on pattern
    
    @Column(name = "actual_completion_date")
    private LocalDate actualCompletionDate;     // When loan was actually completed
    
    // ===== LOAN STATUS =====
    @Column(name = "loan_status")
    private String loanStatus;                  // ACTIVE, COMPLETED, DEFAULTED, WRITTEN_OFF
    
    @Column(name = "completion_percentage")
    private Double completionPercentage;        // % of loan paid off
    
    @Column(name = "is_current")
    private Boolean isCurrent;           // Is loan current (not late)
    
    @Column(name = "is_defaulted")
    private Boolean isDefaulted;        // Has loan defaulted
    
    @Column(name = "default_date")
    private LocalDate defaultDate;              // When loan was marked as defaulted
    
    // ===== SYSTEM FIELDS =====
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    @Column(name = "last_calculated_at")
    private LocalDateTime lastCalculatedAt;     // When metrics were last calculated
    
    // ===== LIFECYCLE HOOKS =====
    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        this.lastCalculatedAt = now;
        
        // Initialize defaults
        if (this.cumulativePayment == null) this.cumulativePayment = 0.0;
        if (this.cumulativePrincipalPaid == null) this.cumulativePrincipalPaid = 0.0;
        if (this.cumulativeInterestPaid == null) this.cumulativeInterestPaid = 0.0;
        if (this.cumulativeFeesPaid == null) this.cumulativeFeesPaid = 0.0;
        if (this.cumulativePenalty == null) this.cumulativePenalty = 0.0;
        if (this.cumulativePenaltyPaid == null) this.cumulativePenaltyPaid = 0.0;
        if (this.installmentsPaid == null) this.installmentsPaid = 0;
        if (this.daysLate == null) this.daysLate = 0;
        if (this.monthsOverdue == null) this.monthsOverdue = 0;
        if (this.latePaymentCount == null) this.latePaymentCount = 0;
        if (this.missedPaymentCount == null) this.missedPaymentCount = 0;
        if (this.earlyPaymentCount == null) this.earlyPaymentCount = 0;
        if (this.onTimePaymentCount == null) this.onTimePaymentCount = 0;
        if (this.isLate == null) this.isLate = false;
        if (this.hasPartialPayments == null) this.hasPartialPayments = false;
        if (this.hasOverpayments == null) this.hasOverpayments = false;
        if (this.isCurrent == null) this.isCurrent = true;
        if (this.isDefaulted == null) this.isDefaulted = false;
        if (this.loanStatus == null) this.loanStatus = "ACTIVE";
        if (this.paymentStatus == null) this.paymentStatus = "ON_TIME";
    }
    
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
        this.lastCalculatedAt = LocalDateTime.now();
    }
    
    // ===== HELPER METHODS =====
    
    /**
     * Calculate completion percentage
     */
    public void calculateCompletionPercentage() {
        if (totalDue != null && totalDue > 0) {
            this.completionPercentage = (cumulativePayment / totalDue) * 100.0;
        }
    }
    
    /**
     * Calculate outstanding balances
     */
    public void calculateOutstandingBalances() {
        this.outstandingPrincipal = originalPrincipal - cumulativePrincipalPaid;
        this.outstandingInterest = (originalInterest != null ? originalInterest : 0.0) - cumulativeInterestPaid;
        this.outstandingFees = (processingFee != null ? processingFee : 0.0) - cumulativeFeesPaid;
        this.outstandingPenalty = cumulativePenalty - cumulativePenaltyPaid;
        this.outstandingBalance = totalDue + cumulativePenalty - cumulativePayment;
    }
    
    /**
     * Calculate remaining installments
     */
    public void calculateRemainingInstallments() {
        if (totalInstallments != null && installmentsPaid != null) {
            this.installmentsRemaining = totalInstallments - installmentsPaid;
        }
    }
    
    /**
     * Calculate financial metrics
     */
    public void calculateFinancialMetrics() {
        // Payment to principal ratio
        if (cumulativePayment > 0) {
            this.paymentToPrincipalRatio = cumulativePrincipalPaid / cumulativePayment;
        }
        
        // Interest coverage ratio
        if (originalInterest != null && originalInterest > 0) {
            this.interestCoverageRatio = cumulativeInterestPaid / originalInterest;
        }
        
        // Recovery rate
        if (totalDue > 0) {
            this.recoveryRate = (cumulativePayment / totalDue) * 100.0;
        }
        
        // Profitability index
        if (originalPrincipal > 0) {
            this.profitabilityIndex = (cumulativeInterestPaid + cumulativeFeesPaid + cumulativePenaltyPaid) / originalPrincipal;
        }
        
        // Actual profit
        this.actualProfit = cumulativeInterestPaid + cumulativeFeesPaid + cumulativePenaltyPaid;
        
        // Expected profit
        if (originalInterest != null && processingFee != null) {
            this.expectedProfit = originalInterest + processingFee;
        }
        
        // Variance
        if (expectedProfit != null) {
            this.expectedVsActualVariance = actualProfit - expectedProfit;
        }
    }
    
    /**
     * Calculate default risk score (0-100, higher = more risk)
     */
    public void calculateDefaultRiskScore() {
        double risk = 0.0;
        
        // Factor 1: Days late (up to 30 points)
        if (daysLate != null && daysLate > 0) {
            risk += Math.min(daysLate * 0.5, 30.0);
        }
        
        // Factor 2: Missed payments (10 points each, up to 30)
        if (missedPaymentCount != null) {
            risk += Math.min(missedPaymentCount * 10.0, 30.0);
        }
        
        // Factor 3: Late payment frequency (up to 20 points)
        if (latePaymentCount != null && installmentsPaid != null && installmentsPaid > 0) {
            double lateRatio = (double) latePaymentCount / installmentsPaid;
            risk += lateRatio * 20.0;
        }
        
        // Factor 4: Payment behavior score inverse (up to 20 points)
        if (paymentBehaviorScore != null) {
            risk += (100 - paymentBehaviorScore) * 0.2;
        }
        
        this.defaultRiskScore = Math.min(risk, 100.0);
    }
    
    /**
     * Calculate payment behavior score (0-100, higher = better)
     */
    public void calculatePaymentBehaviorScore() {
        double score = 100.0;
        
        if (installmentsPaid != null && installmentsPaid > 0) {
            // Deduct for late payments
            if (latePaymentCount != null) {
                score -= (latePaymentCount / (double) installmentsPaid) * 30.0;
            }
            
            // Bonus for on-time payments
            if (onTimePaymentCount != null) {
                score += (onTimePaymentCount / (double) installmentsPaid) * 10.0;
            }
            
            // Bonus for early payments
            if (earlyPaymentCount != null) {
                score += (earlyPaymentCount / (double) installmentsPaid) * 5.0;
            }
            
            // Deduct for missed payments
            if (missedPaymentCount != null) {
                score -= missedPaymentCount * 10.0;
            }
        }
        
        this.paymentBehaviorScore = Math.max(0.0, Math.min(score, 100.0));
    }
}
