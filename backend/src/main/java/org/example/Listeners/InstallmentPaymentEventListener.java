package org.example.Listeners;

import org.example.Events.InstallmentPaidEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.HashMap;
import java.util.Map;

/**
 * Event listener for installment payment events
 * Broadcasts real-time updates via WebSocket
 */
@Component
public class InstallmentPaymentEventListener {
    
    private static final Logger logger = LoggerFactory.getLogger(InstallmentPaymentEventListener.class);
    
    @Autowired(required = false)
    private SimpMessagingTemplate messagingTemplate;
    
    /**
     * Handle installment paid event
     * Broadcast to WebSocket clients for real-time UI updates
     */
    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleInstallmentPaid(InstallmentPaidEvent event) {
        try {
            logger.info("Installment #{} paid for loan: {} - Amount: {}", 
                event.getInstallmentNumber(), 
                event.getLoanId(), 
                event.getAmountPaid());
            
            // Broadcast to WebSocket clients
            if (messagingTemplate != null) {
                Map<String, Object> notification = new HashMap<>();
                notification.put("type", "INSTALLMENT_PAID");
                notification.put("loanId", event.getLoanId());
                notification.put("installmentNumber", event.getInstallmentNumber());
                notification.put("amountPaid", event.getAmountPaid());
                notification.put("fullyPaid", event.isFullyPaid());
                notification.put("isPartial", event.isPartial());
                notification.put("isLate", event.isLate());
                notification.put("timestamp", System.currentTimeMillis());
                
                // Determine message based on payment characteristics
                String message;
                if (event.isFullyPaid()) {
                    message = String.format("Installment #%d fully paid%s", 
                        event.getInstallmentNumber(),
                        event.isLate() ? " (late payment)" : "");
                } else if (event.isPartial()) {
                    message = String.format("Partial payment for installment #%d", 
                        event.getInstallmentNumber());
                } else {
                    message = String.format("Payment recorded for installment #%d", 
                        event.getInstallmentNumber());
                }
                notification.put("message", message);
                
                // Determine notification level based on payment characteristics
                String level;
                if (event.isLate()) {
                    level = "warning"; // Yellow/Orange for late payments
                } else if (event.isFullyPaid()) {
                    level = "success"; // Green for full payments
                } else if (event.isPartial()) {
                    level = "info"; // Blue for partial payments
                } else {
                    level = "default";
                }
                notification.put("level", level);
                
                // Broadcast to all clients monitoring installments
                messagingTemplate.convertAndSend("/topic/installments", notification);
                
                // Send to specific loan channel
                messagingTemplate.convertAndSend("/topic/loan/" + event.getLoanId(), notification);
                
                // Send to payments channel
                messagingTemplate.convertAndSend("/topic/payments", notification);
                
                logger.info("WebSocket notification sent for installment payment");
            }
            
        } catch (Exception e) {
            logger.error("Error handling installment paid event", e);
        }
    }
}
