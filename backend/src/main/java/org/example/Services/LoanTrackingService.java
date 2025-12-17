package org.example.Services;

import org.example.Entities.LoanDetails;
import org.example.Entities.LoanPayments;
import org.example.Entities.LoanTracking;
import org.example.Repositories.LoanDetailsRepository;
import org.example.Repositories.LoanTrackingRepository;
import org.example.Repositories.LoanPaymentsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

/**
 * LoanTrackingService
 * 
 * Central service for managing loan tracking state and financial metrics.
 * This service is called by event listeners when:
 * - A loan is created
 * - A payment is made
 * 
 * It handles:
 * - Initializing tracking records
 * - Processing payments and updating balances
 * - Calculating late payment status
 * - Computing financial metrics
 * - Determining payment characteristics
 */
@Service
public class LoanTrackingService {
    
    @Autowired
    private LoanTrackingRepository trackingRepository;
    
    @Autowired
    private LoanDetailsRepository loanDetailsRepository;
    
    @Autowired
    private LoanPaymentsRepository loanPaymentsRepository;
    
    // ===== INITIALIZATION =====
    
    /**
     * Initialize tracking for a new loan
     * Called when a loan is created
     */
    @Transactional
    public LoanTracking initializeTracking(LoanDetails loan) {
        // Check if tracking already exists
        if (trackingRepository.existsByLoanId(loan.getId())) {
            return trackingRepository.findByLoanId(loan.getId()).orElse(null);
        }
        
        LoanTracking tracking = new LoanTracking();
        
        // Set loan reference
        tracking.setLoanId(loan.getId());
        tracking.setLoanNumber(loan.getLoanNumber());
        tracking.setClientId(loan.getClientId());
        
        // Set original amounts
        tracking.setOriginalPrincipal(loan.getPrincipalAmount());
        tracking.setOriginalInterest(calculateTotalInterest(loan));
        tracking.setProcessingFee(loan.getProcessingFee());
        tracking.setTotalDue(loan.getTotalPayable());
        
        // Initialize outstanding balances (same as original since no payments yet)
        tracking.setOutstandingBalance(loan.getTotalPayable());
        tracking.setOutstandingPrincipal(loan.getPrincipalAmount());
        tracking.setOutstandingInterest(tracking.getOriginalInterest());
        tracking.setOutstandingFees(loan.getProcessingFee());
        tracking.setOutstandingPenalty(0.0);
        
        // Set payment schedule info
        tracking.setPaymentFrequency(loan.getRepaymentFrequency());
        tracking.setTotalInstallments(loan.getNumberOfRepayments());
        tracking.setInstallmentsRemaining(loan.getNumberOfRepayments());
        tracking.setExpectedPaymentAmount(loan.getTotalPayable() / loan.getNumberOfRepayments());
        tracking.setNextPaymentDueDate(loan.getFirstRepaymentDate() != null ? 
            loan.getFirstRepaymentDate() : loan.getPaymentStartDate());
        
        // Set dates
        tracking.setLoanReleaseDate(loan.getReleaseDate());
        tracking.setLoanMaturityDate(loan.getPaymentEndDate());
        tracking.setGracePeriodDays(loan.getGracePeriodDays());
        
        // Calculate fine trigger date (grace period after first payment due)
        if (tracking.getNextPaymentDueDate() != null && loan.getGracePeriodDays() > 0) {
            tracking.setFineTriggerDate(
                tracking.getNextPaymentDueDate().plusDays(loan.getGracePeriodDays())
            );
        }
        
        // Calculate initial metrics
        tracking.calculateCompletionPercentage();
        tracking.calculateFinancialMetrics();
        tracking.calculatePaymentBehaviorScore();
        tracking.calculateDefaultRiskScore();
        
        return trackingRepository.save(tracking);
    }
    
    // ===== PAYMENT PROCESSING =====
    
