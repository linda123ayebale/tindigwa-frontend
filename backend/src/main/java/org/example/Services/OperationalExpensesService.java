package org.example.Services;

import org.example.Entities.ExpenseCategory;
import org.example.Entities.OperationalExpenses;
import org.example.Events.ExpenseApprovedEvent;
import org.example.Events.ExpenseCreatedEvent;
import org.example.Events.ExpensePaidEvent;
import org.example.Events.ExpenseRejectedEvent;
import org.example.Exceptions.CategoryNotFoundException;
import org.example.Exceptions.InactiveCategoryException;
import org.example.Exceptions.InvalidExpenseException;
import org.example.Repositories.OperationalExpensesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class OperationalExpensesService {
    @Autowired
    private OperationalExpensesRepository repository;
    
    @Autowired
    private ExpenseCategoryService categoryService;
    
    @Autowired
    private ApplicationEventPublisher eventPublisher;
    
    @Autowired
    private UserAttributionService userAttributionService;
    
    @Autowired
    private UniqueIdGenerator uniqueIdGenerator;

    // Create expense
    public OperationalExpenses createExpense(OperationalExpenses expense) {
        // Generate expense reference if not provided
        if (expense.getExpenseReference() == null || expense.getExpenseReference().isEmpty()) {
            expense.setExpenseReference(generateExpenseReference());
        }
        
        // Validate that the category exists and is active
        if (expense.getCategory() == null || expense.getCategory().getId() == null) {
            throw new InvalidExpenseException("Expense category is required");
        }
        
        ExpenseCategory category = categoryService.getCategoryById(expense.getCategory().getId())
                .orElseThrow(() -> new CategoryNotFoundException(expense.getCategory().getId()));
                
        if (!category.getIsActive()) {
            throw new InactiveCategoryException(category.getCategoryName());
        }
        
        expense.setCategory(category);
        
        // Set user ID from currently logged-in user (from JWT token)
        Long currentUserId = userAttributionService.getCurrentUserId();
        
        if (currentUserId != null) {
            expense.setRequestedByUserId(currentUserId);
        }
        
        OperationalExpenses savedExpense = repository.save(expense);
        
        // Publish expense created event
        eventPublisher.publishEvent(new ExpenseCreatedEvent(this, savedExpense, String.valueOf(currentUserId)));
        
        return savedExpense;
    }

    // Get all expenses
    public List<OperationalExpenses> getAllExpenses() {
        return repository.findAll();
    }

    // Get expenses with pagination
    public Page<OperationalExpenses> getAllExpenses(Pageable pageable) {
        return repository.findAll(pageable);
    }

    // Get expense by ID
    public Optional<OperationalExpenses> getExpenseById(Long id) {
        return repository.findById(id);
    }

    // Get expense by reference
    public Optional<OperationalExpenses> getExpenseByReference(String reference) {
        return repository.findByExpenseReference(reference);
    }

    // Update expense
    public OperationalExpenses updateExpense(Long id, OperationalExpenses updatedExpense) {
        return repository.findById(id)
                .map(existing -> {
                    // Validate that the category exists and is active
                    if (updatedExpense.getCategory() == null || updatedExpense.getCategory().getId() == null) {
                        throw new InvalidExpenseException("Expense category is required");
                    }
                    
                    ExpenseCategory category = categoryService.getCategoryById(updatedExpense.getCategory().getId())
                            .orElseThrow(() -> new CategoryNotFoundException(updatedExpense.getCategory().getId()));
                            
                    if (!category.getIsActive()) {
                        throw new InactiveCategoryException(category.getCategoryName());
                    }
                    
                    // Preserve ID and timestamps
                    updatedExpense.setId(existing.getId());
                    updatedExpense.setCreatedAt(existing.getCreatedAt());
                    updatedExpense.setUpdatedAt(LocalDateTime.now());
                    updatedExpense.setCategory(category);
                    
                    return repository.save(updatedExpense);
                }).orElseThrow(() -> new InvalidExpenseException("Expense not found with id: " + id));
    }

    // Delete expense
    public void deleteExpense(Long id) {
        if (!repository.existsById(id)) {
            throw new InvalidExpenseException("Expense not found with id: " + id);
        }
        repository.deleteById(id);
    }

    // Get expenses by category
    public List<OperationalExpenses> getExpensesByCategory(String categoryName) {
        return repository.findByCategoryCategoryName(categoryName);
    }

    // Get expenses by status
    public List<OperationalExpenses> getExpensesByStatus(String status) {
        return repository.findByStatus(status);
    }

    // Get expenses by date range
    public List<OperationalExpenses> getExpensesByDateRange(LocalDate startDate, LocalDate endDate) {
        return repository.findByExpenseDateBetween(startDate, endDate);
    }

    // Get filtered expenses
    public List<OperationalExpenses> getFilteredExpenses(String category, String status, 
                                                        LocalDate startDate, LocalDate endDate, 
                                                        String searchTerm) {
        return repository.findExpensesWithFilters(category, status, startDate, endDate, searchTerm);
    }

    // Get expense summary by category
    public Map<String, Map<String, Object>> getExpenseSummaryByCategory(LocalDate startDate, LocalDate endDate) {
        List<Object[]> results = repository.findExpenseSummaryByCategory(startDate, endDate);
        return results.stream().collect(Collectors.toMap(
            result -> (String) result[0], // category
            result -> {
                Map<String, Object> summary = new HashMap<>();
                summary.put("totalAmount", result[1]);
                summary.put("count", result[2]);
                return summary;
            }
        ));
    }

    // Get monthly expense totals
    public List<Map<String, Object>> getMonthlyExpenseTotals(LocalDate startDate, LocalDate endDate) {
        List<Object[]> results = repository.findMonthlyExpenseTotals(startDate, endDate);
        return results.stream().map(result -> {
            Map<String, Object> monthlyData = new HashMap<>();
            monthlyData.put("year", result[0]);
            monthlyData.put("month", result[1]);
            monthlyData.put("totalAmount", result[2]);
            return monthlyData;
        }).collect(Collectors.toList());
    }

    // Get expense categories
    public List<String> getExpenseCategories() {
        return categoryService.getAllActiveCategories().stream()
                .map(ExpenseCategory::getCategoryName)
                .collect(Collectors.toList());
    }

    // Update expense status
    public OperationalExpenses updateExpenseStatus(Long id, String status) {
        return repository.findById(id)
                .map(expense -> {
                    expense.setStatus(status);
                    expense.setUpdatedAt(LocalDateTime.now());
                    return repository.save(expense);
                }).orElseThrow(() -> new InvalidExpenseException("Expense not found with id: " + id));
    }

    // Get total expenses for date range
    public Double getTotalExpensesForDateRange(LocalDate startDate, LocalDate endDate) {
        List<OperationalExpenses> expenses = repository.findByExpenseDateBetween(startDate, endDate);
        return expenses.stream()
                .mapToDouble(OperationalExpenses::getAmount)
                .sum();
    }

    // Generate unique expense reference using UniqueIdGenerator
    // Format: EX###### (8 characters: EX + YY + 4-digit sequence)
    // Example: EX250001
    private String generateExpenseReference() {
        return uniqueIdGenerator.generateExpenseId();
    }

    // Get expense statistics
    public Map<String, Object> getExpenseStatistics(LocalDate startDate, LocalDate endDate) {
        List<OperationalExpenses> expenses = repository.findByExpenseDateBetween(startDate, endDate);
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalCount", expenses.size());
        stats.put("totalAmount", expenses.stream().mapToDouble(OperationalExpenses::getAmount).sum());
        stats.put("averageAmount", expenses.isEmpty() ? 0 : expenses.stream().mapToDouble(OperationalExpenses::getAmount).average().orElse(0));
        
        // Group by status
        Map<String, Long> statusCounts = expenses.stream()
                .collect(Collectors.groupingBy(OperationalExpenses::getStatus, Collectors.counting()));
        stats.put("statusBreakdown", statusCounts);
        
        // Group by category
        Map<String, Double> categoryTotals = expenses.stream()
                .collect(Collectors.groupingBy(e -> e.getCategory().getCategoryName(),
                        Collectors.summingDouble(OperationalExpenses::getAmount)));
        stats.put("categoryTotals", categoryTotals);
        return stats;
    }
    
    // Approve expense
    public OperationalExpenses approveExpense(Long id, String approvedBy, String approvalComment) {
        return repository.findById(id)
                .map(expense -> {
                    if (!"PENDING".equals(expense.getApprovalStatus())) {
                        throw new InvalidExpenseException("Only pending expenses can be approved");
                    }
                    
                    // Get currently logged-in user's ID from JWT token
                    Long currentUserId = userAttributionService.getCurrentUserId();
                    
                    expense.setApprovalStatus("APPROVED");
                    expense.setApprovedByUserId(currentUserId); // Store user ID
                    expense.setApprovalComment(approvalComment);
                    expense.setApprovedAt(LocalDateTime.now());
                    expense.setUpdatedAt(LocalDateTime.now());
                    
                    OperationalExpenses savedExpense = repository.save(expense);
                    
                    // Publish expense approved event
                    eventPublisher.publishEvent(new ExpenseApprovedEvent(this, savedExpense, String.valueOf(currentUserId)));
                    
                    return savedExpense;
                }).orElseThrow(() -> new InvalidExpenseException("Expense not found with id: " + id));
    }
    
    // Reject expense
    public OperationalExpenses rejectExpense(Long id, String rejectedBy, String rejectionComment) {
        return repository.findById(id)
                .map(expense -> {
                    if (!"PENDING".equals(expense.getApprovalStatus())) {
                        throw new InvalidExpenseException("Only pending expenses can be rejected");
                    }
                    
                    // Get currently logged-in user's ID from JWT token
                    Long currentUserId = userAttributionService.getCurrentUserId();
                    
                    expense.setApprovalStatus("REJECTED");
                    expense.setApprovedByUserId(currentUserId); // Store user ID (rejectedBy)
                    expense.setApprovalComment(rejectionComment);
                    expense.setApprovedAt(LocalDateTime.now());
                    expense.setUpdatedAt(LocalDateTime.now());
                    
                    OperationalExpenses savedExpense = repository.save(expense);
                    
                    // Publish expense rejected event
                    eventPublisher.publishEvent(new ExpenseRejectedEvent(this, savedExpense, String.valueOf(currentUserId)));
                    
                    return savedExpense;
                }).orElseThrow(() -> new InvalidExpenseException("Expense not found with id: " + id));
    }
    
    // Mark expense as paid
    public OperationalExpenses markExpenseAsPaid(Long id, String paidBy) {
        return repository.findById(id)
                .map(expense -> {
                    if (!"APPROVED".equals(expense.getApprovalStatus())) {
                        throw new InvalidExpenseException("Only approved expenses can be marked as paid");
                    }
                    
                    if ("PAID".equals(expense.getPaymentStatus())) {
                        throw new InvalidExpenseException("Expense is already marked as paid");
                    }
                    
                    // Get currently logged-in user's ID from JWT token
                    Long currentUserId = userAttributionService.getCurrentUserId();
                    
                    expense.setPaymentStatus("PAID");
                    expense.setPaidByUserId(currentUserId); // Store user ID
                    expense.setPaidAt(LocalDateTime.now());
                    expense.setUpdatedAt(LocalDateTime.now());
                    
                    OperationalExpenses savedExpense = repository.save(expense);
                    
                    // Publish expense paid event
                    eventPublisher.publishEvent(new ExpensePaidEvent(this, savedExpense, String.valueOf(currentUserId)));
                    
                    return savedExpense;
                }).orElseThrow(() -> new InvalidExpenseException("Expense not found with id: " + id));
    }
    
    // Get expenses by approval status
    public List<OperationalExpenses> getExpensesByApprovalStatus(String approvalStatus) {
        return repository.findByApprovalStatus(approvalStatus);
    }
    
    // Get expenses by payment status
    public List<OperationalExpenses> getExpensesByPaymentStatus(String paymentStatus) {
        return repository.findByPaymentStatus(paymentStatus);
    }
    
    // Get expenses that are approved and unpaid
    public List<OperationalExpenses> getApprovedUnpaidExpenses() {
        return repository.findByApprovalStatusAndPaymentStatus("APPROVED", "UNPAID");
    }
}
