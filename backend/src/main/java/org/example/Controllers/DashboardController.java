package org.example.Controllers;

import org.example.DTOs.DashboardStatistics;
import org.example.DTOs.LoanStatusBreakdown;
import org.example.Services.StatisticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Dashboard Controller
 * Provides unified dashboard endpoints that replace multiple separate API calls
 * Main endpoint: /api/dashboard returns all dashboard data in one call
 */
@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class DashboardController {

    @Autowired
    private StatisticsService statisticsService;

    /**
     * Main Dashboard Endpoint
     * GET /api/dashboard
     * Returns: All dashboard statistics in one API call
     * Replaces multiple calls to /api/clients, /api/loans, /api/payments
     */
    @GetMapping
    public ResponseEntity<DashboardStatistics> getDashboardData() {
        try {
            DashboardStatistics dashboardData = statisticsService.getDashboardStatistics();
            return ResponseEntity.ok(dashboardData);
        } catch (Exception e) {
            // Return empty dashboard data with error indicator
            DashboardStatistics errorData = new DashboardStatistics();
            errorData.setSetupCompleted(false);
            return ResponseEntity.status(500).body(errorData);
        }
    }

    /**
     * Dashboard Summary Endpoint (lighter version)
     * GET /api/dashboard/summary
     * Returns: Essential metrics only for quick loading
     */
    @GetMapping("/summary")
    public ResponseEntity<DashboardStatistics> getDashboardSummary() {
        try {
            DashboardStatistics summaryData = statisticsService.getSummaryStatistics();
            return ResponseEntity.ok(summaryData);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new DashboardStatistics());
        }
    }

    /**
     * Loan Status Breakdown Endpoint
     * GET /api/dashboard/loan-status
     * Returns: ONLY loan status counts (Active, Overdue, Defaulted, Completed, New, Processed, Total)
     */
    @GetMapping("/loan-status")
    public ResponseEntity<LoanStatusBreakdown> getLoanStatusBreakdown() {
        try {
            LoanStatusBreakdown loanStatusData = statisticsService.getLoanStatusBreakdownOnly();
            return ResponseEntity.ok(loanStatusData);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new LoanStatusBreakdown());
        }
    }

    /**
     * Dashboard Cards Data Endpoint
     * GET /api/dashboard/cards
     * Returns: Data specifically formatted for dashboard cards
     */
    @GetMapping("/cards")
    public ResponseEntity<Map<String, Object>> getDashboardCards() {
        try {
            DashboardStatistics stats = statisticsService.getDashboardStatistics();
            
            Map<String, Object> cardsData = new HashMap<>();
            
            // Top row cards (Main KPIs)
            Map<String, Object> topCards = new HashMap<>();
            topCards.put("registeredBorrowers", stats.getRegisteredBorrowers());
            topCards.put("totalSavings", stats.getTotalSavings());
            topCards.put("totalLoansReleased", stats.getTotalLoansReleased());
            topCards.put("totalCollections", stats.getTotalCollections());
            cardsData.put("topMetrics", topCards);
            
            // Loan status cards
            Map<String, Object> loanCards = new HashMap<>();
            loanCards.put("activeLoans", stats.getActiveLoans());
            loanCards.put("overdueLoans", stats.getOverdueLoans());
            loanCards.put("defaultedLoans", stats.getDefaultedLoans());
            loanCards.put("completedLoans", stats.getCompletedLoans());
            cardsData.put("loanStatus", loanCards);
            
            // Chart data
            cardsData.put("monthlyLoansReleased", stats.getMonthlyLoansReleased());
            cardsData.put("monthlyCollections", stats.getMonthlyCollections());
            cardsData.put("monthlyPastMaturityLoans", stats.getMonthlyPastMaturityLoans());
            
            // Gender distribution for pie chart
            Map<String, Object> genderData = new HashMap<>();
            genderData.put("maleBorrowers", stats.getMaleBorrowers());
            genderData.put("femaleBorrowers", stats.getFemaleBorrowers());
            genderData.put("malePercentage", stats.getMalePercentage());
            genderData.put("femalePercentage", stats.getFemalePercentage());
            cardsData.put("genderDistribution", genderData);
            
            // Additional metrics
            cardsData.put("averageLoanTenureDays", stats.getAverageLoanTenureDays());
            cardsData.put("outstandingBalance", stats.getOutstandingBalance());
            cardsData.put("timestamp", stats.getDataLoadedAt());
            cardsData.put("currency", stats.getCurrency());
            
            return ResponseEntity.ok(cardsData);
            
        } catch (Exception e) {
            Map<String, Object> errorData = new HashMap<>();
            errorData.put("error", "Unable to load dashboard cards");
            errorData.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorData);
        }
    }
}