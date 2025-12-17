package org.example.Listeners;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.Events.*;
import org.example.Services.InstallmentScheduleService;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Loan Event Listener - Handles real-time WebSocket broadcasts for loan workflow events
 * Mirrors ExpenseEventListener functionality for consistent real-time updates
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class LoanEventListener {

    private final SimpMessagingTemplate messagingTemplate;
    private final InstallmentScheduleService installmentScheduleService;

    @EventListener
    public void handleLoanCreated(LoanCreatedEvent event) {
        log.info("Loan Created Event: Loan ID = {}, Loan Number = {}, Created By = {}", 
                event.getLoan().getId(), 
                event.getLoan().getLoanNumber(),
                event.getActionBy());
        
        Map<String, Object> message = createWebSocketMessage(
                event.getLoan().getId(),
                event.getLoan().getLoanNumber(),
                "loan.created",
                event.getActionBy(),
                "New loan created: " + event.getLoan().getLoanNumber()
        );
        
        messagingTemplate.convertAndSend("/topic/loans", message);
        log.debug("WebSocket message sent to /topic/loans for loan creation");
    }

    @EventListener
    public void handleLoanApproved(LoanApprovedEvent event) {
        log.info("Loan Approved Event: Loan ID = {}, Loan Number = {}, Approved By = {}", 
                event.getLoan().getId(),
                event.getLoan().getLoanNumber(),
                event.getActionBy());
        
        Map<String, Object> message = createWebSocketMessage(
                event.getLoan().getId(),
                event.getLoan().getLoanNumber(),
                "loan.approved",
                event.getActionBy(),
                "Loan " + event.getLoan().getLoanNumber() + " has been approved"
        );
        
        messagingTemplate.convertAndSend("/topic/loans", message);
        log.debug("WebSocket message sent to /topic/loans for loan approval");
    }

    @EventListener
    public void handleLoanRejected(LoanRejectedEvent event) {
        log.info("Loan Rejected Event: Loan ID = {}, Loan Number = {}, Rejected By = {}", 
                event.getLoan().getId(),
                event.getLoan().getLoanNumber(),
                event.getActionBy());
        
        Map<String, Object> message = createWebSocketMessage(
                event.getLoan().getId(),
                event.getLoan().getLoanNumber(),
                "loan.rejected",
                event.getActionBy(),
                "Loan " + event.getLoan().getLoanNumber() + " has been rejected"
        );
        
        messagingTemplate.convertAndSend("/topic/loans", message);
        log.debug("WebSocket message sent to /topic/loans for loan rejection");
    }

    @EventListener
    public void handleLoanStatusUpdated(LoanStatusUpdatedEvent event) {
        log.info("Loan Status Updated Event: Loan ID = {}, Loan Number = {}, New Status = {}", 
                event.getLoan().getId(),
                event.getLoan().getLoanNumber(),
                event.getLoan().getWorkflowStatus());
        
        Map<String, Object> message = createWebSocketMessage(
                event.getLoan().getId(),
                event.getLoan().getLoanNumber(),
                "loan.status.updated",
                event.getActionBy(),
                "Loan " + event.getLoan().getLoanNumber() + " status updated to " + event.getLoan().getWorkflowStatus()
        );
        
        messagingTemplate.convertAndSend("/topic/loans", message);
        log.debug("WebSocket message sent to /topic/loans for status update");
    }

    @EventListener
    public void handleLoanPaymentRecorded(LoanPaymentRecordedEvent event) {
        log.info("Loan Payment Recorded Event: Loan ID = {}, Amount = {}", 
                event.getLoan().getId(), 
                event.getPayment() != null ? event.getPayment().getAmountPaid() : 0);
        
        Map<String, Object> message = new HashMap<>();
        message.put("loanId", event.getLoan().getId());
        message.put("loanNumber", event.getLoan().getLoanNumber());
        message.put("action", "loan.payment.recorded");
        message.put("amount", event.getPayment() != null ? event.getPayment().getAmountPaid() : 0);
        message.put("actionBy", event.getActionBy() != null ? event.getActionBy() : "System");
        message.put("message", "Payment recorded for loan " + event.getLoan().getLoanNumber());
        message.put("timestamp", LocalDateTime.now().toString());
        
        messagingTemplate.convertAndSend("/topic/loans", message);
        log.debug("WebSocket message sent to /topic/loans for payment recording");
    }

    @EventListener
    public void handleLoanBalanceUpdated(LoanBalanceUpdatedEvent event) {
        log.info("Loan Balance Updated Event: Loan ID = {}, Old Balance = {}, New Balance = {}", 
                event.getLoan().getId(),
                event.getOldBalance(),
                event.getNewBalance());
        
        Map<String, Object> message = new HashMap<>();
        message.put("loanId", event.getLoan().getId());
        message.put("loanNumber", event.getLoan().getLoanNumber());
        message.put("action", "loan.balance.updated");
        message.put("oldBalance", event.getOldBalance());
        message.put("newBalance", event.getNewBalance());
        message.put("actionBy", event.getActionBy() != null ? event.getActionBy() : "System");
        message.put("message", "Loan " + event.getLoan().getLoanNumber() + " balance updated");
        message.put("timestamp", LocalDateTime.now().toString());
        
        messagingTemplate.convertAndSend("/topic/loans", message);
        log.debug("WebSocket message sent to /topic/loans for balance update");
    }
    
    /**
     * Handle loan disbursement and automatically generate installment schedule
     * This is the key integration point for the installment system
     */
    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleLoanDisbursed(LoanDisbursedEvent event) {
        log.info("Loan Disbursed Event: Loan ID = {}, Loan Number = {}, Amount = {}", 
                event.getLoan().getId(),
                event.getLoan().getLoanNumber(),
                event.getDisbursedAmount());
        
        try {
            // Automatically generate installment schedule when loan is disbursed
            log.info("Generating installment schedule for loan: {}", event.getLoan().getLoanNumber());
            installmentScheduleService.generateSchedule(event.getLoan().getId());
            log.info("Installment schedule generated successfully for loan: {}", event.getLoan().getLoanNumber());
            
        } catch (Exception e) {
            log.error("Failed to generate installment schedule for loan: {}", event.getLoan().getLoanNumber(), e);
        }
        
        // Send WebSocket notification about disbursement
        Map<String, Object> message = new HashMap<>();
        message.put("loanId", event.getLoan().getId());
        message.put("loanNumber", event.getLoan().getLoanNumber());
        message.put("action", "loan.disbursed");
        message.put("amount", event.getDisbursedAmount());
        message.put("disbursementMethod", event.getDisbursementMethod());
        message.put("actionBy", event.getActionBy() != null ? event.getActionBy() : "System");
        message.put("message", "Loan " + event.getLoan().getLoanNumber() + " disbursed successfully");
        message.put("timestamp", LocalDateTime.now().toString());
        
        messagingTemplate.convertAndSend("/topic/loans", message);
        log.debug("WebSocket message sent to /topic/loans for loan disbursement");
    }

    /**
     * Create standardized WebSocket message payload
     * Follows same format as ExpenseEventListener for consistency
     */
    private Map<String, Object> createWebSocketMessage(Long loanId, String loanNumber,
                                                        String action, String actionBy, 
                                                        String message) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("loanId", loanId);
        payload.put("loanNumber", loanNumber);
        payload.put("action", action);
        payload.put("actionBy", actionBy != null ? actionBy : "System");
        payload.put("message", message);
        payload.put("timestamp", LocalDateTime.now().toString());
        return payload;
    }
}
