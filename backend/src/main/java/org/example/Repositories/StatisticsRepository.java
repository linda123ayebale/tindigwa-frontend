package org.example.Repositories;

import org.example.DTOs.DashboardStatistics;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.time.LocalDateTime;
import java.util.ArrayList;

@Repository
public class StatisticsRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // === TOP ROW METRICS ===
    
    /**
     * Get total registered borrowers (clients)
     */
    public Long getRegisteredBorrowers() {
        try {
            String sql = """
                SELECT COUNT(*) FROM persons p
                JOIN users u ON p.id = u.person_id 
                WHERE u.role = 'CLIENT'
                """;
            return jdbcTemplate.queryForObject(sql, Long.class);
        } catch (Exception e) {
            return 0L;
        }
    }

    /**
     * Get total savings amount (if savings table exists)
     */
    public Double getTotalSavings() {
        try {
            // Check if savings table/column exists
            String sql = "SELECT COALESCE(SUM(savings_amount), 0.0) FROM persons WHERE savings_amount IS NOT NULL";
            return jdbcTemplate.queryForObject(sql, Double.class);
        } catch (Exception e) {
            // If no savings column, return 0
            return 0.0;
        }
    }

    /**
     * Get total loans released (disbursed)
     */
    public Double getTotalLoansReleased() {
        try {
            String sql = "SELECT COALESCE(SUM(amount_disbursed), 0.0) FROM loan_details";
            return jdbcTemplate.queryForObject(sql, Double.class);
        } catch (Exception e) {
            return 0.0;
        }
    }

    /**
     * Get total collections (payments received)
     */
    public Double getTotalCollections() {
        try {
            String sql = "SELECT COALESCE(SUM(amount_paid), 0.0) FROM loan_payments";
            return jdbcTemplate.queryForObject(sql, Double.class);
        } catch (Exception e) {
            return 0.0;
        }
    }

    // === LOAN STATUS COUNTS (Based on Frontend Logic) ===

    /**
     * Get ACTIVE loans count
     * Logic: DATEDIFF(NOW(), payment_start_date) <= loan_duration_days
     * AND total_paid < total_payable
     */
    public Long getActiveLoans() {
        try {
            String sql = """
                SELECT COUNT(*) FROM loan_details l
                LEFT JOIN (
                    SELECT loan_id, COALESCE(SUM(amount_paid), 0) as total_paid 
                    FROM loan_payments 
                    GROUP BY loan_id
                ) p ON l.id = p.loan_id
                WHERE DATEDIFF(NOW(), l.payment_start_date) <= l.loan_duration_days
                AND COALESCE(p.total_paid, 0) < l.total_payable
                """;
            return jdbcTemplate.queryForObject(sql, Long.class);
        } catch (Exception e) {
            return 0L;
        }
    }

    /**
     * Get OVERDUE loans count
     * Logic: DATEDIFF(NOW(), payment_start_date) > loan_duration_days
     * AND DATEDIFF(NOW(), payment_start_date) <= (loan_duration_days + 180) [6 months = 180 days]
     * AND total_paid < total_payable
     */
    public Long getOverdueLoans() {
        try {
            String sql = """
                SELECT COUNT(*) FROM loan_details l
                LEFT JOIN (
                    SELECT loan_id, COALESCE(SUM(amount_paid), 0) as total_paid 
                    FROM loan_payments 
                    GROUP BY loan_id
                ) p ON l.id = p.loan_id
                WHERE DATEDIFF(NOW(), l.payment_start_date) > l.loan_duration_days
                AND DATEDIFF(NOW(), l.payment_start_date) <= (l.loan_duration_days + 180)
                AND COALESCE(p.total_paid, 0) < l.total_payable
                """;
            return jdbcTemplate.queryForObject(sql, Long.class);
        } catch (Exception e) {
            return 0L;
        }
    }

    /**
     * Get DEFAULTED loans count
     * Logic: DATEDIFF(NOW(), payment_start_date) > (loan_duration_days + 180)
     * AND total_paid < total_payable
     */
    public Long getDefaultedLoans() {
        try {
            String sql = """
                SELECT COUNT(*) FROM loan_details l
                LEFT JOIN (
                    SELECT loan_id, COALESCE(SUM(amount_paid), 0) as total_paid 
                    FROM loan_payments 
                    GROUP BY loan_id
                ) p ON l.id = p.loan_id
                WHERE DATEDIFF(NOW(), l.payment_start_date) > (l.loan_duration_days + 180)
                AND COALESCE(p.total_paid, 0) < l.total_payable
                """;
            return jdbcTemplate.queryForObject(sql, Long.class);
        } catch (Exception e) {
            return 0L;
        }
    }

    /**
     * Get COMPLETED loans count
     * Logic: total_paid >= total_payable
     */
    public Long getCompletedLoans() {
        try {
            String sql = """
                SELECT COUNT(*) FROM loan_details l
                JOIN (
                    SELECT loan_id, COALESCE(SUM(amount_paid), 0) as total_paid 
                    FROM loan_payments 
                    GROUP BY loan_id
                ) p ON l.id = p.loan_id
                WHERE p.total_paid >= l.total_payable
                """;
            return jdbcTemplate.queryForObject(sql, Long.class);
        } catch (Exception e) {
            return 0L;
        }
    }

    /**
     * Get NEW loans count (active loans with no payments)
     */
    public Long getNewLoans() {
        try {
            String sql = """
                SELECT COUNT(*) FROM loan_details l
                LEFT JOIN loan_payments p ON l.id = p.loan_id
                WHERE DATEDIFF(NOW(), l.payment_start_date) <= l.loan_duration_days
                AND p.loan_id IS NULL
                """;
            return jdbcTemplate.queryForObject(sql, Long.class);
        } catch (Exception e) {
            return 0L;
        }
    }

    /**
     * Get PROCESSED loans count (active loans with payments made)
     */
    public Long getProcessedLoans() {
        try {
            String sql = """
                SELECT COUNT(DISTINCT l.id) FROM loan_details l
                JOIN loan_payments p ON l.id = p.loan_id
                JOIN (
                    SELECT loan_id, COALESCE(SUM(amount_paid), 0) as total_paid 
                    FROM loan_payments 
                    GROUP BY loan_id
                ) pay ON l.id = pay.loan_id
                WHERE DATEDIFF(NOW(), l.payment_start_date) <= l.loan_duration_days
                AND pay.total_paid < l.total_payable
                """;
            return jdbcTemplate.queryForObject(sql, Long.class);
        } catch (Exception e) {
            return 0L;
        }
    }

    // === ADDITIONAL METRICS ===

    public Long getTotalClients() {
        try {
            String sql = """
                SELECT COUNT(*) FROM persons p
                JOIN users u ON p.id = u.person_id 
                WHERE u.role = 'CLIENT'
                """;
            return jdbcTemplate.queryForObject(sql, Long.class);
        } catch (Exception e) {
            return 0L;
        }
    }

    public Long getTotalLoans() {
        try {
            return jdbcTemplate.queryForObject("SELECT COUNT(*) FROM loan_details", Long.class);
        } catch (Exception e) {
            return 0L;
        }
    }

    public Double getAverageLoanAmount() {
        try {
            return jdbcTemplate.queryForObject("SELECT COALESCE(AVG(amount_disbursed), 0.0) FROM loan_details", Double.class);
        } catch (Exception e) {
            return 0.0;
        }
    }

    public Integer getAverageLoanTenureDays() {
        try {
            return jdbcTemplate.queryForObject("SELECT COALESCE(AVG(loan_duration_days), 0) FROM loan_details", Integer.class);
        } catch (Exception e) {
            return 0;
        }
    }

    public Double getOutstandingBalance() {
        try {
            String sql = """
                SELECT COALESCE(SUM(l.total_payable - COALESCE(p.total_paid, 0)), 0.0)
                FROM loan_details l
                LEFT JOIN (
                    SELECT loan_id, SUM(amount_paid) as total_paid
                    FROM loan_payments 
                    GROUP BY loan_id
                ) p ON l.id = p.loan_id
                WHERE COALESCE(p.total_paid, 0) < l.total_payable
                """;
            return jdbcTemplate.queryForObject(sql, Double.class);
        } catch (Exception e) {
            return 0.0;
        }
    }

    // === GENDER DISTRIBUTION ===

    public Long getMaleBorrowers() {
        try {
            String sql = """
                SELECT COUNT(*) FROM persons p
                JOIN users u ON p.id = u.person_id 
                WHERE u.role = 'CLIENT' AND p.gender = 'MALE'
                """;
            return jdbcTemplate.queryForObject(sql, Long.class);
        } catch (Exception e) {
            // If query fails, return approximate split
            Long total = getTotalClients();
            return total / 2;
        }
    }

    public Long getFemaleBorrowers() {
        try {
            String sql = """
                SELECT COUNT(*) FROM persons p
                JOIN users u ON p.id = u.person_id 
                WHERE u.role = 'CLIENT' AND p.gender = 'FEMALE'
                """;
            return jdbcTemplate.queryForObject(sql, Long.class);
        } catch (Exception e) {
            // If query fails, return approximate split
            Long total = getTotalClients();
            return total - (total / 2);
        }
    }

    // === TIME-BASED ANALYTICS ===

    /**
     * Get monthly loans released data for charts
     */
    public List<DashboardStatistics.MonthlyData> getMonthlyLoansReleased() {
        try {
            String sql = """
                SELECT 
                    MONTHNAME(payment_start_date) as month,
                    YEAR(payment_start_date) as year,
                    MONTH(payment_start_date) as month_number,
                    COALESCE(SUM(amount_disbursed), 0) as amount,
                    COUNT(*) as count
                FROM loan_details 
                WHERE payment_start_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
                GROUP BY YEAR(payment_start_date), MONTH(payment_start_date)
                ORDER BY year DESC, month_number DESC
                LIMIT 12
                """;
            
            List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql);
            List<DashboardStatistics.MonthlyData> result = new ArrayList<>();
            
            for (Map<String, Object> row : rows) {
                DashboardStatistics.MonthlyData monthlyData = new DashboardStatistics.MonthlyData();
                monthlyData.setMonth((String) row.get("month"));
                monthlyData.setYear((Integer) row.get("year"));
                monthlyData.setMonthNumber((Integer) row.get("month_number"));
                monthlyData.setAmount(((Number) row.get("amount")).doubleValue());
                monthlyData.setCount(((Number) row.get("count")).longValue());
                monthlyData.setMonthYear(monthlyData.getMonth() + " " + monthlyData.getYear());
                result.add(monthlyData);
            }
            
            return result;
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    /**
     * Get monthly collections data for charts
     */
    public List<DashboardStatistics.MonthlyData> getMonthlyCollections() {
        try {
            String sql = """
                SELECT 
                    MONTHNAME(payment_date) as month,
                    YEAR(payment_date) as year,
                    MONTH(payment_date) as month_number,
                    COALESCE(SUM(amount_paid), 0) as amount,
                    COUNT(*) as count
                FROM loan_payments 
                WHERE payment_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
                GROUP BY YEAR(payment_date), MONTH(payment_date)
                ORDER BY year DESC, month_number DESC
                LIMIT 12
                """;
            
            List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql);
            List<DashboardStatistics.MonthlyData> result = new ArrayList<>();
            
            for (Map<String, Object> row : rows) {
                DashboardStatistics.MonthlyData monthlyData = new DashboardStatistics.MonthlyData();
                monthlyData.setMonth((String) row.get("month"));
                monthlyData.setYear((Integer) row.get("year"));
                monthlyData.setMonthNumber((Integer) row.get("month_number"));
                monthlyData.setAmount(((Number) row.get("amount")).doubleValue());
                monthlyData.setCount(((Number) row.get("count")).longValue());
                monthlyData.setMonthYear(monthlyData.getMonth() + " " + monthlyData.getYear());
                result.add(monthlyData);
            }
            
            return result;
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    /**
     * Get monthly past maturity loans count for charts
     */
    public List<DashboardStatistics.MonthlyData> getMonthlyPastMaturityLoans() {
        try {
            String sql = """
                SELECT 
                    MONTHNAME(DATE_ADD(payment_start_date, INTERVAL loan_duration_days DAY)) as month,
                    YEAR(DATE_ADD(payment_start_date, INTERVAL loan_duration_days DAY)) as year,
                    MONTH(DATE_ADD(payment_start_date, INTERVAL loan_duration_days DAY)) as month_number,
                    COUNT(*) as count,
                    COALESCE(SUM(total_payable), 0) as amount
                FROM loan_details l
                LEFT JOIN (
                    SELECT loan_id, COALESCE(SUM(amount_paid), 0) as total_paid 
                    FROM loan_payments 
                    GROUP BY loan_id
                ) p ON l.id = p.loan_id
                WHERE DATE_ADD(l.payment_start_date, INTERVAL l.loan_duration_days DAY) >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
                AND DATE_ADD(l.payment_start_date, INTERVAL l.loan_duration_days DAY) <= NOW()
                AND COALESCE(p.total_paid, 0) < l.total_payable
                GROUP BY YEAR(DATE_ADD(payment_start_date, INTERVAL loan_duration_days DAY)), 
                         MONTH(DATE_ADD(payment_start_date, INTERVAL loan_duration_days DAY))
                ORDER BY year DESC, month_number DESC
                LIMIT 12
                """;
            
            List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql);
            List<DashboardStatistics.MonthlyData> result = new ArrayList<>();
            
            for (Map<String, Object> row : rows) {
                DashboardStatistics.MonthlyData monthlyData = new DashboardStatistics.MonthlyData();
                monthlyData.setMonth((String) row.get("month"));
                monthlyData.setYear((Integer) row.get("year"));
                monthlyData.setMonthNumber((Integer) row.get("month_number"));
                monthlyData.setCount(((Number) row.get("count")).longValue());
                monthlyData.setAmount(((Number) row.get("amount")).doubleValue());
                monthlyData.setMonthYear(monthlyData.getMonth() + " " + monthlyData.getYear());
                result.add(monthlyData);
            }
            
            return result;
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    // === SYSTEM INFO ===

    public Boolean isSetupCompleted() {
        try {
            Long userCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM users", Long.class);
            return userCount != null && userCount > 0;
        } catch (Exception e) {
            return false;
        }
    }
}