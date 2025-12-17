package org.example.Scheduler;

import org.example.Entities.LoanTracking;
import org.example.Services.LoanTrackingService;
import org.example.Services.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Scheduled Jobs for Loan Tracking System
 * 
 * Runs automated checks and updates:
 * - Daily late loan detection
 * - Metrics recalculation
 * - Risk assessment updates
 */
@Component
public class LoanTrackingScheduler {
    
    @Autowired
    private LoanTrackingService trackingService;
    
    @Autowired
    private NotificationService notificationService;
    
    /**
     * Check for late loans every day at 1:00 AM
     */
    @Scheduled(cron = "0 0 1 * * *")
    public void checkLateLoansDailyAt1AM() {
        System.out.println("=== Daily Late Loan Check Started at " + LocalDateTime.now() + " ===");
        
        try {
            // Recalculate metrics for all loans
            int updated = trackingService.recalculateAllMetrics();
            
            // Get late loans
            List<LoanTracking> lateLoans = trackingService.getLateLoans();
            
            // Get defaulted loans
            List<LoanTracking> defaultedLoans = trackingService.getDefaultedLoans();
            
            // Get high-risk loans
            List<LoanTracking> highRiskLoans = trackingService.getHighRiskLoans(50.0);
            
            // Log summary
            System.out.println("Daily Check Summary:");
            System.out.println("- Loans Updated: " + updated);
            System.out.println("- Late Loans: " + lateLoans.size());
            System.out.println("- Defaulted Loans: " + defaultedLoans.size());
            System.out.println("- High-Risk Loans: " + highRiskLoans.size());
            
            // Send notifications for late loans
            if (!lateLoans.isEmpty()) {
                notificationService.sendBatchLatePaymentNotifications(lateLoans);
            }
            
            // Send default warnings
            for (LoanTracking defaulted : defaultedLoans) {
                notificationService.sendDefaultWarning(defaulted);
            }
            
        } catch (Exception e) {
            System.err.println("Error in daily late loan check: " + e.getMessage());
            e.printStackTrace();
        }
        
        System.out.println("=== Daily Late Loan Check Completed ===");
    }
    
    /**
     * Check for due payments every day at 8:00 AM
     */
    @Scheduled(cron = "0 0 8 * * *")
    public void checkPaymentsDueToday() {
        System.out.println("=== Checking Payments Due Today at " + LocalDateTime.now() + " ===");
        
        try {
            java.time.LocalDate today = java.time.LocalDate.now();
            List<LoanTracking> dueToday = trackingService.getLoansDueBetween(today, today);
            
            System.out.println("Loans with payments due today: " + dueToday.size());
            
            // Send payment reminders
            for (LoanTracking loan : dueToday) {
                notificationService.sendPaymentDueReminder(loan);
            }
            
        } catch (Exception e) {
            System.err.println("Error checking payments due today: " + e.getMessage());
        }
    }
    
    /**
     * Weekly portfolio health check every Monday at 9:00 AM
     */
    @Scheduled(cron = "0 0 9 * * MON")
    public void weeklyPortfolioHealthCheck() {
        System.out.println("=== Weekly Portfolio Health Check at " + LocalDateTime.now() + " ===");
        
        try {
            Double totalOutstanding = trackingService.getTotalOutstandingBalance();
            Double par30 = trackingService.getPortfolioAtRisk(30);
            Double par60 = trackingService.getPortfolioAtRisk(60);
            Double par90 = trackingService.getPortfolioAtRisk(90);
            
            System.out.println("Portfolio Health Report:");
            System.out.println("- Total Outstanding: USh " + String.format("%,.2f", totalOutstanding != null ? totalOutstanding : 0.0));
            System.out.println("- PAR 30: USh " + String.format("%,.2f", par30 != null ? par30 : 0.0));
            System.out.println("- PAR 60: USh " + String.format("%,.2f", par60 != null ? par60 : 0.0));
            System.out.println("- PAR 90: USh " + String.format("%,.2f", par90 != null ? par90 : 0.0));
            
            // Calculate PAR percentages
            if (totalOutstanding != null && totalOutstanding > 0) {
                double par30Pct = (par30 != null ? par30 / totalOutstanding * 100 : 0.0);
                double par60Pct = (par60 != null ? par60 / totalOutstanding * 100 : 0.0);
                double par90Pct = (par90 != null ? par90 / totalOutstanding * 100 : 0.0);
                
                System.out.println("- PAR 30%: " + String.format("%.2f", par30Pct) + "%");
                System.out.println("- PAR 60%: " + String.format("%.2f", par60Pct) + "%");
                System.out.println("- PAR 90%: " + String.format("%.2f", par90Pct) + "%");
            }
            
            // TODO: Send weekly report email to management
            
        } catch (Exception e) {
            System.err.println("Error in weekly portfolio check: " + e.getMessage());
        }
    }
    
    /**
     * Monthly metrics recalculation on 1st of each month at 2:00 AM
     */
    @Scheduled(cron = "0 0 2 1 * *")
    public void monthlyMetricsRecalculation() {
        System.out.println("=== Monthly Metrics Recalculation at " + LocalDateTime.now() + " ===");
        
        try {
            int updated = trackingService.recalculateAllMetrics();
            System.out.println("Monthly recalculation completed. Updated " + updated + " loans.");
            
        } catch (Exception e) {
            System.err.println("Error in monthly recalculation: " + e.getMessage());
        }
    }
    
    /**
     * Check for loans approaching maturity (7 days before)
     * Runs daily at 10:00 AM
     */
    @Scheduled(cron = "0 0 10 * * *")
    public void checkLoansApproachingMaturity() {
        System.out.println("=== Checking Loans Approaching Maturity ===");
        
        try {
            java.time.LocalDate today = java.time.LocalDate.now();
            java.time.LocalDate sevenDaysLater = today.plusDays(7);
            
            List<LoanTracking> approachingMaturity = trackingService.getLoansDueBetween(today, sevenDaysLater);
            
            System.out.println("Loans maturing in next 7 days: " + approachingMaturity.size());
            
            // Send maturity reminders
            for (LoanTracking loan : approachingMaturity) {
                notificationService.sendMaturityReminder(loan);
            }
            
        } catch (Exception e) {
            System.err.println("Error checking loans approaching maturity: " + e.getMessage());
        }
    }
}
