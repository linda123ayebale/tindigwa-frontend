package org.example.Controllers;


import org.example.Entities.OperationalExpenses;
import org.example.Services.OperationalExpensesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expenses")
public class OperationalExpensesController {
    @Autowired
    private OperationalExpensesService service;

    // Create
    @PostMapping
    public OperationalExpenses createExpense(@RequestBody OperationalExpenses expense) {
        return service.createExpense(expense);
    }

    // Read all
    @GetMapping
    public List<OperationalExpenses> getAllExpenses() {
        return service.getAllExpenses();
    }

    // Read by ID
    @GetMapping("/{id}")
    public OperationalExpenses getExpenseById(@PathVariable Long id) {
        return service.getExpenseById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found with id: " + id));
    }

    // Update
    @PutMapping("/{id}")
    public OperationalExpenses updateExpense(@PathVariable Long id, @RequestBody OperationalExpenses expense) {
        return service.updateExpense(id, expense);
    }

    // Delete
    @DeleteMapping("/{id}")
    public void deleteExpense(@PathVariable Long id) {
        service.deleteExpense(id);
    }
}
