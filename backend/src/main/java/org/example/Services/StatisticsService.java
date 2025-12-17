package org.example.Services;

import org.example.DTOs.DashboardStatistics;
import org.example.DTOs.LoanStatusBreakdown;
import org.example.Repositories.StatisticsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Statistics Service
 * Business logic layer for dashboard statistics
 * Aggregates data from StatisticsRepository and applies business rules
 */
@Service
@Transactional(readOnly = true)
public class StatisticsService {

    @Autowired
    private StatisticsRepository statisticsRepository;

    /**
     * Get complete dashboard statistics
     * This is the main method that returns all dashboard data
     */
    @Cacheable(value = "dashboardStats", unless = "#result == null")
    public DashboardStatistics getDashboardStatistics() {
        try {
            DashboardStatistics stats = new DashboardStatistics();
            
            // === TOP ROW METRICS ===
            stats.setRegisteredBorrowers(statisticsRepository.getRegisteredBorrowers());
            stats.setTotalSavings(statisticsRepository.getTotalSavings());
            stats.setTotalLoansReleased(statisticsRepository.getTotalLoansReleased());
            stats.setTotalCollections(statisticsRepository.getTotalCollections());
            
            // === LOAN STATUS CARDS ===
            stats.setActiveLoans(statisticsRepository.getActiveLoans());
            stats.setOverdueLoans(statisticsRepository.getOverdueLoans());
            stats.setDefaultedLoans(statisticsRepository.getDefaultedLoans());
            stats.setCompletedLoans(statisticsRepository.getCompletedLoans());
            
            // === BREAKDOWN OF ACTIVE LOANS ===
            stats.setNewLoans(statisticsRepository.getNewLoans());
            stats.setProcessedLoans(statisticsRepository.getProcessedLoans());
            
            // === ADDITIONAL METRICS ===
            stats.setTotalClients(statisticsRepository.getTotalClients());
            stats.setTotalLoans(statisticsRepository.getTotalLoans());
            stats.setAverageLoanAmount(statisticsRepository.getAverageLoanAmount());
            stats.setAverageLoanTenureDays(statisticsRepository.getAverageLoanTenureDays());
            stats.setOutstandingBalance(statisticsRepository.getOutstandingBalance());
            
            // === GENDER DISTRIBUTION ===
            stats.setMaleBorrowers(statisticsRepository.getMaleBorrowers());
            stats.setFemaleBorrowers(statisticsRepository.getFemaleBorrowers());
            stats.calculateGenderPercentages(); // Calculate percentages
            
            // === TIME-BASED ANALYTICS ===
            stats.setMonthlyLoansReleased(statisticsRepository.getMonthlyLoansReleased());
            stats.setMonthlyCollections(statisticsRepository.getMonthlyCollections());
            stats.setMonthlyPastMaturityLoans(statisticsRepository.getMonthlyPastMaturityLoans());
            
            // === SYSTEM INFO ===
            stats.setDataLoadedAt(LocalDateTime.now());
            stats.setSetupCompleted(statisticsRepository.isSetupCompleted());
            
            return stats;
            
        } catch (Exception e) {
            // Return empty statistics in case of error
            return createEmptyStatistics(e.getMessage());
        }
    }

    /**
     * Get summary statistics (lighter version for quick checks)
     */
    @Cacheable(value = "dashboardSummary", unless = "#result == null")
    public DashboardStatistics getSummaryStatistics() {
        try {
            DashboardStatistics stats = new DashboardStatistics();
            
            // Only essential metrics
            stats.setRegisteredBorrowers(statisticsRepository.getRegisteredBorrowers());
            stats.setTotalLoansReleased(statisticsRepository.getTotalLoansReleased());
            stats.setTotalCollections(statisticsRepository.getTotalCollections());
            stats.setActiveLoans(statisticsRepository.getActiveLoans());
            stats.setOverdueLoans(statisticsRepository.getOverdueLoans());
            stats.setCompletedLoans(statisticsRepository.getCompletedLoans());
            
            stats.setDataLoadedAt(LocalDateTime.now());
            stats.setSetupCompleted(statisticsRepository.isSetupCompleted());
            
            return stats;
            
        } catch (Exception e) {
            return createEmptyStatistics(e.getMessage());
        }
    }

