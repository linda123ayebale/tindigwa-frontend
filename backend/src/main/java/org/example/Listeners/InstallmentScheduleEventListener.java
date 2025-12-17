package org.example.Listeners;

import org.example.Entities.LoanDetails;
import org.example.Events.InstallmentScheduleGeneratedEvent;
import org.example.Services.InstallmentScheduleService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.HashMap;
import java.util.Map;

/**
 * Event listener for installment schedule events
 * Handles WebSocket notifications and automated actions
 */
@Component
public class InstallmentScheduleEventListener {
    
    private static final Logger logger = LoggerFactory.getLogger(InstallmentScheduleEventListener.class);
    
    @Autowired(required = false)
    private SimpMessagingTemplate messagingTemplate;
    
    /**
     * Listen for schedule generated events and broadcast via WebSocket
     */
    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleInstallmentScheduleGenerated(InstallmentScheduleGeneratedEvent event) {
        try {
            logger.info("Installment schedule generated for loan: {} ({})", 
                event.getLoanNumber(), event.getLoanId());
            
            // Broadcast to WebSocket clients
            if (messagingTemplate != null) {
                Map<String, Object> notification = new HashMap<>();
                notification.put("type", "SCHEDULE_GENERATED");
                notification.put("loanId", event.getLoanId());
                notification.put("loanNumber", event.getLoanNumber());
                notification.put("totalInstallments", event.getTotalInstallments());
                notification.put("timestamp", System.currentTimeMillis());
                notification.put("message", "Payment schedule generated for loan " + event.getLoanNumber());
                
                // Broadcast to all connected clients
                messagingTemplate.convertAndSend("/topic/installments", notification);
                
                // Send to specific loan channel
                messagingTemplate.convertAndSend("/topic/loan/" + event.getLoanId(), notification);
                
                logger.info("WebSocket notification sent for schedule generation");
            }
            
        } catch (Exception e) {
            logger.error("Error handling installment schedule generated event", e);
        }
    }
}
