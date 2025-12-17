package org.example.Repositories;

import org.example.Entities.LoanTracking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface LoanTrackingRepository extends JpaRepository<LoanTracking, Long> {
    
    // Find by loan ID
    Optional<LoanTracking> findByLoanId(Long loanId);
    
    // Find by client ID
    List<LoanTracking> findByClientId(Long clientId);
    
    // Find by loan status
    List<LoanTracking> findByLoanStatus(String loanStatus);
    
    // Find by payment status
    List<LoanTracking> findByPaymentStatus(String paymentStatus);
    
    // Find late loans
    List<LoanTracking> findByIsLateTrue();
    
    // Find defaulted loans
    List<LoanTracking> findByIsDefaultedTrue();
    
    // Find current loans
    List<LoanTracking> findByIsCurrentTrue();
    
    // Find loans by completion percentage range
    @Query("SELECT lt FROM LoanTracking lt WHERE lt.completionPercentage BETWEEN :minPercentage AND :maxPercentage")
    List<LoanTracking> findByCompletionPercentageRange(@Param("minPercentage") Double minPercentage, 
                                                        @Param("maxPercentage") Double maxPercentage);
    
    // Find high-risk loans (default risk score above threshold)
    @Query("SELECT lt FROM LoanTracking lt WHERE lt.defaultRiskScore > :threshold ORDER BY lt.defaultRiskScore DESC")
    List<LoanTracking> findHighRiskLoans(@Param("threshold") Double threshold);
    
    // Find loans with late payments
    @Query("SELECT lt FROM LoanTracking lt WHERE lt.daysLate > :days")
    List<LoanTracking> findLoansLateByDays(@Param("days") Integer days);
    
    // Find loans due soon
    @Query("SELECT lt FROM LoanTracking lt WHERE lt.nextPaymentDueDate BETWEEN :startDate AND :endDate")
    List<LoanTracking> findLoansDueBetween(@Param("startDate") LocalDate startDate, 
                                            @Param("endDate") LocalDate endDate);
    
    // Get total outstanding balance for all loans
    @Query("SELECT SUM(lt.outstandingBalance) FROM LoanTracking lt WHERE lt.loanStatus = 'ACTIVE'")
    Double getTotalOutstandingBalance();
    
    // Get total outstanding principal
    @Query("SELECT SUM(lt.outstandingPrincipal) FROM LoanTracking lt WHERE lt.loanStatus = 'ACTIVE'")
    Double getTotalOutstandingPrincipal();
    
    // Get portfolio at risk (loans late by more than X days)
    @Query("SELECT SUM(lt.outstandingBalance) FROM LoanTracking lt WHERE lt.daysLate > :days AND lt.loanStatus = 'ACTIVE'")
    Double getPortfolioAtRisk(@Param("days") Integer days);
    
    // Get average completion percentage
    @Query("SELECT AVG(lt.completionPercentage) FROM LoanTracking lt WHERE lt.loanStatus = 'ACTIVE'")
    Double getAverageCompletionPercentage();
    
    // Get average payment behavior score
    @Query("SELECT AVG(lt.paymentBehaviorScore) FROM LoanTracking lt WHERE lt.loanStatus = 'ACTIVE'")
    Double getAveragePaymentBehaviorScore();
    
    // Find loans with partial payments
    List<LoanTracking> findByHasPartialPaymentsTrue();
    
    // Find loans with overpayments
    List<LoanTracking> findByHasOverpaymentsTrue();
    
    // Get loans by payment pattern
    List<LoanTracking> findByPaymentPattern(String pattern);
    
    // Check if tracking exists for loan
    boolean existsByLoanId(Long loanId);
}
