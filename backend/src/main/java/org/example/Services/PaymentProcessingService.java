package org.example.Services;

import org.example.Entities.LoanDetails;
import org.example.Entities.LoanPayments;
import org.example.Entities.LoanInstallmentSchedule;
import org.example.Events.PaymentMadeEvent;
import org.example.Events.InstallmentPaidEvent;
import org.example.Repositories.LoanDetailsRepository;
import org.example.Repositories.LoanPaymentsRepository;
import org.example.Repositories.LoanInstallmentScheduleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Transactional
public class PaymentProcessingService {

    @Autowired
    private LoanPaymentsRepository paymentRepository;
    
    @Autowired
    private LoanDetailsRepository loanRepository;
    
    @Autowired
    private LoanDetailsService loanDetailsService;
    
    @Autowired
    private LoanInstallmentScheduleRepository installmentRepository;
    
    @Autowired
    private ApplicationEventPublisher eventPublisher;

    /**
     * Process a new payment with automatic balance calculation and schedule updates
     */
    public PaymentResult processPayment(PaymentRequest request) {
        try {
            // Validate the loan exists and is active
            Optional<LoanDetails> loanOpt = loanRepository.findById(request.getLoanId());
            if (loanOpt.isEmpty()) {
                return PaymentResult.failure("Loan not found with ID: " + request.getLoanId());
            }
            
            LoanDetails loan = loanOpt.get();
            
            // Validate payment amount
            if (request.getAmount() <= 0) {
                return PaymentResult.failure("Payment amount must be greater than zero");
            }
            
            // Get current payment summary
            PaymentSummary currentSummary = getPaymentSummary(request.getLoanId());
            
            // Calculate payment allocation
            PaymentAllocation allocation = calculatePaymentAllocation(loan, currentSummary, request.getAmount());
            
            // Check for overpayment
            boolean isOverpayment = request.getAmount() > allocation.getTotalDue();
            double overpaymentAmount = isOverpayment ? request.getAmount() - allocation.getTotalDue() : 0;
            
            // Determine if payment is late
            boolean isLate = isPaymentLate(loan, request.getPaymentDate());
            int daysLate = isLate ? calculateDaysLate(loan, request.getPaymentDate()) : 0;
            
            // Calculate next installment number
            int installmentNumber = calculateNextInstallmentNumber(request.getLoanId());
            
            // Create the payment record
            LoanPayments payment = new LoanPayments();
            payment.setLoanId(request.getLoanId());
            payment.setPaymentDate(request.getPaymentDate());
            payment.setAmountPaid(request.getAmount());
            payment.setPaymentMethod(request.getPaymentMethod());
            payment.setReferenceNumber(request.getReferenceNumber());
            payment.setNotes(request.getNotes());
            
            // Set allocation details
            payment.setPrincipalPaid(allocation.getPrincipalAmount());
            payment.setInterestPaid(allocation.getInterestAmount());
            payment.setFeesPaid(allocation.getFeesAmount());
            payment.setFine(allocation.getPenaltyAmount());
            
            // Set balance details
            payment.setCumulativePayment(currentSummary.getTotalPaid() + request.getAmount());
            payment.setOutstandingBalance(Math.max(0, allocation.getTotalDue() - request.getAmount()));
            payment.setPrincipalBalance(allocation.getRemainingPrincipal());
            payment.setInterestBalance(allocation.getRemainingInterest());
            
            // Set payment characteristics
            payment.setLate(isLate);
            payment.setDaysLate(daysLate);
            payment.setPartialPayment(request.getAmount() < allocation.getScheduledAmount());
            payment.setOverpayment(isOverpayment);
            payment.setOverpaymentAmount(overpaymentAmount);
            payment.setInstallmentNumber(installmentNumber);
            payment.setScheduledAmount(allocation.getScheduledAmount());
            
            // Set system fields
            payment.setCreatedAt(LocalDateTime.now());
            payment.setCreatedBy(request.getCreatedBy());
            payment.setPaymentStatus("COMPLETED");
            payment.setGracePeriodDays(loan.getGracePeriodDays());
            
            // Calculate financial metrics
            payment.setProfit(allocation.getInterestAmount() + allocation.getFeesAmount() + allocation.getPenaltyAmount());
            payment.setPenaltyIncome(allocation.getPenaltyAmount());
            payment.setCumulativePenalty(currentSummary.getTotalPenalties() + allocation.getPenaltyAmount());
            
            // Save the payment
            LoanPayments savedPayment = paymentRepository.save(payment);
            
            // Update corresponding installment
            updateInstallmentWithPayment(loan.getId(), savedPayment, allocation);
            
            // Publish payment made event for tracking system
            try {
                eventPublisher.publishEvent(new PaymentMadeEvent(this, savedPayment, loan));
            } catch (Exception e) {
                System.err.println("Error publishing payment made event: " + e.getMessage());
            }
            
            // Update loan totals
            updateLoanAfterPayment(loan, savedPayment, currentSummary);
            
            return PaymentResult.success(savedPayment, allocation);
            
        } catch (Exception e) {
            return PaymentResult.failure("Payment processing failed: " + e.getMessage());
        }
    }

