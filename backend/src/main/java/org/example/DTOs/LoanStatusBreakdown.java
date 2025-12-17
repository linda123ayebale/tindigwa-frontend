package org.example.DTOs;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

/**
 * Loan Status Breakdown DTO
 * Contains ONLY loan status related fields for /api/dashboard/loan-status endpoint
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoanStatusBreakdown {
    
    // === LOAN STATUS COUNTS ===
    private Long activeLoans;            // Loans within duration period
    private Long overdueLoans;           // Loans past due but within 6 months
    private Long defaultedLoans;         // Loans beyond 6 months past due
    private Long completedLoans;         // Fully paid loans
    
    // === BREAKDOWN OF ACTIVE LOANS ===
    private Long newLoans;               // Active loans with no payments yet
    private Long processedLoans;         // Active loans with payments made
    
    // === TOTAL LOANS COUNT ===
    private Long totalLoans;             // Total count of all loans
    
    // === SYSTEM INFO ===
    private LocalDateTime dataLoadedAt;
    private String currency = "UGX";     // Uganda Shillings
    
    /**
     * Get total loan count across all statuses
     */
    public Long getTotalLoansCount() {
        return (activeLoans != null ? activeLoans : 0) +
               (overdueLoans != null ? overdueLoans : 0) + 
               (defaultedLoans != null ? defaultedLoans : 0) +
               (completedLoans != null ? completedLoans : 0);
    }
}