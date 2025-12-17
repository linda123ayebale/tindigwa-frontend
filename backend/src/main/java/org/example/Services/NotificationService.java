package org.example.Services;

import org.example.Entities.LoanTracking;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Notification Service
 * Handles all notification types: Email, SMS, Push Notifications
 */
@Service
public class NotificationService {
    
    /**
     * Send late payment notification
     */
    public void sendLatePaymentNotification(LoanTracking tracking) {
        String clientContact = getClientContact(tracking.getClientId());
        String message = buildLatePaymentMessage(tracking);
        
        // Send via multiple channels
        sendEmail(clientContact, "Late Payment Alert", message);
        sendSMS(clientContact, message);
        
        logNotification("LATE_PAYMENT", tracking.getLoanId(), clientContact);
    }
    
    /**
     * Send payment due reminder
     */
    public void sendPaymentDueReminder(LoanTracking tracking) {
        String clientContact = getClientContact(tracking.getClientId());
        String message = buildPaymentDueMessage(tracking);
        
        sendEmail(clientContact, "Payment Due Reminder", message);
        sendSMS(clientContact, message);
        
        logNotification("PAYMENT_DUE", tracking.getLoanId(), clientContact);
    }
    
    /**
     * Send default warning
     */
    public void sendDefaultWarning(LoanTracking tracking) {
        String clientContact = getClientContact(tracking.getClientId());
        String message = buildDefaultWarningMessage(tracking);
        
        sendEmail(clientContact, "URGENT: Loan Default Warning", message);
        sendSMS(clientContact, message);
        
        logNotification("DEFAULT_WARNING", tracking.getLoanId(), clientContact);
    }
    
    /**
     * Send maturity reminder
     */
    public void sendMaturityReminder(LoanTracking tracking) {
        String clientContact = getClientContact(tracking.getClientId());
        String message = buildMaturityReminderMessage(tracking);
        
        sendEmail(clientContact, "Loan Maturity Notice", message);
        sendSMS(clientContact, message);
        
        logNotification("MATURITY_REMINDER", tracking.getLoanId(), clientContact);
    }
    
    /**
     * Send weekly report to management
     */
    public void sendWeeklyReport(String recipient, String reportContent) {
        sendEmail(recipient, "Weekly Portfolio Report", reportContent);
        logNotification("WEEKLY_REPORT", null, recipient);
    }
    
    /**
     * Send batch notifications for multiple loans
     */
    public void sendBatchLatePaymentNotifications(List<LoanTracking> lateLoans) {
        System.out.println("Sending notifications for " + lateLoans.size() + " late loans...");
        
        for (LoanTracking loan : lateLoans) {
            try {
                sendLatePaymentNotification(loan);
            } catch (Exception e) {
                System.err.println("Failed to send notification for loan " + loan.getLoanId() + ": " + e.getMessage());
            }
        }
        
        System.out.println("Batch notifications completed.");
    }
    
    // ===== MESSAGE BUILDERS =====
    
    private String buildLatePaymentMessage(LoanTracking tracking) {
        return String.format(
            "Dear Customer,\n\n" +
            "Your loan payment for Loan #%s is overdue by %d days.\n" +
            "Outstanding Balance: USh %,.2f\n" +
            "Please make payment immediately to avoid penalties.\n\n" +
            "Thank you.",
            tracking.getLoanNumber(),
            tracking.getDaysLate(),
            tracking.getOutstandingBalance()
        );
    }
    
    private String buildPaymentDueMessage(LoanTracking tracking) {
        return String.format(
            "Dear Customer,\n\n" +
            "Reminder: Payment for Loan #%s is due on %s.\n" +
            "Amount Due: USh %,.2f\n" +
            "Please ensure timely payment.\n\n" +
            "Thank you.",
            tracking.getLoanNumber(),
            tracking.getNextPaymentDueDate(),
            tracking.getExpectedPaymentAmount()
        );
    }
    
    private String buildDefaultWarningMessage(LoanTracking tracking) {
        return String.format(
            "URGENT NOTICE\n\n" +
            "Dear Customer,\n\n" +
            "Your loan #%s is %d days overdue and at risk of default.\n" +
            "Outstanding Balance: USh %,.2f\n" +
            "Contact us immediately to arrange payment.\n\n" +
            "This is a final warning.",
            tracking.getLoanNumber(),
            tracking.getDaysLate(),
            tracking.getOutstandingBalance()
        );
    }
    
    private String buildMaturityReminderMessage(LoanTracking tracking) {
        return String.format(
            "Dear Customer,\n\n" +
            "Your loan #%s will mature on %s.\n" +
            "Final Balance: USh %,.2f\n" +
            "Please ensure full payment by maturity date.\n\n" +
            "Thank you.",
            tracking.getLoanNumber(),
            tracking.getLoanMaturityDate(),
            tracking.getOutstandingBalance()
        );
    }
    
    // ===== CHANNEL IMPLEMENTATIONS =====
    
    private void sendEmail(String recipient, String subject, String body) {
        // TODO: Implement actual email sending
        System.out.println("📧 EMAIL SENT");
        System.out.println("To: " + recipient);
        System.out.println("Subject: " + subject);
        System.out.println("Body: " + body);
        System.out.println("---");
    }
    
    private void sendSMS(String phoneNumber, String message) {
        // TODO: Implement actual SMS sending
        System.out.println("📱 SMS SENT");
        System.out.println("To: " + phoneNumber);
        System.out.println("Message: " + message);
        System.out.println("---");
    }
    
    private void logNotification(String type, Long loanId, String recipient) {
        System.out.println(String.format(
            "[NOTIFICATION LOG] Type: %s, Loan: %s, Recipient: %s, Time: %s",
            type,
            loanId != null ? loanId : "N/A",
            recipient,
            java.time.LocalDateTime.now()
        ));
    }
    
    private String getClientContact(Long clientId) {
        // TODO: Fetch from database
        return "client" + clientId + "@example.com";
    }
}