    /**
     * Calculate how payment amount should be allocated across principal, interest, fees, penalties
     */
    private PaymentAllocation calculatePaymentAllocation(LoanDetails loan, PaymentSummary currentSummary, double paymentAmount) {
        PaymentAllocation allocation = new PaymentAllocation();
        
        // Get loan totals
        double totalDue = loan.getTotalPayable();
        double principalAmount = loan.getPrincipalAmount();
        double interestAmount = totalDue - principalAmount - loan.getProcessingFee();
        double feesAmount = loan.getProcessingFee();
        
        // Calculate remaining amounts
        double remainingTotal = totalDue - currentSummary.getTotalPaid();
        double remainingPrincipal = principalAmount - currentSummary.getTotalPrincipal();
        double remainingInterest = interestAmount - currentSummary.getTotalInterest();
        double remainingFees = feesAmount - currentSummary.getTotalFees();
        
        // Calculate penalties for late payment
        double penaltyAmount = calculatePenalty(loan, paymentAmount);
        
        // Total amount needed including penalties
        double totalNeeded = remainingTotal + penaltyAmount;
        
        // Allocate payment (priority: penalties -> fees -> interest -> principal)
        double remainingPayment = paymentAmount;
        
        // 1. Allocate to penalties first
        double penaltyPaid = Math.min(remainingPayment, penaltyAmount);
        remainingPayment -= penaltyPaid;
        
        // 2. Allocate to fees
        double feesPaid = Math.min(remainingPayment, remainingFees);
        remainingPayment -= feesPaid;
        
        // 3. Allocate to interest
        double interestPaid = Math.min(remainingPayment, remainingInterest);
        remainingPayment -= interestPaid;
        
        // 4. Remaining goes to principal
        double principalPaid = Math.min(remainingPayment, remainingPrincipal);
        
        // Set allocation results
        allocation.setPrincipalAmount(principalPaid);
        allocation.setInterestAmount(interestPaid);
        allocation.setFeesAmount(feesPaid);
        allocation.setPenaltyAmount(penaltyPaid);
        allocation.setRemainingPrincipal(remainingPrincipal - principalPaid);
        allocation.setRemainingInterest(remainingInterest - interestPaid);
        allocation.setTotalDue(totalNeeded);
        allocation.setScheduledAmount(calculateScheduledInstallmentAmount(loan));
        
        return allocation;
    }

