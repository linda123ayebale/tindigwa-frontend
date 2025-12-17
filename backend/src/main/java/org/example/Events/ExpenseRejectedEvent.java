package org.example.Events;

import org.example.Entities.OperationalExpenses;

public class ExpenseRejectedEvent extends ExpenseEvent {
    public ExpenseRejectedEvent(Object source, OperationalExpenses expense, String actionBy) {
        super(source, expense, actionBy, "REJECTED");
    }
}
