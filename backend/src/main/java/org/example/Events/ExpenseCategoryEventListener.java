package org.example.Events;

import org.example.Entities.AuditLog;
import org.example.Entities.ExpenseCategory;
import org.example.Repositories.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;

@Component
public class ExpenseCategoryEventListener {
    private static final Logger logger = LoggerFactory.getLogger(ExpenseCategoryEventListener.class);
    
    @Autowired
    private AuditLogRepository auditLogRepository;

    @EventListener
    @Async
    public void handleCategoryCreatedEvent(ExpenseCategoryCreatedEvent event) {
        ExpenseCategory category = event.getCategory();
        logger.info("New expense category created: {} by {}", 
                category.getCategoryName(), category.getCreatedBy());
        
        // Create audit log entry
        AuditLog auditLog = new AuditLog();
        auditLog.setEntityType("ExpenseCategory");
        auditLog.setEntityId(category.getId());
        auditLog.setAction("CREATE");
        auditLog.setPerformedBy(category.getCreatedBy());
        auditLog.setNewValue(String.format("Category: %s, Description: %s", 
                category.getCategoryName(), category.getDescription()));
        auditLog.setTimestamp(LocalDateTime.now());
        auditLogRepository.save(auditLog);
    }

    @EventListener
    @Async
    public void handleCategoryUpdatedEvent(ExpenseCategoryUpdatedEvent event) {
        ExpenseCategory category = event.getCategory();
        logger.info("Expense category updated: {} by {}", 
                category.getCategoryName(), category.getLastModifiedBy());
        
        // Create audit log entry
        AuditLog auditLog = new AuditLog();
        auditLog.setEntityType("ExpenseCategory");
        auditLog.setEntityId(category.getId());
        auditLog.setAction("UPDATE");
        auditLog.setPerformedBy(category.getLastModifiedBy());
        auditLog.setNewValue(String.format("Category: %s, Description: %s, Active: %s", 
                category.getCategoryName(), category.getDescription(), category.getIsActive()));
        auditLog.setTimestamp(LocalDateTime.now());
        auditLogRepository.save(auditLog);
    }
}
