package org.example.Controllers;

import org.example.Entities.ExpenseCategory;
import org.example.Services.ExpenseCategoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expense-categories")
public class ExpenseCategoryController {
    private final ExpenseCategoryService categoryService;

    public ExpenseCategoryController(ExpenseCategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @PostMapping
    public ResponseEntity<ExpenseCategory> createCategory(@RequestBody ExpenseCategory category) {
        return ResponseEntity.ok(categoryService.createCategory(category));
    }

    @GetMapping
    public ResponseEntity<List<ExpenseCategory>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllActiveCategories());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExpenseCategory> getCategoryById(@PathVariable Long id) {
        return categoryService.getCategoryById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExpenseCategory> updateCategory(
            @PathVariable Long id,
            @RequestBody ExpenseCategory categoryDetails) {
        return ResponseEntity.ok(categoryService.updateCategory(id, categoryDetails));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/names")
    public ResponseEntity<List<String>> getCategoryNames() {
        return ResponseEntity.ok(categoryService.getCategoryNames());
    }
}
