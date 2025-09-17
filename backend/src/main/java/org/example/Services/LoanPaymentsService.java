package org.example.Services;


import org.example.Entities.LoanPayments;
import org.example.Repositories.LoanPaymentsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
@Service
public class LoanPaymentsService {
    @Autowired
    private LoanPaymentsRepository repository;

    // Create
    public LoanPayments createPayment(LoanPayments payment) {
        return repository.save(payment);
    }

    // Read all
    public List<LoanPayments> getAllPayments() {
        return repository.findAll();
    }

    // Read by ID
    public Optional<LoanPayments> getPaymentById(Long id) {
        return repository.findById(id);
    }

    // Update
    public LoanPayments updatePayment(Long id, LoanPayments updatedPayment) {
        return repository.findById(id)
                .map(existing -> {
                    updatedPayment.setId(existing.getId()); // Ensure ID remains unchanged
                    return repository.save(updatedPayment);
                }).orElseThrow(() -> new RuntimeException("Payment not found with id: " + id));
    }

    // Delete
    public void deletePayment(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Payment not found with id: " + id);
        }
        repository.deleteById(id);
    }
}
