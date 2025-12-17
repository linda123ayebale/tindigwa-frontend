package org.example.Controllers;

import org.example.Services.PaymentAnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/payments/analytics")
@CrossOrigin(origins = "http://localhost:3000")
public class PaymentAnalyticsController {

    @Autowired
    private PaymentAnalyticsService analyticsService;

    /**
     * Get payment trends over a date range
     */
    @GetMapping("/trends")
    public ResponseEntity<Map<String, Object>> getPaymentTrends(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "daily") String granularity) {
        
        if (startDate == null) {
            startDate = LocalDate.now().minusMonths(1);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }
        
        return ResponseEntity.ok(analyticsService.getPaymentTrends(startDate, endDate, granularity));
    }

    /**
     * Get payment method distribution
     */
    @GetMapping("/methods")
    public ResponseEntity<Map<String, Object>> getPaymentMethodAnalytics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        if (startDate == null) {
            startDate = LocalDate.now().minusMonths(3);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }
        
        return ResponseEntity.ok(analyticsService.getPaymentMethodAnalytics(startDate, endDate));
    }

    /**
     * Get comprehensive payment summary
     */
    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getPaymentSummary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        if (startDate == null) {
            startDate = LocalDate.now().minusMonths(1);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }
        
        return ResponseEntity.ok(analyticsService.getPaymentSummary(startDate, endDate));
    }

    /**
     * Get collection efficiency metrics
     */
    @GetMapping("/collection-efficiency")
    public ResponseEntity<Map<String, Object>> getCollectionEfficiency(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        if (startDate == null) {
            startDate = LocalDate.now().minusMonths(1);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }
        
        return ResponseEntity.ok(analyticsService.getCollectionEfficiency(startDate, endDate));
    }

    /**
     * Get late payment analysis
     */
    @GetMapping("/late-payments")
    public ResponseEntity<Map<String, Object>> getLatePaymentAnalysis(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        if (startDate == null) {
            startDate = LocalDate.now().minusMonths(3);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }
        
        return ResponseEntity.ok(analyticsService.getLatePaymentAnalysis(startDate, endDate));
    }

    /**
     * Get top performing loans by on-time payments
     */
    @GetMapping("/top-performers")
    public ResponseEntity<Map<String, Object>> getTopPerformers(
            @RequestParam(defaultValue = "10") int limit) {
        
        return ResponseEntity.ok(analyticsService.getTopPerformingLoans(limit));
    }

    /**
     * Get loan payment performance by client
     */
    @GetMapping("/client/{clientId}/performance")
    public ResponseEntity<Map<String, Object>> getClientPaymentPerformance(
            @PathVariable Long clientId) {
        
        return ResponseEntity.ok(analyticsService.getClientPaymentPerformance(clientId));
    }

    /**
     * Get overall portfolio health
     */
    @GetMapping("/portfolio-health")
    public ResponseEntity<Map<String, Object>> getPortfolioHealth() {
        return ResponseEntity.ok(analyticsService.getPortfolioHealth());
    }

    /**
     * Get payment forecasting data
     */
    @GetMapping("/forecast")
    public ResponseEntity<Map<String, Object>> getPaymentForecast(
            @RequestParam(defaultValue = "30") int daysAhead) {
        
        return ResponseEntity.ok(analyticsService.getPaymentForecast(daysAhead));
    }

    /**
     * Get dashboard metrics for current period
     */
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardMetrics() {
        return ResponseEntity.ok(analyticsService.getDashboardMetrics());
    }
}
