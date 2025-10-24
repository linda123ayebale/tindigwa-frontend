package org.example.Services;

import org.example.Entities.ExpenseCategory;
import org.example.Repositories.ExpenseCategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ExpenseCategoryService {
    
    @Autowired
    private ExpenseCategoryRepository repository;
    
    // Create new category
    public ExpenseCategory createCategory(ExpenseCategory category) {
        // Check for duplicate names
        if (repository.existsByCategoryNameIgnoreCase(category.getCategoryName())) {
            throw new RuntimeException("Category name already exists: " + category.getCategoryName());
        }
        
        // Validate parent category if specified
        if (category.getParentCategoryId() != null) {
            Optional<ExpenseCategory> parent = repository.findById(category.getParentCategoryId());
            if (parent.isEmpty() || !parent.get().getIsActive()) {
                throw new RuntimeException("Invalid parent category ID: " + category.getParentCategoryId());
            }
            
            // Prevent deep nesting (only allow 1 level of subcategories)
            if (parent.get().getParentCategoryId() != null) {
                throw new RuntimeException("Cannot create subcategory of a subcategory");
            }
        }
        
        return repository.save(category);
    }
    
    // Get all active categories
    public List<ExpenseCategory> getAllActiveCategories() {
        return repository.findByIsActiveTrueOrderBySortOrderAsc();
    }
    
    // Get categories in hierarchical order
    public List<ExpenseCategory> getCategoriesInHierarchy() {
        return repository.findCategoriesInHierarchicalOrder();
    }
    
    // Get parent categories only
    public List<ExpenseCategory> getParentCategories() {
        return repository.findByParentCategoryIdIsNullAndIsActiveTrueOrderBySortOrderAsc();
    }
    
    // Get subcategories by parent ID
    public List<ExpenseCategory> getSubcategoriesByParent(Long parentId) {
        return repository.findByParentCategoryIdAndIsActiveTrue(parentId);
    }
    
    // Get category by ID
    public Optional<ExpenseCategory> getCategoryById(Long id) {
        return repository.findById(id).filter(ExpenseCategory::getIsActive);
    }
    
    // Get category by name
    public Optional<ExpenseCategory> getCategoryByName(String categoryName) {
        return repository.findByCategoryNameIgnoreCase(categoryName)
                .filter(ExpenseCategory::getIsActive);
    }
    
    // Update category
    public ExpenseCategory updateCategory(Long id, ExpenseCategory updatedCategory) {
        return repository.findById(id)
                .filter(ExpenseCategory::getIsActive)
                .map(existing -> {
                    // Check for duplicate names (excluding current)
                    if (!existing.getCategoryName().equalsIgnoreCase(updatedCategory.getCategoryName()) &&
                        repository.existsByCategoryNameIgnoreCase(updatedCategory.getCategoryName())) {
                        throw new RuntimeException("Category name already exists: " + updatedCategory.getCategoryName());
                    }
                    
                    // Validate parent category if changed
                    if (updatedCategory.getParentCategoryId() != null && 
                        !updatedCategory.getParentCategoryId().equals(existing.getParentCategoryId())) {
                        
                        Optional<ExpenseCategory> parent = repository.findById(updatedCategory.getParentCategoryId());
                        if (parent.isEmpty() || !parent.get().getIsActive()) {
                            throw new RuntimeException("Invalid parent category ID: " + updatedCategory.getParentCategoryId());
                        }
                        
                        // Prevent circular references
                        if (parent.get().getId().equals(id)) {
                            throw new RuntimeException("Category cannot be its own parent");
                        }
                    }
                    
                    // Update fields
                    existing.setCategoryName(updatedCategory.getCategoryName());
                    existing.setDescription(updatedCategory.getDescription());
                    existing.setParentCategoryId(updatedCategory.getParentCategoryId());
                    existing.setSortOrder(updatedCategory.getSortOrder());
                    existing.setBudgetLimit(updatedCategory.getBudgetLimit());
                    existing.setColorCode(updatedCategory.getColorCode());
                    existing.setIcon(updatedCategory.getIcon());
                    existing.setUpdatedAt(LocalDateTime.now());
                    
                    return repository.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));
    }
    
    // Soft delete category (set isActive to false)
    public void deactivateCategory(Long id) {
        repository.findById(id)
                .filter(ExpenseCategory::getIsActive)
                .ifPresentOrElse(category -> {
                    // First deactivate all subcategories
                    List<ExpenseCategory> subcategories = repository.findByParentCategoryIdAndIsActiveTrue(id);
                    subcategories.forEach(sub -> {
                        sub.setIsActive(false);
                        sub.setUpdatedAt(LocalDateTime.now());
                    });
                    repository.saveAll(subcategories);
                    
                    // Then deactivate the parent category
                    category.setIsActive(false);
                    category.setUpdatedAt(LocalDateTime.now());
                    repository.save(category);
                }, () -> {
                    throw new RuntimeException("Category not found with id: " + id);
                });
    }
    
    // Hard delete category (only if no expenses are using it)
    public void deleteCategory(Long id) {
        repository.findById(id)
                .ifPresentOrElse(category -> {
                    // TODO: Check if any expenses are using this category
                    // For now, we'll just delete it
                    repository.delete(category);
                }, () -> {
                    throw new RuntimeException("Category not found with id: " + id);
                });
    }
    
    // Get categories with budget limits
    public List<ExpenseCategory> getCategoriesWithBudgets() {
        return repository.findByBudgetLimitIsNotNullAndIsActiveTrue();
    }
    
    // Initialize default categories
    public void initializeDefaultCategories(String createdBy) {
        List<String> defaultCategories = List.of(
            "Operational", "Salaries", "Marketing", "Technology", 
            "Legal & Compliance", "Travel", "Utilities", "Office Supplies", "Other"
        );
        
        int sortOrder = 1;
        for (String categoryName : defaultCategories) {
            if (!repository.existsByCategoryNameIgnoreCase(categoryName)) {
                ExpenseCategory category = new ExpenseCategory();
                category.setCategoryName(categoryName);
                category.setDescription("Default " + categoryName.toLowerCase() + " category");
                category.setSortOrder(sortOrder++);
                category.setIsActive(true);
                category.setCreatedBy(createdBy);
                repository.save(category);
            }
        }
    }
    
    // Get category names only (for simple dropdown)
    public List<String> getCategoryNames() {
        return repository.findByIsActiveTrueOrderBySortOrderAsc()
                .stream()
                .map(ExpenseCategory::getCategoryName)
                .collect(Collectors.toList());
    }
    
    // Search categories by name
    public List<ExpenseCategory> searchCategoriesByName(String searchTerm) {
        return repository.findByIsActiveTrueOrderBySortOrderAsc()
                .stream()
                .filter(category -> category.getCategoryName().toLowerCase()
                        .contains(searchTerm.toLowerCase()))
                .collect(Collectors.toList());
    }
}package org.example.Services;

