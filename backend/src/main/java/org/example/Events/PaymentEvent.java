package org.example.Events;

import lombok.Getter;
import org.example.Entities.LoanPayments;
import org.springframework.context.ApplicationEvent;

@Getter
public abstract class PaymentEvent extends ApplicationEvent {
    
    private final LoanPayments payment;
    private final String actionBy;
    private final String eventType;
    
    public PaymentEvent(Object source, LoanPayments payment, String actionBy, String eventType) {
        super(source);
        this.payment = payment;
        this.actionBy = actionBy;
        this.eventType = eventType;
    }
}
