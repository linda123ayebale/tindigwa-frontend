package org.example.Controllers;


import org.example.Entities.LoanDetails;
import org.example.Services.LoanDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/loans")

public class LoanDetailsController {
    private final LoanDetailsService loanDetailsService;

    @Autowired
    public LoanDetailsController(LoanDetailsService loanDetailsService) {
        this.loanDetailsService = loanDetailsService;
    }

    @PostMapping
    public LoanDetails createLoan(@RequestBody LoanDetails loan) {
        return loanDetailsService.createLoan(loan);
    }
    @GetMapping("/{id}")
    public LoanDetails getLoan(@PathVariable Long id) {
        return loanDetailsService.getLoanById(id)
                .orElseThrow(() -> new RuntimeException("Loan not found with id: " + id));
    }

    // Update loan
    @PutMapping("/{id}")
    public LoanDetails updateLoan(@PathVariable Long id, @RequestBody LoanDetails loan) {
        return loanDetailsService.updateLoan(id, loan);
    }

    // Retrieve all loans by lending branch
    @GetMapping("/branch/{branch}")
    public List<LoanDetails> getLoansByBranch(@PathVariable String branch) {
        return loanDetailsService.getLoansByBranch(branch);
    }

}