    /**
     * Get comprehensive payment summary for a loan
     */
    public PaymentSummary getPaymentSummary(Long loanId) {
        PaymentSummary summary = new PaymentSummary();
        
        Double totalPaid = paymentRepository.getTotalPaidByLoanId(loanId);
        Double totalPrincipal = paymentRepository.getTotalPrincipalPaidByLoanId(loanId);
        Double totalInterest = paymentRepository.getTotalInterestPaidByLoanId(loanId);
        Double totalFees = paymentRepository.getTotalFeesPaidByLoanId(loanId);
        Double totalPenalties = paymentRepository.getTotalPenaltyByLoanId(loanId);
        Long paymentCount = paymentRepository.getPaymentCountByLoanId(loanId);
        Long latePaymentCount = paymentRepository.getLatePaymentCountByLoanId(loanId);
        
        summary.setTotalPaid(totalPaid != null ? totalPaid : 0.0);
        summary.setTotalPrincipal(totalPrincipal != null ? totalPrincipal : 0.0);
        summary.setTotalInterest(totalInterest != null ? totalInterest : 0.0);
        summary.setTotalFees(totalFees != null ? totalFees : 0.0);
        summary.setTotalPenalties(totalPenalties != null ? totalPenalties : 0.0);
        summary.setPaymentCount(paymentCount != null ? paymentCount.intValue() : 0);
        summary.setLatePaymentCount(latePaymentCount != null ? latePaymentCount.intValue() : 0);
        
        // Get latest payment for additional details
        Optional<LoanPayments> latestPayment = paymentRepository.findTopByLoanIdOrderByPaymentDateDesc(loanId);
        if (latestPayment.isPresent()) {
            summary.setLastPaymentDate(latestPayment.get().getPaymentDate());
            summary.setOutstandingBalance(latestPayment.get().getOutstandingBalance());
        }
        
        return summary;
    }

    /**
     * Get payment history for a loan
     */
    public List<LoanPayments> getPaymentHistory(Long loanId) {
        return paymentRepository.findByLoanIdOrderByPaymentDateDesc(loanId);
    }

    /**
     * Calculate loan balance after payments
     */
    public LoanBalance calculateLoanBalance(Long loanId) {
        Optional<LoanDetails> loanOpt = loanRepository.findById(loanId);
        if (loanOpt.isEmpty()) {
            return null;
        }
        
        LoanDetails loan = loanOpt.get();
        PaymentSummary summary = getPaymentSummary(loanId);
        
        LoanBalance balance = new LoanBalance();
        balance.setLoanId(loanId);
        balance.setTotalLoanAmount(loan.getTotalPayable());
        balance.setPrincipalAmount(loan.getPrincipalAmount());
        balance.setInterestAmount(loan.getTotalPayable() - loan.getPrincipalAmount() - loan.getProcessingFee());
        balance.setFeesAmount(loan.getProcessingFee());
        
        balance.setTotalPaid(summary.getTotalPaid());
        balance.setPrincipalPaid(summary.getTotalPrincipal());
        balance.setInterestPaid(summary.getTotalInterest());
        balance.setFeesPaid(summary.getTotalFees());
        balance.setPenaltiesPaid(summary.getTotalPenalties());
        
        balance.setOutstandingBalance(Math.max(0, loan.getTotalPayable() - summary.getTotalPaid()));
        balance.setRemainingPrincipal(Math.max(0, loan.getPrincipalAmount() - summary.getTotalPrincipal()));
        balance.setRemainingInterest(Math.max(0, balance.getInterestAmount() - summary.getTotalInterest()));
        balance.setRemainingFees(Math.max(0, loan.getProcessingFee() - summary.getTotalFees()));
        
        balance.setPaymentCount(summary.getPaymentCount());
        balance.setLatePaymentCount(summary.getLatePaymentCount());
        balance.setLastPaymentDate(summary.getLastPaymentDate());
        
        return balance;
    }

    // Helper methods
    private boolean isPaymentLate(LoanDetails loan, LocalDate paymentDate) {
        if (loan.getPaymentStartDate() == null) return false;
        LocalDate dueDate = loan.getPaymentStartDate().plusDays(loan.getGracePeriodDays());
        return paymentDate.isAfter(dueDate);
    }

    private int calculateDaysLate(LoanDetails loan, LocalDate paymentDate) {
        if (loan.getPaymentStartDate() == null) return 0;
        LocalDate dueDate = loan.getPaymentStartDate().plusDays(loan.getGracePeriodDays());
        return paymentDate.isAfter(dueDate) ? (int) ChronoUnit.DAYS.between(dueDate, paymentDate) : 0;
    }

    private double calculatePenalty(LoanDetails loan, double paymentAmount) {
        // Simple penalty calculation - can be enhanced
        return loan.getLateFee();
    }

