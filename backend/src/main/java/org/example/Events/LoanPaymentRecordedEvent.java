package org.example.Events;

import org.example.Entities.LoanDetails;
import org.example.Entities.LoanPayments;

public class LoanPaymentRecordedEvent extends LoanEvent {
    
    private final LoanPayments payment;
    
    public LoanPaymentRecordedEvent(Object source, LoanDetails loan, LoanPayments payment, String actionBy) {
        super(source, loan, actionBy, "LOAN_PAYMENT_RECORDED");
        this.payment = payment;
    }
    
    public LoanPayments getPayment() {
        return payment;
    }
}
