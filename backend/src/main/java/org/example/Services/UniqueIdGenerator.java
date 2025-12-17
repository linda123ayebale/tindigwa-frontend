package org.example.Services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.Entities.Sequence;
import org.example.Repositories.SequenceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

/**
 * Universal ID Generator Service
 * 
 * Generates unique IDs with pattern: <PREFIX><YY><SEQ>
 * Example: LN250001
 * 
 * - PREFIX: Module code (LN, PM, EX, US, BR, VN) - 2 chars
 * - YY: Year (25 for 2025) - 2 chars
 * - SEQ: 4-digit sequence number - 4 chars
 * 
 * Total: 8 characters maximum
 * Sequence resets each year per module prefix.
 */
@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class UniqueIdGenerator {
    
    private final SequenceRepository sequenceRepository;
    
    // Module prefixes (2 characters each)
    public static final String LOAN_PREFIX = "LN";
    public static final String PAYMENT_PREFIX = "PM";
    public static final String EXPENSE_PREFIX = "EX";
    public static final String USER_PREFIX = "US";
    public static final String BRANCH_PREFIX = "BR";
    public static final String VENDOR_PREFIX = "VN";
    
    /**
     * Generate unique ID for a module
     * 
     * @param prefix Module prefix (e.g., "LN", "PM", "EX") - 2 chars
     * @return Formatted ID (e.g., "LN250001") - 8 chars max
     */
    public String generateId(String prefix) {
        // Get current year in YY format
        String year = getCurrentYear();
        
        // Get or create sequence (using year as "branchCode" for compatibility)
        Sequence sequence = sequenceRepository
                .findByModulePrefixAndBranchCodeAndYearMonthForUpdate(prefix, year, year)
                .orElseGet(() -> createNewSequence(prefix, year, year));
        
        // Increment sequence
        int nextNumber = sequence.getLastNumber() + 1;
        sequence.setLastNumber(nextNumber);
        sequenceRepository.save(sequence);
        
        // Format and return ID
        String formattedId = formatId(prefix, year, nextNumber);
        log.info("Generated ID: {} for module: {}", formattedId, prefix);
        
        return formattedId;
    }
    
    /**
     * Generate loan ID
     */
    public String generateLoanId() {
        return generateId(LOAN_PREFIX);
    }
    
    /**
     * Generate payment ID
     */
    public String generatePaymentId() {
        return generateId(PAYMENT_PREFIX);
    }
    
    /**
     * Generate expense ID
     */
    public String generateExpenseId() {
        return generateId(EXPENSE_PREFIX);
    }
    
    /**
     * Generate user ID
     */
    public String generateUserId() {
        return generateId(USER_PREFIX);
    }
    
    /**
     * Generate branch ID
     */
    public String generateBranchId() {
        return generateId(BRANCH_PREFIX);
    }
    
    /**
     * Generate vendor ID
     */
    public String generateVendorId() {
        return generateId(VENDOR_PREFIX);
    }
    
    /**
     * Preview next ID without incrementing (useful for UI previews)
     */
    public String previewNextId(String prefix) {
        String year = getCurrentYear();
        
        Sequence sequence = sequenceRepository
                .findByModulePrefixAndBranchCodeAndYearMonth(prefix, year, year)
                .orElse(null);
        
        int nextNumber = (sequence != null) ? sequence.getLastNumber() + 1 : 1;
        return formatId(prefix, year, nextNumber);
    }
    
    /**
     * Create new sequence entry
     */
    private Sequence createNewSequence(String prefix, String branchCode, String yearMonth) {
        Sequence sequence = new Sequence();
        sequence.setModulePrefix(prefix);
        sequence.setBranchCode(branchCode);
        sequence.setYearMonth(yearMonth);
        sequence.setLastNumber(0);
        return sequence;
    }
    
    /**
     * Get current year in YY format
     * Example: 2025 -> "25"
     */
    private String getCurrentYear() {
        LocalDate now = LocalDate.now();
        return now.format(DateTimeFormatter.ofPattern("yy"));
    }
    
    /**
     * Format ID: <PREFIX><YY><SEQ>
     * Example: LN250001
     * Max 8 characters: 2 (prefix) + 2 (year) + 4 (sequence)
     */
    private String formatId(String prefix, String year, int sequenceNumber) {
        return String.format("%s%s%04d", 
                prefix.toUpperCase(), 
                year, 
                sequenceNumber);
    }
    
    /**
     * Reset all sequences (USE WITH CAUTION - typically for testing only)
     */
    public void resetAllSequences() {
        log.warn("Resetting all sequences - this should only be done in testing!");
        sequenceRepository.deleteAll();
    }
    
    /**
     * Reset sequences for a specific month (automated cleanup)
     */
    public void cleanupOldSequences(int monthsToKeep) {
        // This can be implemented as a scheduled task to clean up old sequence records
        log.info("Cleanup of sequences older than {} months requested", monthsToKeep);
        // Implementation can be added based on requirements
    }
}
