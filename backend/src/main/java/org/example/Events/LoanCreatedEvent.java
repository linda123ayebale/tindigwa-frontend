package org.example.Events;

import org.example.Entities.LoanDetails;

/**
 * Event published when a new loan is created
 */
public class LoanCreatedEvent extends LoanEvent {
    
    public LoanCreatedEvent(Object source, LoanDetails loan, String actionBy) {
        super(source, loan, actionBy, "LOAN_CREATED");
    }
}
