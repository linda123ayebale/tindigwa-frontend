package org.example.Events;

import org.example.Services.DashboardWebSocketService;
import org.example.Services.StatisticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
public class DashboardUpdateListener {

    @Autowired
    private DashboardWebSocketService dashboardWebSocketService;

    @Autowired
    private StatisticsService statisticsService;

    /**
     * Listen for loan created events
     */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onLoanCreated(LoanCreatedEvent event) {
        System.out.println("Loan created event detected for loan ID: " + event.getLoan().getId());
        
        // Evict cache
        statisticsService.evictDashboardCache();
        
        // Broadcast update to WebSocket clients
        dashboardWebSocketService.broadcastDashboardUpdate();
    }

    /**
     * Listen for payment made events
     */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onPaymentMade(PaymentMadeEvent event) {
        System.out.println("Payment made event detected for loan ID: " + event.getLoan().getId());
        
        // Evict cache
        statisticsService.evictDashboardCache();
        
        // Broadcast update to WebSocket clients
        dashboardWebSocketService.broadcastDashboardUpdate();
    }

    /**
     * Listen for expense category created events
     */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onExpenseCategoryCreated(ExpenseCategoryCreatedEvent event) {
        System.out.println("Expense category created: " + event.getCategory().getCategoryName());
        
        // Evict cache
        statisticsService.evictDashboardCache();
        
        // Broadcast update
        dashboardWebSocketService.broadcastDashboardUpdate();
    }

    /**
     * Listen for expense category updated events
     */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onExpenseCategoryUpdated(ExpenseCategoryUpdatedEvent event) {
        System.out.println("Expense category updated: " + event.getCategory().getCategoryName());
        
        // Evict cache
        statisticsService.evictDashboardCache();
        
        // Broadcast update
        dashboardWebSocketService.broadcastDashboardUpdate();
    }
}
