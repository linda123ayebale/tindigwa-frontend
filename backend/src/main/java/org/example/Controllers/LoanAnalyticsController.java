package org.example.Controllers;

import org.example.Entities.LoanTracking;
import org.example.Services.LoanTrackingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Analytics Controller for Loan Tracking
 * Provides advanced analytics, trends, and insights
 */
@RestController
@RequestMapping("/api/loan-analytics")
@CrossOrigin(origins = "*")
public class LoanAnalyticsController {
    
    @Autowired
    private LoanTrackingService trackingService;
    
    /**
     * Get portfolio performance metrics
     * GET /api/loan-analytics/portfolio-performance
     */
    @GetMapping("/portfolio-performance")
    public ResponseEntity<Map<String, Object>> getPortfolioPerformance() {
        Map<String, Object> performance = new HashMap<>();
        
        Double totalOutstanding = trackingService.getTotalOutstandingBalance();
        Double par30 = trackingService.getPortfolioAtRisk(30);
        Double par60 = trackingService.getPortfolioAtRisk(60);
        Double par90 = trackingService.getPortfolioAtRisk(90);
        
        performance.put("totalOutstandingBalance", totalOutstanding);
        performance.put("portfolioAtRisk30", par30);
        performance.put("portfolioAtRisk60", par60);
        performance.put("portfolioAtRisk90", par90);
        
        // Calculate percentages
        if (totalOutstanding != null && totalOutstanding > 0) {
            performance.put("par30Percentage", (par30 != null ? par30 / totalOutstanding * 100 : 0.0));
            performance.put("par60Percentage", (par60 != null ? par60 / totalOutstanding * 100 : 0.0));
            performance.put("par90Percentage", (par90 != null ? par90 / totalOutstanding * 100 : 0.0));
        }
        
        // Get loan counts by status
        List<LoanTracking> lateLoans = trackingService.getLateLoans();
        List<LoanTracking> defaultedLoans = trackingService.getDefaultedLoans();
        
        performance.put("lateLoansCount", lateLoans.size());
        performance.put("defaultedLoansCount", defaultedLoans.size());
        
        return ResponseEntity.ok(performance);
    }
    
    /**
     * Get payment behavior distribution
     * GET /api/loan-analytics/payment-behavior-distribution
     */
    @GetMapping("/payment-behavior-distribution")
    public ResponseEntity<Map<String, Object>> getPaymentBehaviorDistribution() {
        // This would query all tracking records and categorize by behavior score
        Map<String, Object> distribution = new HashMap<>();
        
        // Categories: Excellent (90-100), Good (70-89), Fair (50-69), Poor (<50)
        distribution.put("excellent", 0);  // 90-100
        distribution.put("good", 0);       // 70-89
        distribution.put("fair", 0);       // 50-69
        distribution.put("poor", 0);       // <50
        
        return ResponseEntity.ok(distribution);
    }
    
    /**
     * Get risk score distribution
     * GET /api/loan-analytics/risk-distribution
     */
    @GetMapping("/risk-distribution")
    public ResponseEntity<Map<String, Object>> getRiskDistribution() {
        Map<String, Object> distribution = new HashMap<>();
        
        List<LoanTracking> allLoans = trackingService.getHighRiskLoans(0.0); // Get all loans
        
        long lowRisk = allLoans.stream()
            .filter(t -> t.getDefaultRiskScore() != null && t.getDefaultRiskScore() <= 20)
            .count();
        
        long mediumRisk = allLoans.stream()
            .filter(t -> t.getDefaultRiskScore() != null && t.getDefaultRiskScore() > 20 && t.getDefaultRiskScore() <= 50)
            .count();
        
        long highRisk = allLoans.stream()
            .filter(t -> t.getDefaultRiskScore() != null && t.getDefaultRiskScore() > 50 && t.getDefaultRiskScore() <= 75)
            .count();
        
        long veryHighRisk = allLoans.stream()
            .filter(t -> t.getDefaultRiskScore() != null && t.getDefaultRiskScore() > 75)
            .count();
        
        distribution.put("lowRisk", lowRisk);
        distribution.put("mediumRisk", mediumRisk);
        distribution.put("highRisk", highRisk);
        distribution.put("veryHighRisk", veryHighRisk);
        distribution.put("total", allLoans.size());
        
        return ResponseEntity.ok(distribution);
    }
    
    /**
     * Get top defaulters (clients with multiple late/defaulted loans)
     * GET /api/loan-analytics/top-defaulters?limit=10
     */
    @GetMapping("/top-defaulters")
    public ResponseEntity<List<Map<String, Object>>> getTopDefaulters(
            @RequestParam(defaultValue = "10") int limit) {
        
        List<LoanTracking> lateLoans = trackingService.getLateLoans();
        
        // Group by client and count late loans
        Map<Long, Long> clientLateCounts = lateLoans.stream()
            .collect(Collectors.groupingBy(LoanTracking::getClientId, Collectors.counting()));
        
        // Sort and get top defaulters
        List<Map<String, Object>> topDefaulters = clientLateCounts.entrySet().stream()
            .sorted(Map.Entry.<Long, Long>comparingByValue().reversed())
            .limit(limit)
            .map(entry -> {
                Map<String, Object> defaulter = new HashMap<>();
                defaulter.put("clientId", entry.getKey());
                defaulter.put("lateLoansCount", entry.getValue());
                
                // Calculate total outstanding for this client
                List<LoanTracking> clientLoans = trackingService.getTrackingByClientId(entry.getKey());
                double totalOutstanding = clientLoans.stream()
                    .mapToDouble(t -> t.getOutstandingBalance() != null ? t.getOutstandingBalance() : 0.0)
                    .sum();
                
                defaulter.put("totalOutstanding", totalOutstanding);
                
                return defaulter;
            })
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(topDefaulters);
    }
    
