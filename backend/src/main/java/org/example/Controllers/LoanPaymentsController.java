package org.example.Controllers;


import org.example.Entities.LoanPayments;
import org.example.Services.LoanPaymentsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class LoanPaymentsController {
    @Autowired
    private LoanPaymentsService service;

    // Create
    @PostMapping
    public LoanPayments createPayment(@RequestBody LoanPayments payment) {
        return service.createPayment(payment);
    }

    // Read all
    @GetMapping
    public List<LoanPayments> getAllPayments() {
        return service.getAllPayments();
    }

    // Read by ID
    @GetMapping("/{id}")
    public LoanPayments getPaymentById(@PathVariable Long id) {
        return service.getPaymentById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found with id: " + id));
    }

    // Update
    @PutMapping("/{id}")
    public LoanPayments updatePayment(@PathVariable Long id, @RequestBody LoanPayments payment) {
        return service.updatePayment(id, payment);
    }

    // Delete
    @DeleteMapping("/{id}")
    public void deletePayment(@PathVariable Long id) {
        service.deletePayment(id);
    }

}
