package org.example.Events;

import org.example.Entities.LoanDetails;
import org.springframework.context.ApplicationEvent;

import java.util.List;

/**
 * Event published when loan installment schedule is generated
 */
public class InstallmentScheduleGeneratedEvent extends ApplicationEvent {
    
    private final LoanDetails loan;
    private final List<Long> installmentIds;
    private final int totalInstallments;
    
    public InstallmentScheduleGeneratedEvent(Object source, LoanDetails loan, List<Long> installmentIds) {
        super(source);
        this.loan = loan;
        this.installmentIds = installmentIds;
        this.totalInstallments = installmentIds != null ? installmentIds.size() : 0;
    }
    
    public LoanDetails getLoan() {
        return loan;
    }
    
    public List<Long> getInstallmentIds() {
        return installmentIds;
    }
    
    public int getTotalInstallments() {
        return totalInstallments;
    }
    
    public Long getLoanId() {
        return loan != null ? loan.getId() : null;
    }
    
    public String getLoanNumber() {
        return loan != null ? loan.getLoanNumber() : null;
    }
}
