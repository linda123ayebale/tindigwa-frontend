package org.example.Entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class LoanPayments {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;
    Long loanId; // link to LoanDetail
    LocalDate paymentDate;
    double amountPaid;
    double cumulativePayment;
    double outstandingBalance;
    double profit;
    boolean isLate;
    int gracePeriodDays;
    double fine;
    LocalDate fineTriggerDate;
    int monthsOverdue;
    double cumulativePenalty;
    double penaltyIncome;

}