    /**
     * Get loan status breakdown
     */
    public DashboardStatistics getLoanStatusBreakdown() {
        DashboardStatistics stats = new DashboardStatistics();
        
        try {
            // Only loan status metrics
            stats.setActiveLoans(statisticsRepository.getActiveLoans());
        } catch (Exception e) {
            stats.setActiveLoans(0L);
        }
        
        try {
            stats.setOverdueLoans(statisticsRepository.getOverdueLoans());
        } catch (Exception e) {
            stats.setOverdueLoans(0L);
        }
        
        try {
            stats.setDefaultedLoans(statisticsRepository.getDefaultedLoans());
        } catch (Exception e) {
            stats.setDefaultedLoans(0L);
        }
        
        try {
            stats.setCompletedLoans(statisticsRepository.getCompletedLoans());
        } catch (Exception e) {
            stats.setCompletedLoans(0L);
        }
        
        try {
            stats.setNewLoans(statisticsRepository.getNewLoans());
        } catch (Exception e) {
            stats.setNewLoans(0L);
        }
        
        try {
            stats.setProcessedLoans(statisticsRepository.getProcessedLoans());
        } catch (Exception e) {
            stats.setProcessedLoans(0L);
        }
        
        try {
            stats.setTotalLoans(statisticsRepository.getTotalLoans());
        } catch (Exception e) {
            stats.setTotalLoans(0L);
        }
        
        stats.setDataLoadedAt(LocalDateTime.now());
        
        return stats;
    }

    /**
     * Get loan status breakdown only (dedicated DTO)
     * Returns ONLY loan status related fields
     */
    public LoanStatusBreakdown getLoanStatusBreakdownOnly() {
        LoanStatusBreakdown loanStatus = new LoanStatusBreakdown();
        
        try {
            loanStatus.setActiveLoans(statisticsRepository.getActiveLoans());
        } catch (Exception e) {
            loanStatus.setActiveLoans(0L);
        }
        
        try {
            loanStatus.setOverdueLoans(statisticsRepository.getOverdueLoans());
        } catch (Exception e) {
            loanStatus.setOverdueLoans(0L);
        }
        
        try {
            loanStatus.setDefaultedLoans(statisticsRepository.getDefaultedLoans());
        } catch (Exception e) {
            loanStatus.setDefaultedLoans(0L);
        }
        
        try {
            loanStatus.setCompletedLoans(statisticsRepository.getCompletedLoans());
        } catch (Exception e) {
            loanStatus.setCompletedLoans(0L);
        }
        
        try {
            loanStatus.setNewLoans(statisticsRepository.getNewLoans());
        } catch (Exception e) {
            loanStatus.setNewLoans(0L);
        }
        
        try {
            loanStatus.setProcessedLoans(statisticsRepository.getProcessedLoans());
        } catch (Exception e) {
            loanStatus.setProcessedLoans(0L);
        }
        
        try {
            loanStatus.setTotalLoans(statisticsRepository.getTotalLoans());
        } catch (Exception e) {
            loanStatus.setTotalLoans(0L);
        }
        
        loanStatus.setDataLoadedAt(LocalDateTime.now());
        
        return loanStatus;
    }

    /**
     * Get financial overview
     */
    public DashboardStatistics getFinancialOverview() {
        try {
            DashboardStatistics stats = new DashboardStatistics();
            
            // Financial metrics only
            stats.setTotalLoansReleased(statisticsRepository.getTotalLoansReleased());
            stats.setTotalCollections(statisticsRepository.getTotalCollections());
            stats.setTotalSavings(statisticsRepository.getTotalSavings());
            stats.setOutstandingBalance(statisticsRepository.getOutstandingBalance());
            stats.setAverageLoanAmount(statisticsRepository.getAverageLoanAmount());
            
            stats.setDataLoadedAt(LocalDateTime.now());
            
            return stats;
            
        } catch (Exception e) {
            return createEmptyStatistics(e.getMessage());
        }
    }

    /**
     * Get analytics data for charts
     */
    public DashboardStatistics getAnalyticsData() {
        try {
            DashboardStatistics stats = new DashboardStatistics();
            
            // Only chart data
            stats.setMonthlyLoansReleased(statisticsRepository.getMonthlyLoansReleased());
            stats.setMonthlyCollections(statisticsRepository.getMonthlyCollections());
            stats.setMonthlyPastMaturityLoans(statisticsRepository.getMonthlyPastMaturityLoans());
            
            // Gender distribution for pie chart
            stats.setMaleBorrowers(statisticsRepository.getMaleBorrowers());
            stats.setFemaleBorrowers(statisticsRepository.getFemaleBorrowers());
            stats.calculateGenderPercentages();
            
            stats.setDataLoadedAt(LocalDateTime.now());
            
            return stats;
            
        } catch (Exception e) {
            return createEmptyStatistics(e.getMessage());
        }
    }

    // === BUSINESS LOGIC METHODS ===

    /**
     * Calculate collection efficiency
     */
    public Double calculateCollectionEfficiency() {
        try {
            Double totalReleased = statisticsRepository.getTotalLoansReleased();
            Double totalCollected = statisticsRepository.getTotalCollections();
            
            if (totalReleased != null && totalReleased > 0) {
                return Math.round((totalCollected / totalReleased) * 10000.0) / 100.0; // Round to 2 decimal places
            }
            return 0.0;
        } catch (Exception e) {
            return 0.0;
        }
    }

