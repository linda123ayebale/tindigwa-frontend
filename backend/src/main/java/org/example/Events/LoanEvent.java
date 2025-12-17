package org.example.Events;

import lombok.Getter;
import org.example.Entities.LoanDetails;
import org.springframework.context.ApplicationEvent;

@Getter
public abstract class LoanEvent extends ApplicationEvent {
    
    private final LoanDetails loan;
    private final String actionBy;
    private final String eventType;
    
    public LoanEvent(Object source, LoanDetails loan, String actionBy, String eventType) {
        super(source);
        this.loan = loan;
        this.actionBy = actionBy;
        this.eventType = eventType;
    }
}
