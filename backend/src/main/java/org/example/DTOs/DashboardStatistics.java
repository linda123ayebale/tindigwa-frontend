package org.example.DTOs;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Dashboard Statistics DTO
 * Based on frontend loan status logic:
 * - ACTIVE: Within loan duration
 * - OVERDUE: Past due date + within 14 day grace period + within 6 months  
 * - DEFAULTED: Beyond 6 months after due date
 * - COMPLETED: Fully paid (amountPaid >= totalPayable)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatistics {
    
    // === TOP ROW METRICS (Main KPIs) ===
    private Long registeredBorrowers;     // Total clients/borrowers
    private Double totalSavings;          // Total savings amount (if applicable)
    private Double totalLoansReleased;    // SUM(amount_disbursed) FROM loans
    private Double totalCollections;      // SUM(amount_paid) FROM payments
    
    // === LOAN STATUS CARDS (Based on your logic) ===
    private Long activeLoans;            // Loans within duration period (NEW + PROCESSED)
    private Long overdueLoans;           // Loans past due but within 6 months
    private Long defaultedLoans;         // Loans beyond 6 months past due
    private Long completedLoans;         // Fully paid loans (amount_paid >= total_payable)
    
    // === BREAKDOWN OF ACTIVE LOANS ===
    private Long newLoans;               // Active loans with no payments yet
    private Long processedLoans;         // Active loans with payments made
    
    // === ADDITIONAL METRICS ===
    private Long totalClients;           // COUNT(*) FROM persons
    private Long totalLoans;             // COUNT(*) FROM loans
    private Double averageLoanAmount;    // AVG(amount_disbursed) FROM loans
    private Integer averageLoanTenureDays; // AVG(loan_duration_days) FROM loans
    private Double outstandingBalance;   // SUM(total_payable - amount_paid) FROM active loans
    
    // === GENDER DISTRIBUTION ===
    private Long maleBorrowers;          // COUNT(*) FROM persons WHERE gender = 'MALE'
    private Long femaleBorrowers;        // COUNT(*) FROM persons WHERE gender = 'FEMALE'  
    private Double malePercentage;       // Calculated percentage
    private Double femalePercentage;     // Calculated percentage
    
    // === TIME-BASED ANALYTICS (For Charts) ===
    private List<MonthlyData> monthlyLoansReleased;      // Monthly loan disbursements
    private List<MonthlyData> monthlyCollections;        // Monthly payment collections  
    private List<MonthlyData> monthlyPastMaturityLoans;  // Monthly overdue loans count
    
    // === SYSTEM INFO ===
    private LocalDateTime dataLoadedAt;
    private Boolean setupCompleted;
    private String currency = "UGX"; // Uganda Shillings
    
    /**
     * Monthly data for charts
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyData {
        private String month;           // "January"
        private Integer year;           // 2024
        private String monthYear;       // "Jan 2024" (chart label)
        private Double amount;          // Total amount
        private Long count;             // Count of items
        private Integer monthNumber;    // 1-12 (for sorting)
    }
    
    // === CALCULATED FIELDS ===
    
    /**
     * Calculate gender distribution percentages
     */
    public void calculateGenderPercentages() {
        Long total = (maleBorrowers != null ? maleBorrowers : 0) + 
                    (femaleBorrowers != null ? femaleBorrowers : 0);
        if (total > 0) {
            this.malePercentage = Math.round((maleBorrowers * 100.0) / total * 100.0) / 100.0;
            this.femalePercentage = Math.round((femaleBorrowers * 100.0) / total * 100.0) / 100.0;
        } else {
            this.malePercentage = 50.0; // Default equal split if no data
            this.femalePercentage = 50.0;
        }
    }
    
    /**
     * Get total loan count across all statuses
     */
    public Long getTotalLoansCount() {
        return (activeLoans != null ? activeLoans : 0) +
               (overdueLoans != null ? overdueLoans : 0) + 
               (defaultedLoans != null ? defaultedLoans : 0) +
               (completedLoans != null ? completedLoans : 0);
    }
    
    /**
     * Calculate collection rate (payments vs loans released)
     */
    public Double getCollectionRate() {
        if (totalLoansReleased != null && totalLoansReleased > 0) {
            double rate = (totalCollections != null ? totalCollections : 0) / totalLoansReleased * 100;
            return Math.round(rate * 100.0) / 100.0;
        }
        return 0.0;
    }
}