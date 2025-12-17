package org.example.Events;

import org.example.Services.LoanTrackingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Event Listener for Loan Tracking
 * 
 * This listener responds to loan and payment events and updates the tracking system.
 * It provides the application-layer event handling that complements the database triggers.
 */
@Component
public class LoanTrackingEventListener {
    
    @Autowired
    private LoanTrackingService loanTrackingService;
    
    /**
     * Handle loan created event
     * Initialize tracking record when a new loan is created
     */
    @EventListener
    @Transactional
    public void handleLoanCreated(LoanCreatedEvent event) {
        try {
            loanTrackingService.initializeTracking(event.getLoan());
            System.out.println("Loan tracking initialized for loan: " + event.getLoan().getLoanNumber());
        } catch (Exception e) {
            System.err.println("Error initializing tracking for loan " + event.getLoan().getId() + ": " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    /**
     * Handle payment made event
     * Update tracking when a payment is recorded
     */
    @EventListener
    @Transactional
    public void handlePaymentMade(PaymentMadeEvent event) {
        try {
            loanTrackingService.processPayment(event.getPayment(), event.getLoan());
            System.out.println("Loan tracking updated for payment on loan: " + event.getLoan().getLoanNumber());
        } catch (Exception e) {
            System.err.println("Error processing payment tracking for loan " + event.getLoan().getId() + ": " + e.getMessage());
            e.printStackTrace();
        }
    }
}
