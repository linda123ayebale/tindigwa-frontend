package org.example.Repositories;

import org.example.Entities.LoanInstallmentSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface LoanInstallmentScheduleRepository extends JpaRepository<LoanInstallmentSchedule, Long> {
    
    // ===== BASIC QUERIES =====
    
    /**
     * Find all installments for a specific loan
     */
    List<LoanInstallmentSchedule> findByLoanIdOrderByInstallmentNumberAsc(Long loanId);
    
    /**
     * Find specific installment for a loan
     */
    Optional<LoanInstallmentSchedule> findByLoanIdAndInstallmentNumber(Long loanId, Integer installmentNumber);
    
    /**
     * Count total installments for a loan
     */
    Long countByLoanId(Long loanId);
    
    // ===== STATUS-BASED QUERIES =====
    
    /**
     * Find all installments by status
     */
    List<LoanInstallmentSchedule> findByStatus(String status);
    
    /**
     * Find pending installments for a loan
     */
    List<LoanInstallmentSchedule> findByLoanIdAndStatusOrderByInstallmentNumberAsc(Long loanId, String status);
    
    /**
     * Find unpaid installments for a loan
     */
    List<LoanInstallmentSchedule> findByLoanIdAndIsPaidFalseOrderByInstallmentNumberAsc(Long loanId);
    
    /**
     * Find paid installments for a loan
     */
    List<LoanInstallmentSchedule> findByLoanIdAndIsPaidTrueOrderByInstallmentNumberAsc(Long loanId);
    
    /**
     * Find next unpaid installment for a loan
     */
    @Query("SELECT i FROM LoanInstallmentSchedule i WHERE i.loanId = :loanId AND i.isPaid = false ORDER BY i.installmentNumber ASC")
    Optional<LoanInstallmentSchedule> findNextUnpaidInstallment(@Param("loanId") Long loanId);
    
    // ===== DUE DATE QUERIES =====
    
    /**
     * Find installments due between dates
     */
    @Query("SELECT i FROM LoanInstallmentSchedule i WHERE i.dueDate BETWEEN :startDate AND :endDate AND i.isPaid = false ORDER BY i.dueDate ASC")
    List<LoanInstallmentSchedule> findDueBetweenDates(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    /**
     * Find installments due on specific date
     */
    List<LoanInstallmentSchedule> findByDueDateAndIsPaidFalse(LocalDate dueDate);
    
    /**
     * Find installments due today
     */
    @Query("SELECT i FROM LoanInstallmentSchedule i WHERE i.dueDate = CURRENT_DATE AND i.isPaid = false")
    List<LoanInstallmentSchedule> findDueToday();
    
    /**
     * Find installments due in next N days
     */
    @Query("SELECT i FROM LoanInstallmentSchedule i WHERE i.dueDate BETWEEN CURRENT_DATE AND :endDate AND i.isPaid = false ORDER BY i.dueDate ASC")
    List<LoanInstallmentSchedule> findDueInNextDays(@Param("endDate") LocalDate endDate);
    
    // ===== OVERDUE QUERIES =====
    
    /**
     * Find all overdue installments
     */
    @Query("SELECT i FROM LoanInstallmentSchedule i WHERE i.dueDate < CURRENT_DATE AND i.isPaid = false ORDER BY i.dueDate ASC")
    List<LoanInstallmentSchedule> findOverdueInstallments();
    
    /**
     * Find overdue installments for a loan
     */
    @Query("SELECT i FROM LoanInstallmentSchedule i WHERE i.loanId = :loanId AND i.dueDate < CURRENT_DATE AND i.isPaid = false ORDER BY i.dueDate ASC")
    List<LoanInstallmentSchedule> findOverdueInstallmentsByLoanId(@Param("loanId") Long loanId);
    
    /**
     * Count overdue installments for a loan
     */
    @Query("SELECT COUNT(i) FROM LoanInstallmentSchedule i WHERE i.loanId = :loanId AND i.dueDate < CURRENT_DATE AND i.isPaid = false")
    Long countOverdueInstallmentsByLoanId(@Param("loanId") Long loanId);
    
    // ===== GRACE PERIOD QUERIES =====
    
    /**
     * Find installments in grace period
     */
    @Query("SELECT i FROM LoanInstallmentSchedule i WHERE i.inGracePeriod = true AND i.isPaid = false ORDER BY i.dueDate ASC")
    List<LoanInstallmentSchedule> findInGracePeriod();
    
    /**
     * Find installments where grace period expires soon
     */
    @Query("SELECT i FROM LoanInstallmentSchedule i WHERE i.graceExpiryDate BETWEEN CURRENT_DATE AND :endDate AND i.isPaid = false ORDER BY i.graceExpiryDate ASC")
    List<LoanInstallmentSchedule> findGracePeriodExpiringSoon(@Param("endDate") LocalDate endDate);
    
    // ===== PAYMENT TRACKING QUERIES =====
    
    /**
     * Find partial payments
     */
    List<LoanInstallmentSchedule> findByIsPartialTrueOrderByDueDateDesc();
    
    /**
     * Find partial payments for a loan
     */
    List<LoanInstallmentSchedule> findByLoanIdAndIsPartialTrue(Long loanId);
    
    /**
     * Count paid installments for a loan
     */
    Long countByLoanIdAndIsPaidTrue(Long loanId);
    
    /**
     * Get total paid amount for a loan
     */
    @Query("SELECT SUM(i.paidAmount) FROM LoanInstallmentSchedule i WHERE i.loanId = :loanId AND i.paidAmount IS NOT NULL")
    Double getTotalPaidByLoanId(@Param("loanId") Long loanId);
    
    /**
     * Get total outstanding amount for a loan
     */
    @Query("SELECT SUM(i.outstandingAmount) FROM LoanInstallmentSchedule i WHERE i.loanId = :loanId AND i.isPaid = false")
    Double getTotalOutstandingByLoanId(@Param("loanId") Long loanId);
    
    /**
     * Get total penalties for a loan
     */
    @Query("SELECT SUM(i.penaltyAmount) FROM LoanInstallmentSchedule i WHERE i.loanId = :loanId")
    Double getTotalPenaltiesByLoanId(@Param("loanId") Long loanId);
    
    // ===== ANALYTICS QUERIES =====
    
    /**
     * Get payment completion rate for a loan
     */
    @Query("SELECT CAST(COUNT(CASE WHEN i.isPaid = true THEN 1 END) AS double) / COUNT(*) * 100 FROM LoanInstallmentSchedule i WHERE i.loanId = :loanId")
    Double getPaymentCompletionRate(@Param("loanId") Long loanId);
    
    /**
     * Get on-time payment count for a loan
     */
    @Query("SELECT COUNT(i) FROM LoanInstallmentSchedule i WHERE i.loanId = :loanId AND i.isPaid = true AND i.isLate = false")
    Long getOnTimePaymentCount(@Param("loanId") Long loanId);
    
    /**
     * Get late payment count for a loan
     */
    @Query("SELECT COUNT(i) FROM LoanInstallmentSchedule i WHERE i.loanId = :loanId AND i.isLate = true")
    Long getLatePaymentCount(@Param("loanId") Long loanId);
    
    /**
     * Find all loans with overdue installments
     */
    @Query("SELECT DISTINCT i.loanId FROM LoanInstallmentSchedule i WHERE i.dueDate < CURRENT_DATE AND i.isPaid = false")
    List<Long> findLoansWithOverdueInstallments();
    
    /**
     * Find all loans with upcoming installments
     */
    @Query("SELECT DISTINCT i.loanId FROM LoanInstallmentSchedule i WHERE i.dueDate BETWEEN CURRENT_DATE AND :endDate AND i.isPaid = false")
    List<Long> findLoansWithUpcomingInstallments(@Param("endDate") LocalDate endDate);
    
    // ===== DELETE OPERATIONS =====
    
    /**
     * Delete all installments for a loan
     */
    void deleteByLoanId(Long loanId);
}
