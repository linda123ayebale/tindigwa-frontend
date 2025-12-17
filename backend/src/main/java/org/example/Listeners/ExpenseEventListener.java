package org.example.Listeners;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.Entities.ExpenseLog;
import org.example.Events.ExpenseApprovedEvent;
import org.example.Events.ExpenseCreatedEvent;
import org.example.Events.ExpensePaidEvent;
import org.example.Events.ExpenseRejectedEvent;
import org.example.Repositories.ExpenseLogRepository;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class ExpenseEventListener {

    private final SimpMessagingTemplate messagingTemplate;
    private final ExpenseLogRepository expenseLogRepository;

    @EventListener
    public void handleExpenseCreated(ExpenseCreatedEvent event) {
        log.info("Expense Created Event: Expense ID = {}, Created By = {}", 
                event.getExpense().getId(), event.getActionBy());
        
        // Save to audit log
        ExpenseLog logEntry = new ExpenseLog();
        logEntry.setExpenseId(event.getExpense().getId());
        logEntry.setAction("CREATED");
        logEntry.setActionBy(event.getActionBy());
        logEntry.setActionAt(LocalDateTime.now());
        logEntry.setNotes("Expense created: " + event.getExpense().getDescription());
        expenseLogRepository.save(logEntry);
        
        // Broadcast via WebSocket
        Map<String, Object> message = createWebSocketMessage(
                event.getExpense().getId(),
                "CREATED",
                event.getActionBy(),
                "New expense created: " + event.getExpense().getDescription()
        );
        messagingTemplate.convertAndSend("/topic/expenses", message);
    }

    @EventListener
    public void handleExpenseApproved(ExpenseApprovedEvent event) {
        log.info("Expense Approved Event: Expense ID = {}, Approved By = {}", 
                event.getExpense().getId(), event.getActionBy());
        
        // Save to audit log
        ExpenseLog logEntry = new ExpenseLog();
        logEntry.setExpenseId(event.getExpense().getId());
        logEntry.setAction("APPROVED");
        logEntry.setActionBy(event.getActionBy());
        logEntry.setActionAt(LocalDateTime.now());
        logEntry.setNotes(event.getExpense().getApprovalComment());
        expenseLogRepository.save(logEntry);
        
        // Broadcast via WebSocket
        Map<String, Object> message = createWebSocketMessage(
                event.getExpense().getId(),
                "APPROVED",
                event.getActionBy(),
                "Expense #" + event.getExpense().getId() + " has been approved"
        );
        messagingTemplate.convertAndSend("/topic/expenses", message);
    }

    @EventListener
    public void handleExpenseRejected(ExpenseRejectedEvent event) {
        log.info("Expense Rejected Event: Expense ID = {}, Rejected By = {}", 
                event.getExpense().getId(), event.getActionBy());
        
        // Save to audit log
        ExpenseLog logEntry = new ExpenseLog();
        logEntry.setExpenseId(event.getExpense().getId());
        logEntry.setAction("REJECTED");
        logEntry.setActionBy(event.getActionBy());
        logEntry.setActionAt(LocalDateTime.now());
        logEntry.setNotes(event.getExpense().getApprovalComment());
        expenseLogRepository.save(logEntry);
        
        // Broadcast via WebSocket
        Map<String, Object> message = createWebSocketMessage(
                event.getExpense().getId(),
                "REJECTED",
                event.getActionBy(),
                "Expense #" + event.getExpense().getId() + " has been rejected"
        );
        messagingTemplate.convertAndSend("/topic/expenses", message);
    }

    @EventListener
    public void handleExpensePaid(ExpensePaidEvent event) {
        log.info("Expense Paid Event: Expense ID = {}, Paid By = {}", 
                event.getExpense().getId(), event.getActionBy());
        
        // Save to audit log
        ExpenseLog logEntry = new ExpenseLog();
        logEntry.setExpenseId(event.getExpense().getId());
        logEntry.setAction("PAID");
        logEntry.setActionBy(event.getActionBy());
        logEntry.setActionAt(LocalDateTime.now());
        logEntry.setNotes("Expense marked as paid");
        expenseLogRepository.save(logEntry);
        
        // Broadcast via WebSocket
        Map<String, Object> message = createWebSocketMessage(
                event.getExpense().getId(),
                "PAID",
                event.getActionBy(),
                "Expense #" + event.getExpense().getId() + " has been marked as paid"
        );
        messagingTemplate.convertAndSend("/topic/expenses", message);
    }

    private Map<String, Object> createWebSocketMessage(Long expenseId, String action, 
                                                        String actionBy, String message) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("expenseId", expenseId);
        payload.put("action", action);
        payload.put("actionBy", actionBy);
        payload.put("message", message);
        payload.put("timestamp", LocalDateTime.now().toString());
        return payload;
    }
}
