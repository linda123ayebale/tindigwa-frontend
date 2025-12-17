package org.example.Events;

import org.example.Entities.LoanDetails;

public class LoanRejectedEvent extends LoanEvent {
    
    private final String reason;
    
    public LoanRejectedEvent(Object source, LoanDetails loan, String actionBy, String reason) {
        super(source, loan, actionBy, "LOAN_REJECTED");
        this.reason = reason;
    }
    
    public String getReason() {
        return reason;
    }
}
