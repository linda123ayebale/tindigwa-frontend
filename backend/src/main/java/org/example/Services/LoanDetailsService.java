package org.example.Services;

import org.example.Entities.LoanDetails;
import org.example.Repositories.LoanDetailsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class LoanDetailsService {
    @Autowired
    private LoanDetailsRepository repository;
    public LoanDetails createLoan(LoanDetails loan) {
        // Set interest rate (static 20%)
        loan.setInterestRate(0.20);

        // Calculate loan processing fee based on amountDisbursed
        double pf = calculateProcessingFee(loan.getAmountDisbursed());
        loan.setLoanProcessingFee(pf);

        // Calculate total payable
        double interestAmount = loan.getAmountDisbursed() * loan.getInterestRate();
        double totalPayable = loan.getAmountDisbursed() + interestAmount + pf;
        loan.setTotalPayable(totalPayable);

        // Auto-calculate paymentEndDate if needed (optional)
        if (loan.getPaymentStartDate() != null && loan.getLoanDurationDays() > 0) {
            loan.setPaymentEndDate(loan.getPaymentStartDate().plusDays(loan.getLoanDurationDays()));
        }

        // Here you would normally save to database using repository
        return loan; // for now, just return calculated loan object
    }

    private double calculateProcessingFee(double amount) {
        if (amount >= 50_000 && amount <= 100_000) return 10_000;
        else if (amount <= 300_000) return 15_000;
        else if (amount <= 500_000) return 20_000;
        else if (amount <= 750_000) return 25_000;
        else if (amount <= 1_000_000) return 30_000;
        else if (amount <= 2_000_000) return 50_000;
        else return 100_000;
    }
    public Optional<LoanDetails> getLoanById(Long id) {
        return repository.findById(id);
    }

    public LoanDetails updateLoan(Long id, LoanDetails updatedLoan) {
        return repository.findById(id).map(existingLoan -> {
            existingLoan.setAmountDisbursed(updatedLoan.getAmountDisbursed());
            existingLoan.setPaymentStartDate(updatedLoan.getPaymentStartDate());
            existingLoan.setLoanDurationDays(updatedLoan.getLoanDurationDays());
            existingLoan.setLendingBranch(updatedLoan.getLendingBranch());

            return createLoan(existingLoan); // re-calculate all derived fields
        }).orElseThrow(() -> new RuntimeException("Loan not found"));
    }

    public List<LoanDetails> getLoansByBranch(String branch) {
        return repository.findByLendingBranch(branch);
    }

}
