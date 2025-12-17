package org.example.DTO;

import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LoanProductResponse {
    
    private Long id;
    private String productName;
    private String productCode;
    private String description;
    private String displayName;
    
    // Interest configuration
    private double defaultInterestRate;
    private String interestMethod;
    private String interestType;
    private String ratePer;
    
    // Duration constraints
    private int minDuration;
    private int maxDuration;
    private int defaultDuration;
    private String durationUnit;
    
    // Amount constraints
    private double minAmount;
    private double maxAmount;
    
    // Repayment configuration
    private String[] allowedRepaymentFrequencies;
    private String defaultRepaymentFrequency;
    
    // Fees
    private String processingFeeType;
    private double processingFeeValue;
    private double lateFee;
    private double defaultFee;
    
    // Grace period
    private int defaultGracePeriodDays;
    
    // Registration Fee Tiers (NEW)
    private List<Map<String, Object>> registrationFeeTiers;
    
    // Penalty Rate (NEW)
    private Double penaltyRate;  // Penalty rate per day (e.g., 0.02 for 0.02% per day)
    
    // Requirements
    private boolean requiresGuarantor;
    private boolean requiresCollateral;
    
    // Status
    private boolean active;
    
    // System fields
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long createdByUserId;  // ID of user who created this product
    
    // Helper method to get processing fee for a specific amount
    public double calculateProcessingFee(double loanAmount) {
        if ("percentage".equalsIgnoreCase(processingFeeType)) {
            return loanAmount * (processingFeeValue / 100);
        } else {
            return processingFeeValue; // Fixed amount
        }
    }
    
    // Helper method to check if a repayment frequency is allowed
    public boolean isRepaymentFrequencyAllowed(String frequency) {
        if (allowedRepaymentFrequencies == null) return true;
        for (String freq : allowedRepaymentFrequencies) {
            if (freq.trim().equalsIgnoreCase(frequency)) {
                return true;
            }
        }
        return false;
    }
    
    // Helper method to validate loan amount
    public boolean isAmountValid(double amount) {
        return amount >= minAmount && amount <= maxAmount;
    }
    
    // Helper method to validate loan duration
    public boolean isDurationValid(int duration) {
        return duration >= minDuration && duration <= maxDuration;
    }
    
    /**
     * Calculate registration fee based on principal amount using tiered structure
     * @param principal The loan principal amount
     * @return The registration fee for the given principal, or 0 if no tiers defined
     */
    public double calculateRegistrationFee(double principal) {
        if (registrationFeeTiers == null || registrationFeeTiers.isEmpty()) {
            return 0.0;
        }
        
        for (Map<String, Object> tier : registrationFeeTiers) {
            double minAmount = ((Number) tier.getOrDefault("minAmount", 0)).doubleValue();
            double maxAmount = ((Number) tier.getOrDefault("maxAmount", Double.MAX_VALUE)).doubleValue();
            double fee = ((Number) tier.getOrDefault("fee", 0)).doubleValue();
            
            if (principal >= minAmount && principal <= maxAmount) {
                return fee;
            }
        }
        
        return 0.0; // No matching tier found
    }
    
    /**
     * Calculate penalty fee based on reducing balance and days overdue
     * Formula: reducingBalance * (penaltyRate / 100) * daysOverdue
     * @param reducingBalance The current outstanding balance
     * @param daysOverdue Number of days overdue (after grace period)
     * @return The penalty amount
     */
    public double calculatePenaltyFee(double reducingBalance, int daysOverdue) {
        if (penaltyRate == null || penaltyRate <= 0 || daysOverdue <= 0) {
            return 0.0;
        }
        
        return reducingBalance * (penaltyRate / 100) * daysOverdue;
    }
}
