package org.example.Controllers;

import org.example.Services.FinancialAnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Map;

@RestController
@RequestMapping("/api/financial-analytics")
@CrossOrigin(origins = "*")
public class FinancialAnalyticsController {
    
    @Autowired
    private FinancialAnalyticsService analyticsService;
    
    // Get comprehensive financial summary
    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getFinancialSummary(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            Map<String, Object> summary = analyticsService.getFinancialSummary(startDate, endDate);
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Get financial summary for current month
    @GetMapping("/summary/current-month")
    public ResponseEntity<Map<String, Object>> getCurrentMonthSummary() {
        try {
            YearMonth currentMonth = YearMonth.now();
            LocalDate startDate = currentMonth.atDay(1);
            LocalDate endDate = currentMonth.atEndOfMonth();
            
            Map<String, Object> summary = analyticsService.getFinancialSummary(startDate, endDate);
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Get financial summary for current year
    @GetMapping("/summary/current-year")
    public ResponseEntity<Map<String, Object>> getCurrentYearSummary() {
        try {
            int currentYear = LocalDate.now().getYear();
            LocalDate startDate = LocalDate.of(currentYear, 1, 1);
            LocalDate endDate = LocalDate.of(currentYear, 12, 31);
            
            Map<String, Object> summary = analyticsService.getFinancialSummary(startDate, endDate);
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Get cash flow analysis
    @GetMapping("/cash-flow")
    public ResponseEntity<Map<String, Object>> getCashFlowAnalysis(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            Map<String, Object> cashFlow = analyticsService.getCashFlowAnalysis(startDate, endDate);
            return ResponseEntity.ok(cashFlow);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Get cash flow for last 12 months
    @GetMapping("/cash-flow/last-12-months")
    public ResponseEntity<Map<String, Object>> getCashFlowLast12Months() {
        try {
            LocalDate endDate = LocalDate.now();
            LocalDate startDate = endDate.minusMonths(12);
            
            Map<String, Object> cashFlow = analyticsService.getCashFlowAnalysis(startDate, endDate);
            return ResponseEntity.ok(cashFlow);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Get category analysis
    @GetMapping("/categories")
    public ResponseEntity<Map<String, Object>> getCategoryAnalysis(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            Map<String, Object> analysis = analyticsService.getCategoryAnalysis(startDate, endDate);
            return ResponseEntity.ok(analysis);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Get category analysis for current month
    @GetMapping("/categories/current-month")
    public ResponseEntity<Map<String, Object>> getCurrentMonthCategoryAnalysis() {
        try {
            YearMonth currentMonth = YearMonth.now();
            LocalDate startDate = currentMonth.atDay(1);
            LocalDate endDate = currentMonth.atEndOfMonth();
            
            Map<String, Object> analysis = analyticsService.getCategoryAnalysis(startDate, endDate);
            return ResponseEntity.ok(analysis);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Get expense trends
    @GetMapping("/trends")
    public ResponseEntity<Map<String, Object>> getExpenseTrends(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            Map<String, Object> trends = analyticsService.getExpenseTrends(startDate, endDate);
            return ResponseEntity.ok(trends);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Get trends for last 6 months
    @GetMapping("/trends/last-6-months")
    public ResponseEntity<Map<String, Object>> getTrendsLast6Months() {
        try {
            LocalDate endDate = LocalDate.now();
            LocalDate startDate = endDate.minusMonths(6);
            
            Map<String, Object> trends = analyticsService.getExpenseTrends(startDate, endDate);
            return ResponseEntity.ok(trends);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Get budget vs actual analysis
    @GetMapping("/budget-analysis")
    public ResponseEntity<Map<String, Object>> getBudgetAnalysis(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestBody Map<String, Double> budgets) {
        try {
            Map<String, Object> analysis = analyticsService.getBudgetAnalysis(startDate, endDate, budgets);
            return ResponseEntity.ok(analysis);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Get quick analytics dashboard data
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardAnalytics() {
        try {
            LocalDate now = LocalDate.now();
            
            // Current month data
            YearMonth currentMonth = YearMonth.from(now);
            LocalDate monthStart = currentMonth.atDay(1);
            LocalDate monthEnd = currentMonth.atEndOfMonth();
            Map<String, Object> currentMonthData = analyticsService.getFinancialSummary(monthStart, monthEnd);
            
            // Previous month data for comparison
            YearMonth previousMonth = currentMonth.minusMonths(1);
            LocalDate prevMonthStart = previousMonth.atDay(1);
            LocalDate prevMonthEnd = previousMonth.atEndOfMonth();
            Map<String, Object> previousMonthData = analyticsService.getFinancialSummary(prevMonthStart, prevMonthEnd);
            
            // Year to date
            LocalDate yearStart = LocalDate.of(now.getYear(), 1, 1);
            Map<String, Object> yearToDateData = analyticsService.getFinancialSummary(yearStart, now);
            
            // Category breakdown for current month
            Map<String, Object> categoryAnalysis = analyticsService.getCategoryAnalysis(monthStart, monthEnd);
            
            // Trends for last 6 months
            LocalDate trendsStart = now.minusMonths(6);
            Map<String, Object> trends = analyticsService.getExpenseTrends(trendsStart, now);
            
            Map<String, Object> dashboard = Map.of(
                "currentMonth", currentMonthData,
                "previousMonth", previousMonthData,
                "yearToDate", yearToDateData,
                "categoryBreakdown", categoryAnalysis,
                "trends", trends,
                "generatedAt", now.toString()
            );
            
            return ResponseEntity.ok(dashboard);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Get key performance indicators (KPIs)
    @GetMapping("/kpis")
    public ResponseEntity<Map<String, Object>> getKPIs(
            @RequestParam(defaultValue = "current-month") String period) {
        try {
            LocalDate endDate = LocalDate.now();
            LocalDate startDate;
            
            switch (period.toLowerCase()) {
                case "current-week":
                    startDate = endDate.minusDays(7);
                    break;
                case "current-month":
                default:
                    YearMonth currentMonth = YearMonth.from(endDate);
                    startDate = currentMonth.atDay(1);
                    endDate = currentMonth.atEndOfMonth();
                    break;
                case "current-quarter":
                    int quarter = (endDate.getMonthValue() - 1) / 3;
                    startDate = LocalDate.of(endDate.getYear(), quarter * 3 + 1, 1);
                    break;
                case "current-year":
                    startDate = LocalDate.of(endDate.getYear(), 1, 1);
                    break;
            }
            
            Map<String, Object> summary = analyticsService.getFinancialSummary(startDate, endDate);
            Map<String, Object> trends = analyticsService.getExpenseTrends(startDate, endDate);
            
            // Extract KPIs
            @SuppressWarnings("unchecked")
            Map<String, Object> totals = (Map<String, Object>) summary.get("totals");
            @SuppressWarnings("unchecked")
            Map<String, Object> analysis = (Map<String, Object>) trends.get("analysis");
            
            Map<String, Object> kpis = Map.of(
                "period", period,
                "dateRange", Map.of("startDate", startDate.toString(), "endDate", endDate.toString()),
                "totalExpenses", totals.get("totalExpenses"),
                "expenseCount", totals.get("expenseCount"),
                "averageExpense", totals.get("averageExpense"),
                "trendDirection", analysis.get("trendDirection"),
                "growthRate", analysis.get("growthRate"),
                "volatility", analysis.get("volatility")
            );
            
            return ResponseEntity.ok(kpis);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}