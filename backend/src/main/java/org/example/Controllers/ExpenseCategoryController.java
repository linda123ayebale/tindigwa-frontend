package org.example.Controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.example.DTOs.ErrorResponse;
import org.example.DTOs.ExpenseCategoryRequestDTO;
import org.example.DTOs.ExpenseCategoryResponseDTO;
import org.example.Services.ExpenseCategoryFacadeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expense-categories")
@Tag(name = "Expense Categories", description = "API for managing expense categories")
public class ExpenseCategoryController {
    private final ExpenseCategoryFacadeService categoryFacadeService;

    public ExpenseCategoryController(ExpenseCategoryFacadeService categoryFacadeService) {
        this.categoryFacadeService = categoryFacadeService;
    }

    /**
     * Create a new expense category.
     * Request JSON example:
     * {
     *   "categoryName": "office",
     *   "description": "Office supplies",
     *   "colorCode": "#ff0000",
     *   "sortOrder": 1,
     *   "isActive": true
     * }
     * Response: 201 with created ExpenseCategoryResponseDTO containing id, createdAt, updatedAt.
     */
    @PostMapping
    public ResponseEntity<ExpenseCategoryResponseDTO> createCategory(@Valid @RequestBody ExpenseCategoryRequestDTO request) {
        ExpenseCategoryResponseDTO created = categoryFacadeService.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * List all active categories.
     * Request: none
     * Response: 200, JSON array of ExpenseCategoryResponseDTO objects (only active ones).
     */
    @GetMapping
    public ResponseEntity<List<ExpenseCategoryResponseDTO>> getAllCategories() {
        return ResponseEntity.ok(categoryFacadeService.getAllActiveCategories());
    }

    /**
     * Get a single category by id.
     * Path param: id (Long)
     * Response: 200 with ExpenseCategoryResponseDTO if found and active, otherwise 404.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ExpenseCategoryResponseDTO> getCategoryById(@PathVariable Long id) {
        ExpenseCategoryResponseDTO category = categoryFacadeService.getCategoryById(id);
        return category != null ? ResponseEntity.ok(category) : ResponseEntity.notFound().build();
    }

    /**
     * Update a category by id.
     * Path param: id (Long)
     * Request example:
     * {
     *   "categoryName": "office-updated",
     *   "description": "Updated desc",
     *   "colorCode": "#00ff00",
     *   "sortOrder": 2,
     *   "isActive": true
     * }
     * Response: 200 with updated ExpenseCategoryResponseDTO (or 404 if not found).
     */
    @PutMapping("/{id}")
    public ResponseEntity<ExpenseCategoryResponseDTO> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody ExpenseCategoryRequestDTO request) {
        return ResponseEntity.ok(categoryFacadeService.updateCategory(id, request));
    }

    /**
     * Delete a category by id.
     * Path param: id (Long)
     * Response: 204 No Content on success, 409 if category has expenses.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        categoryFacadeService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get the list of category names (active only).
     * Response: 200, JSON array of strings
     */
    @GetMapping("/names")
    public ResponseEntity<List<String>> getCategoryNames() {
        return ResponseEntity.ok(categoryFacadeService.getCategoryNames());
    }
    
    /**
     * Deactivate a category (soft delete).
     * Path param: id (Long)
     * Response: 200 with deactivated ExpenseCategoryResponseDTO
     */
    @PutMapping("/{id}/deactivate")
    public ResponseEntity<ExpenseCategoryResponseDTO> deactivateCategory(@PathVariable Long id) {
        return ResponseEntity.ok(categoryFacadeService.deactivateCategory(id));
    }
    
    /**
     * Reactivate a previously deactivated category.
     * Path param: id (Long)
     * Response: 200 with activated ExpenseCategoryResponseDTO
     */
    @PutMapping("/{id}/activate")
    public ResponseEntity<ExpenseCategoryResponseDTO> activateCategory(@PathVariable Long id) {
        return ResponseEntity.ok(categoryFacadeService.activateCategory(id));
    }
    
    /**
     * Get all categories including inactive ones (admin endpoint).
     * Response: 200, JSON array of all ExpenseCategoryResponseDTO objects
     */
    @GetMapping("/all")
    public ResponseEntity<List<ExpenseCategoryResponseDTO>> getAllCategoriesIncludingInactive() {
        return ResponseEntity.ok(categoryFacadeService.getAllCategories());
    }
}