    /**
     * Process a payment and update tracking
     * Called when a payment is made
     */
    @Transactional
    public LoanTracking processPayment(LoanPayments payment, LoanDetails loan) {
        // Get or create tracking record
        LoanTracking tracking = trackingRepository.findByLoanId(loan.getId())
            .orElseGet(() -> initializeTracking(loan));
        
        // Update cumulative payments (null-safe for tracking fields)
        tracking.setCumulativePayment((tracking.getCumulativePayment() != null ? tracking.getCumulativePayment() : 0.0) + payment.getAmountPaid());
        tracking.setCumulativePrincipalPaid((tracking.getCumulativePrincipalPaid() != null ? tracking.getCumulativePrincipalPaid() : 0.0) + payment.getPrincipalPaid());
        tracking.setCumulativeInterestPaid((tracking.getCumulativeInterestPaid() != null ? tracking.getCumulativeInterestPaid() : 0.0) + payment.getInterestPaid());
        tracking.setCumulativeFeesPaid((tracking.getCumulativeFeesPaid() != null ? tracking.getCumulativeFeesPaid() : 0.0) + payment.getFeesPaid());
        
        // Update penalties (fine is primitive double, so check for > 0)
        if (payment.getFine() > 0) {
            tracking.setCumulativePenalty((tracking.getCumulativePenalty() != null ? tracking.getCumulativePenalty() : 0.0) + payment.getFine());
            tracking.setCumulativePenaltyPaid((tracking.getCumulativePenaltyPaid() != null ? tracking.getCumulativePenaltyPaid() : 0.0) + payment.getFine());
        }
        
        // Update payment counts
        tracking.setInstallmentsPaid((tracking.getInstallmentsPaid() != null ? tracking.getInstallmentsPaid() : 0) + 1);
        
        // Update last payment info
        tracking.setLastPaymentDate(payment.getPaymentDate());
        tracking.setLastPaymentAmount(payment.getAmountPaid());
        
        // Determine payment characteristics
        determinePaymentCharacteristics(tracking, payment, loan);
        
        // Calculate outstanding balances
        tracking.calculateOutstandingBalances();
        tracking.calculateRemainingInstallments();
        
        // Determine if late
        determineLateStatus(tracking, payment, loan);
        
        // Update next payment due date
        updateNextPaymentDueDate(tracking, loan);
        
        // Calculate all metrics
        tracking.calculateCompletionPercentage();
        tracking.calculateFinancialMetrics();
        tracking.calculatePaymentBehaviorScore();
        tracking.calculateDefaultRiskScore();
        
        // Update loan status
        updateLoanStatus(tracking);
        
        // Determine payment pattern
        determinePaymentPattern(tracking);
        
        return trackingRepository.save(tracking);
    }
    
    // ===== PAYMENT CHARACTERISTICS =====
    
    /**
     * Determine payment characteristics (early, on-time, late, partial, overpayment)
     */
    private void determinePaymentCharacteristics(LoanTracking tracking, LoanPayments payment, LoanDetails loan) {
        LocalDate dueDate = tracking.getNextPaymentDueDate();
        LocalDate paymentDate = payment.getPaymentDate();
        double expectedAmount = tracking.getExpectedPaymentAmount();
        double paidAmount = payment.getAmountPaid();
        
        // Check if payment is early, on-time, or late
        if (dueDate != null && paymentDate != null) {
            if (paymentDate.isBefore(dueDate)) {
                // Early payment
                tracking.setEarlyPaymentCount((tracking.getEarlyPaymentCount() != null ? tracking.getEarlyPaymentCount() : 0) + 1);
            } else if (paymentDate.isEqual(dueDate) || 
                       paymentDate.isBefore(dueDate.plusDays(tracking.getGracePeriodDays() != null ? 
                           tracking.getGracePeriodDays() : 0))) {
                // On-time payment (within grace period)
                tracking.setOnTimePaymentCount((tracking.getOnTimePaymentCount() != null ? tracking.getOnTimePaymentCount() : 0) + 1);
            } else {
                // Late payment
                tracking.setLatePaymentCount((tracking.getLatePaymentCount() != null ? tracking.getLatePaymentCount() : 0) + 1);
            }
        }
        
        // Check for partial payment
        if (expectedAmount > 0 && paidAmount < expectedAmount * 0.95) { // 95% threshold
            tracking.setHasPartialPayments(true);
        }
        
        // Check for overpayment
        if (expectedAmount > 0 && paidAmount > expectedAmount * 1.05) { // 105% threshold
            tracking.setHasOverpayments(true);
        }
    }
    
