package org.example.Events;

import org.example.Entities.LoanPayments;

public class PaymentRecordedEvent extends PaymentEvent {
    
    public PaymentRecordedEvent(Object source, LoanPayments payment, String actionBy) {
        super(source, payment, actionBy, "PAYMENT_RECORDED");
    }
}
