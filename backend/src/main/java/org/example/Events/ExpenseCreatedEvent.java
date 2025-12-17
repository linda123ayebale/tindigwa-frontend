package org.example.Events;

import org.example.Entities.OperationalExpenses;

public class ExpenseCreatedEvent extends ExpenseEvent {
    public ExpenseCreatedEvent(Object source, OperationalExpenses expense, String actionBy) {
        super(source, expense, actionBy, "CREATED");
    }
}
