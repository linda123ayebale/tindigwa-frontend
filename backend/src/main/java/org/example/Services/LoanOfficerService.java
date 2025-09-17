package org.example.Services;


import org.example.Entities.LoanOfficer;
import org.example.Repositories.LoanOfficersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
@Service
public class LoanOfficerService {
    @Autowired
    private LoanOfficersRepository repository;
@Autowired
    private PasswordEncoder passwordEncoder;

    // Create
    public LoanOfficer createLoanOfficer(LoanOfficer officer) {

        String hashedPassword = passwordEncoder.encode(officer.getPassword());
        officer.setPassword(hashedPassword);
        return repository.save(officer);
    }

    // Read all
    public List<LoanOfficer> getAllLoanOfficers() {
        return repository.findAll();
    }

    // Read by ID
    public Optional<LoanOfficer> getLoanOfficerById(Long id) {
        return repository.findById(id);
    }

    // Update
    public LoanOfficer updateLoanOfficer(Long id, LoanOfficer updatedOfficer) {
        return repository.findById(id)
                .map(existing -> {
                    updatedOfficer.setId(existing.getId()); // Ensure ID remains the same
                    return repository.save(updatedOfficer);
                })
                .orElseThrow(() -> new RuntimeException("Loan Officer not found with id: " + id));
    }

    // Delete
    public void deleteLoanOfficer(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Loan Officer not found with id: " + id);
        }
        repository.deleteById(id);
    }
}
