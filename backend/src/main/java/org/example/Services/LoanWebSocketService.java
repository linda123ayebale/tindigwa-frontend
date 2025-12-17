package org.example.Services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Service for broadcasting real-time loan updates via WebSocket
 * Notifies frontend clients when loans are created, approved, rejected, disbursed, or payments are added
 */
@Service
public class LoanWebSocketService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    /**
     * Broadcast loan creation event
     */
    public void broadcastLoanCreated(Long loanId, String loanNumber, String clientName) {
        try {
            Map<String, Object> message = new HashMap<>();
            message.put("type", "LOAN_CREATED");
            message.put("loanId", loanId);
            message.put("loanNumber", loanNumber);
            message.put("clientName", clientName);
            message.put("timestamp", LocalDateTime.now().toString());
            message.put("message", "New loan application created");
            
            messagingTemplate.convertAndSend("/topic/loans/updates", message);
            System.out.println("✅ WebSocket: Loan created broadcast sent for loan #" + loanId);
            
        } catch (Exception e) {
            System.err.println("❌ Error broadcasting loan creation: " + e.getMessage());
        }
    }

    /**
     * Broadcast loan approval event
     */
    public void broadcastLoanApproved(Long loanId, String loanNumber, String approvedBy) {
        try {
            Map<String, Object> message = new HashMap<>();
            message.put("type", "LOAN_APPROVED");
            message.put("loanId", loanId);
            message.put("loanNumber", loanNumber);
            message.put("approvedBy", approvedBy);
            message.put("timestamp", LocalDateTime.now().toString());
            message.put("message", "Loan approved");
            
            messagingTemplate.convertAndSend("/topic/loans/updates", message);
            System.out.println("✅ WebSocket: Loan approved broadcast sent for loan #" + loanId);
            
        } catch (Exception e) {
            System.err.println("❌ Error broadcasting loan approval: " + e.getMessage());
        }
    }

    /**
     * Broadcast loan rejection event
     */
    public void broadcastLoanRejected(Long loanId, String loanNumber, String rejectedBy, String reason) {
        try {
            Map<String, Object> message = new HashMap<>();
            message.put("type", "LOAN_REJECTED");
            message.put("loanId", loanId);
            message.put("loanNumber", loanNumber);
            message.put("rejectedBy", rejectedBy);
            message.put("reason", reason);
            message.put("timestamp", LocalDateTime.now().toString());
            message.put("message", "Loan rejected");
            
            messagingTemplate.convertAndSend("/topic/loans/updates", message);
            System.out.println("✅ WebSocket: Loan rejected broadcast sent for loan #" + loanId);
            
        } catch (Exception e) {
            System.err.println("❌ Error broadcasting loan rejection: " + e.getMessage());
        }
    }

    /**
     * Broadcast loan disbursement event
     */
    public void broadcastLoanDisbursed(Long loanId, String loanNumber, Double amount) {
        try {
            Map<String, Object> message = new HashMap<>();
            message.put("type", "LOAN_DISBURSED");
            message.put("loanId", loanId);
            message.put("loanNumber", loanNumber);
            message.put("amount", amount);
            message.put("timestamp", LocalDateTime.now().toString());
            message.put("message", "Loan disbursed");
            
            messagingTemplate.convertAndSend("/topic/loans/updates", message);
            System.out.println("✅ WebSocket: Loan disbursed broadcast sent for loan #" + loanId);
            
        } catch (Exception e) {
            System.err.println("❌ Error broadcasting loan disbursement: " + e.getMessage());
        }
    }

    /**
     * Broadcast payment added event
     */
    public void broadcastPaymentAdded(Long loanId, String loanNumber, Double amount, Double newBalance) {
        try {
            Map<String, Object> message = new HashMap<>();
            message.put("type", "PAYMENT_ADDED");
            message.put("loanId", loanId);
            message.put("loanNumber", loanNumber);
            message.put("amount", amount);
            message.put("newBalance", newBalance);
            message.put("timestamp", LocalDateTime.now().toString());
            message.put("message", "Payment recorded");
            
            messagingTemplate.convertAndSend("/topic/loans/updates", message);
            System.out.println("✅ WebSocket: Payment added broadcast sent for loan #" + loanId);
            
        } catch (Exception e) {
            System.err.println("❌ Error broadcasting payment addition: " + e.getMessage());
        }
    }

    /**
     * Broadcast loan updated event (generic update)
     */
    public void broadcastLoanUpdated(Long loanId, String loanNumber, String updateType) {
        try {
            Map<String, Object> message = new HashMap<>();
            message.put("type", "LOAN_UPDATED");
            message.put("loanId", loanId);
            message.put("loanNumber", loanNumber);
            message.put("updateType", updateType);
            message.put("timestamp", LocalDateTime.now().toString());
            message.put("message", "Loan updated");
            
            messagingTemplate.convertAndSend("/topic/loans/updates", message);
            System.out.println("✅ WebSocket: Loan updated broadcast sent for loan #" + loanId);
            
        } catch (Exception e) {
            System.err.println("❌ Error broadcasting loan update: " + e.getMessage());
        }
    }

    /**
     * Broadcast to specific loan details page
     * Used when a user is viewing a specific loan's details page
     */
    public void broadcastToLoanDetails(Long loanId) {
        try {
            Map<String, Object> message = new HashMap<>();
            message.put("type", "LOAN_DETAILS_UPDATED");
            message.put("loanId", loanId);
            message.put("timestamp", LocalDateTime.now().toString());
            message.put("message", "Loan details have been updated");
            
            messagingTemplate.convertAndSend("/topic/loans/" + loanId, message);
            System.out.println("✅ WebSocket: Loan details update sent for loan #" + loanId);
            
        } catch (Exception e) {
            System.err.println("❌ Error broadcasting to loan details: " + e.getMessage());
        }
    }
    
    /**
     * Notify when a loan is archived
     */
    public void notifyLoanArchived(org.example.Entities.LoanDetails loan) {
        try {
            Map<String, Object> message = new HashMap<>();
            message.put("id", loan.getId());
            message.put("loanNumber", loan.getLoanNumber());
            message.put("archived", true);
            message.put("archivedDate", loan.getArchivedDate() != null ? loan.getArchivedDate().toString() : null);
            message.put("timestamp", LocalDateTime.now().toString());
            
            messagingTemplate.convertAndSend("/topic/loan.archived", message);
            System.out.println("✅ WebSocket: Loan archived notification sent for loan #" + loan.getId());
            
        } catch (Exception e) {
            System.err.println("❌ Error broadcasting loan archived: " + e.getMessage());
        }
    }
    
    /**
     * Notify when a loan is unarchived
     */
    public void notifyLoanUnarchived(org.example.Entities.LoanDetails loan) {
        try {
            Map<String, Object> message = new HashMap<>();
            message.put("id", loan.getId());
            message.put("loanNumber", loan.getLoanNumber());
            message.put("archived", false);
            message.put("timestamp", LocalDateTime.now().toString());
            
            messagingTemplate.convertAndSend("/topic/loan.unarchived", message);
            System.out.println("✅ WebSocket: Loan unarchived notification sent for loan #" + loan.getId());
            
        } catch (Exception e) {
            System.err.println("❌ Error broadcasting loan unarchived: " + e.getMessage());
        }
    }
}
