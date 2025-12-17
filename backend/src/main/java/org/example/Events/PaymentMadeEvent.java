package org.example.Events;

import org.example.Entities.LoanDetails;
import org.example.Entities.LoanPayments;
import org.springframework.context.ApplicationEvent;

/**
 * Event published when a payment is made on a loan
 */
public class PaymentMadeEvent extends ApplicationEvent {
    
    private final LoanPayments payment;
    private final LoanDetails loan;
    
    public PaymentMadeEvent(Object source, LoanPayments payment, LoanDetails loan) {
        super(source);
        this.payment = payment;
        this.loan = loan;
    }
    
    public LoanPayments getPayment() {
        return payment;
    }
    
    public LoanDetails getLoan() {
        return loan;
    }
}