    // ===== LATE STATUS DETERMINATION =====
    
    /**
     * Determine if loan is late and calculate days late
     */
    private void determineLateStatus(LoanTracking tracking, LoanPayments payment, LoanDetails loan) {
        LocalDate today = LocalDate.now();
        LocalDate nextDueDate = tracking.getNextPaymentDueDate();
        
        if (nextDueDate != null && today.isAfter(nextDueDate)) {
            int gracePeriod = tracking.getGracePeriodDays() != null ? tracking.getGracePeriodDays() : 0;
            LocalDate gracePeriodEnd = nextDueDate.plusDays(gracePeriod);
            
            if (today.isAfter(gracePeriodEnd)) {
                // Loan is late
                tracking.setIsLate(true);
                tracking.setIsCurrent(false);
                tracking.setDaysLate((int) ChronoUnit.DAYS.between(gracePeriodEnd, today));
                tracking.setMonthsOverdue((int) (tracking.getDaysLate() / 30));
                tracking.setPaymentStatus("LATE");
            } else {
                // Within grace period
                tracking.setPaymentStatus("GRACE_PERIOD");
            }
        } else {
            // Not late
            tracking.setIsLate(false);
            tracking.setIsCurrent(true);
            tracking.setDaysLate(0);
            tracking.setMonthsOverdue(0);
            tracking.setPaymentStatus("ON_TIME");
        }
        
        // Check for default (e.g., 90 days late)
        if (tracking.getDaysLate() != null && tracking.getDaysLate() > 90) {
            tracking.setIsDefaulted(true);
            tracking.setPaymentStatus("DEFAULTED");
            if (tracking.getDefaultDate() == null) {
                tracking.setDefaultDate(LocalDate.now());
            }
        }
    }
    
    // ===== NEXT PAYMENT DUE DATE =====
    
    /**
     * Update next payment due date based on frequency
     */
    private void updateNextPaymentDueDate(LoanTracking tracking, LoanDetails loan) {
        if (tracking.getInstallmentsRemaining() != null && tracking.getInstallmentsRemaining() <= 0) {
            // No more payments due
            tracking.setNextPaymentDueDate(null);
            return;
        }
        
        LocalDate currentDueDate = tracking.getNextPaymentDueDate();
        if (currentDueDate == null) return;
        
        String frequency = tracking.getPaymentFrequency();
        if (frequency == null) frequency = "monthly";
        
        LocalDate nextDueDate;
        switch (frequency.toLowerCase()) {
            case "daily":
                nextDueDate = currentDueDate.plusDays(1);
                break;
            case "weekly":
                nextDueDate = currentDueDate.plusWeeks(1);
                break;
            case "monthly":
                nextDueDate = currentDueDate.plusMonths(1);
                break;
            case "quarterly":
                nextDueDate = currentDueDate.plusMonths(3);
                break;
            case "yearly":
                nextDueDate = currentDueDate.plusYears(1);
                break;
            default:
                nextDueDate = currentDueDate.plusMonths(1);
        }
        
        tracking.setNextPaymentDueDate(nextDueDate);
        
        // Update fine trigger date
        if (tracking.getGracePeriodDays() != null && tracking.getGracePeriodDays() > 0) {
            tracking.setFineTriggerDate(nextDueDate.plusDays(tracking.getGracePeriodDays()));
        }
    }
    
    // ===== LOAN STATUS =====
    
    /**
     * Update overall loan status
     */
    private void updateLoanStatus(LoanTracking tracking) {
        if (tracking.getIsDefaulted()) {
            tracking.setLoanStatus("DEFAULTED");
        } else if (tracking.getCompletionPercentage() != null && tracking.getCompletionPercentage() >= 99.9) {
            tracking.setLoanStatus("COMPLETED");
            tracking.setActualCompletionDate(LocalDate.now());
            tracking.setIsCurrent(true);
            tracking.setIsLate(false);
        } else {
            tracking.setLoanStatus("ACTIVE");
        }
    }
    
    // ===== PAYMENT PATTERN =====
    
