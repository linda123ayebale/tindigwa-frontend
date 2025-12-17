package org.example.Events;

import org.example.Entities.LoanPayments;

public class PaymentReversedEvent extends PaymentEvent {
    
    private final String reason;
    
    public PaymentReversedEvent(Object source, LoanPayments payment, String actionBy, String reason) {
        super(source, payment, actionBy, "PAYMENT_REVERSED");
        this.reason = reason;
    }
    
    public String getReason() {
        return reason;
    }
}
