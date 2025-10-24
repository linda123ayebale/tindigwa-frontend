package org.example.Repositories;

import org.example.Entities.ExpenseCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExpenseCategoryRepository extends JpaRepository<ExpenseCategory, Long> {
    List<ExpenseCategory> findByIsActiveTrue();
    Optional<ExpenseCategory> findByCategoryNameIgnoreCase(String categoryName);
    List<ExpenseCategory> findByIsActiveTrueOrderByCreatedAtDesc();
    boolean existsByCategoryNameIgnoreCase(String categoryName);
}