    /**
     * Determine payment pattern based on history
     */
    private void determinePaymentPattern(LoanTracking tracking) {
        if (tracking.getInstallmentsPaid() == null || tracking.getInstallmentsPaid() < 3) {
            tracking.setPaymentPattern("INSUFFICIENT_DATA");
            return;
        }
        
        double lateRatio = tracking.getLatePaymentCount() / (double) tracking.getInstallmentsPaid();
        double onTimeRatio = tracking.getOnTimePaymentCount() / (double) tracking.getInstallmentsPaid();
        
        if (onTimeRatio >= 0.8) {
            tracking.setPaymentPattern("CONSISTENT");
        } else if (lateRatio > 0.3) {
            tracking.setPaymentPattern("DETERIORATING");
        } else {
            tracking.setPaymentPattern("IRREGULAR");
        }
    }
    
    // ===== HELPER METHODS =====
    
    /**
     * Calculate total interest from loan
     */
    private Double calculateTotalInterest(LoanDetails loan) {
        return loan.getTotalPayable() - loan.getPrincipalAmount() - loan.getProcessingFee();
    }
    
    // ===== PUBLIC QUERY METHODS =====
    
    /**
     * Get tracking by loan ID
     */
    public Optional<LoanTracking> getTrackingByLoanId(Long loanId) {
        return trackingRepository.findByLoanId(loanId);
    }
    
    /**
     * Get all tracking records for a client
     */
    public List<LoanTracking> getTrackingByClientId(Long clientId) {
        return trackingRepository.findByClientId(clientId);
    }
    
    /**
     * Get all late loans
     */
    public List<LoanTracking> getLateLoans() {
        return trackingRepository.findByIsLateTrue();
    }
    
    /**
     * Get all defaulted loans
     */
    public List<LoanTracking> getDefaultedLoans() {
        return trackingRepository.findByIsDefaultedTrue();
    }
    
    /**
     * Get high-risk loans (default risk score > threshold)
     */
    public List<LoanTracking> getHighRiskLoans(Double threshold) {
        return trackingRepository.findHighRiskLoans(threshold);
    }
    
    /**
     * Get loans due in date range
     */
    public List<LoanTracking> getLoansDueBetween(LocalDate startDate, LocalDate endDate) {
        return trackingRepository.findLoansDueBetween(startDate, endDate);
    }
    
    /**
     * Get total portfolio outstanding balance
     */
    public Double getTotalOutstandingBalance() {
        return trackingRepository.getTotalOutstandingBalance();
    }
    
    /**
     * Get portfolio at risk (loans late by more than X days)
     */
    public Double getPortfolioAtRisk(Integer days) {
        return trackingRepository.getPortfolioAtRisk(days);
    }
    
    /**
     * Recalculate metrics for a specific loan
     */
    @Transactional
    public LoanTracking recalculateMetrics(Long loanId) {
        Optional<LoanTracking> trackingOpt = trackingRepository.findByLoanId(loanId);
        if (trackingOpt.isEmpty()) return null;
        
        LoanTracking tracking = trackingOpt.get();
        
        // Recalculate all metrics
        tracking.calculateOutstandingBalances();
        tracking.calculateRemainingInstallments();
        tracking.calculateCompletionPercentage();
        tracking.calculateFinancialMetrics();
        tracking.calculatePaymentBehaviorScore();
        tracking.calculateDefaultRiskScore();
        
        // Recalculate late status
        Optional<LoanDetails> loanOpt = loanDetailsRepository.findById(loanId);
        if (loanOpt.isPresent()) {
            determineLateStatus(tracking, null, loanOpt.get());
            updateLoanStatus(tracking);
            determinePaymentPattern(tracking);
        }
        
        return trackingRepository.save(tracking);
    }
    
    /**
     * Recalculate metrics for all loans
     */
    @Transactional
    public int recalculateAllMetrics() {
        List<LoanTracking> allTracking = trackingRepository.findAll();
        int count = 0;
        
        for (LoanTracking tracking : allTracking) {
            try {
                recalculateMetrics(tracking.getLoanId());
                count++;
            } catch (Exception e) {
                System.err.println("Error recalculating metrics for loan " + tracking.getLoanId() + ": " + e.getMessage());
            }
        }
        
        return count;
    }
}
