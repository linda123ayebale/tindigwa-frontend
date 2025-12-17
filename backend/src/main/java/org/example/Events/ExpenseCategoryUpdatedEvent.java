package org.example.Events;

import org.example.Entities.ExpenseCategory;
import org.springframework.context.ApplicationEvent;

public class ExpenseCategoryUpdatedEvent extends ApplicationEvent {
    private final ExpenseCategory category;

    public ExpenseCategoryUpdatedEvent(ExpenseCategory category) {
        super(category);
        this.category = category;
    }

    public ExpenseCategory getCategory() {
        return category;
    }
}