package org.example.Events;

import org.example.Entities.LoanDetails;

public class LoanBalanceUpdatedEvent extends LoanEvent {
    
    private final double oldBalance;
    private final double newBalance;
    
    public LoanBalanceUpdatedEvent(Object source, LoanDetails loan, String actionBy, 
                                    double oldBalance, double newBalance) {
        super(source, loan, actionBy, "LOAN_BALANCE_UPDATED");
        this.oldBalance = oldBalance;
        this.newBalance = newBalance;
    }
    
    public double getOldBalance() {
        return oldBalance;
    }
    
    public double getNewBalance() {
        return newBalance;
    }
}
