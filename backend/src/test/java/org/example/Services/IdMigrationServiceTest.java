package org.example.Services;

import org.example.Entities.Branches;
import org.example.Entities.LoanDetails;
import org.example.Entities.OperationalExpenses;
import org.example.Repositories.BranchesRepository;
import org.example.Repositories.LoanDetailsRepository;
import org.example.Repositories.OperationalExpensesRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class IdMigrationServiceTest {

    @Mock
    private UniqueIdGenerator idGenerator;

    @Mock
    private LoanDetailsRepository loanDetailsRepository;

    @Mock
    private OperationalExpensesRepository operationalExpensesRepository;

    @Mock
    private BranchesRepository branchesRepository;

    @InjectMocks
    private IdMigrationService idMigrationService;

    @Test
    void testMigrateLoanIds() {
        // Arrange
        LoanDetails loan1 = new LoanDetails();
        loan1.setId(1L);
        loan1.setLoanNumber(null); // Needs migration

        LoanDetails loan2 = new LoanDetails();
        loan2.setId(2L);
        loan2.setLoanNumber("LN-OLD-123"); // Old format, needs migration

        LoanDetails loan3 = new LoanDetails();
        loan3.setId(3L);
        loan3.setLoanNumber("LN250001"); // Already has new format

        List<LoanDetails> loans = Arrays.asList(loan1, loan2, loan3);

        when(loanDetailsRepository.findAll()).thenReturn(loans);
        when(idGenerator.generateLoanId()).thenReturn("LN250002", "LN250003");
        when(loanDetailsRepository.save(any(LoanDetails.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        int migratedCount = idMigrationService.migrateLoanIds();

        // Assert
        assertEquals(2, migratedCount);
        verify(loanDetailsRepository, times(2)).save(any(LoanDetails.class));
        verify(idGenerator, times(2)).generateLoanId();
    }

    @Test
    void testMigrateExpenseIds() {
        // Arrange
        OperationalExpenses expense1 = new OperationalExpenses();
        expense1.setId(1L);
        expense1.setExpenseReference(null); // Needs migration

        OperationalExpenses expense2 = new OperationalExpenses();
        expense2.setId(2L);
        expense2.setExpenseReference("EXP-OLD-123"); // Old format, needs migration

        OperationalExpenses expense3 = new OperationalExpenses();
        expense3.setId(3L);
        expense3.setExpenseReference("EX250001"); // Already has new format

        List<OperationalExpenses> expenses = Arrays.asList(expense1, expense2, expense3);

        when(operationalExpensesRepository.findAll()).thenReturn(expenses);
        when(idGenerator.generateExpenseId()).thenReturn("EX250002", "EX250003");
        when(operationalExpensesRepository.save(any(OperationalExpenses.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        int migratedCount = idMigrationService.migrateExpenseIds();

        // Assert
        assertEquals(2, migratedCount);
        verify(operationalExpensesRepository, times(2)).save(any(OperationalExpenses.class));
        verify(idGenerator, times(2)).generateExpenseId();
    }

    @Test
    void testMigrateAllIds() {
        // Arrange
        when(loanDetailsRepository.findAll()).thenReturn(Arrays.asList());
        when(operationalExpensesRepository.findAll()).thenReturn(Arrays.asList());
        when(branchesRepository.findAll()).thenReturn(Arrays.asList());

        // Act & Assert - should not throw
        assertDoesNotThrow(() -> idMigrationService.migrateAllIds());
    }

    @Test
    void testGetMigrationStatus() {
        // Arrange
        LoanDetails loan1 = new LoanDetails();
        loan1.setLoanNumber("LN250001");

        LoanDetails loan2 = new LoanDetails();
        loan2.setLoanNumber(null);

        OperationalExpenses expense1 = new OperationalExpenses();
        expense1.setExpenseReference("EX250001");

        Branches branch1 = new Branches();
        branch1.setBranchCode("BR250001");

        when(loanDetailsRepository.count()).thenReturn(2L);
        when(loanDetailsRepository.findAll()).thenReturn(Arrays.asList(loan1, loan2));
        when(operationalExpensesRepository.count()).thenReturn(1L);
        when(operationalExpensesRepository.findAll()).thenReturn(Arrays.asList(expense1));
        when(branchesRepository.count()).thenReturn(1L);
        when(branchesRepository.findAll()).thenReturn(Arrays.asList(branch1));

        // Act
        IdMigrationService.MigrationStatus status = idMigrationService.getMigrationStatus();

        // Assert
        assertEquals(2, status.totalLoans);
        assertEquals(1, status.loansWithNewId);
        assertEquals(1, status.totalExpenses);
        assertEquals(1, status.expensesWithNewId);
        assertEquals(1, status.totalBranches);
        assertEquals(1, status.branchesWithNewId);
        assertFalse(status.isComplete());
    }
}
