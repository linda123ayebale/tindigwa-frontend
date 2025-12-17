package org.example.Controllers;

import jakarta.validation.Valid;
import org.example.DTOs.OperationalExpenseRequestDTO;
import org.example.DTOs.OperationalExpenseResponseDTO;
import org.example.Entities.OperationalExpenses;
import org.example.Services.OperationalExpensesService;
import org.example.Services.OperationalExpenseFacadeService;
import org.example.Services.FileUploadService;
import org.example.Services.BulkImportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/expenses")
@CrossOrigin(origins = "*")
public class OperationalExpensesController {
    @Autowired
    private OperationalExpensesService service;
    
    @Autowired
    private OperationalExpenseFacadeService facadeService;
    
    @Autowired
    private FileUploadService fileUploadService;
    
    @Autowired
    private BulkImportService bulkImportService;

    // Create expense
    @PostMapping
    public ResponseEntity<OperationalExpenseResponseDTO> createExpense(@Valid @RequestBody OperationalExpenseRequestDTO request) {
        OperationalExpenseResponseDTO created = facadeService.createExpense(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // Get all expenses
    @GetMapping
    public ResponseEntity<List<OperationalExpenseResponseDTO>> getAllExpenses() {
        List<OperationalExpenseResponseDTO> expenses = facadeService.getAllExpenses();
        return ResponseEntity.ok(expenses);
    }

    // Get expenses with pagination
    @GetMapping("/paginated")
    public ResponseEntity<Page<OperationalExpenseResponseDTO>> getAllExpenses(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "expenseDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {
        Sort sort = sortDirection.equalsIgnoreCase("desc") ? 
                   Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<OperationalExpenseResponseDTO> expenses = facadeService.getAllExpenses(pageable);
        return ResponseEntity.ok(expenses);
    }

    // Get expense by ID
    @GetMapping("/{id}")
    public ResponseEntity<OperationalExpenseResponseDTO> getExpenseById(@PathVariable Long id) {
        OperationalExpenseResponseDTO expense = facadeService.getExpenseById(id);
        return expense != null ? ResponseEntity.ok(expense) : ResponseEntity.notFound().build();
    }

    // Get expense by reference
    @GetMapping("/reference/{reference}")
    public ResponseEntity<OperationalExpenseResponseDTO> getExpenseByReference(@PathVariable String reference) {
        OperationalExpenseResponseDTO expense = facadeService.getExpenseByReference(reference);
        return expense != null ? ResponseEntity.ok(expense) : ResponseEntity.notFound().build();
    }

    // Update expense
    @PutMapping("/{id}")
    public ResponseEntity<OperationalExpenseResponseDTO> updateExpense(@PathVariable Long id, @Valid @RequestBody OperationalExpenseRequestDTO request) {
        OperationalExpenseResponseDTO updated = facadeService.updateExpense(id, request);
        return ResponseEntity.ok(updated);
    }

    // Update expense status
    @PutMapping("/{id}/status")
    public ResponseEntity<OperationalExpenseResponseDTO> updateExpenseStatus(@PathVariable Long id, @RequestParam String status) {
        OperationalExpenseResponseDTO updated = facadeService.updateExpenseStatus(id, status);
        return ResponseEntity.ok(updated);
    }

    // Delete expense
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long id) {
        facadeService.deleteExpense(id);
        return ResponseEntity.noContent().build();
    }

    // Get expenses by category
    @GetMapping("/category/{category}")
    public ResponseEntity<List<OperationalExpenses>> getExpensesByCategory(@PathVariable String category) {
        try {
            List<OperationalExpenses> expenses = service.getExpensesByCategory(category);
            return ResponseEntity.ok(expenses);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Get expenses by status
    @GetMapping("/status/{status}")
    public ResponseEntity<List<OperationalExpenses>> getExpensesByStatus(@PathVariable String status) {
        try {
            List<OperationalExpenses> expenses = service.getExpensesByStatus(status);
            return ResponseEntity.ok(expenses);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Get filtered expenses
    @GetMapping("/filter")
    public ResponseEntity<List<OperationalExpenses>> getFilteredExpenses(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String searchTerm) {
        try {
            List<OperationalExpenses> expenses = service.getFilteredExpenses(category, status, startDate, endDate, searchTerm);
            return ResponseEntity.ok(expenses);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Get expense categories (redirects to category service)
    @GetMapping("/categories")
    public ResponseEntity<List<String>> getExpenseCategories() {
        try {
            List<String> categories = service.getExpenseCategories();
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Get expense summary by category
    @GetMapping("/summary/category")
    public ResponseEntity<Map<String, Map<String, Object>>> getExpenseSummaryByCategory(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            Map<String, Map<String, Object>> summary = service.getExpenseSummaryByCategory(startDate, endDate);
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Get monthly expense totals
    @GetMapping("/summary/monthly")
    public ResponseEntity<List<Map<String, Object>>> getMonthlyExpenseTotals(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            List<Map<String, Object>> monthlyTotals = service.getMonthlyExpenseTotals(startDate, endDate);
            return ResponseEntity.ok(monthlyTotals);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Get expense statistics
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getExpenseStatistics(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            Map<String, Object> statistics = service.getExpenseStatistics(startDate, endDate);
            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Get total expenses for date range
    @GetMapping("/total")
    public ResponseEntity<Double> getTotalExpensesForDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            Double total = service.getTotalExpensesForDateRange(startDate, endDate);
            return ResponseEntity.ok(total);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Upload receipt
    @PostMapping("/{expenseId}/receipt")
    public ResponseEntity<Map<String, String>> uploadReceipt(
            @PathVariable Long expenseId,
            @RequestParam("file") MultipartFile file) {
        try {
            String filename = fileUploadService.uploadReceipt(file);
            
            // Update expense with receipt URL
            OperationalExpenses expense = service.getExpenseById(expenseId)
                    .orElseThrow(() -> new RuntimeException("Expense not found"));
            expense.setReceiptUrl(filename);
            service.updateExpense(expenseId, expense);
            
            Map<String, String> response = Map.of(
                "message", "Receipt uploaded successfully",
                "filename", filename
            );
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to upload receipt"));
        }
    }

    // Get receipt
    @GetMapping("/{expenseId}/receipt")
    public ResponseEntity<byte[]> getReceipt(@PathVariable Long expenseId) {
        try {
            OperationalExpenses expense = service.getExpenseById(expenseId)
                    .orElseThrow(() -> new RuntimeException("Expense not found"));
            
            if (expense.getReceiptUrl() == null) {
                return ResponseEntity.notFound().build();
            }
            
            byte[] fileData = fileUploadService.getReceiptFile(expense.getReceiptUrl());
            String contentType = fileUploadService.getReceiptContentType(expense.getReceiptUrl());
            
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + expense.getReceiptUrl() + "\"")
                    .body(fileData);
        } catch (IOException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Delete receipt
    @DeleteMapping("/{expenseId}/receipt")
    public ResponseEntity<Map<String, String>> deleteReceipt(@PathVariable Long expenseId) {
        try {
            OperationalExpenses expense = service.getExpenseById(expenseId)
                    .orElseThrow(() -> new RuntimeException("Expense not found"));
            
            if (expense.getReceiptUrl() != null) {
                fileUploadService.deleteReceipt(expense.getReceiptUrl());
                expense.setReceiptUrl(null);
                service.updateExpense(expenseId, expense);
            }
            
            return ResponseEntity.ok(Map.of("message", "Receipt deleted successfully"));
        } catch (IOException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to delete receipt"));
        }
    }

    // Bulk import expenses from CSV
    @PostMapping("/import")
    public ResponseEntity<Map<String, Object>> importExpenses(@RequestParam("file") MultipartFile file) {
        try {
            Map<String, Object> result = bulkImportService.importExpensesFromCSV(file);
            return ResponseEntity.ok(result);
        } catch (IOException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to import expenses"));
        }
    }

    // Export expenses to CSV
    @GetMapping("/export")
    public ResponseEntity<byte[]> exportExpenses(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            List<OperationalExpenses> expenses = service.getFilteredExpenses(category, status, startDate, endDate, null);
            byte[] csvData = bulkImportService.exportExpensesToCSV(expenses);
            
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType("text/csv"))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"expenses_export.csv\"")
                    .body(csvData);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Get CSV template
    @GetMapping("/template")
    public ResponseEntity<String> getCSVTemplate() {
        try {
            String template = bulkImportService.generateCSVTemplate();
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType("text/csv"))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"expense_template.csv\"")
                    .body(template);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Bulk delete expenses
    @DeleteMapping("/bulk")
    public ResponseEntity<Map<String, Object>> bulkDeleteExpenses(@RequestBody List<Long> expenseIds) {
        try {
            int deletedCount = 0;
            List<String> errors = new ArrayList<>();
            
            for (Long id : expenseIds) {
                try {
                    service.deleteExpense(id);
                    deletedCount++;
                } catch (Exception e) {
                    errors.add("Failed to delete expense ID " + id + ": " + e.getMessage());
                }
            }
            
            Map<String, Object> result = Map.of(
                "deletedCount", deletedCount,
                "totalRequested", expenseIds.size(),
                "errors", errors
            );
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Bulk delete operation failed"));
        }
    }

    // Bulk update status
    @PutMapping("/bulk/status")
    public ResponseEntity<Map<String, Object>> bulkUpdateStatus(
            @RequestBody Map<String, Object> request) {
        try {
            @SuppressWarnings("unchecked")
            List<Long> expenseIds = (List<Long>) request.get("expenseIds");
            String status = (String) request.get("status");
            
            int updatedCount = 0;
            List<String> errors = new ArrayList<>();
            
            for (Long id : expenseIds) {
                try {
                    service.updateExpenseStatus(id, status);
                    updatedCount++;
                } catch (Exception e) {
                    errors.add("Failed to update expense ID " + id + ": " + e.getMessage());
                }
            }
            
            Map<String, Object> result = Map.of(
                "updatedCount", updatedCount,
                "totalRequested", expenseIds.size(),
                "errors", errors
            );
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Bulk update operation failed"));
        }
    }
    
    // === Approval Workflow Endpoints ===
    
    // Approve expense
    @PostMapping("/{id}/approve")
    public ResponseEntity<OperationalExpenseResponseDTO> approveExpense(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        try {
            String approvedBy = request.getOrDefault("approvedBy", "System");
            String approvalComment = request.getOrDefault("approvalComment", "");
            OperationalExpenseResponseDTO approved = facadeService.approveExpense(id, approvedBy, approvalComment);
            return ResponseEntity.ok(approved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // Reject expense
    @PostMapping("/{id}/reject")
    public ResponseEntity<OperationalExpenseResponseDTO> rejectExpense(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        try {
            String rejectedBy = request.getOrDefault("rejectedBy", "System");
            String rejectionComment = request.getOrDefault("rejectionComment", "");
            OperationalExpenseResponseDTO rejected = facadeService.rejectExpense(id, rejectedBy, rejectionComment);
            return ResponseEntity.ok(rejected);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // Mark expense as paid
    @PostMapping("/{id}/mark-paid")
    public ResponseEntity<OperationalExpenseResponseDTO> markExpenseAsPaid(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        try {
            String paidBy = request.getOrDefault("paidBy", "System");
            OperationalExpenseResponseDTO paid = facadeService.markExpenseAsPaid(id, paidBy);
            return ResponseEntity.ok(paid);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // Get pending expenses
    @GetMapping("/pending")
    public ResponseEntity<List<OperationalExpenseResponseDTO>> getPendingExpenses() {
        try {
            List<OperationalExpenseResponseDTO> expenses = facadeService.getExpensesByApprovalStatus("PENDING");
            return ResponseEntity.ok(expenses);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Get rejected expenses
    @GetMapping("/rejected")
    public ResponseEntity<List<OperationalExpenseResponseDTO>> getRejectedExpenses() {
        try {
            List<OperationalExpenseResponseDTO> expenses = facadeService.getExpensesByApprovalStatus("REJECTED");
            return ResponseEntity.ok(expenses);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Get approved unpaid expenses (expenses to pay)
    @GetMapping("/approved-unpaid")
    public ResponseEntity<List<OperationalExpenseResponseDTO>> getApprovedUnpaidExpenses() {
        try {
            List<OperationalExpenseResponseDTO> expenses = facadeService.getApprovedUnpaidExpenses();
            return ResponseEntity.ok(expenses);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // End of controller
}
