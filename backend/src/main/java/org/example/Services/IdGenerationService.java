package org.example.Services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Centralized service for generating unique IDs with custom prefixes
 * 
 * ID Formats:
 * - Users (all roles including clients): TIN001, TIN002, etc.
 * - Next of Kin: NOK001, NOK002, etc.
 * - Guarantors: GUA001, GUA002, etc.
 * - Persons: PER001, PER002, etc.
 */
@Service
@Transactional
public class IdGenerationService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // Entity type constants
    public static final String USER_PREFIX = "TIN";
    public static final String NEXT_OF_KIN_PREFIX = "NOK";
    public static final String GUARANTOR_PREFIX = "GUA";
    public static final String PERSON_PREFIX = "PER";
    public static final String BRANCH_PREFIX = "BRH";



    // In-memory cache for counters to avoid frequent DB queries
    private final ConcurrentHashMap<String, AtomicLong> counterCache = new ConcurrentHashMap<>();

    /**
     * Generate next ID for users (including clients)
     * @return String ID like TIN001, TIN002, etc.
     */
    public String generateUserId() {
        return generateId(USER_PREFIX, "users");
    }

    /**
     * Generate next ID for next of kin
     * @return String ID like NOK001, NOK002, etc.
     */
    public String generateNextOfKinId() {
        return generateId(NEXT_OF_KIN_PREFIX, "next_of_kin");
    }

    /**
     * Generate next ID for guarantors
     * @return String ID like GUA001, GUA002, etc.
     */
    public String generateGuarantorId() {
        return generateId(GUARANTOR_PREFIX, "guarantors");
    }

    /**
     * Generate next ID for persons
     * @return String ID like PER001, PER002, etc.
     */
    public String generatePersonId() {
        return generateId(PERSON_PREFIX, "persons");
    }

    public String generateBranchId() {
        return generateId(BRANCH_PREFIX, "branches");
    }


    /**
     * Core ID generation method
     * @param prefix The prefix for the ID (TIN, NOK, GUA, PER)
     * @param tableName The table name to check for existing IDs
     * @return Formatted ID string
     */
    private synchronized String generateId(String prefix, String tableName) {
        // Get current counter from cache or initialize from database
        AtomicLong counter = counterCache.computeIfAbsent(prefix, 
            p -> new AtomicLong(getCurrentMaxCounter(prefix, tableName)));
        
        // Increment and format
        long nextNumber = counter.incrementAndGet();
        return formatId(prefix, nextNumber);
    }

    /**
     * Get the current maximum counter for a prefix from the database
     * @param prefix The prefix to search for
     * @param tableName The table to query
     * @return The current maximum counter value
     */
    private long getCurrentMaxCounter(String prefix, String tableName) {
        try {
            // Query to find the highest existing number for this prefix
            String sql = "SELECT COALESCE(MAX(CAST(SUBSTRING(id, ?) AS UNSIGNED)), 0) FROM " + tableName + 
                        " WHERE id LIKE ? AND LENGTH(id) = ?";
            
            int prefixLength = prefix.length() + 1; // +1 for the prefix
            String pattern = prefix + "%";
            int expectedLength = prefix.length() + 3; // prefix + 3 digits
            
            Long maxNumber = jdbcTemplate.queryForObject(sql, Long.class, 
                prefixLength, pattern, expectedLength);
            
            return maxNumber != null ? maxNumber : 0;
            
        } catch (Exception e) {
            // If table doesn't exist or has no records, start from 0
            System.out.println("Warning: Could not get max counter for " + prefix + " from " + tableName + ": " + e.getMessage());
            return 0;
        }
    }

    /**
     * Format ID with prefix and zero-padded number
     * @param prefix The prefix (TIN, NOK, etc.)
     * @param number The sequential number
     * @return Formatted ID like TIN001, NOK001, etc.
     */
    private String formatId(String prefix, long number) {
        return String.format("%s%03d", prefix, number);
    }

    /**
     * Check if an ID already exists in the specified table
     * @param id The ID to check
     * @param tableName The table to check in
     * @return true if ID exists, false otherwise
     */
    public boolean idExists(String id, String tableName) {
        try {
            String sql = "SELECT COUNT(*) FROM " + tableName + " WHERE id = ?";
            Integer count = jdbcTemplate.queryForObject(sql, Integer.class, id);
            return count != null && count > 0;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Reset counter cache (useful for testing or manual resets)
     */
    public void resetCounterCache() {
        counterCache.clear();
    }

    /**
     * Get next available ID without incrementing (for preview purposes)
     * @param prefix The prefix to check
     * @param tableName The table name
     * @return The next ID that would be generated
     */
    public String previewNextId(String prefix, String tableName) {
        AtomicLong counter = counterCache.get(prefix);
        if (counter == null) {
            long currentMax = getCurrentMaxCounter(prefix, tableName);
            return formatId(prefix, currentMax + 1);
        }
        return formatId(prefix, counter.get() + 1);
    }
}