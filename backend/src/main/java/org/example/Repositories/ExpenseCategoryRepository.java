package org.example.Repositories;

import org.example.Entities.ExpenseCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExpenseCategoryRepository extends JpaRepository<ExpenseCategory, Long> {
    
    // Find active categories
    List<ExpenseCategory> findByIsActiveTrue();
    
    // Find by category name (case-insensitive)
    Optional<ExpenseCategory> findByCategoryNameIgnoreCase(String categoryName);
    
    // Find parent categories (no parent)
    // Find categories ordered by sort order
    List<ExpenseCategory> findByIsActiveTrueOrderBySortOrderAsc();
    
    // Find parent categories ordered by sort order
    List<ExpenseCategory> findByParentCategoryIdIsNullAndIsActiveTrueOrderBySortOrderAsc();
    
    // Check if category name exists (for unique validation)
    boolean existsByCategoryNameIgnoreCase(String categoryName);
    
    // Find categories with budget limits
    List<ExpenseCategory> findByBudgetLimitIsNotNullAndIsActiveTrue();
    
    // Custom query to get category hierarchy
    @Query("SELECT c FROM ExpenseCategory c WHERE c.isActive = true ORDER BY " +
           "CASE WHEN c.parentCategoryId IS NULL THEN c.sortOrder ELSE " +
           "(SELECT p.sortOrder FROM ExpenseCategory p WHERE p.id = c.parentCategoryId) END, " +
           "c.parentCategoryId NULLS FIRST, c.sortOrder")
    List<ExpenseCategory> findCategoriesInHierarchicalOrder();
    
    // Find categories by created user
    List<ExpenseCategory> findByCreatedByAndIsActiveTrue(String createdBy);
}package org.example.Repositories;

import org.example.Entities.ExpenseCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExpenseCategoryRepository extends JpaRepository<ExpenseCategory, Long> {
    List<ExpenseCategory> findAllByOrderByNameAsc();
    boolean existsByName(String name);
    Optional<ExpenseCategory> findByName(String name);
}