    private int calculateNextInstallmentNumber(Long loanId) {
        // Get next unpaid installment from schedule
        Optional<LoanInstallmentSchedule> nextInstallment = installmentRepository.findNextUnpaidInstallment(loanId);
        if (nextInstallment.isPresent()) {
            return nextInstallment.get().getInstallmentNumber();
        }
        
        // Fallback to payment history
        Optional<LoanPayments> lastPayment = paymentRepository.findTopByLoanIdOrderByInstallmentNumberDesc(loanId);
        if (lastPayment.isPresent() && lastPayment.get().getInstallmentNumber() != null) {
            return lastPayment.get().getInstallmentNumber() + 1;
        }
        return 1;
    }

    private double calculateScheduledInstallmentAmount(LoanDetails loan) {
        if (loan.getNumberOfRepayments() > 0) {
            return loan.getTotalPayable() / loan.getNumberOfRepayments();
        }
        return loan.getTotalPayable();
    }

    private void updateLoanAfterPayment(LoanDetails loan, LoanPayments payment, PaymentSummary currentSummary) {
        // Update loan's amount paid
        double newTotalPaid = currentSummary.getTotalPaid() + payment.getAmountPaid();
        
        // Update loan status if fully paid
        if (payment.getOutstandingBalance() <= 0.01) {
            loan.setLoanStatus("closed");
        }
        
        // Save updated loan
        loanRepository.save(loan);
    }
    
    /**
     * Update installment schedule with payment information
     */
    private void updateInstallmentWithPayment(Long loanId, LoanPayments payment, PaymentAllocation allocation) {
        try {
            // Find the installment this payment corresponds to
            Optional<LoanInstallmentSchedule> installmentOpt = installmentRepository
                .findByLoanIdAndInstallmentNumber(loanId, payment.getInstallmentNumber());
            
            if (installmentOpt.isEmpty()) {
                System.err.println("Warning: No installment found for payment. Loan: " + loanId + 
                    ", Installment: " + payment.getInstallmentNumber());
                return;
            }
            
            LoanInstallmentSchedule installment = installmentOpt.get();
            
            // Update installment with payment details
            double previousPaidAmount = installment.getPaidAmount() != null ? installment.getPaidAmount() : 0.0;
            double newPaidAmount = previousPaidAmount + payment.getAmountPaid();
            
            installment.setPaidAmount(newPaidAmount);
            installment.setActualPrincipalPaid(payment.getPrincipalPaid());
            installment.setActualInterestPaid(payment.getInterestPaid());
            installment.setActualFeesPaid(payment.getFeesPaid());
            installment.setPaidDate(payment.getPaymentDate());
            installment.setPaymentId(payment.getId());
            
            // Update outstanding amount
            double newOutstanding = Math.max(0, installment.getScheduledAmount() - newPaidAmount);
            installment.setOutstandingAmount(newOutstanding);
            
            // Determine if fully paid, partial, or late
            boolean fullyPaid = newPaidAmount >= installment.getScheduledAmount();
            boolean isPartial = newPaidAmount > 0 && newPaidAmount < installment.getScheduledAmount();
            boolean isLate = payment.isLate();
            
            installment.setIsPaid(fullyPaid);
            installment.setIsPartial(isPartial);
            installment.setIsLate(isLate);
            
            if (payment.getDaysLate() > 0) {
                installment.setDaysLate(payment.getDaysLate());
            }
            
            if (payment.getFine() > 0) {
                installment.setPenaltyAmount(payment.getFine());
                installment.setPenaltyAppliedDate(payment.getPaymentDate());
            }
            
            // Update status
            installment.updateStatus();
            
            // Save installment
            installmentRepository.save(installment);
            
            // Publish installment paid event
            eventPublisher.publishEvent(new InstallmentPaidEvent(
                this, installment, payment, fullyPaid, isPartial, isLate
            ));
            
        } catch (Exception e) {
            System.err.println("Error updating installment with payment: " + e.getMessage());
            e.printStackTrace();
        }
    }

    // Inner classes for structured responses
    public static class PaymentRequest {
        private Long loanId;
        private double amount;
        private LocalDate paymentDate;
        private String paymentMethod;
        private String referenceNumber;
        private String notes;
        private Long createdBy;

