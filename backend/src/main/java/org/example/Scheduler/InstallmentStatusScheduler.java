package org.example.Scheduler;

import org.example.Services.InstallmentScheduleService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

/**
 * Scheduler for updating installment statuses
 * Runs daily to check for overdue installments and grace period expirations
 */
@Component
public class InstallmentStatusScheduler {
    
    private static final Logger logger = LoggerFactory.getLogger(InstallmentStatusScheduler.class);
    
    @Autowired
    private InstallmentScheduleService installmentScheduleService;
    
    @Autowired(required = false)
    private SimpMessagingTemplate messagingTemplate;
    
    @Autowired
    private org.example.Repositories.LoanInstallmentScheduleRepository installmentRepository;
    
    /**
     * Update installment statuses every day at midnight
     * Checks for overdue installments and grace period status
     */
    @Scheduled(cron = "0 0 0 * * *") // Run at midnight every day
    public void updateInstallmentStatuses() {
        try {
            logger.info("Starting scheduled installment status update");
            
            // Update all installment statuses
            installmentScheduleService.updateInstallmentStatuses();
            
            // Get counts for notification
            long overdueCount = installmentRepository.findOverdueInstallments().size();
            long gracePeriodCount = installmentRepository.findInGracePeriod().size();
            long dueTodayCount = installmentRepository.findDueToday().size();
            
            logger.info("Installment status update complete - Overdue: {}, Grace Period: {}, Due Today: {}", 
                overdueCount, gracePeriodCount, dueTodayCount);
            
            // Broadcast update notification via WebSocket
            if (messagingTemplate != null && (overdueCount > 0 || gracePeriodCount > 0 || dueTodayCount > 0)) {
                Map<String, Object> notification = new HashMap<>();
                notification.put("type", "INSTALLMENT_STATUS_UPDATE");
                notification.put("overdueCount", overdueCount);
                notification.put("gracePeriodCount", gracePeriodCount);
                notification.put("dueTodayCount", dueTodayCount);
                notification.put("timestamp", System.currentTimeMillis());
                notification.put("message", "Daily installment status update completed");
                
                messagingTemplate.convertAndSend("/topic/installments", notification);
                messagingTemplate.convertAndSend("/topic/notifications", notification);
            }
            
        } catch (Exception e) {
            logger.error("Error during scheduled installment status update", e);
        }
    }
    
    /**
     * Check for grace period expirations every 6 hours
     * Send alerts for grace periods expiring soon
     */
    @Scheduled(cron = "0 0 */6 * * *") // Run every 6 hours
    public void checkGracePeriodExpirations() {
        try {
            logger.info("Checking for grace period expirations");
            
            // Get installments with grace period expiring in next 24 hours
            java.time.LocalDate tomorrow = java.time.LocalDate.now().plusDays(1);
            var expiringInstallments = installmentRepository.findGracePeriodExpiringSoon(tomorrow);
            
            if (!expiringInstallments.isEmpty()) {
                logger.warn("Found {} installments with grace period expiring soon", expiringInstallments.size());
                
                // Broadcast warning via WebSocket
                if (messagingTemplate != null) {
                    Map<String, Object> notification = new HashMap<>();
                    notification.put("type", "GRACE_PERIOD_EXPIRING");
                    notification.put("count", expiringInstallments.size());
                    notification.put("timestamp", System.currentTimeMillis());
                    notification.put("message", expiringInstallments.size() + " grace periods expiring soon");
                    notification.put("level", "warning");
                    
                    messagingTemplate.convertAndSend("/topic/installments", notification);
                    messagingTemplate.convertAndSend("/topic/notifications", notification);
                }
            }
            
        } catch (Exception e) {
            logger.error("Error checking grace period expirations", e);
        }
    }
    
    /**
     * Morning reminder for due payments - runs at 8 AM
     */
    @Scheduled(cron = "0 0 8 * * *") // Run at 8 AM every day
    public void sendDuePaymentReminders() {
        try {
            logger.info("Checking for due payments today");
            
            var dueTodayInstallments = installmentRepository.findDueToday();
            
            if (!dueTodayInstallments.isEmpty()) {
                logger.info("Found {} payments due today", dueTodayInstallments.size());
                
                // Broadcast reminder via WebSocket
                if (messagingTemplate != null) {
                    Map<String, Object> notification = new HashMap<>();
                    notification.put("type", "PAYMENTS_DUE_TODAY");
                    notification.put("count", dueTodayInstallments.size());
                    notification.put("timestamp", System.currentTimeMillis());
                    notification.put("message", dueTodayInstallments.size() + " payments due today");
                    notification.put("level", "info");
                    
                    messagingTemplate.convertAndSend("/topic/installments", notification);
                    messagingTemplate.convertAndSend("/topic/notifications", notification);
                }
            }
            
        } catch (Exception e) {
            logger.error("Error sending due payment reminders", e);
        }
    }
}
