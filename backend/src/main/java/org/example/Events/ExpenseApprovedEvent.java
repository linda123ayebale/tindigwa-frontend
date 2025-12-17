package org.example.Events;

import org.example.Entities.OperationalExpenses;

public class ExpenseApprovedEvent extends ExpenseEvent {
    public ExpenseApprovedEvent(Object source, OperationalExpenses expense, String actionBy) {
        super(source, expense, actionBy, "APPROVED");
    }
}
