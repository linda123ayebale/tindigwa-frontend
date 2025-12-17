package org.example.Entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class LoanPayments {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "payment_number", unique = true, length = 8)
    private String paymentNumber;  // Universal payment ID (e.g., PM250001)
    
    // Basic Payment Information
    @Column(nullable = false)
    private Long loanId; // link to LoanDetail
    
    @Column(nullable = false)
    private LocalDate paymentDate;
    
    @Column(nullable = false)
    private double amountPaid;
    
    // Payment Method Information
    private String paymentMethod; // Cash, Bank Transfer, Mobile Money, etc.
    private String referenceNumber; // Transaction reference
    
    @Column(length = 1000)
    private String notes; // Additional payment notes
    
    // Schedule Integration
    private Integer installmentNumber; // Which installment this payment is for
    private double scheduledAmount; // What was the scheduled amount for this installment
    private double principalPaid; // How much went to principal
    private double interestPaid; // How much went to interest
    private double feesPaid; // How much went to fees
    
    // Balance Tracking
    private double cumulativePayment; // Total paid so far
    private double outstandingBalance; // Remaining balance after this payment
    private double principalBalance; // Remaining principal
    private double interestBalance; // Remaining interest
    
    // Late Payment Information
    private boolean late;
    private int daysLate; // How many days late this payment was
    private int gracePeriodDays;
    private double fine; // Penalty for this payment
    private double cumulativePenalty; // Total penalties so far
    private LocalDate fineTriggerDate;
    private int monthsOverdue;
    
    // System Fields
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long createdBy; // User who recorded this payment
    private String paymentStatus; // COMPLETED, PENDING, FAILED, REVERSED
    
    // Financial Tracking
    private double profit; // Profit from this payment
    private double penaltyIncome; // Income from penalties
    
    // Payment Allocation
    private boolean partialPayment; // If this was less than scheduled
    private boolean overpayment; // If this was more than scheduled
    private double overpaymentAmount; // Amount over the scheduled payment
    
    // Constructor for basic payment creation
    public LoanPayments(Long loanId, LocalDate paymentDate, double amountPaid, String paymentMethod) {
        this.loanId = loanId;
        this.paymentDate = paymentDate;
        this.amountPaid = amountPaid;
        this.paymentMethod = paymentMethod;
        this.createdAt = LocalDateTime.now();
        this.paymentStatus = "COMPLETED";
        this.late = false;
        this.partialPayment = false;
        this.overpayment = false;
    }
}
