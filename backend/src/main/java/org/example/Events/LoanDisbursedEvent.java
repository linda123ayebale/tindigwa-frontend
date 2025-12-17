package org.example.Events;

import lombok.Getter;
import org.example.Entities.LoanDetails;

@Getter
public class LoanDisbursedEvent extends LoanEvent {
    private final double disbursedAmount;
    private final String disbursementMethod;
    
    public LoanDisbursedEvent(Object source, LoanDetails loan, String actionBy, double disbursedAmount, String disbursementMethod) {
        super(source, loan, actionBy, "LOAN_DISBURSED");
        this.disbursedAmount = disbursedAmount;
        this.disbursementMethod = disbursementMethod;
    }
}
