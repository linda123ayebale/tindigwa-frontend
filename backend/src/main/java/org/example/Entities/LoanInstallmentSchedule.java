package org.example.Entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * LoanInstallmentSchedule Entity
 * 
 * Represents individual payment installments for a loan.
 * Each installment tracks expected vs actual payments with detailed breakdown.
 */
@Entity
@Table(name = "loan_installment_schedule")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LoanInstallmentSchedule {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // ===== LOAN REFERENCE =====
    @Column(name = "loan_id", nullable = false)
    private Long loanId;                        // Reference to LoanDetails.id
    
    @Column(name = "installment_number", nullable = false)
    private Integer installmentNumber;          // 1, 2, 3, ... (sequential)
    
    // ===== SCHEDULED AMOUNTS =====
    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;                  // When this installment is due
    
    @Column(name = "scheduled_amount", nullable = false)
    private Double scheduledAmount;             // Total amount expected
    
    @Column(name = "principal_portion")
    private Double principalPortion;            // Expected principal payment
    
    @Column(name = "interest_portion")
    private Double interestPortion;             // Expected interest payment
    
    @Column(name = "fees_portion")
    private Double feesPortion;                 // Expected fees payment
    
    // ===== PAYMENT STATUS =====
    @Column(name = "status", nullable = false)
    private String status;                      // PENDING, PAID, PARTIAL, OVERDUE, GRACE_PERIOD
    
    @Column(name = "is_paid")
    private Boolean isPaid;                     // Quick check if fully paid
    
    // ===== ACTUAL PAYMENT =====
    @Column(name = "paid_amount")
    private Double paidAmount;                  // Actual amount received
    
    @Column(name = "actual_principal_paid")
    private Double actualPrincipalPaid;         // Actual principal received
    
    @Column(name = "actual_interest_paid")
    private Double actualInterestPaid;          // Actual interest received
    
    @Column(name = "actual_fees_paid")
    private Double actualFeesPaid;              // Actual fees received
    
    @Column(name = "paid_date")
    private LocalDate paidDate;                 // When payment was received
    
    @Column(name = "payment_id")
    private Long paymentId;                     // Link to LoanPayments.id
    
    // ===== BALANCE TRACKING =====
    @Column(name = "outstanding_amount")
    private Double outstandingAmount;           // Remaining amount for this installment
    
    @Column(name = "cumulative_paid")
    private Double cumulativePaid;              // Total paid up to this installment
    
    @Column(name = "cumulative_outstanding")
    private Double cumulativeOutstanding;       // Total remaining after this installment
    
    // ===== LATE PAYMENT TRACKING =====
    @Column(name = "is_late")
    private Boolean isLate;                     // Is this installment late?
    
    @Column(name = "days_late")
    private Integer daysLate;                   // How many days past due
    
    @Column(name = "grace_period_days")
    private Integer gracePeriodDays;            // Grace period before penalties
    
    @Column(name = "in_grace_period")
    private Boolean inGracePeriod;              // Currently in grace period
    
    @Column(name = "grace_expiry_date")
    private LocalDate graceExpiryDate;          // When grace period ends
    
    @Column(name = "penalty_amount")
    private Double penaltyAmount;               // Late fee for this installment
    
    @Column(name = "penalty_applied_date")
    private LocalDate penaltyAppliedDate;       // When penalty was applied
    
    // ===== PAYMENT CHARACTERISTICS =====
    @Column(name = "is_partial")
    private Boolean isPartial;                  // Was this a partial payment?
    
    @Column(name = "is_early")
    private Boolean isEarly;                    // Paid before due date?
    
    @Column(name = "days_early")
    private Integer daysEarly;                  // How many days early
    
    // ===== SYSTEM FIELDS =====
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "notes", length = 500)
    private String notes;                       // Additional notes
    
    // ===== LIFECYCLE METHODS =====
    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        
        // Set defaults
        if (this.status == null) this.status = "PENDING";
        if (this.isPaid == null) this.isPaid = false;
        if (this.isLate == null) this.isLate = false;
        if (this.isPartial == null) this.isPartial = false;
        if (this.isEarly == null) this.isEarly = false;
        if (this.inGracePeriod == null) this.inGracePeriod = false;
        if (this.daysLate == null) this.daysLate = 0;
        if (this.daysEarly == null) this.daysEarly = 0;
        if (this.paidAmount == null) this.paidAmount = 0.0;
        if (this.outstandingAmount == null) this.outstandingAmount = this.scheduledAmount;
        if (this.penaltyAmount == null) this.penaltyAmount = 0.0;
        
        // Calculate grace expiry date
        if (this.dueDate != null && this.gracePeriodDays != null && this.gracePeriodDays > 0) {
            this.graceExpiryDate = this.dueDate.plusDays(this.gracePeriodDays);
        }
    }
    
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
    // ===== HELPER METHODS =====
    
    /**
     * Check if this installment is currently overdue
     */
    public boolean isOverdue() {
        if (isPaid) return false;
        LocalDate today = LocalDate.now();
        
        // If grace period is set, use grace expiry date
        if (graceExpiryDate != null) {
            return today.isAfter(graceExpiryDate);
        }
        
        // Otherwise use due date
        return today.isAfter(dueDate);
    }
    
    /**
     * Check if currently in grace period
     */
    public boolean isInGracePeriod() {
        if (isPaid) return false;
        LocalDate today = LocalDate.now();
        
        if (graceExpiryDate == null) return false;
        
        return today.isAfter(dueDate) && today.isBefore(graceExpiryDate.plusDays(1));
    }
    
    /**
     * Calculate days late from today
     */
    public int calculateDaysLate() {
        if (isPaid) return 0;
        
        LocalDate today = LocalDate.now();
        LocalDate referenceDate = graceExpiryDate != null ? graceExpiryDate : dueDate;
        
        if (today.isAfter(referenceDate)) {
            return (int) java.time.temporal.ChronoUnit.DAYS.between(referenceDate, today);
        }
        
        return 0;
    }
    
    /**
     * Update status based on current state
     */
    public void updateStatus() {
        if (isPaid != null && isPaid) {
            this.status = "PAID";
        } else if (isPartial != null && isPartial) {
            this.status = "PARTIAL";
        } else if (isInGracePeriod()) {
            this.status = "GRACE_PERIOD";
            this.inGracePeriod = true;
        } else if (isOverdue()) {
            this.status = "OVERDUE";
            this.isLate = true;
            this.daysLate = calculateDaysLate();
        } else {
            this.status = "PENDING";
        }
    }
    
    /**
     * Get completion percentage for this installment
     */
    public double getCompletionPercentage() {
        if (scheduledAmount == null || scheduledAmount == 0) return 0.0;
        if (paidAmount == null) return 0.0;
        
        double percentage = (paidAmount / scheduledAmount) * 100;
        return Math.min(percentage, 100.0);
    }
}
