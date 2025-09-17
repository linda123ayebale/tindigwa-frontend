package org.example.Services;


import org.example.Entities.OperationalExpenses;
import org.example.Repositories.OperationalExpensesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class OperationalExpensesService {
    @Autowired
    private OperationalExpensesRepository repository;

    // Create
    public OperationalExpenses createExpense(OperationalExpenses expense) {
        return repository.save(expense);
    }

    // Read all
    public List<OperationalExpenses> getAllExpenses() {
        return repository.findAll();
    }

    // Read by ID
    public Optional<OperationalExpenses> getExpenseById(Long id) {
        return repository.findById(id);
    }

    // Update
    public OperationalExpenses updateExpense(Long id, OperationalExpenses updatedExpense) {
        return repository.findById(id)
                .map(existing -> {
                    updatedExpense.setId(existing.getId()); // Ensure ID is preserved
                    return repository.save(updatedExpense);
                }).orElseThrow(() -> new RuntimeException("Expense not found with id: " + id));
    }

    // Delete
    public void deleteExpense(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Expense not found with id: " + id);
        }
        repository.deleteById(id);
    }
}