import org.example.Entities.ExpenseCategory;
import org.example.Repositories.ExpenseCategoryRepository;
import org.springframework.stereotype.Service;

import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import java.util.Optional;

@Service
public class ExpenseCategoryService {
    private final ExpenseCategoryRepository repository;

    public ExpenseCategoryService(ExpenseCategoryRepository repository) {
        this.repository = repository;
    }
    
    public List<ExpenseCategory> getAllCategories() {
        return repository.findAllByOrderByNameAsc();
    }
    
    public Optional<ExpenseCategory> getCategoryByName(String name) {
        return repository.findByName(name);
    }
    
    public ExpenseCategory createCategory(ExpenseCategory category) {
        return repository.save(category);
    }
    
    public Optional<ExpenseCategory> getCategoryById(Long id) {
        return repository.findById(id);
    }
    
    public ExpenseCategory updateCategory(Long id, ExpenseCategory categoryDetails) {
        ExpenseCategory category = repository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Category not found"));
            
        category.setName(categoryDetails.getName());
        category.setDescription(categoryDetails.getDescription());
        category.setColorCode(categoryDetails.getColorCode());
        
        return repository.save(category);
    }
    
    public void deleteCategory(Long id) {
        repository.deleteById(id);
    }
    
    public boolean checkIfCategoryExists(String name) {
        return repository.existsByName(name);
    }
}
