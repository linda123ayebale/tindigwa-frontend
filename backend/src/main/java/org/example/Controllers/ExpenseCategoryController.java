package org.example.Controllers;

import org.example.Entities.ExpenseCategory;
import org.example.Services.ExpenseCategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expense-categories")
@CrossOrigin(origins = "*")
public class ExpenseCategoryController {
    
    @Autowired
    private ExpenseCategoryService service;
    
    // Create new category
    @PostMapping
    public ResponseEntity<ExpenseCategory> createCategory(@RequestBody ExpenseCategory category) {
        try {
            ExpenseCategory createdCategory = service.createCategory(category);
            return ResponseEntity.ok(createdCategory);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Get all active categories
    @GetMapping
    public ResponseEntity<List<ExpenseCategory>> getAllCategories() {
        try {
            List<ExpenseCategory> categories = service.getAllActiveCategories();
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Get categories in hierarchical order
    @GetMapping("/hierarchy")
    public ResponseEntity<List<ExpenseCategory>> getCategoriesInHierarchy() {
        try {
            List<ExpenseCategory> categories = service.getCategoriesInHierarchy();
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Get parent categories only
    @GetMapping("/parents")
    public ResponseEntity<List<ExpenseCategory>> getParentCategories() {
        try {
            List<ExpenseCategory> categories = service.getParentCategories();
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Get subcategories by parent ID
    @GetMapping("/subcategories/{parentId}")
    public ResponseEntity<List<ExpenseCategory>> getSubcategories(@PathVariable Long parentId) {
        try {
            List<ExpenseCategory> subcategories = service.getSubcategoriesByParent(parentId);
            return ResponseEntity.ok(subcategories);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Get category by ID
    @GetMapping("/{id}")
    public ResponseEntity<ExpenseCategory> getCategoryById(@PathVariable Long id) {
        return service.getCategoryById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    // Get category by name
    @GetMapping("/name/{categoryName}")
    public ResponseEntity<ExpenseCategory> getCategoryByName(@PathVariable String categoryName) {
        return service.getCategoryByName(categoryName)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    // Update category
    @PutMapping("/{id}")
    public ResponseEntity<ExpenseCategory> updateCategory(@PathVariable Long id, @RequestBody ExpenseCategory category) {
        try {
            ExpenseCategory updatedCategory = service.updateCategory(id, category);
            return ResponseEntity.ok(updatedCategory);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Deactivate category (soft delete)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deactivateCategory(@PathVariable Long id) {
        try {
            service.deactivateCategory(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Hard delete category
    @DeleteMapping("/{id}/permanent")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        try {
            service.deleteCategory(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Get categories with budget limits
    @GetMapping("/budgets")
    public ResponseEntity<List<ExpenseCategory>> getCategoriesWithBudgets() {
        try {
            List<ExpenseCategory> categories = service.getCategoriesWithBudgets();
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Initialize default categories
    @PostMapping("/initialize")
    public ResponseEntity<Void> initializeDefaultCategories(@RequestParam(defaultValue = "system") String createdBy) {
        try {
            service.initializeDefaultCategories(createdBy);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Get category names only (for dropdowns)
    @GetMapping("/names")
    public ResponseEntity<List<String>> getCategoryNames() {
        try {
            List<String> categoryNames = service.getCategoryNames();
            return ResponseEntity.ok(categoryNames);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Search categories by name
    @GetMapping("/search")
    public ResponseEntity<List<ExpenseCategory>> searchCategories(@RequestParam String term) {
        try {
            List<ExpenseCategory> categories = service.searchCategoriesByName(term);
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}