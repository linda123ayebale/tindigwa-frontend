package org.example.Services;

import org.example.Entities.ExpenseCategory;
import org.example.Repositories.ExpenseCategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ExpenseCategoryService {
    private final ExpenseCategoryRepository repository;

    public ExpenseCategoryService(ExpenseCategoryRepository repository) {
        this.repository = repository;
    }

    public ExpenseCategory createCategory(ExpenseCategory category) {
        if (repository.existsByCategoryNameIgnoreCase(category.getCategoryName())) {
            throw new RuntimeException("Category name already exists");
        }
        return repository.save(category);
    }

    public List<ExpenseCategory> getAllActiveCategories() {
        return repository.findByIsActiveTrueOrderByCreatedAtDesc();
    }

    public Optional<ExpenseCategory> getCategoryById(Long id) {
        return repository.findById(id)
                .filter(ExpenseCategory::getIsActive);
    }

    public ExpenseCategory updateCategory(Long id, ExpenseCategory categoryDetails) {
        return repository.findById(id)
                .map(existing -> {
                    if (!existing.getCategoryName().equalsIgnoreCase(categoryDetails.getCategoryName()) &&
                        repository.existsByCategoryNameIgnoreCase(categoryDetails.getCategoryName())) {
                        throw new RuntimeException("Category name already exists");
                    }
                    
                    existing.setCategoryName(categoryDetails.getCategoryName());
                    existing.setDescription(categoryDetails.getDescription());
                    existing.setColorCode(categoryDetails.getColorCode());
                    
                    return repository.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("Category not found"));
    }

    public void deleteCategory(Long id) {
        repository.deleteById(id);
    }

    public List<String> getCategoryNames() {
        return repository.findByIsActiveTrue().stream()
                .map(ExpenseCategory::getCategoryName)
                .collect(Collectors.toList());
    }
}
