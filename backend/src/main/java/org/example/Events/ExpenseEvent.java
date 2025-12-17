package org.example.Events;

import lombok.Getter;
import org.example.Entities.OperationalExpenses;
import org.springframework.context.ApplicationEvent;

@Getter
public abstract class ExpenseEvent extends ApplicationEvent {
    private final OperationalExpenses expense;
    private final String actionBy;
    private final String action;

    public ExpenseEvent(Object source, OperationalExpenses expense, String actionBy, String action) {
        super(source);
        this.expense = expense;
        this.actionBy = actionBy;
        this.action = action;
    }
}
