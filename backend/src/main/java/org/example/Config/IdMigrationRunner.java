package org.example.Config;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.Services.IdMigrationService;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class IdMigrationRunner {

    private final IdMigrationService idMigrationService;

    @PostConstruct
    public void runMigrationOnStartup() {
        try {
            log.info("🚀 Starting automatic ID migration on application startup...");

            // Run migration for all loans and expenses
            idMigrationService.migrateAllIds();

            // Get summary
            var status = idMigrationService.getMigrationStatus();
            log.info("✅ ID migration completed. Loans migrated: {}/{} | Expenses migrated: {}/{}",
                    status.loansWithNewId, status.totalLoans,
                    status.expensesWithNewId, status.totalExpenses);

            // Add a simple completion marker
            if (status.isComplete()) {
                log.info("🎯 All IDs migrated successfully!");
            } else {
                log.warn("⚠️ Some records still have old or missing IDs. Run manual migration if needed.");
            }

        } catch (Exception e) {
            log.error("❌ Error during automatic ID migration", e);
        }
    }
}