        // Constructors
        public PaymentRequest() {}
        
        public PaymentRequest(Long loanId, double amount, LocalDate paymentDate, String paymentMethod) {
            this.loanId = loanId;
            this.amount = amount;
            this.paymentDate = paymentDate;
            this.paymentMethod = paymentMethod;
        }

        // Getters and Setters
        public Long getLoanId() { return loanId; }
        public void setLoanId(Long loanId) { this.loanId = loanId; }
        public double getAmount() { return amount; }
        public void setAmount(double amount) { this.amount = amount; }
        public LocalDate getPaymentDate() { return paymentDate; }
        public void setPaymentDate(LocalDate paymentDate) { this.paymentDate = paymentDate; }
        public String getPaymentMethod() { return paymentMethod; }
        public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
        public String getReferenceNumber() { return referenceNumber; }
        public void setReferenceNumber(String referenceNumber) { this.referenceNumber = referenceNumber; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
        public Long getCreatedBy() { return createdBy; }
        public void setCreatedBy(Long createdBy) { this.createdBy = createdBy; }
    }

    public static class PaymentResult {
        private boolean success;
        private String message;
        private LoanPayments payment;
        private PaymentAllocation allocation;

        public static PaymentResult success(LoanPayments payment, PaymentAllocation allocation) {
            PaymentResult result = new PaymentResult();
            result.success = true;
            result.message = "Payment processed successfully";
            result.payment = payment;
            result.allocation = allocation;
            return result;
        }

        public static PaymentResult failure(String message) {
            PaymentResult result = new PaymentResult();
            result.success = false;
            result.message = message;
            return result;
        }

        // Getters
        public boolean isSuccess() { return success; }
        public String getMessage() { return message; }
        public LoanPayments getPayment() { return payment; }
        public PaymentAllocation getAllocation() { return allocation; }
    }

    public static class PaymentAllocation {
        private double principalAmount;
        private double interestAmount;
        private double feesAmount;
        private double penaltyAmount;
        private double remainingPrincipal;
        private double remainingInterest;
        private double totalDue;
        private double scheduledAmount;

        // Getters and Setters
        public double getPrincipalAmount() { return principalAmount; }
        public void setPrincipalAmount(double principalAmount) { this.principalAmount = principalAmount; }
        public double getInterestAmount() { return interestAmount; }
        public void setInterestAmount(double interestAmount) { this.interestAmount = interestAmount; }
        public double getFeesAmount() { return feesAmount; }
        public void setFeesAmount(double feesAmount) { this.feesAmount = feesAmount; }
        public double getPenaltyAmount() { return penaltyAmount; }
        public void setPenaltyAmount(double penaltyAmount) { this.penaltyAmount = penaltyAmount; }
        public double getRemainingPrincipal() { return remainingPrincipal; }
        public void setRemainingPrincipal(double remainingPrincipal) { this.remainingPrincipal = remainingPrincipal; }
        public double getRemainingInterest() { return remainingInterest; }
        public void setRemainingInterest(double remainingInterest) { this.remainingInterest = remainingInterest; }
        public double getTotalDue() { return totalDue; }
        public void setTotalDue(double totalDue) { this.totalDue = totalDue; }
        public double getScheduledAmount() { return scheduledAmount; }
        public void setScheduledAmount(double scheduledAmount) { this.scheduledAmount = scheduledAmount; }
    }

    public static class PaymentSummary {
        private double totalPaid;
        private double totalPrincipal;
        private double totalInterest;
        private double totalFees;
        private double totalPenalties;
        private int paymentCount;
        private int latePaymentCount;
        private LocalDate lastPaymentDate;
        private double outstandingBalance;

