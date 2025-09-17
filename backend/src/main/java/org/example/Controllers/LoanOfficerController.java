package org.example.Controllers;

import org.example.Entities.LoanOfficer;
import org.example.Services.LoanOfficerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/loan-officers")
public class LoanOfficerController {
    @Autowired
    private LoanOfficerService service;

    // Create
    @PostMapping
    public LoanOfficer createLoanOfficer(@RequestBody LoanOfficer officer) {
        return service.createLoanOfficer(officer);
    }

    // Read all
    @GetMapping
    public List<LoanOfficer> getAllLoanOfficers() {
        return service.getAllLoanOfficers();
    }

    // Read by ID
    @GetMapping("/{id}")
    public LoanOfficer getLoanOfficerById(@PathVariable Long id) {
        return service.getLoanOfficerById(id)
                .orElseThrow(() -> new RuntimeException("Loan Officer not found with id: " + id));
    }

    // Update
    @PutMapping("/{id}")
    public LoanOfficer updateLoanOfficer(@PathVariable Long id, @RequestBody LoanOfficer officer) {
        return service.updateLoanOfficer(id, officer);
    }

    // Delete
    @DeleteMapping("/{id}")
    public void deleteLoanOfficer(@PathVariable Long id) {
        service.deleteLoanOfficer(id);
    }

}
