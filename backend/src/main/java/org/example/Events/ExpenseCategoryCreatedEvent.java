package org.example.Events;

import org.example.Entities.ExpenseCategory;
import org.springframework.context.ApplicationEvent;

public class ExpenseCategoryCreatedEvent extends ApplicationEvent {
    private final ExpenseCategory category;

    public ExpenseCategoryCreatedEvent(ExpenseCategory category) {
        super(category);
        this.category = category;
    }

    public ExpenseCategory getCategory() {
        return category;
    }
}