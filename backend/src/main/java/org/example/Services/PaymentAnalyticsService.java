package org.example.Services;

import org.example.Entities.LoanPayments;
import org.example.Entities.LoanInstallmentSchedule;
import org.example.Repositories.LoanPaymentsRepository;
import org.example.Repositories.LoanInstallmentScheduleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PaymentAnalyticsService {

    @Autowired
    private LoanPaymentsRepository paymentsRepository;

    @Autowired
    private LoanInstallmentScheduleRepository installmentRepository;

    /**
     * Get payment trends with aggregated metrics
     */
    public Map<String, Object> getPaymentTrends(LocalDate startDate, LocalDate endDate, String granularity) {
        List<LoanPayments> payments = paymentsRepository.findByPaymentDateBetween(startDate, endDate);
        
        Map<String, Object> trends = new HashMap<>();
        
        // Group by date based on granularity
        Map<String, List<LoanPayments>> groupedPayments = groupByGranularity(payments, granularity);
        
        List<Map<String, Object>> trendData = new ArrayList<>();
        for (Map.Entry<String, List<LoanPayments>> entry : groupedPayments.entrySet()) {
            Map<String, Object> dataPoint = new HashMap<>();
            dataPoint.put("date", entry.getKey());
            dataPoint.put("count", entry.getValue().size());
            dataPoint.put("totalAmount", entry.getValue().stream()
                .mapToDouble(LoanPayments::getAmountPaid).sum());
            dataPoint.put("principalPaid", entry.getValue().stream()
                .mapToDouble(LoanPayments::getPrincipalPaid).sum());
            dataPoint.put("interestPaid", entry.getValue().stream()
                .mapToDouble(LoanPayments::getInterestPaid).sum());
            dataPoint.put("feesPaid", entry.getValue().stream()
                .mapToDouble(LoanPayments::getFeesPaid).sum());
            
            trendData.add(dataPoint);
        }
        
        // Sort by date
        trendData.sort(Comparator.comparing(m -> (String) m.get("date")));
        
        trends.put("data", trendData);
        trends.put("granularity", granularity);
        trends.put("startDate", startDate);
        trends.put("endDate", endDate);
        trends.put("totalPayments", payments.size());
        trends.put("totalAmount", payments.stream().mapToDouble(LoanPayments::getAmountPaid).sum());
        
        return trends;
    }

    /**
     * Group payments by time granularity
     */
    private Map<String, List<LoanPayments>> groupByGranularity(List<LoanPayments> payments, String granularity) {
        return payments.stream().collect(Collectors.groupingBy(payment -> {
            LocalDate date = payment.getPaymentDate();
            switch (granularity.toLowerCase()) {
                case "weekly":
                    long weekNum = ChronoUnit.WEEKS.between(LocalDate.of(date.getYear(), 1, 1), date);
                    return date.getYear() + "-W" + weekNum;
                case "monthly":
                    return date.getYear() + "-" + String.format("%02d", date.getMonthValue());
                case "yearly":
                    return String.valueOf(date.getYear());
                default: // daily
                    return date.toString();
            }
        }));
    }

    /**
     * Get payment method distribution analytics
     */
    public Map<String, Object> getPaymentMethodAnalytics(LocalDate startDate, LocalDate endDate) {
        List<LoanPayments> payments = paymentsRepository.findByPaymentDateBetween(startDate, endDate);
        
        Map<String, Object> analytics = new HashMap<>();
        
        // Group by payment method
        Map<String, List<LoanPayments>> byMethod = payments.stream()
            .collect(Collectors.groupingBy(p -> p.getPaymentMethod() != null ? p.getPaymentMethod() : "Unknown"));
        
        List<Map<String, Object>> methodData = new ArrayList<>();
        for (Map.Entry<String, List<LoanPayments>> entry : byMethod.entrySet()) {
            Map<String, Object> methodInfo = new HashMap<>();
            methodInfo.put("method", entry.getKey());
            methodInfo.put("count", entry.getValue().size());
            methodInfo.put("totalAmount", entry.getValue().stream()
                .mapToDouble(LoanPayments::getAmountPaid).sum());
            methodInfo.put("averageAmount", entry.getValue().stream()
                .mapToDouble(LoanPayments::getAmountPaid).average().orElse(0.0));
            
            methodData.add(methodInfo);
        }
        
        // Sort by total amount descending
        methodData.sort((a, b) -> Double.compare((Double) b.get("totalAmount"), (Double) a.get("totalAmount")));
        
        analytics.put("methods", methodData);
        analytics.put("totalMethods", methodData.size());
        analytics.put("period", Map.of("start", startDate, "end", endDate));
        
        return analytics;
    }

    /**
     * Get comprehensive payment summary
     */
    public Map<String, Object> getPaymentSummary(LocalDate startDate, LocalDate endDate) {
        List<LoanPayments> payments = paymentsRepository.findByPaymentDateBetween(startDate, endDate);
        
        Map<String, Object> summary = new HashMap<>();
        
        summary.put("totalPayments", payments.size());
        summary.put("totalAmount", payments.stream().mapToDouble(LoanPayments::getAmountPaid).sum());
        summary.put("totalPrincipal", payments.stream().mapToDouble(LoanPayments::getPrincipalPaid).sum());
        summary.put("totalInterest", payments.stream().mapToDouble(LoanPayments::getInterestPaid).sum());
        summary.put("totalFees", payments.stream().mapToDouble(LoanPayments::getFeesPaid).sum());
        summary.put("totalFines", payments.stream().mapToDouble(LoanPayments::getFine).sum());
        
        summary.put("averagePayment", payments.stream()
            .mapToDouble(LoanPayments::getAmountPaid).average().orElse(0.0));
        
        long latePayments = payments.stream().filter(LoanPayments::isLate).count();
        summary.put("latePayments", latePayments);
        summary.put("latePaymentRate", payments.isEmpty() ? 0.0 : (double) latePayments / payments.size() * 100);
        
        long onTimePayments = payments.stream().filter(p -> !p.isLate()).count();
        summary.put("onTimePayments", onTimePayments);
        summary.put("onTimePaymentRate", payments.isEmpty() ? 0.0 : (double) onTimePayments / payments.size() * 100);
        
        summary.put("uniqueLoans", payments.stream()
            .map(LoanPayments::getLoanId).distinct().count());
        
        summary.put("period", Map.of("start", startDate, "end", endDate));
        
        return summary;
    }

    /**
     * Get collection efficiency metrics
     */
    public Map<String, Object> getCollectionEfficiency(LocalDate startDate, LocalDate endDate) {
        List<LoanInstallmentSchedule> allInstallments = installmentRepository.findAll();
        List<LoanInstallmentSchedule> dueInstallments = allInstallments.stream()
            .filter(i -> !i.getDueDate().isBefore(startDate) && !i.getDueDate().isAfter(endDate))
            .collect(Collectors.toList());
        
        List<LoanInstallmentSchedule> paidInstallments = dueInstallments.stream()
            .filter(i -> i.getIsPaid() != null && i.getIsPaid()).collect(Collectors.toList());
        
        Map<String, Object> efficiency = new HashMap<>();
        
        double totalExpected = dueInstallments.stream()
            .mapToDouble(LoanInstallmentSchedule::getScheduledAmount).sum();
        double totalCollected = paidInstallments.stream()
            .mapToDouble(i -> i.getPaidAmount() != null ? i.getPaidAmount() : 0.0).sum();
        
        efficiency.put("totalDueInstallments", dueInstallments.size());
        efficiency.put("paidInstallments", paidInstallments.size());
        efficiency.put("pendingInstallments", dueInstallments.size() - paidInstallments.size());
        
        efficiency.put("totalExpected", totalExpected);
        efficiency.put("totalCollected", totalCollected);
        efficiency.put("totalOutstanding", totalExpected - totalCollected);
        
        efficiency.put("collectionRate", totalExpected > 0 ? (totalCollected / totalExpected * 100) : 0.0);
        
        long onTimeCount = paidInstallments.stream()
            .filter(i -> i.getIsLate() == null || !i.getIsLate()).count();
        efficiency.put("onTimeCollectionRate", paidInstallments.isEmpty() ? 0.0 : 
            (double) onTimeCount / paidInstallments.size() * 100);
        
        long overdueCount = dueInstallments.stream()
            .filter(i -> "OVERDUE".equals(i.getStatus())).count();
        efficiency.put("overdueInstallments", overdueCount);
        efficiency.put("overdueRate", dueInstallments.isEmpty() ? 0.0 : 
            (double) overdueCount / dueInstallments.size() * 100);
        
        efficiency.put("period", Map.of("start", startDate, "end", endDate));
        
        return efficiency;
    }

    /**
     * Get late payment analysis
     */
    public Map<String, Object> getLatePaymentAnalysis(LocalDate startDate, LocalDate endDate) {
        List<LoanPayments> latePayments = paymentsRepository.findByPaymentDateBetween(startDate, endDate)
            .stream().filter(LoanPayments::isLate).collect(Collectors.toList());
        
        Map<String, Object> analysis = new HashMap<>();
        
        analysis.put("totalLatePayments", latePayments.size());
        analysis.put("totalFinesCollected", latePayments.stream()
            .mapToDouble(LoanPayments::getFine).sum());
        
        if (!latePayments.isEmpty()) {
            analysis.put("averageDaysLate", latePayments.stream()
                .mapToInt(LoanPayments::getDaysLate).average().orElse(0.0));
            
            analysis.put("maxDaysLate", latePayments.stream()
                .mapToInt(LoanPayments::getDaysLate).max().orElse(0));
            
            // Group by days late ranges
            Map<String, Long> latencyDistribution = new HashMap<>();
            latencyDistribution.put("1-7 days", latePayments.stream()
                .filter(p -> p.getDaysLate() >= 1 && p.getDaysLate() <= 7).count());
            latencyDistribution.put("8-14 days", latePayments.stream()
                .filter(p -> p.getDaysLate() >= 8 && p.getDaysLate() <= 14).count());
            latencyDistribution.put("15-30 days", latePayments.stream()
                .filter(p -> p.getDaysLate() >= 15 && p.getDaysLate() <= 30).count());
            latencyDistribution.put("30+ days", latePayments.stream()
                .filter(p -> p.getDaysLate() > 30).count());
            
            analysis.put("latencyDistribution", latencyDistribution);
        } else {
            analysis.put("averageDaysLate", 0);
            analysis.put("maxDaysLate", 0);
            analysis.put("latencyDistribution", Map.of());
        }
        
        analysis.put("period", Map.of("start", startDate, "end", endDate));
        
        return analysis;
    }

    /**
     * Get top performing loans by on-time payment rate
     */
    public Map<String, Object> getTopPerformingLoans(int limit) {
        List<LoanInstallmentSchedule> allInstallments = installmentRepository.findAll();
        
        Map<Long, List<LoanInstallmentSchedule>> byLoan = allInstallments.stream()
            .collect(Collectors.groupingBy(LoanInstallmentSchedule::getLoanId));
        
        List<Map<String, Object>> loanPerformance = new ArrayList<>();
        
        for (Map.Entry<Long, List<LoanInstallmentSchedule>> entry : byLoan.entrySet()) {
            List<LoanInstallmentSchedule> installments = entry.getValue();
            
            long totalInstallments = installments.size();
            long paidInstallments = installments.stream()
                .filter(i -> i.getIsPaid() != null && i.getIsPaid()).count();
            long onTimeInstallments = installments.stream()
                .filter(i -> i.getIsPaid() != null && i.getIsPaid() && 
                    (i.getIsLate() == null || !i.getIsLate())).count();
            
            double onTimeRate = totalInstallments > 0 ? (double) onTimeInstallments / totalInstallments * 100 : 0.0;
            
            Map<String, Object> performance = new HashMap<>();
            performance.put("loanId", entry.getKey());
            performance.put("totalInstallments", totalInstallments);
            performance.put("paidInstallments", paidInstallments);
            performance.put("onTimeInstallments", onTimeInstallments);
            performance.put("onTimeRate", onTimeRate);
            
            loanPerformance.add(performance);
        }
        
        // Sort by on-time rate descending
        loanPerformance.sort((a, b) -> Double.compare((Double) b.get("onTimeRate"), (Double) a.get("onTimeRate")));
        
        // Limit results
        List<Map<String, Object>> topPerformers = loanPerformance.stream()
            .limit(limit).collect(Collectors.toList());
        
        Map<String, Object> result = new HashMap<>();
        result.put("topPerformers", topPerformers);
        result.put("totalLoansAnalyzed", loanPerformance.size());
        
        return result;
    }

    /**
     * Get client payment performance
     */
    public Map<String, Object> getClientPaymentPerformance(Long clientId) {
        // Note: This requires a way to link loans to clients
        // For now, return a placeholder structure
        Map<String, Object> performance = new HashMap<>();
        performance.put("clientId", clientId);
        performance.put("message", "Client payment performance requires loan-to-client mapping");
        return performance;
    }

    /**
     * Get overall portfolio health
     */
    public Map<String, Object> getPortfolioHealth() {
        List<LoanInstallmentSchedule> allInstallments = installmentRepository.findAll();
        
        Map<String, Object> health = new HashMap<>();
        
        long totalInstallments = allInstallments.size();
        long paidCount = allInstallments.stream().filter(i -> i.getIsPaid() != null && i.getIsPaid()).count();
        long overdueCount = allInstallments.stream().filter(i -> "OVERDUE".equals(i.getStatus())).count();
        long gracePeriodCount = allInstallments.stream().filter(i -> "GRACE_PERIOD".equals(i.getStatus())).count();
        
        health.put("totalInstallments", totalInstallments);
        health.put("paidInstallments", paidCount);
        health.put("overdueInstallments", overdueCount);
        health.put("gracePeriodInstallments", gracePeriodCount);
        
        health.put("collectionRate", totalInstallments > 0 ? (double) paidCount / totalInstallments * 100 : 0.0);
        health.put("overdueRate", totalInstallments > 0 ? (double) overdueCount / totalInstallments * 100 : 0.0);
        
        double totalScheduled = allInstallments.stream()
            .mapToDouble(LoanInstallmentSchedule::getScheduledAmount).sum();
        double totalPaid = allInstallments.stream()
            .mapToDouble(i -> i.getPaidAmount() != null ? i.getPaidAmount() : 0.0).sum();
        
        health.put("totalScheduled", totalScheduled);
        health.put("totalPaid", totalPaid);
        health.put("totalOutstanding", totalScheduled - totalPaid);
        
        return health;
    }

    /**
     * Get payment forecast
     */
    public Map<String, Object> getPaymentForecast(int daysAhead) {
        LocalDate today = LocalDate.now();
        LocalDate forecastEnd = today.plusDays(daysAhead);
        
        List<LoanInstallmentSchedule> allInstallments = installmentRepository.findAll();
        List<LoanInstallmentSchedule> upcomingInstallments = allInstallments.stream()
            .filter(i -> !i.getDueDate().isBefore(today) && !i.getDueDate().isAfter(forecastEnd))
            .collect(Collectors.toList());
        
        Map<String, Object> forecast = new HashMap<>();
        
        // Group by date
        Map<LocalDate, List<LoanInstallmentSchedule>> byDate = upcomingInstallments.stream()
            .collect(Collectors.groupingBy(LoanInstallmentSchedule::getDueDate));
        
        List<Map<String, Object>> forecastData = new ArrayList<>();
        for (Map.Entry<LocalDate, List<LoanInstallmentSchedule>> entry : byDate.entrySet()) {
            Map<String, Object> dayForecast = new HashMap<>();
            dayForecast.put("date", entry.getKey());
            dayForecast.put("count", entry.getValue().size());
            dayForecast.put("expectedAmount", entry.getValue().stream()
                .mapToDouble(LoanInstallmentSchedule::getScheduledAmount).sum());
            
            forecastData.add(dayForecast);
        }
        
        forecastData.sort(Comparator.comparing(m -> (LocalDate) m.get("date")));
        
        forecast.put("forecast", forecastData);
        forecast.put("totalUpcoming", upcomingInstallments.size());
        forecast.put("totalExpectedAmount", upcomingInstallments.stream()
            .mapToDouble(LoanInstallmentSchedule::getScheduledAmount).sum());
        forecast.put("period", Map.of("start", today, "end", forecastEnd));
        
        return forecast;
    }

    /**
     * Get dashboard metrics
     */
    public Map<String, Object> getDashboardMetrics() {
        LocalDate today = LocalDate.now();
        LocalDate monthStart = today.withDayOfMonth(1);
        
        Map<String, Object> metrics = new HashMap<>();
        
        // Current month payments
        List<LoanPayments> monthPayments = paymentsRepository.findByPaymentDateBetween(monthStart, today);
        metrics.put("monthlyPayments", monthPayments.size());
        metrics.put("monthlyAmount", monthPayments.stream().mapToDouble(LoanPayments::getAmountPaid).sum());
        
        // Today's due installments
        List<LoanInstallmentSchedule> dueTodayList = installmentRepository.findDueToday();
        metrics.put("dueToday", dueTodayList.size());
        metrics.put("dueTodayAmount", dueTodayList.stream()
            .mapToDouble(LoanInstallmentSchedule::getScheduledAmount).sum());
        
        // Overdue installments
        List<LoanInstallmentSchedule> overdueList = installmentRepository.findOverdueInstallments();
        metrics.put("overdue", overdueList.size());
        metrics.put("overdueAmount", overdueList.stream()
            .mapToDouble(LoanInstallmentSchedule::getOutstandingAmount).sum());
        
        // Upcoming 7 days
        LocalDate sevenDaysAhead = today.plusDays(7);
        List<LoanInstallmentSchedule> upcomingList = installmentRepository.findDueInNextDays(sevenDaysAhead);
        metrics.put("upcoming7Days", upcomingList.size());
        metrics.put("upcoming7DaysAmount", upcomingList.stream()
            .mapToDouble(LoanInstallmentSchedule::getScheduledAmount).sum());
        
        return metrics;
    }
}
