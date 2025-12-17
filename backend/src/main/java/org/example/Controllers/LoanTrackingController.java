package org.example.Controllers;

import org.example.Entities.LoanTracking;
import org.example.Services.LoanTrackingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * REST API Controller for Loan Tracking
 * Provides endpoints to access loan tracking data and metrics
 */
@RestController
@RequestMapping("/api/loan-tracking")
@CrossOrigin(origins = "*")
public class LoanTrackingController {
    
    @Autowired
    private LoanTrackingService trackingService;
    
    @Autowired
    private org.example.Services.LoanPaymentsService loanPaymentsService;
    
    @Autowired
    private org.example.Repositories.LoanDetailsRepository loanDetailsRepository;
    
    /**
     * Get tracking data for a specific loan
     * GET /api/loan-tracking/loan/{loanId}
     */
    @GetMapping("/loan/{loanId}")
    public ResponseEntity<?> getTrackingByLoanId(@PathVariable Long loanId) {
        Optional<LoanTracking> tracking = trackingService.getTrackingByLoanId(loanId);
        if (tracking.isPresent()) {
            return ResponseEntity.ok(tracking.get());
        }
        return ResponseEntity.notFound().build();
    }
    
    /**
     * Get comprehensive tracking data for a specific loan
     * Includes: tracking data, loan details, payment history, financial summary
     * GET /api/loan-tracking/loan/{loanId}/comprehensive
     */
    @GetMapping("/loan/{loanId}/comprehensive")
    public ResponseEntity<?> getComprehensiveTracking(@PathVariable Long loanId) {
        try {
            Map<String, Object> comprehensive = new HashMap<>();
            
            // 1. Get tracking data
            Optional<LoanTracking> trackingOpt = trackingService.getTrackingByLoanId(loanId);
            if (trackingOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            LoanTracking tracking = trackingOpt.get();
            comprehensive.put("tracking", tracking);
            
            // 2. Get loan details
            var loanOpt = loanDetailsRepository.findById(loanId);
            if (loanOpt.isPresent()) {
                comprehensive.put("loan", loanOpt.get());
            }
            
            // 3. Get payment history
            var paymentHistory = loanPaymentsService.getPaymentHistory(loanId);
            comprehensive.put("paymentHistory", paymentHistory);
            comprehensive.put("paymentCount", paymentHistory.size());
            
            // 4. Get payment summary
            var paymentSummary = loanPaymentsService.getPaymentSummary(loanId);
            comprehensive.put("paymentSummary", paymentSummary);
            
            // 5. Get loan balance details
            var loanBalance = loanPaymentsService.getLoanBalance(loanId);
            comprehensive.put("balance", loanBalance);
            
            // 6. Calculate additional metrics
            Map<String, Object> metrics = new HashMap<>();
            metrics.put("completionPercentage", tracking.getCompletionPercentage());
            metrics.put("onTimePaymentRate", calculateOnTimeRate(tracking));
            metrics.put("averageDaysToPay", calculateAverageDaysToPay(paymentHistory));
            metrics.put("paymentConsistency", tracking.getPaymentPattern());
            metrics.put("riskLevel", getRiskLevel(tracking.getDefaultRiskScore()));
            comprehensive.put("metrics", metrics);
            
            // 7. Status indicators
            Map<String, Object> status = new HashMap<>();
            status.put("isLate", tracking.getIsLate());
            status.put("daysOverdue", tracking.getDaysLate());
            status.put("nextPaymentDue", tracking.getNextPaymentDueDate());
            status.put("loanStatus", tracking.getLoanStatus());
            status.put("hasPartialPayments", tracking.getHasPartialPayments());
            status.put("hasOverpayments", tracking.getHasOverpayments());
            comprehensive.put("status", status);
            
            return ResponseEntity.ok(comprehensive);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to fetch comprehensive tracking: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }
    
    // Helper methods
    private double calculateOnTimeRate(LoanTracking tracking) {
        Integer onTime = tracking.getOnTimePaymentCount();
        Integer total = tracking.getInstallmentsPaid();
        if (total == null || total == 0) return 0.0;
        if (onTime == null) return 0.0;
        return (onTime * 100.0) / total;
    }
    
    private double calculateAverageDaysToPay(List<?> paymentHistory) {
        // Simplified - could be enhanced with actual day calculations
        return 0.0;
    }
    
    private String getRiskLevel(Double riskScore) {
        if (riskScore == null) return "UNKNOWN";
        if (riskScore >= 70) return "HIGH";
        if (riskScore >= 40) return "MEDIUM";
        return "LOW";
    }
    
    /**
     * Get all tracking records for a client
     * GET /api/loan-tracking/client/{clientId}
     */
    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<LoanTracking>> getTrackingByClientId(@PathVariable Long clientId) {
        List<LoanTracking> tracking = trackingService.getTrackingByClientId(clientId);
        return ResponseEntity.ok(tracking);
    }
    
    /**
     * Get all late loans
     * GET /api/loan-tracking/late
     */
    @GetMapping("/late")
    public ResponseEntity<List<LoanTracking>> getLateLoans() {
        List<LoanTracking> lateLoans = trackingService.getLateLoans();
        return ResponseEntity.ok(lateLoans);
    }
    
    /**
     * Get all defaulted loans
     * GET /api/loan-tracking/defaulted
     */
    @GetMapping("/defaulted")
    public ResponseEntity<List<LoanTracking>> getDefaultedLoans() {
        List<LoanTracking> defaultedLoans = trackingService.getDefaultedLoans();
        return ResponseEntity.ok(defaultedLoans);
    }
    
    /**
     * Get high-risk loans (default risk score above threshold)
     * GET /api/loan-tracking/high-risk?threshold=50
     */
    @GetMapping("/high-risk")
    public ResponseEntity<List<LoanTracking>> getHighRiskLoans(
            @RequestParam(defaultValue = "50.0") Double threshold) {
        List<LoanTracking> highRiskLoans = trackingService.getHighRiskLoans(threshold);
        return ResponseEntity.ok(highRiskLoans);
    }
    
    /**
     * Get loans due in a date range
     * GET /api/loan-tracking/due?startDate=2024-10-01&endDate=2024-10-31
     */
    @GetMapping("/due")
    public ResponseEntity<List<LoanTracking>> getLoansDueBetween(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<LoanTracking> dueLoans = trackingService.getLoansDueBetween(startDate, endDate);
        return ResponseEntity.ok(dueLoans);
    }
    
    /**
     * Get portfolio summary metrics
     * GET /api/loan-tracking/portfolio-summary
     */
    @GetMapping("/portfolio-summary")
    public ResponseEntity<Map<String, Object>> getPortfolioSummary() {
        Map<String, Object> summary = new HashMap<>();
        
        summary.put("totalOutstandingBalance", trackingService.getTotalOutstandingBalance());
        summary.put("portfolioAtRisk30Days", trackingService.getPortfolioAtRisk(30));
        summary.put("portfolioAtRisk60Days", trackingService.getPortfolioAtRisk(60));
        summary.put("portfolioAtRisk90Days", trackingService.getPortfolioAtRisk(90));
        
        List<LoanTracking> lateLoans = trackingService.getLateLoans();
        List<LoanTracking> defaultedLoans = trackingService.getDefaultedLoans();
        List<LoanTracking> highRiskLoans = trackingService.getHighRiskLoans(50.0);
        
        summary.put("lateLoanCount", lateLoans.size());
        summary.put("defaultedLoanCount", defaultedLoans.size());
        summary.put("highRiskLoanCount", highRiskLoans.size());
        
        return ResponseEntity.ok(summary);
    }
    
    /**
     * Get risk dashboard data
     * GET /api/loan-tracking/risk-dashboard
     */
    @GetMapping("/risk-dashboard")
    public ResponseEntity<Map<String, Object>> getRiskDashboard() {
        Map<String, Object> dashboard = new HashMap<>();
        
        // High-risk loans by category
        dashboard.put("highRisk", trackingService.getHighRiskLoans(50.0));
        dashboard.put("mediumRisk", trackingService.getHighRiskLoans(30.0).stream()
            .filter(t -> t.getDefaultRiskScore() < 50.0)
            .toList());
        
        // Late loans
        dashboard.put("lateLoans", trackingService.getLateLoans());
        
        // Defaulted loans
        dashboard.put("defaultedLoans", trackingService.getDefaultedLoans());
        
        // Portfolio metrics
        dashboard.put("totalOutstanding", trackingService.getTotalOutstandingBalance());
        dashboard.put("portfolioAtRisk", trackingService.getPortfolioAtRisk(30));
        
        return ResponseEntity.ok(dashboard);
    }
    
    /**
     * Get payment behavior report for client
     * GET /api/loan-tracking/client/{clientId}/behavior
     */
    @GetMapping("/client/{clientId}/behavior")
    public ResponseEntity<Map<String, Object>> getClientBehaviorReport(@PathVariable Long clientId) {
        List<LoanTracking> clientLoans = trackingService.getTrackingByClientId(clientId);
        
        Map<String, Object> report = new HashMap<>();
        report.put("totalLoans", clientLoans.size());
        
        // Calculate averages
        double avgBehaviorScore = clientLoans.stream()
            .filter(t -> t.getPaymentBehaviorScore() != null)
            .mapToDouble(LoanTracking::getPaymentBehaviorScore)
            .average()
            .orElse(0.0);
        
        double avgRiskScore = clientLoans.stream()
            .filter(t -> t.getDefaultRiskScore() != null)
            .mapToDouble(LoanTracking::getDefaultRiskScore)
            .average()
            .orElse(0.0);
        
        long lateCount = clientLoans.stream()
            .filter(t -> t.getIsLate() != null && t.getIsLate())
            .count();
        
        report.put("averageBehaviorScore", avgBehaviorScore);
        report.put("averageRiskScore", avgRiskScore);
        report.put("lateLoansCount", lateCount);
        report.put("loans", clientLoans);
        
        return ResponseEntity.ok(report);
    }
    
    /**
     * Recalculate metrics for a specific loan
     * POST /api/loan-tracking/loan/{loanId}/recalculate
     */
    @PostMapping("/loan/{loanId}/recalculate")
    public ResponseEntity<?> recalculateMetrics(@PathVariable Long loanId) {
        try {
            LoanTracking updated = trackingService.recalculateMetrics(loanId);
            if (updated != null) {
                return ResponseEntity.ok(updated);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error recalculating metrics: " + e.getMessage());
        }
    }
    
    /**
     * Recalculate metrics for all loans
     * POST /api/loan-tracking/recalculate-all
     */
    @PostMapping("/recalculate-all")
    public ResponseEntity<Map<String, Object>> recalculateAllMetrics() {
        try {
            int updated = trackingService.recalculateAllMetrics();
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("loansUpdated", updated);
            result.put("message", "Successfully recalculated metrics for " + updated + " loans");
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Error recalculating metrics: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Get loans with specific payment pattern
     * GET /api/loan-tracking/pattern/{pattern}
     * Patterns: CONSISTENT, IRREGULAR, DETERIORATING
     */
    @GetMapping("/pattern/{pattern}")
    public ResponseEntity<List<LoanTracking>> getLoansByPattern(@PathVariable String pattern) {
        // This would need a repository method - for now return empty
        return ResponseEntity.ok(List.of());
    }
}
