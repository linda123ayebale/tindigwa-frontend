package org.example.enums;

/**
 * Loan Status Definitions based on business requirements:
 * 
 * OPEN - Loan has been approved but no installment has been paid yet
 * IN_PROGRESS - First installment has been made as agreed on the agreed date
 * CLOSED - Loan is completely paid (within agreed time or maturity date)
 * OVERDUE - Beyond maturity date + 14 days grace period and not yet paid
 * DEFAULTED - Not paid for 6 months after the maturity date
 */
public enum LoanStatus {
    OPEN("Open", "Approved but no payments made yet"),
    IN_PROGRESS("In Progress", "Payments are being made as agreed"),
    CLOSED("Closed", "Fully paid within agreed time"),
    OVERDUE("Overdue", "Beyond 14 days grace period after maturity"),
    DEFAULTED("Defaulted", "No payment for 6+ months after maturity");
    
    private final String displayName;
    private final String description;
    
    LoanStatus(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public String getDescription() {
        return description;
    }
    
    public String getCssClass() {
        return this.name().toLowerCase().replace("_", "-");
    }
}