package org.example.Events;

import org.example.Entities.LoanInstallmentSchedule;
import org.example.Entities.LoanPayments;
import org.springframework.context.ApplicationEvent;

/**
 * Event published when an installment is paid or partially paid
 */
public class InstallmentPaidEvent extends ApplicationEvent {
    
    private final LoanInstallmentSchedule installment;
    private final LoanPayments payment;
    private final boolean fullyPaid;
    private final boolean isPartial;
    private final boolean isLate;
    
    public InstallmentPaidEvent(Object source, LoanInstallmentSchedule installment, LoanPayments payment, 
                                boolean fullyPaid, boolean isPartial, boolean isLate) {
        super(source);
        this.installment = installment;
        this.payment = payment;
        this.fullyPaid = fullyPaid;
        this.isPartial = isPartial;
        this.isLate = isLate;
    }
    
    public LoanInstallmentSchedule getInstallment() {
        return installment;
    }
    
    public LoanPayments getPayment() {
        return payment;
    }
    
    public boolean isFullyPaid() {
        return fullyPaid;
    }
    
    public boolean isPartial() {
        return isPartial;
    }
    
    public boolean isLate() {
        return isLate;
    }
    
    public Long getLoanId() {
        return installment != null ? installment.getLoanId() : null;
    }
    
    public Integer getInstallmentNumber() {
        return installment != null ? installment.getInstallmentNumber() : null;
    }
    
    public Double getAmountPaid() {
        return payment != null ? payment.getAmountPaid() : null;
    }
}
