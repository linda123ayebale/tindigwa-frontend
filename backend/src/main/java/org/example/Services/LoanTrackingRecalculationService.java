package org.example.Services;

import org.example.Entities.LoanDetails;
import org.example.Entities.LoanPayments;
import org.example.Entities.LoanTracking;
import org.example.Repositories.LoanDetailsRepository;
import org.example.Repositories.LoanPaymentsRepository;
import org.example.Repositories.LoanTrackingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Service for recalculating loan tracking from payment history
 * 
 * This service rebuilds tracking state from scratch based on payment records,
 * useful for fixing data inconsistencies or migrating legacy data.
 */
@Service
public class LoanTrackingRecalculationService {
    
    @Autowired
    private LoanTrackingRepository trackingRepository;
    
    @Autowired
    private LoanDetailsRepository loanDetailsRepository;
    
    @Autowired
    private LoanPaymentsRepository loanPaymentsRepository;
    
    @Autowired
    private LoanTrackingService loanTrackingService;
    
    /**
     * Recalculate tracking for a specific loan from all payments
     */
    @Transactional
    public LoanTracking recalculateFromPayments(Long loanId) {
        // Get loan details
        Optional<LoanDetails> loanOpt = loanDetailsRepository.findById(loanId);
        if (loanOpt.isEmpty()) {
            throw new RuntimeException("Loan not found: " + loanId);
        }
        LoanDetails loan = loanOpt.get();
        
        // Get or create tracking record
        LoanTracking tracking = trackingRepository.findByLoanId(loanId)
            .orElseGet(() -> loanTrackingService.initializeTracking(loan));
        
        // Reset cumulative fields to zero
        tracking.setCumulativePayment(0.0);
        tracking.setCumulativePrincipalPaid(0.0);
        tracking.setCumulativeInterestPaid(0.0);
        tracking.setCumulativeFeesPaid(0.0);
        tracking.setCumulativePenalty(0.0);
        tracking.setCumulativePenaltyPaid(0.0);
        tracking.setInstallmentsPaid(0);
        tracking.setEarlyPaymentCount(0);
        tracking.setOnTimePaymentCount(0);
        tracking.setLatePaymentCount(0);
        tracking.setLastPaymentDate(null);
        tracking.setLastPaymentAmount(null);
        
        // Get all payments for this loan (ordered by date)
        List<LoanPayments> payments = loanPaymentsRepository.findByLoanIdOrderByPaymentDateAsc(loanId);
        
        // Process each payment in chronological order
        for (LoanPayments payment : payments) {
            // Skip cancelled or invalid payments
            if ("CANCELLED".equals(payment.getPaymentStatus()) || payment.getAmountPaid() <= 0) {
                continue;
            }
            
            // Update cumulative totals
            tracking.setCumulativePayment(tracking.getCumulativePayment() + payment.getAmountPaid());
            tracking.setCumulativePrincipalPaid(tracking.getCumulativePrincipalPaid() + payment.getPrincipalPaid());
            tracking.setCumulativeInterestPaid(tracking.getCumulativeInterestPaid() + payment.getInterestPaid());
            tracking.setCumulativeFeesPaid(tracking.getCumulativeFeesPaid() + payment.getFeesPaid());
            
            if (payment.getFine() > 0) {
                tracking.setCumulativePenalty(tracking.getCumulativePenalty() + payment.getFine());
                tracking.setCumulativePenaltyPaid(tracking.getCumulativePenaltyPaid() + payment.getFine());
            }
            
            // Update payment counts
            tracking.setInstallmentsPaid(tracking.getInstallmentsPaid() + 1);
            
            // Track last payment
            tracking.setLastPaymentDate(payment.getPaymentDate());
            tracking.setLastPaymentAmount(payment.getAmountPaid());
            
            // Update payment timing counts (early/on-time/late)
            if (payment.isLate()) {
                tracking.setLatePaymentCount(tracking.getLatePaymentCount() + 1);
            } else {
                tracking.setOnTimePaymentCount(tracking.getOnTimePaymentCount() + 1);
            }
            
            // Track payment characteristics
            if (payment.isPartialPayment()) {
                tracking.setHasPartialPayments(true);
            }
            if (payment.isOverpayment()) {
                tracking.setHasOverpayments(true);
            }
        }
        
        // Recalculate all derived fields
        tracking.calculateOutstandingBalances();
        tracking.calculateRemainingInstallments();
        tracking.calculateCompletionPercentage();
        tracking.calculateFinancialMetrics();
        tracking.calculatePaymentBehaviorScore();
        tracking.calculateDefaultRiskScore();
        
        // Update loan status based on completion
        if (tracking.getCompletionPercentage() != null && tracking.getCompletionPercentage() >= 99.9) {
            tracking.setLoanStatus("COMPLETED");
            tracking.setIsCurrent(true);
            tracking.setIsLate(false);
            tracking.setDaysLate(0);
            tracking.setPaymentStatus("COMPLETED");
        } else if (tracking.getOutstandingBalance() <= 0.01) {
            // Also mark as completed if outstanding balance is essentially zero
            tracking.setLoanStatus("COMPLETED");
            tracking.setIsCurrent(true);
            tracking.setIsLate(false);
            tracking.setDaysLate(0);
            tracking.setPaymentStatus("COMPLETED");
        } else {
            tracking.setLoanStatus("ACTIVE");
        }
        
        return trackingRepository.save(tracking);
    }
    