        // Getters and Setters
        public double getTotalPaid() { return totalPaid; }
        public void setTotalPaid(double totalPaid) { this.totalPaid = totalPaid; }
        public double getTotalPrincipal() { return totalPrincipal; }
        public void setTotalPrincipal(double totalPrincipal) { this.totalPrincipal = totalPrincipal; }
        public double getTotalInterest() { return totalInterest; }
        public void setTotalInterest(double totalInterest) { this.totalInterest = totalInterest; }
        public double getTotalFees() { return totalFees; }
        public void setTotalFees(double totalFees) { this.totalFees = totalFees; }
        public double getTotalPenalties() { return totalPenalties; }
        public void setTotalPenalties(double totalPenalties) { this.totalPenalties = totalPenalties; }
        public int getPaymentCount() { return paymentCount; }
        public void setPaymentCount(int paymentCount) { this.paymentCount = paymentCount; }
        public int getLatePaymentCount() { return latePaymentCount; }
        public void setLatePaymentCount(int latePaymentCount) { this.latePaymentCount = latePaymentCount; }
        public LocalDate getLastPaymentDate() { return lastPaymentDate; }
        public void setLastPaymentDate(LocalDate lastPaymentDate) { this.lastPaymentDate = lastPaymentDate; }
        public double getOutstandingBalance() { return outstandingBalance; }
        public void setOutstandingBalance(double outstandingBalance) { this.outstandingBalance = outstandingBalance; }
    }

    public static class LoanBalance {
        private Long loanId;
        private double totalLoanAmount;
        private double principalAmount;
        private double interestAmount;
        private double feesAmount;
        private double totalPaid;
        private double principalPaid;
        private double interestPaid;
        private double feesPaid;
        private double penaltiesPaid;
        private double outstandingBalance;
        private double remainingPrincipal;
        private double remainingInterest;
        private double remainingFees;
        private int paymentCount;
        private int latePaymentCount;
        private LocalDate lastPaymentDate;

        // Getters and Setters
        public Long getLoanId() { return loanId; }
        public void setLoanId(Long loanId) { this.loanId = loanId; }
        public double getTotalLoanAmount() { return totalLoanAmount; }
        public void setTotalLoanAmount(double totalLoanAmount) { this.totalLoanAmount = totalLoanAmount; }
        public double getPrincipalAmount() { return principalAmount; }
        public void setPrincipalAmount(double principalAmount) { this.principalAmount = principalAmount; }
        public double getInterestAmount() { return interestAmount; }
        public void setInterestAmount(double interestAmount) { this.interestAmount = interestAmount; }
        public double getFeesAmount() { return feesAmount; }
        public void setFeesAmount(double feesAmount) { this.feesAmount = feesAmount; }
        public double getTotalPaid() { return totalPaid; }
        public void setTotalPaid(double totalPaid) { this.totalPaid = totalPaid; }
        public double getPrincipalPaid() { return principalPaid; }
        public void setPrincipalPaid(double principalPaid) { this.principalPaid = principalPaid; }
        public double getInterestPaid() { return interestPaid; }
        public void setInterestPaid(double interestPaid) { this.interestPaid = interestPaid; }
        public double getFeesPaid() { return feesPaid; }
        public void setFeesPaid(double feesPaid) { this.feesPaid = feesPaid; }
        public double getPenaltiesPaid() { return penaltiesPaid; }
        public void setPenaltiesPaid(double penaltiesPaid) { this.penaltiesPaid = penaltiesPaid; }
        public double getOutstandingBalance() { return outstandingBalance; }
        public void setOutstandingBalance(double outstandingBalance) { this.outstandingBalance = outstandingBalance; }
        public double getRemainingPrincipal() { return remainingPrincipal; }
        public void setRemainingPrincipal(double remainingPrincipal) { this.remainingPrincipal = remainingPrincipal; }
        public double getRemainingInterest() { return remainingInterest; }
        public void setRemainingInterest(double remainingInterest) { this.remainingInterest = remainingInterest; }
        public double getRemainingFees() { return remainingFees; }
        public void setRemainingFees(double remainingFees) { this.remainingFees = remainingFees; }
        public int getPaymentCount() { return paymentCount; }
        public void setPaymentCount(int paymentCount) { this.paymentCount = paymentCount; }
        public int getLatePaymentCount() { return latePaymentCount; }
        public void setLatePaymentCount(int latePaymentCount) { this.latePaymentCount = latePaymentCount; }
        public LocalDate getLastPaymentDate() { return lastPaymentDate; }
        public void setLastPaymentDate(LocalDate lastPaymentDate) { this.lastPaymentDate = lastPaymentDate; }
    }
}