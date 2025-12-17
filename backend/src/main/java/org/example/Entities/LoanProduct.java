package org.example.Entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.example.config.RegistrationFeeTiersConverter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "loan_products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LoanProduct {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "product_name", nullable = false)
    private String productName;           // "Personal Loan", "Business Loan", "Emergency Loan"

    @Column(name = "product_code", unique = true)
    private String productCode;           // "PL001", "BL001", "EL001"

    @Column(name = "description")
    private String description;           // Product description

    @Column(name = "default_interest_rate")
    private double defaultInterestRate;   // 15.5% (stored as 15.5, not 0.155)

    @Column(name = "interest_method")
    private String interestMethod;        // "flat", "reducing", "compound"

    @Column(name = "interest_type")
    private String interestType;          // "percentage", "fixed"

    @Column(name = "rate_per")
    private String ratePer;               // "month", "year", "day"

    // Duration constraints
    @Column(name = "min_duration")
    private int minDuration;              // Minimum loan duration
    
    @Column(name = "max_duration")
    private int maxDuration;              // Maximum loan duration
    
    @Column(name = "default_duration")
    private int defaultDuration;          // Default loan duration
    
    @Column(name = "duration_unit")
    private String durationUnit;          // "days", "weeks", "months", "years"

    // Amount constraints
    @Column(name = "min_amount")
    private double minAmount;             // Minimum loan amount (e.g., 50000)

    @Column(name = "max_amount")
    private double maxAmount;             // Maximum loan amount (e.g., 5000000)

    // Repayment options
    @Column(name = "allowed_repayment_frequencies")
    private String allowedRepaymentFrequencies;  // "daily,weekly,monthly" (comma-separated)

    @Column(name = "default_repayment_frequency")
    private String defaultRepaymentFrequency;    // "monthly"

    // Fees
    @Column(name = "processing_fee_type")
    private String processingFeeType;     // "fixed", "percentage"

    @Column(name = "processing_fee_value")
    private double processingFeeValue;    // If fixed: amount, if percentage: rate

    @Column(name = "late_fee")
    private double lateFee;               // Default late fee

    @Column(name = "default_fee")
    private double defaultFee;            // Default penalty fee

    // Grace period
    @Column(name = "default_grace_period_days")
    private int defaultGracePeriodDays;   // Default grace period (also applies to penalty grace)

    // Registration Fee Tiers (NEW - for tiered registration fees based on principal amount)
    @Column(name = "registration_fee_tiers", columnDefinition = "JSON")
    @Convert(converter = RegistrationFeeTiersConverter.class)
    private List<Map<String, Object>> registrationFeeTiers;  // [{"minAmount": 100000, "maxAmount": 250000, "fee": 5000}, ...]

    // Penalty Rate (NEW - daily penalty rate on reducing balance)
    @Column(name = "penalty_rate")
    private Double penaltyRate;           // Penalty rate per day (e.g., 0.02 for 0.02% per day)

    // Status and metadata
    @Column(name = "active")
    private Boolean active;               // Whether product is available for new loans

    @Column(name = "requires_guarantor")
    private Boolean requiresGuarantor;    // Whether this product requires a guarantor

    @Column(name = "requires_collateral")
    private Boolean requiresCollateral;   // Whether this product requires collateral

    // System fields
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "created_by_user_id")
    private Long createdByUserId;         // ID of user who created this product

    // Lifecycle methods
    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        
        // Set defaults
        if (this.active == null) this.active = true;
        if (this.interestMethod == null) this.interestMethod = "flat";
        if (this.interestType == null) this.interestType = "percentage";
        if (this.ratePer == null) this.ratePer = "month";
        if (this.durationUnit == null) this.durationUnit = "months";
        if (this.defaultRepaymentFrequency == null) this.defaultRepaymentFrequency = "monthly";
        if (this.allowedRepaymentFrequencies == null) this.allowedRepaymentFrequencies = "daily,weekly,monthly";
        if (this.processingFeeType == null) this.processingFeeType = "fixed";
        // All loan products require a guarantor, never require collateral
        if (this.requiresGuarantor == null) this.requiresGuarantor = true;
        if (this.requiresCollateral == null) this.requiresCollateral = false;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Helper methods
    public String[] getAllowedRepaymentFrequenciesArray() {
        if (allowedRepaymentFrequencies == null) return new String[0];
        return allowedRepaymentFrequencies.split(",");
    }

    public boolean isRepaymentFrequencyAllowed(String frequency) {
        if (allowedRepaymentFrequencies == null) return true;
        String[] allowed = getAllowedRepaymentFrequenciesArray();
        for (String freq : allowed) {
            if (freq.trim().equalsIgnoreCase(frequency)) {
                return true;
            }
        }
        return false;
    }

    public double calculateProcessingFee(double loanAmount) {
        if ("percentage".equalsIgnoreCase(processingFeeType)) {
            return loanAmount * (processingFeeValue / 100);
        } else {
            return processingFeeValue; // Fixed amount
        }
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

    // Display name for frontend
    public String getDisplayName() {
        return productName + " (" + productCode + ")";
    }
    
    // Getter methods for Boolean fields
    public boolean isActive() {
        return active != null ? active : false;
    }
    
    public boolean isRequiresGuarantor() {
        return requiresGuarantor != null ? requiresGuarantor : false;
    }
    
    public boolean isRequiresCollateral() {
        return requiresCollateral != null ? requiresCollateral : false;
    }
    
    // Setter methods for Boolean fields  
    public void setActive(Boolean active) {
        this.active = active;
    }
    
    public void setRequiresGuarantor(Boolean requiresGuarantor) {
        this.requiresGuarantor = requiresGuarantor;
    }
    
    public void setRequiresCollateral(Boolean requiresCollateral) {
        this.requiresCollateral = requiresCollateral;
    }
}
