package org.example.Services;

import org.example.Entities.OperationalExpenses;
import org.example.Repositories.OperationalExpensesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class FinancialAnalyticsService {
    
    @Autowired
    private OperationalExpensesRepository expenseRepository;
    
    // Get comprehensive financial summary
    public Map<String, Object> getFinancialSummary(LocalDate startDate, LocalDate endDate) {
        Map<String, Object> summary = new HashMap<>();
        
        // Get expenses for the period
        List<OperationalExpenses> expenses = expenseRepository.findByExpenseDateBetween(startDate, endDate);
        
        // Calculate basic metrics
        double totalExpenses = expenses.stream().mapToDouble(OperationalExpenses::getAmount).sum();
        int expenseCount = expenses.size();
        double averageExpense = expenseCount > 0 ? totalExpenses / expenseCount : 0;
        
        // Category breakdown
        Map<String, Double> categoryTotals = expenses.stream()
                .collect(Collectors.groupingBy(
                    expense -> expense.getCategory() != null ? expense.getCategory().getCategoryName() : "Uncategorized",
                    Collectors.summingDouble(OperationalExpenses::getAmount)
                ));
        
        // Status breakdown
        Map<String, Long> statusCounts = expenses.stream()
                .collect(Collectors.groupingBy(OperationalExpenses::getStatus, Collectors.counting()));
        
        // Monthly trends
        Map<String, Double> monthlyTrends = getMonthlyTrends(expenses);
        
        summary.put("period", Map.of(
            "startDate", startDate.toString(),
            "endDate", endDate.toString(),
            "days", startDate.until(endDate).getDays() + 1
        ));
        
        summary.put("totals", Map.of(
            "totalExpenses", totalExpenses,
            "expenseCount", expenseCount,
            "averageExpense", Math.round(averageExpense * 100.0) / 100.0
        ));
        
        summary.put("breakdown", Map.of(
            "byCategory", categoryTotals,
            "byStatus", statusCounts
        ));
        
        summary.put("trends", Map.of(
            "monthly", monthlyTrends
        ));
        
        return summary;
    }
    
    // Get cash flow analysis
    public Map<String, Object> getCashFlowAnalysis(LocalDate startDate, LocalDate endDate) {
        Map<String, Object> cashFlow = new HashMap<>();
        
        // Get expenses by month
        List<OperationalExpenses> expenses = expenseRepository.findByExpenseDateBetween(startDate, endDate);
        Map<String, Double> monthlyExpenses = getMonthlyTrends(expenses);
        
        // Calculate cash flow metrics
        List<Double> monthlyValues = new ArrayList<>(monthlyExpenses.values());
        double totalOutflow = monthlyValues.stream().mapToDouble(Double::doubleValue).sum();
        double averageMonthlyOutflow = monthlyValues.isEmpty() ? 0 : totalOutflow / monthlyValues.size();
        
        // Find peak months
        String highestExpenseMonth = monthlyExpenses.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("N/A");
        
        String lowestExpenseMonth = monthlyExpenses.entrySet().stream()
                .min(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("N/A");
        
        cashFlow.put("period", Map.of(
            "startDate", startDate.toString(),
            "endDate", endDate.toString()
        ));
        
        cashFlow.put("outflow", Map.of(
            "total", totalOutflow,
            "averageMonthly", Math.round(averageMonthlyOutflow * 100.0) / 100.0,
            "monthlyBreakdown", monthlyExpenses
        ));
        
        cashFlow.put("insights", Map.of(
            "highestExpenseMonth", highestExpenseMonth,
            "lowestExpenseMonth", lowestExpenseMonth,
            "monthlyVariation", calculateMonthlyVariation(monthlyValues)
        ));
        
        return cashFlow;
    }
    
    // Get category analysis
    public Map<String, Object> getCategoryAnalysis(LocalDate startDate, LocalDate endDate) {
        Map<String, Object> analysis = new HashMap<>();
        
        List<OperationalExpenses> expenses = expenseRepository.findByExpenseDateBetween(startDate, endDate);
        
        // Category totals and percentages
        Map<String, Double> categoryTotals = expenses.stream()
                .collect(Collectors.groupingBy(
                    expense -> expense.getCategory() != null ? expense.getCategory().getCategoryName() : "Uncategorized",
                    Collectors.summingDouble(OperationalExpenses::getAmount)
                ));
        
        double totalAmount = categoryTotals.values().stream().mapToDouble(Double::doubleValue).sum();
        
        Map<String, Map<String, Object>> categoryDetails = categoryTotals.entrySet().stream()
                .collect(Collectors.toMap(
                    Map.Entry::getKey,
                    entry -> {
                        double amount = entry.getValue();
                        double percentage = totalAmount > 0 ? (amount / totalAmount) * 100 : 0;
                        long count = expenses.stream()
                                .filter(e -> e.getCategory() != null && e.getCategory().getCategoryName().equals(entry.getKey()))
                                .count();
                        
                        Map<String, Object> details = new HashMap<>();
                        details.put("amount", amount);
                        details.put("percentage", Math.round(percentage * 100.0) / 100.0);
                        details.put("count", count);
                        details.put("average", count > 0 ? Math.round((amount / count) * 100.0) / 100.0 : 0);
                        
                        return details;
                    }
                ));
        
        // Top categories
        List<Map<String, Object>> topCategories = categoryDetails.entrySet().stream()
                .sorted((e1, e2) -> Double.compare(
                    (Double) e2.getValue().get("amount"),
                    (Double) e1.getValue().get("amount")
                ))
                .limit(5)
                .map(entry -> Map.of(
                    "category", entry.getKey(),
                    "amount", entry.getValue().get("amount"),
                    "percentage", entry.getValue().get("percentage")
                ))
                .collect(Collectors.toList());
        
        analysis.put("period", Map.of(
            "startDate", startDate.toString(),
            "endDate", endDate.toString()
        ));
        
        analysis.put("summary", Map.of(
            "totalAmount", totalAmount,
            "categoryCount", categoryTotals.size(),
            "totalTransactions", expenses.size()
        ));
        
        analysis.put("categories", categoryDetails);
        analysis.put("topCategories", topCategories);
        
        return analysis;
    }
    
    // Get expense trends and forecasting
    public Map<String, Object> getExpenseTrends(LocalDate startDate, LocalDate endDate) {
        Map<String, Object> trends = new HashMap<>();
        
        List<OperationalExpenses> expenses = expenseRepository.findByExpenseDateBetween(startDate, endDate);
        Map<String, Double> monthlyTrends = getMonthlyTrends(expenses);
        
        // Calculate trend indicators
        List<Double> monthlyValues = new ArrayList<>(monthlyTrends.values());
        String trendDirection = calculateTrendDirection(monthlyValues);
        double growthRate = calculateGrowthRate(monthlyValues);
        
        // Seasonal analysis
        Map<String, Double> seasonalAnalysis = calculateSeasonalTrends(expenses);
        
        trends.put("period", Map.of(
            "startDate", startDate.toString(),
            "endDate", endDate.toString()
        ));
        
        trends.put("monthly", monthlyTrends);
        
        trends.put("analysis", Map.of(
            "trendDirection", trendDirection,
            "growthRate", Math.round(growthRate * 100.0) / 100.0,
            "volatility", calculateVolatility(monthlyValues)
        ));
        
        trends.put("seasonal", seasonalAnalysis);
        
        return trends;
    }
    
    // Get budget vs actual analysis
    public Map<String, Object> getBudgetAnalysis(LocalDate startDate, LocalDate endDate, Map<String, Double> budgets) {
        Map<String, Object> analysis = new HashMap<>();
        
        // Get actual expenses by category
        List<OperationalExpenses> expenses = expenseRepository.findByExpenseDateBetween(startDate, endDate);
        Map<String, Double> actualExpenses = expenses.stream()
                .collect(Collectors.groupingBy(
                    expense -> expense.getCategory() != null ? expense.getCategory().getCategoryName() : "Uncategorized",
                    Collectors.summingDouble(OperationalExpenses::getAmount)
                ));
        
        // Calculate variances
        Map<String, Map<String, Object>> categoryAnalysis = new HashMap<>();
        double totalBudget = 0;
        double totalActual = 0;
        
        for (Map.Entry<String, Double> budgetEntry : budgets.entrySet()) {
            String category = budgetEntry.getKey();
            double budget = budgetEntry.getValue();
            double actual = actualExpenses.getOrDefault(category, 0.0);
            double variance = actual - budget;
            double variancePercentage = budget > 0 ? (variance / budget) * 100 : 0;
            
            totalBudget += budget;
            totalActual += actual;
            
            Map<String, Object> categoryData = new HashMap<>();
            categoryData.put("budget", budget);
            categoryData.put("actual", actual);
            categoryData.put("variance", Math.round(variance * 100.0) / 100.0);
            categoryData.put("variancePercentage", Math.round(variancePercentage * 100.0) / 100.0);
            categoryData.put("status", variance > 0 ? "Over Budget" : "Under Budget");
            
            categoryAnalysis.put(category, categoryData);
        }
        
        double totalVariance = totalActual - totalBudget;
        double totalVariancePercentage = totalBudget > 0 ? (totalVariance / totalBudget) * 100 : 0;
        
        analysis.put("period", Map.of(
            "startDate", startDate.toString(),
            "endDate", endDate.toString()
        ));
        
        analysis.put("totals", Map.of(
            "budget", totalBudget,
            "actual", totalActual,
            "variance", Math.round(totalVariance * 100.0) / 100.0,
            "variancePercentage", Math.round(totalVariancePercentage * 100.0) / 100.0,
            "status", totalVariance > 0 ? "Over Budget" : "Under Budget"
        ));
        
        analysis.put("categories", categoryAnalysis);
        
        return analysis;
    }
    
    // Helper methods
    private Map<String, Double> getMonthlyTrends(List<OperationalExpenses> expenses) {
        return expenses.stream()
                .collect(Collectors.groupingBy(
                    expense -> YearMonth.from(expense.getExpenseDate()).format(DateTimeFormatter.ofPattern("yyyy-MM")),
                    LinkedHashMap::new,
                    Collectors.summingDouble(OperationalExpenses::getAmount)
                ));
    }
    
    private double calculateMonthlyVariation(List<Double> monthlyValues) {
        if (monthlyValues.size() < 2) return 0;
        
        double mean = monthlyValues.stream().mapToDouble(Double::doubleValue).average().orElse(0);
        double variance = monthlyValues.stream()
                .mapToDouble(value -> Math.pow(value - mean, 2))
                .average().orElse(0);
        
        return Math.round(Math.sqrt(variance) * 100.0) / 100.0;
    }
    
    private String calculateTrendDirection(List<Double> values) {
        if (values.size() < 2) return "Stable";
        
        double first = values.get(0);
        double last = values.get(values.size() - 1);
        
        if (last > first * 1.05) return "Increasing";
        if (last < first * 0.95) return "Decreasing";
        return "Stable";
    }
    
    private double calculateGrowthRate(List<Double> values) {
        if (values.size() < 2) return 0;
        
        double first = values.get(0);
        double last = values.get(values.size() - 1);
        
        if (first == 0) return 0;
        return ((last - first) / first) * 100;
    }
    
    private double calculateVolatility(List<Double> values) {
        if (values.size() < 2) return 0;
        
        double mean = values.stream().mapToDouble(Double::doubleValue).average().orElse(0);
        double variance = values.stream()
                .mapToDouble(value -> Math.pow(value - mean, 2))
                .average().orElse(0);
        
        return Math.round((Math.sqrt(variance) / mean) * 10000.0) / 100.0; // Coefficient of variation
    }
    
    private Map<String, Double> calculateSeasonalTrends(List<OperationalExpenses> expenses) {
        Map<String, Double> seasonal = new HashMap<>();
        
        Map<Integer, Double> quarterlyTotals = expenses.stream()
                .collect(Collectors.groupingBy(
                    expense -> (expense.getExpenseDate().getMonthValue() - 1) / 3 + 1,
                    Collectors.summingDouble(OperationalExpenses::getAmount)
                ));
        
        seasonal.put("Q1", quarterlyTotals.getOrDefault(1, 0.0));
        seasonal.put("Q2", quarterlyTotals.getOrDefault(2, 0.0));
        seasonal.put("Q3", quarterlyTotals.getOrDefault(3, 0.0));
        seasonal.put("Q4", quarterlyTotals.getOrDefault(4, 0.0));
        
        return seasonal;
    }
}