    /**
     * Calculate default rate
     */
    public Double calculateDefaultRate() {
        try {
            Long totalLoans = statisticsRepository.getTotalLoans();
            Long defaultedLoans = statisticsRepository.getDefaultedLoans();
            
            if (totalLoans != null && totalLoans > 0) {
                return Math.round((defaultedLoans.doubleValue() / totalLoans.doubleValue()) * 10000.0) / 100.0;
            }
            return 0.0;
        } catch (Exception e) {
            return 0.0;
        }
    }

    /**
     * Calculate active loan percentage
     */
    public Double calculateActiveLoanPercentage() {
        try {
            Long totalLoans = statisticsRepository.getTotalLoans();
            Long activeLoans = statisticsRepository.getActiveLoans();
            
            if (totalLoans != null && totalLoans > 0) {
                return Math.round((activeLoans.doubleValue() / totalLoans.doubleValue()) * 10000.0) / 100.0;
            }
            return 0.0;
        } catch (Exception e) {
            return 0.0;
        }
    }

    /**
     * Get portfolio health score (0-100)
     * Based on completion rate, default rate, and collection efficiency
     */
    public Integer getPortfolioHealthScore() {
        try {
            Double collectionEfficiency = calculateCollectionEfficiency();
            Double defaultRate = calculateDefaultRate();
            Double activeRate = calculateActiveLoanPercentage();
            
            // Simple scoring algorithm
            double healthScore = 0;
            
            // Collection efficiency weight: 40%
            healthScore += (collectionEfficiency * 0.4);
            
            // Low default rate weight: 40% (invert default rate)
            healthScore += ((100 - defaultRate) * 0.4);
            
            // Active portfolio weight: 20%
            healthScore += (activeRate * 0.2);
            
            return Math.max(0, Math.min(100, (int) Math.round(healthScore)));
            
        } catch (Exception e) {
            return 50; // Default neutral score
        }
    }

    // === HELPER METHODS ===

    /**
     * Create empty statistics object for error cases
     */
    private DashboardStatistics createEmptyStatistics(String errorMessage) {
        DashboardStatistics stats = new DashboardStatistics();
        
        // Set all numeric fields to 0
        stats.setRegisteredBorrowers(0L);
        stats.setTotalSavings(0.0);
        stats.setTotalLoansReleased(0.0);
        stats.setTotalCollections(0.0);
        stats.setActiveLoans(0L);
        stats.setOverdueLoans(0L);
        stats.setDefaultedLoans(0L);
        stats.setCompletedLoans(0L);
        stats.setNewLoans(0L);
        stats.setProcessedLoans(0L);
        stats.setTotalClients(0L);
        stats.setTotalLoans(0L);
        stats.setAverageLoanAmount(0.0);
        stats.setAverageLoanTenureDays(0);
        stats.setOutstandingBalance(0.0);
        stats.setMaleBorrowers(0L);
        stats.setFemaleBorrowers(0L);
        stats.setMalePercentage(50.0);
        stats.setFemalePercentage(50.0);
        
        // Empty lists for charts
        stats.setMonthlyLoansReleased(new ArrayList<>());
        stats.setMonthlyCollections(new ArrayList<>());
        stats.setMonthlyPastMaturityLoans(new ArrayList<>());
        
        // System info
        stats.setDataLoadedAt(LocalDateTime.now());
        stats.setSetupCompleted(false);
        
        System.err.println("Error loading dashboard statistics: " + errorMessage);
        
        return stats;
    }

    /**
     * Validate and sanitize statistics data
     */
    private DashboardStatistics validateStatistics(DashboardStatistics stats) {
        // Ensure no null values
        if (stats.getRegisteredBorrowers() == null) stats.setRegisteredBorrowers(0L);
        if (stats.getTotalSavings() == null) stats.setTotalSavings(0.0);
        if (stats.getTotalLoansReleased() == null) stats.setTotalLoansReleased(0.0);
        if (stats.getTotalCollections() == null) stats.setTotalCollections(0.0);
        if (stats.getActiveLoans() == null) stats.setActiveLoans(0L);
        if (stats.getOverdueLoans() == null) stats.setOverdueLoans(0L);
        if (stats.getDefaultedLoans() == null) stats.setDefaultedLoans(0L);
        if (stats.getCompletedLoans() == null) stats.setCompletedLoans(0L);
        
        // Ensure percentages are calculated
        if (stats.getMalePercentage() == null || stats.getFemalePercentage() == null) {
            stats.calculateGenderPercentages();
        }
        
        return stats;
    }

    /**
     * Evict all dashboard caches
     * Call this method when dashboard data needs to be refreshed
     */
    @CacheEvict(value = {"dashboardStats", "dashboardSummary"}, allEntries = true)
    public void evictDashboardCache() {
        // Cache will be automatically evicted
        System.out.println("Dashboard cache evicted at " + LocalDateTime.now());
    }
}
