package org.example.Services;

import org.example.Entities.LoanDetails;
import org.example.enums.LoanStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

/**
 * Service for calculating loan status based on business rules:
 * 
 * Business Rules:
 * - OPEN: Loan approved but no installment paid yet
 * - IN_PROGRESS: First installment made as agreed on agreed date
 * - CLOSED: Completely paid within agreed time or maturity date
 * - OVERDUE: Beyond maturity date + 14 days grace period and not yet paid
 * - DEFAULTED: Not paid for 6+ months after maturity date
 */
@Service
public class LoanStatusCalculator {
    
    private static final int GRACE_PERIOD_DAYS = 14;
    private static final int DEFAULT_PERIOD_MONTHS = 6;
    
    /**
     * Calculate the current status of a loan based on business rules
     * 
     * @param loan The loan details
     * @param totalPaid Total amount paid so far
     * @param hasAnyPayments Whether any payments have been made
     * @return The calculated loan status
     */
    public LoanStatus calculateLoanStatus(LoanDetails loan, double totalPaid, boolean hasAnyPayments) {
        LocalDate today = LocalDate.now();
        LocalDate maturityDate = loan.getPaymentEndDate();
        double totalDue = loan.getTotalPayable();
        
        // Rule 1: CLOSED - Fully paid
        if (isFullyPaid(totalPaid, totalDue)) {
            return LoanStatus.CLOSED;
        }
        
        // Rule 2: OPEN - No payments made yet
        if (!hasAnyPayments) {
            return LoanStatus.OPEN;
        }
        
        // Rule 3: DEFAULTED - 6+ months after maturity with no full payment
        if (maturityDate != null && isDefaulted(today, maturityDate)) {
            return LoanStatus.DEFAULTED;
        }
        
        // Rule 4: OVERDUE - Beyond maturity + 14 days grace period
        if (maturityDate != null && isOverdue(today, maturityDate)) {
            return LoanStatus.OVERDUE;
        }
        
        // Rule 5: IN_PROGRESS - Payments being made as agreed
        return LoanStatus.IN_PROGRESS;
    }
    
    /**
     * Check if loan is fully paid (allowing for small floating point differences)
     */
    private boolean isFullyPaid(double totalPaid, double totalDue) {
        // If totalDue is 0 or very small, the loan is not properly configured, not fully paid
        if (totalDue <= 0.01) {
            return false;
        }
        
        // Check if paid amount covers the total due (allowing for small floating point differences)
        return totalPaid >= (totalDue - 0.01);
    }
    
    /**
     * Check if loan is overdue (beyond maturity + grace period)
     */
    private boolean isOverdue(LocalDate today, LocalDate maturityDate) {
        LocalDate overdueDate = maturityDate.plusDays(GRACE_PERIOD_DAYS);
        return today.isAfter(overdueDate);
    }
    
    /**
     * Check if loan is defaulted (6+ months after maturity)
     */
    private boolean isDefaulted(LocalDate today, LocalDate maturityDate) {
        LocalDate defaultDate = maturityDate.plusMonths(DEFAULT_PERIOD_MONTHS);
        return today.isAfter(defaultDate);
    }
    
    /**
     * Get additional status information for display
     */
    public LoanStatusInfo getStatusInfo(LoanDetails loan, double totalPaid, boolean hasAnyPayments) {
        LoanStatus status = calculateLoanStatus(loan, totalPaid, hasAnyPayments);
        LocalDate today = LocalDate.now();
        LocalDate maturityDate = loan.getPaymentEndDate();
        
        LoanStatusInfo info = new LoanStatusInfo();
        info.setStatus(status);
        info.setDisplayName(status.getDisplayName());
        info.setCssClass(status.getCssClass());
        
        // Calculate days information
        if (maturityDate != null) {
            long daysToMaturity = ChronoUnit.DAYS.between(today, maturityDate);
            long daysSinceMaturity = ChronoUnit.DAYS.between(maturityDate, today);
            
            info.setDaysToMaturity((int) daysToMaturity);
            info.setDaysSinceMaturity((int) daysSinceMaturity);
            
            // Set additional context based on status
            switch (status) {
                case OVERDUE:
                    int overdueDays = (int) daysSinceMaturity - GRACE_PERIOD_DAYS;
                    info.setAdditionalInfo(overdueDays + " days overdue");
                    break;
                case DEFAULTED:
                    long monthsDefault = ChronoUnit.MONTHS.between(maturityDate, today);
                    info.setAdditionalInfo(monthsDefault + " months in default");
                    break;
                case IN_PROGRESS:
                    if (daysToMaturity > 0) {
                        info.setAdditionalInfo(daysToMaturity + " days remaining");
                    } else if (daysSinceMaturity <= GRACE_PERIOD_DAYS) {
                        info.setAdditionalInfo("In grace period (" + (GRACE_PERIOD_DAYS - daysSinceMaturity) + " days left)");
                    }
                    break;
                case CLOSED:
                    info.setAdditionalInfo("Paid in full");
                    break;
                case OPEN:
                    if (daysToMaturity > 0) {
                        info.setAdditionalInfo(daysToMaturity + " days to start");
                    } else {
                        info.setAdditionalInfo("Payment due");
                    }
                    break;
            }
        }
        
        return info;
    }
    
    /**
     * Inner class to hold comprehensive status information
     */
    public static class LoanStatusInfo {
        private LoanStatus status;
        private String displayName;
        private String cssClass;
        private int daysToMaturity;
        private int daysSinceMaturity;
        private String additionalInfo;
        
        // Getters and Setters
        public LoanStatus getStatus() { return status; }
        public void setStatus(LoanStatus status) { this.status = status; }
        
        public String getDisplayName() { return displayName; }
        public void setDisplayName(String displayName) { this.displayName = displayName; }
        
        public String getCssClass() { return cssClass; }
        public void setCssClass(String cssClass) { this.cssClass = cssClass; }
        
        public int getDaysToMaturity() { return daysToMaturity; }
        public void setDaysToMaturity(int daysToMaturity) { this.daysToMaturity = daysToMaturity; }
        
        public int getDaysSinceMaturity() { return daysSinceMaturity; }
        public void setDaysSinceMaturity(int daysSinceMaturity) { this.daysSinceMaturity = daysSinceMaturity; }
        
        public String getAdditionalInfo() { return additionalInfo; }
        public void setAdditionalInfo(String additionalInfo) { this.additionalInfo = additionalInfo; }
    }
}