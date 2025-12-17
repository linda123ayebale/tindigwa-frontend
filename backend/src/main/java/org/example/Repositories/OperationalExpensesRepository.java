package org.example.Repositories;

import org.example.Entities.OperationalExpenses;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface OperationalExpensesRepository extends JpaRepository<OperationalExpenses, Long> {
    
    // Find by category name with category loaded
    @EntityGraph(attributePaths = {"category"})
    List<OperationalExpenses> findByCategoryCategoryName(String categoryName);

    // Find by status with category loaded
    @EntityGraph(attributePaths = {"category"})
    List<OperationalExpenses> findByStatus(String status);

    // Find by date range with category loaded
    @EntityGraph(attributePaths = {"category"})
    List<OperationalExpenses> findByExpenseDateBetween(LocalDate startDate, LocalDate endDate);
    
    // Find by category name and date range with category loaded
    @EntityGraph(attributePaths = {"category"})
    List<OperationalExpenses> findByCategoryCategoryNameAndExpenseDateBetween(String categoryName, LocalDate startDate, LocalDate endDate);

    // Find by vendor with category loaded
    @EntityGraph(attributePaths = {"category"})
    List<OperationalExpenses> findByVendorContainingIgnoreCase(String vendor);
    
    // Find by expense reference with category loaded
    @EntityGraph(attributePaths = {"category"})
    Optional<OperationalExpenses> findByExpenseReference(String expenseReference);
    
    // Custom query for expense summary by category
    @Query("SELECT e.category.categoryName, SUM(e.amount) as totalAmount, COUNT(e) as count FROM OperationalExpenses e WHERE e.expenseDate BETWEEN :startDate AND :endDate GROUP BY e.category.categoryName")
    List<Object[]> findExpenseSummaryByCategory(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    // Custom query for monthly expenses
    @Query("SELECT YEAR(e.expenseDate), MONTH(e.expenseDate), SUM(e.amount) FROM OperationalExpenses e WHERE e.expenseDate BETWEEN :startDate AND :endDate GROUP BY YEAR(e.expenseDate), MONTH(e.expenseDate) ORDER BY YEAR(e.expenseDate), MONTH(e.expenseDate)")
    List<Object[]> findMonthlyExpenseTotals(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    // Find expenses by multiple filters
    @Query("SELECT e FROM OperationalExpenses e WHERE " +
           "(:category IS NULL OR e.category.categoryName = :category) AND " +
           "(:status IS NULL OR e.status = :status) AND " +
           "(:startDate IS NULL OR e.expenseDate >= :startDate) AND " +
           "(:endDate IS NULL OR e.expenseDate <= :endDate) AND " +
           "(:searchTerm IS NULL OR e.description LIKE %:searchTerm% OR e.vendor LIKE %:searchTerm%)")
    List<OperationalExpenses> findExpensesWithFilters(
        @Param("category") String category,
        @Param("status") String status,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate,
        @Param("searchTerm") String searchTerm
    );
    
    // Find by approval status with category loaded
    @EntityGraph(attributePaths = {"category"})
    List<OperationalExpenses> findByApprovalStatus(String approvalStatus);
    
    // Find by payment status with category loaded
    @EntityGraph(attributePaths = {"category"})
    List<OperationalExpenses> findByPaymentStatus(String paymentStatus);
    
    // Find by approval status and payment status with category loaded
    @EntityGraph(attributePaths = {"category"})
    List<OperationalExpenses> findByApprovalStatusAndPaymentStatus(String approvalStatus, String paymentStatus);
}
