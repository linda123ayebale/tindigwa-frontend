package org.example.Services;

import org.example.Entities.LoanDetails;
import org.example.Entities.LoanPayments;
import org.example.Events.PaymentMadeEvent;
import org.example.Repositories.LoanDetailsRepository;
import org.example.Repositories.LoanPaymentsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class LoanPaymentsService {
    @Autowired
    private LoanPaymentsRepository repository;
    
    @Autowired
    private LoanDetailsRepository loanDetailsRepository;
    
    @Autowired
    private PaymentProcessingService paymentProcessingService;
    
    @Autowired
    private ApplicationEventPublisher eventPublisher;
    
    @Autowired
    private LoanDetailsService loanDetailsService;
    
    @Autowired
    private LoanWebSocketService loanWebSocketService;

    // Enhanced Create - with payment processing
    public LoanPayments createPayment(LoanPayments payment) {
        payment.setCreatedAt(LocalDateTime.now());
        payment.setUpdatedAt(LocalDateTime.now());
        if (payment.getPaymentStatus() == null) {
            payment.setPaymentStatus("COMPLETED");
        }
        LoanPayments savedPayment = repository.save(payment);
        
        // Update loan status immediately after payment
        try {
            LoanDetails loan = loanDetailsRepository.findById(payment.getLoanId())
                .orElseThrow(() -> new RuntimeException("Loan not found with id: " + payment.getLoanId()));
            
            // Update loan status based on new payment
            loanDetailsService.updateLoanStatusBasedOnPayments(loan);
            LoanDetails updatedLoan = loanDetailsRepository.save(loan);
            
            // Broadcast payment via WebSocket
            try {
                double cumulativeAmount = (savedPayment.getCumulativePayment() > 0) 
                    ? savedPayment.getCumulativePayment() 
                    : savedPayment.getAmountPaid();
                Double newBalance = updatedLoan.getTotalPayable() - cumulativeAmount;
                loanWebSocketService.broadcastPaymentAdded(
                    loan.getId(),
                    loan.getLoanNumber(),
                    savedPayment.getAmountPaid(),
                    newBalance
                );
                loanWebSocketService.broadcastToLoanDetails(loan.getId());
            } catch (Exception wsError) {
                System.err.println("Error broadcasting payment: " + wsError.getMessage());
            }
            
            // Publish payment made event for tracking system
            eventPublisher.publishEvent(new PaymentMadeEvent(this, savedPayment, loan));
        } catch (Exception e) {
            System.err.println("Error updating loan status or publishing event: " + e.getMessage());
        }
        
        return savedPayment;
    }
    
    // Create payment with full processing
    public PaymentProcessingService.PaymentResult processPayment(PaymentProcessingService.PaymentRequest request) {
        return paymentProcessingService.processPayment(request);
    }

    // Read all
    public List<LoanPayments> getAllPayments() {
        return repository.findAll();
    }
    
    // Get payments by loan ID
    public List<LoanPayments> getPaymentsByLoanId(Long loanId) {
        return repository.findByLoanIdOrderByPaymentDateDesc(loanId);
    }
    
    // Get payment history for a loan
    public List<LoanPayments> getPaymentHistory(Long loanId) {
        return repository.findByLoanIdOrderByPaymentDateAsc(loanId);
    }
    
    // Get payments by status
    public List<LoanPayments> getPaymentsByStatus(String status) {
        return repository.findByPaymentStatus(status);
    }
    
    // Get payments in date range
    public List<LoanPayments> getPaymentsByDateRange(LocalDate startDate, LocalDate endDate) {
        return repository.findByPaymentDateBetween(startDate, endDate);
    }
    
    // Get payments by method
    public List<LoanPayments> getPaymentsByMethod(String paymentMethod) {
        return repository.findByPaymentMethod(paymentMethod);
    }
    
    // Get late payments
    public List<LoanPayments> getLatePayments() {
        return repository.findByLateTrue();
    }
    
    // Get partial payments
    public List<LoanPayments> getPartialPayments() {
        return repository.findByPartialPaymentTrue();
    }
    
    // Get overpayments
    public List<LoanPayments> getOverpayments() {
        return repository.findByOverpaymentTrue();
    }

    // Read by ID
    public Optional<LoanPayments> getPaymentById(Long id) {
        return repository.findById(id);
    }
    
    // Get latest payment for loan
    public Optional<LoanPayments> getLatestPaymentForLoan(Long loanId) {
        return repository.findTopByLoanIdOrderByPaymentDateDesc(loanId);
    }
    
    // Get payment by reference number
    public Optional<LoanPayments> getPaymentByReference(String referenceNumber) {
        return repository.findByReferenceNumber(referenceNumber);
    }

    // Enhanced Update
    public LoanPayments updatePayment(Long id, LoanPayments updatedPayment) {
        return repository.findById(id)
                .map(existing -> {
                    // Update allowed fields
                    existing.setPaymentMethod(updatedPayment.getPaymentMethod());
                    existing.setReferenceNumber(updatedPayment.getReferenceNumber());
                    existing.setNotes(updatedPayment.getNotes());
                    existing.setPaymentStatus(updatedPayment.getPaymentStatus());
                    existing.setUpdatedAt(LocalDateTime.now());
                    
                    // Don't allow changes to financial fields after creation for audit purposes
                    // existing.setAmountPaid(updatedPayment.getAmountPaid());
                    // existing.setPrincipalPaid(updatedPayment.getPrincipalPaid());
                    
                    return repository.save(existing);
                }).orElseThrow(() -> new RuntimeException("Payment not found with id: " + id));
    }
    
    // Update payment status
    public LoanPayments updatePaymentStatus(Long id, String status) {
        return repository.findById(id)
                .map(payment -> {
                    payment.setPaymentStatus(status);
                    payment.setUpdatedAt(LocalDateTime.now());
                    return repository.save(payment);
                }).orElseThrow(() -> new RuntimeException("Payment not found with id: " + id));
    }

    // Soft delete - mark as cancelled instead of hard delete
    public LoanPayments cancelPayment(Long id, String reason) {
        return repository.findById(id)
                .map(payment -> {
                    payment.setPaymentStatus("CANCELLED");
                    payment.setNotes(payment.getNotes() + " | CANCELLED: " + reason);
                    payment.setUpdatedAt(LocalDateTime.now());
                    return repository.save(payment);
                }).orElseThrow(() -> new RuntimeException("Payment not found with id: " + id));
    }

    // Hard Delete (use with caution)
    public void deletePayment(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Payment not found with id: " + id);
        }
        repository.deleteById(id);
    }
    
    // Financial Summary Methods
    public Double getTotalPaidForLoan(Long loanId) {
        return repository.getTotalPaidByLoanId(loanId);
    }
    
    public Double getTotalPrincipalPaidForLoan(Long loanId) {
        return repository.getTotalPrincipalPaidByLoanId(loanId);
    }
    
    public Double getTotalInterestPaidForLoan(Long loanId) {
        return repository.getTotalInterestPaidByLoanId(loanId);
    }
    
    public Double getTotalFeesPaidForLoan(Long loanId) {
        return repository.getTotalFeesPaidByLoanId(loanId);
    }
    
    public Double getTotalPenaltiesForLoan(Long loanId) {
        return repository.getTotalPenaltyByLoanId(loanId);
    }
    
    public Long getPaymentCountForLoan(Long loanId) {
        return repository.getPaymentCountByLoanId(loanId);
    }
    
    public Long getLatePaymentCountForLoan(Long loanId) {
        return repository.getLatePaymentCountByLoanId(loanId);
    }
    
    // Get payment summary
    public PaymentProcessingService.PaymentSummary getPaymentSummary(Long loanId) {
        return paymentProcessingService.getPaymentSummary(loanId);
    }
    
    // Get loan balance
    public PaymentProcessingService.LoanBalance getLoanBalance(Long loanId) {
        return paymentProcessingService.calculateLoanBalance(loanId);
    }
    
    // Check if loan has payments
    public boolean hasPayments(Long loanId) {
        return repository.hasAnyPayments(loanId);
    }
    
    // Get payment summary as map
    public Optional<Map<String, Object>> getPaymentSummaryMap(Long loanId) {
        return repository.getPaymentSummaryByLoanId(loanId);
    }
    
    // Get outstanding balance
    public Double getOutstandingBalance(Long loanId) {
        return repository.getLatestOutstandingBalanceByLoanId(loanId);
    }
    
    // Validation methods
    public boolean isValidPaymentAmount(Long loanId, double amount) {
        if (amount <= 0) return false;
        
        // Check if amount exceeds reasonable overpayment threshold
        PaymentProcessingService.LoanBalance balance = getLoanBalance(loanId);
        if (balance == null) return false;
        
        // Allow up to 10% overpayment
        double maxAllowed = balance.getOutstandingBalance() * 1.1;
        return amount <= maxAllowed;
    }
    
    public boolean isValidPaymentDate(LocalDate paymentDate) {
        LocalDate today = LocalDate.now();
        LocalDate maxFutureDate = today.plusDays(1); // Allow next day for timezone issues
        LocalDate minPastDate = today.minusYears(2); // Don't allow payments older than 2 years
        
        return !paymentDate.isAfter(maxFutureDate) && !paymentDate.isBefore(minPastDate);
    }
    
    /**
     * Reverse a payment - sets status to REVERSED and recalculates loan tracking
     */
    public LoanPayments reversePayment(Long paymentId, Long reversedById, String reason) {
        LoanPayments payment = repository.findById(paymentId)
            .orElseThrow(() -> new IllegalArgumentException("Payment not found with id: " + paymentId));
        
        // Guard: Only COMPLETED/RECORDED payments can be reversed
        if (!"COMPLETED".equalsIgnoreCase(payment.getPaymentStatus()) && 
            !"RECORDED".equalsIgnoreCase(payment.getPaymentStatus())) {
            throw new IllegalStateException("Can only reverse completed payments. Current status: " + payment.getPaymentStatus());
        }
        
        // Update payment status
        payment.setPaymentStatus("REVERSED");
        payment.setNotes((payment.getNotes() != null ? payment.getNotes() + " | " : "") + 
                         "REVERSED: " + reason + " (by user " + reversedById + ")");
        payment.setUpdatedAt(LocalDateTime.now());
        
        LoanPayments reversedPayment = repository.save(payment);
        
        // Note: Tracking recalculation would need a manual update or trigger modification
        // For now, publish events for manual handling
        publishWebSocketEvent("payment.reversed", reversedPayment);
        publishWebSocketEvent("loan.balance.updated", reversedPayment.getLoanId());
        
        return reversedPayment;
    }
    
    /**
     * Record a new payment with WebSocket notifications
     */
    public LoanPayments recordPayment(Long loanId, double amountPaid, LocalDate paymentDate, 
                                      String paymentMethod, String referenceNumber, String notes) {
        // Validate loan exists
        LoanDetails loan = loanDetailsRepository.findById(loanId)
            .orElseThrow(() -> new IllegalArgumentException("Loan not found with id: " + loanId));
        
        // Create payment
        LoanPayments payment = new LoanPayments();
        payment.setLoanId(loanId);
        payment.setAmountPaid(amountPaid);
        payment.setPaymentDate(paymentDate);
        payment.setPaymentMethod(paymentMethod);
        payment.setReferenceNumber(referenceNumber);
        payment.setNotes(notes);
        payment.setPaymentStatus("RECORDED");
        payment.setCreatedAt(LocalDateTime.now());
        payment.setUpdatedAt(LocalDateTime.now());
        
        LoanPayments savedPayment = repository.save(payment);
        // Database trigger will update loan_tracking automatically
        
        // Update loan status immediately after payment
        try {
            loanDetailsService.updateLoanStatusBasedOnPayments(loan);
            loanDetailsRepository.save(loan);
        } catch (Exception e) {
            System.err.println("Error updating loan status after payment: " + e.getMessage());
        }
        
        // Publish WebSocket events
        publishWebSocketEvent("payment.recorded", savedPayment);
        publishWebSocketEvent("loan.payment.recorded", savedPayment);
        publishWebSocketEvent("loan.balance.updated", loanId);
        
        return savedPayment;
    }
    
    /**
     * Publish WebSocket event for payment state changes
     */
    private void publishWebSocketEvent(String eventType, Object data) {
        try {
            java.util.Map<String, Object> payload = new java.util.HashMap<>();
            payload.put("event", eventType);
            payload.put("timestamp", LocalDateTime.now().toString());
            
            if (data instanceof LoanPayments) {
                LoanPayments payment = (LoanPayments) data;
                payload.put("paymentId", payment.getId());
                payload.put("loanId", payment.getLoanId());
                payload.put("amountPaid", payment.getAmountPaid());
                payload.put("paymentStatus", payment.getPaymentStatus());
            } else if (data instanceof Long) {
                payload.put("loanId", data);
            }
            
            // Use existing WebSocket infrastructure
            if (messagingTemplate != null) {
                messagingTemplate.convertAndSend("/topic/payments", payload);
            }
        } catch (Exception e) {
            System.err.println("Error publishing WebSocket event " + eventType + ": " + e.getMessage());
        }
    }
    
    // WebSocket messaging template (inject if available)
    @Autowired(required = false)
    private org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;
    
    /**
     * Get loan details by payment ID
     */
    public org.example.Entities.LoanDetails getLoanDetailsByPaymentId(Long paymentId) {
        try {
            LoanPayments payment = repository.findById(paymentId).orElse(null);
            if (payment != null && payment.getLoanId() != null) {
                return loanDetailsRepository.findById(payment.getLoanId()).orElse(null);
            }
        } catch (Exception e) {
            System.err.println("Error getting loan details for payment " + paymentId + ": " + e.getMessage());
        }
        return null;
    }
}
