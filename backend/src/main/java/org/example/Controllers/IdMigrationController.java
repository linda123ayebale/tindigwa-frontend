package org.example.Controllers;

import lombok.RequiredArgsConstructor;
import org.example.Services.IdMigrationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/migration")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class IdMigrationController {
    
    private final IdMigrationService idMigrationService;
    
    /**
     * Trigger full ID migration
     */
    @PostMapping("/migrate-ids")
    public ResponseEntity<Map<String, Object>> migrateIds() {
        idMigrationService.migrateAllIds();
        
        IdMigrationService.MigrationStatus status = idMigrationService.getMigrationStatus();
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "ID migration completed");
        response.put("totalLoans", status.totalLoans);
        response.put("loansWithNewId", status.loansWithNewId);
        response.put("totalExpenses", status.totalExpenses);
        response.put("expensesWithNewId", status.expensesWithNewId);
        response.put("isComplete", status.isComplete());
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get migration status
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getMigrationStatus() {
        IdMigrationService.MigrationStatus status = idMigrationService.getMigrationStatus();
        
        Map<String, Object> response = new HashMap<>();
        response.put("totalLoans", status.totalLoans);
        response.put("loansWithNewId", status.loansWithNewId);
        response.put("totalExpenses", status.totalExpenses);
        response.put("expensesWithNewId", status.expensesWithNewId);
        response.put("isComplete", status.isComplete());
        response.put("loansMigrationComplete", status.loansWithNewId == status.totalLoans);
        response.put("expensesMigrationComplete", status.expensesWithNewId == status.totalExpenses);
        
        return ResponseEntity.ok(response);
    }
}
