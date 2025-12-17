package org.example.Services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.Entities.Branches;
import org.example.Entities.LoanDetails;
import org.example.Entities.OperationalExpenses;
import org.example.Repositories.BranchesRepository;
import org.example.Repositories.LoanDetailsRepository;
import org.example.Repositories.OperationalExpensesRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service to migrate existing records to use new 8-character universal IDs
 */
@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class IdMigrationService {

    private final UniqueIdGenerator idGenerator;
    private final LoanDetailsRepository loanDetailsRepository;
    private final OperationalExpensesRepository operationalExpensesRepository;
    private final BranchesRepository branchesRepository;

    /**
     * Migrate all loans to have new 8-character loan_number
     */
    public int migrateLoanIds() {
        log.info("Starting loan ID migration...");

        List<LoanDetails> loans = loanDetailsRepository.findAll();
        int migratedCount = 0;

        for (LoanDetails loan : loans) {
            if (loan.getLoanNumber() == null ||
                    loan.getLoanNumber().length() != 8 ||
                    loan.getLoanNumber().contains("-")) {

                String newLoanNumber = idGenerator.generateLoanId();
                loan.setLoanNumber(newLoanNumber);
                loanDetailsRepository.save(loan);
                migratedCount++;

                log.debug("Migrated loan ID {} to {}", loan.getId(), newLoanNumber);
            }
        }

        log.info("Completed loan ID migration. Migrated {} records.", migratedCount);
        return migratedCount;
    }

    /**
     * Migrate all expenses to have new 8-character expense_reference
     */
    public int migrateExpenseIds() {
        log.info("Starting expense ID migration...");

        List<OperationalExpenses> expenses = operationalExpensesRepository.findAll();
        int migratedCount = 0;

        for (OperationalExpenses expense : expenses) {
            if (expense.getExpenseReference() == null ||
                    expense.getExpenseReference().length() != 8 ||
                    expense.getExpenseReference().contains("-")) {

                String newExpenseRef = idGenerator.generateExpenseId();
                expense.setExpenseReference(newExpenseRef);
                operationalExpensesRepository.save(expense);
                migratedCount++;

                log.debug("Migrated expense ID {} to {}", expense.getId(), newExpenseRef);
            }
        }

        log.info("Completed expense ID migration. Migrated {} expense records.", migratedCount);
        return migratedCount;
    }

    /**
     * Migrate all branches to have new 8-character branch_code (BR250001)
     */
    public int migrateBranchIds() {
        log.info("Starting branch ID migration...");

        List<Branches> branches = branchesRepository.findAll();
        int migratedCount = 0;

        for (Branches branch : branches) {

            if (branch.getBranchCode() == null ||
                    branch.getBranchCode().length() != 8 ||
                    branch.getBranchCode().contains("-")) {

                String newBranchCode = idGenerator.generateBranchId();
                branch.setBranchCode(newBranchCode);
                branchesRepository.save(branch);
                migratedCount++;

                log.debug("Migrated branch ID {} to {}", branch.getId(), newBranchCode);
            }
        }

        log.info("Completed branch ID migration. Migrated {} branch records.", migratedCount);
        return migratedCount;
    }

    /**
     * Migrate ALL IDs (Loans, Expenses, Branches)
     */
    public void migrateAllIds() {
        log.info("Starting full ID migration process...");

        int loansMigrated = migrateLoanIds();
        int expensesMigrated = migrateExpenseIds();
        int branchesMigrated = migrateBranchIds();

        log.info("Full ID migration complete. Loans: {}, Expenses: {}, Branches: {}",
                loansMigrated, expensesMigrated, branchesMigrated);
    }

    /**
     * Get migration status for Loans, Expenses and Branches
     */
    public MigrationStatus getMigrationStatus() {
        long totalLoans = loanDetailsRepository.count();
        long loansWithNewId = loanDetailsRepository.findAll().stream()
                .filter(loan -> loan.getLoanNumber() != null &&
                        loan.getLoanNumber().length() == 8 &&
                        !loan.getLoanNumber().contains("-"))
                .count();

        long totalExpenses = operationalExpensesRepository.count();
        long expensesWithNewId = operationalExpensesRepository.findAll().stream()
                .filter(exp -> exp.getExpenseReference() != null &&
                        exp.getExpenseReference().length() == 8 &&
                        !exp.getExpenseReference().contains("-"))
                .count();

        long totalBranches = branchesRepository.count();
        long branchesWithNewId = branchesRepository.findAll().stream()
                .filter(br -> br.getBranchCode() != null &&
                        br.getBranchCode().length() == 8 &&
                        !br.getBranchCode().contains("-"))
                .count();

        return new MigrationStatus(
                totalLoans, loansWithNewId,
                totalExpenses, expensesWithNewId,
                totalBranches, branchesWithNewId
        );
    }

    public static class MigrationStatus {
        public final long totalLoans;
        public final long loansWithNewId;
        public final long totalExpenses;
        public final long expensesWithNewId;
        public final long totalBranches;
        public final long branchesWithNewId;

        public MigrationStatus(long totalLoans, long loansWithNewId,
                               long totalExpenses, long expensesWithNewId,
                               long totalBranches, long branchesWithNewId) {

            this.totalLoans = totalLoans;
            this.loansWithNewId = loansWithNewId;
            this.totalExpenses = totalExpenses;
            this.expensesWithNewId = expensesWithNewId;
            this.totalBranches = totalBranches;
            this.branchesWithNewId = branchesWithNewId;
        }

        public boolean isComplete() {
            return loansWithNewId == totalLoans &&
                    expensesWithNewId == totalExpenses &&
                    branchesWithNewId == totalBranches;
        }
    }
}
