package org.example.Repositories;

import org.example.Entities.LoanPayments;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface LoanPaymentsRepository extends JpaRepository<LoanPayments,Long> {
    
    // Basic Queries
    List<LoanPayments> findByLoanId(Long loanId);
    List<LoanPayments> findByLoanIdOrderByPaymentDateAsc(Long loanId);
    List<LoanPayments> findByLoanIdOrderByPaymentDateDesc(Long loanId);
    
    // Payment Status Queries
    List<LoanPayments> findByLoanIdAndPaymentStatus(Long loanId, String paymentStatus);
    List<LoanPayments> findByPaymentStatus(String paymentStatus);
    
    // Date Range Queries
    List<LoanPayments> findByPaymentDateBetween(LocalDate startDate, LocalDate endDate);
    List<LoanPayments> findByLoanIdAndPaymentDateBetween(Long loanId, LocalDate startDate, LocalDate endDate);
    
    // Latest Payment Queries
    Optional<LoanPayments> findTopByLoanIdOrderByPaymentDateDesc(Long loanId);
    Optional<LoanPayments> findTopByLoanIdOrderByCreatedAtDesc(Long loanId);
    
    // Financial Summary Queries
    @Query("SELECT SUM(p.amountPaid) FROM LoanPayments p WHERE p.loanId = :loanId AND p.paymentStatus = 'COMPLETED'")
    Double getTotalPaidByLoanId(@Param("loanId") Long loanId);
    
    @Query("SELECT SUM(p.principalPaid) FROM LoanPayments p WHERE p.loanId = :loanId AND p.paymentStatus = 'COMPLETED'")
    Double getTotalPrincipalPaidByLoanId(@Param("loanId") Long loanId);
    
    @Query("SELECT SUM(p.interestPaid) FROM LoanPayments p WHERE p.loanId = :loanId AND p.paymentStatus = 'COMPLETED'")
    Double getTotalInterestPaidByLoanId(@Param("loanId") Long loanId);
    
    @Query("SELECT SUM(p.feesPaid) FROM LoanPayments p WHERE p.loanId = :loanId AND p.paymentStatus = 'COMPLETED'")
    Double getTotalFeesPaidByLoanId(@Param("loanId") Long loanId);
    
    @Query("SELECT SUM(p.fine) FROM LoanPayments p WHERE p.loanId = :loanId")
    Double getTotalPenaltyByLoanId(@Param("loanId") Long loanId);
    
    @Query("SELECT SUM(p.cumulativePenalty) FROM LoanPayments p WHERE p.loanId = :loanId ORDER BY p.paymentDate DESC LIMIT 1")
    Double getLatestCumulativePenaltyByLoanId(@Param("loanId") Long loanId);
    
    // Balance Queries
    @Query("SELECT p.outstandingBalance FROM LoanPayments p WHERE p.loanId = :loanId ORDER BY p.paymentDate DESC LIMIT 1")
    Double getLatestOutstandingBalanceByLoanId(@Param("loanId") Long loanId);
    
    @Query("SELECT p.principalBalance FROM LoanPayments p WHERE p.loanId = :loanId ORDER BY p.paymentDate DESC LIMIT 1")
    Double getLatestPrincipalBalanceByLoanId(@Param("loanId") Long loanId);
    
    @Query("SELECT p.interestBalance FROM LoanPayments p WHERE p.loanId = :loanId ORDER BY p.paymentDate DESC LIMIT 1")
    Double getLatestInterestBalanceByLoanId(@Param("loanId") Long loanId);
    
    // Payment Count and Status
    @Query("SELECT COUNT(p) FROM LoanPayments p WHERE p.loanId = :loanId AND p.paymentStatus = 'COMPLETED'")
    Long getPaymentCountByLoanId(@Param("loanId") Long loanId);
    
    @Query("SELECT COUNT(p) > 0 FROM LoanPayments p WHERE p.loanId = :loanId")
    boolean hasAnyPayments(@Param("loanId") Long loanId);
    
    @Query("SELECT COUNT(p) FROM LoanPayments p WHERE p.loanId = :loanId AND p.late = true")
    Long getLatePaymentCountByLoanId(@Param("loanId") Long loanId);
    
    // Installment Queries
    List<LoanPayments> findByLoanIdAndInstallmentNumber(Long loanId, Integer installmentNumber);
    Optional<LoanPayments> findTopByLoanIdOrderByInstallmentNumberDesc(Long loanId);
    
    // Payment Method Queries
    List<LoanPayments> findByPaymentMethod(String paymentMethod);
    List<LoanPayments> findByLoanIdAndPaymentMethod(Long loanId, String paymentMethod);
    
    // Late Payment Queries
    List<LoanPayments> findByLateTrue();
    List<LoanPayments> findByLoanIdAndLateTrue(Long loanId);
    
    // Overdue and Partial Payment Queries
    List<LoanPayments> findByPartialPaymentTrue();
    List<LoanPayments> findByOverpaymentTrue();
    List<LoanPayments> findByLoanIdAndPartialPaymentTrue(Long loanId);
    List<LoanPayments> findByLoanIdAndOverpaymentTrue(Long loanId);
    
    // Reference Number Query
    Optional<LoanPayments> findByReferenceNumber(String referenceNumber);
    
    // Payment Summary DTO Query
    @Query("SELECT new map(" +
           "COUNT(p) as totalPayments, " +
           "SUM(p.amountPaid) as totalAmount, " +
           "SUM(p.principalPaid) as totalPrincipal, " +
           "SUM(p.interestPaid) as totalInterest, " +
           "SUM(p.feesPaid) as totalFees, " +
           "SUM(p.fine) as totalPenalties, " +
           "MAX(p.paymentDate) as lastPaymentDate, " +
           "MIN(p.paymentDate) as firstPaymentDate" +
           ") FROM LoanPayments p WHERE p.loanId = :loanId AND p.paymentStatus = 'COMPLETED'")
    Optional<java.util.Map<String, Object>> getPaymentSummaryByLoanId(@Param("loanId") Long loanId);
}
