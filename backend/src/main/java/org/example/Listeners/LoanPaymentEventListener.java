package org.example.Listeners;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.Entities.AuditLog;
import org.example.Events.*;
import org.example.Repositories.AuditLogRepository;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class LoanPaymentEventListener {
    
    private final SimpMessagingTemplate messagingTemplate;
    private final AuditLogRepository auditLogRepository;
    
    @EventListener
    public void handleLoanCreated(LoanCreatedEvent event) {
        log.info("Loan Created Event: Loan ID = {}, Created By = {}", 
                event.getLoan().getId(), event.getActionBy());
        
        // Save to audit log
        saveAuditLog("LOAN", event.getLoan().getId(), "CREATED", event.getActionBy(),
                "Loan created: " + event.getLoan().getLoanNumber());
        
        // Broadcast via WebSocket
        Map<String, Object> message = createWebSocketMessage(
                event.getLoan().getId(),
                event.getLoan().getLoanNumber(),
                "loan.created",
                event.getActionBy(),
                "New loan created: " + event.getLoan().getLoanNumber()
        );
        messagingTemplate.convertAndSend("/topic/loans", message);
        messagingTemplate.convertAndSend("/topic/dashboard", message);
    }
    
    @EventListener
    public void handleLoanStatusUpdated(LoanStatusUpdatedEvent event) {
        log.info("Loan Status Updated Event: Loan ID = {}, Old Status = {}, New Status = {}", 
                event.getLoan().getId(), event.getOldStatus(), event.getNewStatus());
        
        saveAuditLog("LOAN", event.getLoan().getId(), "STATUS_UPDATED", event.getActionBy(),
                String.format("Status changed from %s to %s", event.getOldStatus(), event.getNewStatus()));
        
        Map<String, Object> message = createWebSocketMessage(
                event.getLoan().getId(),
                event.getLoan().getLoanNumber(),
                "loan.status.updated",
                event.getActionBy(),
                String.format("Loan status updated from %s to %s", event.getOldStatus(), event.getNewStatus())
        );
        message.put("oldStatus", event.getOldStatus());
        message.put("newStatus", event.getNewStatus());
        
        messagingTemplate.convertAndSend("/topic/loans", message);
        messagingTemplate.convertAndSend("/topic/dashboard", message);
    }
    
    @EventListener
    public void handleLoanApproved(LoanApprovedEvent event) {
        log.info("Loan Approved Event: Loan ID = {}, Approved By = {}", 
                event.getLoan().getId(), event.getActionBy());
        
        saveAuditLog("LOAN", event.getLoan().getId(), "APPROVED", event.getActionBy(),
                "Loan approved: " + event.getLoan().getLoanNumber());
        
        Map<String, Object> message = createWebSocketMessage(
                event.getLoan().getId(),
                event.getLoan().getLoanNumber(),
                "loan.approved",
                event.getActionBy(),
                "Loan " + event.getLoan().getLoanNumber() + " has been approved"
        );
        messagingTemplate.convertAndSend("/topic/loans", message);
        messagingTemplate.convertAndSend("/topic/dashboard", message);
    }
    
    @EventListener
    public void handleLoanRejected(LoanRejectedEvent event) {
        log.info("Loan Rejected Event: Loan ID = {}, Rejected By = {}, Reason = {}", 
                event.getLoan().getId(), event.getActionBy(), event.getReason());
        
        saveAuditLog("LOAN", event.getLoan().getId(), "REJECTED", event.getActionBy(),
                "Loan rejected: " + event.getReason());
        
        Map<String, Object> message = createWebSocketMessage(
                event.getLoan().getId(),
                event.getLoan().getLoanNumber(),
                "loan.rejected",
                event.getActionBy(),
                "Loan " + event.getLoan().getLoanNumber() + " has been rejected"
        );
        message.put("reason", event.getReason());
        
        messagingTemplate.convertAndSend("/topic/loans", message);
        messagingTemplate.convertAndSend("/topic/dashboard", message);
    }
    
    @EventListener
    public void handleLoanPaymentRecorded(LoanPaymentRecordedEvent event) {
        log.info("Loan Payment Recorded Event: Loan ID = {}, Payment ID = {}, Amount = {}", 
                event.getLoan().getId(), event.getPayment().getId(), event.getPayment().getAmountPaid());
        
        saveAuditLog("LOAN", event.getLoan().getId(), "PAYMENT_RECORDED", event.getActionBy(),
                String.format("Payment of %.2f recorded", event.getPayment().getAmountPaid()));
        
        Map<String, Object> message = createWebSocketMessage(
                event.getLoan().getId(),
                event.getLoan().getLoanNumber(),
                "loan.payment.recorded",
                event.getActionBy(),
                String.format("Payment of %.2f recorded for loan %s", 
                        event.getPayment().getAmountPaid(), event.getLoan().getLoanNumber())
        );
        message.put("paymentId", event.getPayment().getId());
        message.put("amount", event.getPayment().getAmountPaid());
        message.put("paymentDate", event.getPayment().getPaymentDate().toString());
        
        messagingTemplate.convertAndSend("/topic/loans", message);
        messagingTemplate.convertAndSend("/topic/payments", message);
        messagingTemplate.convertAndSend("/topic/dashboard", message);
    }
    
    @EventListener
    public void handleLoanBalanceUpdated(LoanBalanceUpdatedEvent event) {
        log.info("Loan Balance Updated Event: Loan ID = {}, Old Balance = {}, New Balance = {}", 
                event.getLoan().getId(), event.getOldBalance(), event.getNewBalance());
        
        saveAuditLog("LOAN", event.getLoan().getId(), "BALANCE_UPDATED", event.getActionBy(),
                String.format("Balance updated from %.2f to %.2f", event.getOldBalance(), event.getNewBalance()));
        
        Map<String, Object> message = createWebSocketMessage(
                event.getLoan().getId(),
                event.getLoan().getLoanNumber(),
                "loan.balance.updated",
                event.getActionBy(),
                String.format("Loan balance updated to %.2f", event.getNewBalance())
        );
        message.put("oldBalance", event.getOldBalance());
        message.put("newBalance", event.getNewBalance());
        
        messagingTemplate.convertAndSend("/topic/loans", message);
        messagingTemplate.convertAndSend("/topic/dashboard", message);
    }
    
    @EventListener
    public void handlePaymentRecorded(PaymentRecordedEvent event) {
        log.info("Payment Recorded Event: Payment ID = {}, Loan ID = {}, Amount = {}", 
                event.getPayment().getId(), event.getPayment().getLoanId(), event.getPayment().getAmountPaid());
        
        saveAuditLog("PAYMENT", event.getPayment().getId(), "RECORDED", event.getActionBy(),
                String.format("Payment of %.2f recorded for loan ID %d", 
                        event.getPayment().getAmountPaid(), event.getPayment().getLoanId()));
        
        Map<String, Object> message = new HashMap<>();
        message.put("paymentId", event.getPayment().getId());
        message.put("loanId", event.getPayment().getLoanId());
        message.put("action", "payment.recorded");
        message.put("actionBy", event.getActionBy());
        message.put("amount", event.getPayment().getAmountPaid());
        message.put("paymentDate", event.getPayment().getPaymentDate().toString());
        message.put("message", String.format("Payment of %.2f recorded", event.getPayment().getAmountPaid()));
        message.put("timestamp", LocalDateTime.now().toString());
        
        messagingTemplate.convertAndSend("/topic/payments", message);
        messagingTemplate.convertAndSend("/topic/dashboard", message);
    }
    
    @EventListener
    public void handlePaymentReversed(PaymentReversedEvent event) {
        log.info("Payment Reversed Event: Payment ID = {}, Reason = {}", 
                event.getPayment().getId(), event.getReason());
        
        saveAuditLog("PAYMENT", event.getPayment().getId(), "REVERSED", event.getActionBy(),
                "Payment reversed: " + event.getReason());
        
        Map<String, Object> message = new HashMap<>();
        message.put("paymentId", event.getPayment().getId());
        message.put("loanId", event.getPayment().getLoanId());
        message.put("action", "payment.reversed");
        message.put("actionBy", event.getActionBy());
        message.put("amount", event.getPayment().getAmountPaid());
        message.put("reason", event.getReason());
        message.put("message", "Payment has been reversed: " + event.getReason());
        message.put("timestamp", LocalDateTime.now().toString());
        
        messagingTemplate.convertAndSend("/topic/payments", message);
        messagingTemplate.convertAndSend("/topic/dashboard", message);
    }
    
    private Map<String, Object> createWebSocketMessage(Long loanId, String loanNumber, 
                                                        String action, String actionBy, String message) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("loanId", loanId);
        payload.put("loanNumber", loanNumber);
        payload.put("action", action);
        payload.put("actionBy", actionBy);
        payload.put("message", message);
        payload.put("timestamp", LocalDateTime.now().toString());
        return payload;
    }
    
    private void saveAuditLog(String entityType, Long entityId, String action, String actionBy, String notes) {
        try {
            AuditLog auditLog = new AuditLog();
            auditLog.setEntityType(entityType);
            auditLog.setEntityId(entityId);
            auditLog.setAction(action);
            auditLog.setPerformedBy(actionBy);
            auditLog.setNewValue(notes);
            auditLog.setTimestamp(LocalDateTime.now());
            auditLogRepository.save(auditLog);
        } catch (Exception e) {
            log.error("Error saving audit log: {}", e.getMessage());
        }
    }
}
