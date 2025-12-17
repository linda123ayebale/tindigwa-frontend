package org.example.Controllers;

import org.example.Services.LoanTrackingRecalculationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for loan tracking recalculation operations
 * 
 * Provides endpoints to fix data inconsistencies by recalculating
 * loan tracking state from payment history.
 */
@RestController
@RequestMapping("/api/admin/tracking-recalculation")
@CrossOrigin(origins = "*")
public class LoanTrackingRecalculationController {
    
    @Autowired
    private LoanTrackingRecalculationService recalculationService;
    
    /**
     * Recalculate tracking for a specific loan
     */
    @PostMapping("/loan/{loanId}")
    public ResponseEntity<?> recalculateLoan(@PathVariable Long loanId) {
        try {
            var tracking = recalculationService.recalculateFromPayments(loanId);
            return ResponseEntity.ok(tracking);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }
    
    /**
     * Recalculate tracking for all loans
     * WARNING: This can take a long time for large databases
     */
    @PostMapping("/all")
    public ResponseEntity<?> recalculateAll() {
        try {
            var result = recalculationService.recalculateAllLoans();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }
    
    /**
     * Recalculate tracking only for loans with inconsistent data
     * This is safer and faster than recalculating all loans
     */
    @PostMapping("/inconsistent")
    public ResponseEntity<?> recalculateInconsistent() {
        try {
            var result = recalculationService.recalculateInconsistentLoans();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }
}
