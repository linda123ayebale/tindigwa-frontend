package org.example.Events;

import org.example.Entities.OperationalExpenses;

public class ExpensePaidEvent extends ExpenseEvent {
    public ExpensePaidEvent(Object source, OperationalExpenses expense, String actionBy) {
        super(source, expense, actionBy, "PAID");
    }
}