    /**
     * Recalculate tracking for all loans
     */
    @Transactional
    public RecalculationResult recalculateAllLoans() {
        List<LoanDetails> allLoans = loanDetailsRepository.findAll();
        int successCount = 0;
        int failureCount = 0;
        StringBuilder errors = new StringBuilder();
        
        for (LoanDetails loan : allLoans) {
            try {
                recalculateFromPayments(loan.getId());
                successCount++;
                System.out.println("Successfully recalculated tracking for loan: " + loan.getLoanNumber());
            } catch (Exception e) {
                failureCount++;
                String errorMsg = "Error recalculating loan " + loan.getId() + ": " + e.getMessage();
                System.err.println(errorMsg);
                errors.append(errorMsg).append("\n");
            }
        }
        
        return new RecalculationResult(successCount, failureCount, errors.toString());
    }
    
    /**
     * Recalculate tracking for loans with inconsistent data
     */
    @Transactional
    public RecalculationResult recalculateInconsistentLoans() {
        List<LoanDetails> allLoans = loanDetailsRepository.findAll();
        int successCount = 0;
        int failureCount = 0;
        StringBuilder errors = new StringBuilder();
        
        for (LoanDetails loan : allLoans) {
            try {
                Optional<LoanTracking> trackingOpt = trackingRepository.findByLoanId(loan.getId());
                if (trackingOpt.isEmpty()) {
                    // No tracking record - create one
                    recalculateFromPayments(loan.getId());
                    successCount++;
                    continue;
                }
                
                LoanTracking tracking = trackingOpt.get();
                
                // Check for inconsistencies
                boolean isInconsistent = tracking.getCumulativePayment() == null ||
                    tracking.getCumulativePrincipalPaid() == null ||
                    tracking.getOutstandingBalance() == null ||
                    (loanPaymentsRepository.hasAnyPayments(loan.getId()) && 
                     tracking.getCumulativePayment() == 0.0);
                
                if (isInconsistent) {
                    recalculateFromPayments(loan.getId());
                    successCount++;
                    System.out.println("Fixed inconsistent data for loan: " + loan.getLoanNumber());
                }
            } catch (Exception e) {
                failureCount++;
                String errorMsg = "Error checking/recalculating loan " + loan.getId() + ": " + e.getMessage();
                System.err.println(errorMsg);
                errors.append(errorMsg).append("\n");
            }
        }
        
        return new RecalculationResult(successCount, failureCount, errors.toString());
    }
    
    /**
     * Result object for batch recalculations
     */
    public static class RecalculationResult {
        private final int successCount;
        private final int failureCount;
        private final String errors;
        
        public RecalculationResult(int successCount, int failureCount, String errors) {
            this.successCount = successCount;
            this.failureCount = failureCount;
            this.errors = errors;
        }
        
        public int getSuccessCount() { return successCount; }
        public int getFailureCount() { return failureCount; }
        public String getErrors() { return errors; }
        public int getTotalProcessed() { return successCount + failureCount; }
        
        @Override
        public String toString() {
            return String.format("Recalculation completed: %d succeeded, %d failed out of %d total", 
                successCount, failureCount, getTotalProcessed());
        }
    }
}
