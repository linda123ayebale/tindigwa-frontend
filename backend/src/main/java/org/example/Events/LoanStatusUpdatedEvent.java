package org.example.Events;

import org.example.Entities.LoanDetails;

public class LoanStatusUpdatedEvent extends LoanEvent {
    
    private final String oldStatus;
    private final String newStatus;
    
    public LoanStatusUpdatedEvent(Object source, LoanDetails loan, String actionBy, 
                                   String oldStatus, String newStatus) {
        super(source, loan, actionBy, "LOAN_STATUS_UPDATED");
        this.oldStatus = oldStatus;
        this.newStatus = newStatus;
    }
    
    public String getOldStatus() {
        return oldStatus;
    }
    
    public String getNewStatus() {
        return newStatus;
    }
}