    /**
     * Get best performers (clients with excellent payment records)
     * GET /api/loan-analytics/best-performers?limit=10
     */
    @GetMapping("/best-performers")
    public ResponseEntity<List<Map<String, Object>>> getBestPerformers(
            @RequestParam(defaultValue = "10") int limit) {
        
        // Get all tracking records and find clients with best behavior scores
        List<LoanTracking> allLoans = trackingService.getHighRiskLoans(0.0);
        
        // Group by client and calculate average behavior score
        Map<Long, Double> clientBehaviorScores = allLoans.stream()
            .filter(t -> t.getPaymentBehaviorScore() != null)
            .collect(Collectors.groupingBy(
                LoanTracking::getClientId,
                Collectors.averagingDouble(t -> t.getPaymentBehaviorScore() != null ? t.getPaymentBehaviorScore() : 0.0)
            ));
        
        // Sort and get top performers
        List<Map<String, Object>> bestPerformers = clientBehaviorScores.entrySet().stream()
            .sorted(Map.Entry.<Long, Double>comparingByValue().reversed())
            .limit(limit)
            .map(entry -> {
                Map<String, Object> performer = new HashMap<>();
                performer.put("clientId", entry.getKey());
                performer.put("averageBehaviorScore", entry.getValue());
                
                // Get loan count for this client
                List<LoanTracking> clientLoans = trackingService.getTrackingByClientId(entry.getKey());
                performer.put("totalLoans", clientLoans.size());
                
                return performer;
            })
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(bestPerformers);
    }
    
    /**
     * Get loans due in next N days
     * GET /api/loan-analytics/upcoming-due-loans?days=7
     */
    @GetMapping("/upcoming-due-loans")
    public ResponseEntity<Map<String, Object>> getUpcomingDueLoans(
            @RequestParam(defaultValue = "7") int days) {
        
        LocalDate today = LocalDate.now();
        LocalDate futureDate = today.plusDays(days);
        
        List<LoanTracking> upcomingLoans = trackingService.getLoansDueBetween(today, futureDate);
        
        // Calculate total expected payments
        double totalExpected = upcomingLoans.stream()
            .mapToDouble(t -> t.getExpectedPaymentAmount() != null ? t.getExpectedPaymentAmount() : 0.0)
            .sum();
        
        Map<String, Object> result = new HashMap<>();
        result.put("count", upcomingLoans.size());
        result.put("totalExpectedPayment", totalExpected);
        result.put("loans", upcomingLoans);
        
        return ResponseEntity.ok(result);
    }
    
    /**
     * Get completion rate statistics
     * GET /api/loan-analytics/completion-stats
     */
    @GetMapping("/completion-stats")
    public ResponseEntity<Map<String, Object>> getCompletionStats() {
        List<LoanTracking> allLoans = trackingService.getHighRiskLoans(0.0);
        
        Map<String, Long> completionRanges = new HashMap<>();
        completionRanges.put("0-25%", allLoans.stream()
            .filter(t -> t.getCompletionPercentage() != null && t.getCompletionPercentage() <= 25)
            .count());
        
        completionRanges.put("26-50%", allLoans.stream()
            .filter(t -> t.getCompletionPercentage() != null && t.getCompletionPercentage() > 25 && t.getCompletionPercentage() <= 50)
            .count());
        
        completionRanges.put("51-75%", allLoans.stream()
            .filter(t -> t.getCompletionPercentage() != null && t.getCompletionPercentage() > 50 && t.getCompletionPercentage() <= 75)
            .count());
        
        completionRanges.put("76-99%", allLoans.stream()
            .filter(t -> t.getCompletionPercentage() != null && t.getCompletionPercentage() > 75 && t.getCompletionPercentage() < 100)
            .count());
        
        completionRanges.put("100%", allLoans.stream()
            .filter(t -> t.getCompletionPercentage() != null && t.getCompletionPercentage() >= 100)
            .count());
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("completionRanges", completionRanges);
        stats.put("totalLoans", allLoans.size());
        
        // Calculate average completion percentage
        double avgCompletion = allLoans.stream()
            .filter(t -> t.getCompletionPercentage() != null)
            .mapToDouble(LoanTracking::getCompletionPercentage)
            .average()
            .orElse(0.0);
        
        stats.put("averageCompletion", avgCompletion);
        
        return ResponseEntity.ok(stats);
    }
}
