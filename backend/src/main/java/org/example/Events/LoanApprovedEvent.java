package org.example.Events;

import org.example.Entities.LoanDetails;

public class LoanApprovedEvent extends LoanEvent {
    
    public LoanApprovedEvent(Object source, LoanDetails loan, String actionBy) {
        super(source, loan, actionBy, "LOAN_APPROVED");
    }
}
