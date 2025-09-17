package org.example.Entities;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;



import java.time.LocalDate;

    @Entity
    @Table(name = "loan_details")
    @Data
    public class LoanDetails {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @Column(name = "client_id")
        private Long clientId;

        @Column(name = "lending_branch")
        private String lendingBranch;

        @Column(name = "amount_disbursed")
        private double amountDisbursed;

        @Column(name = "loan_duration_days")
        private int loanDurationDays;

        @Column(name = "repayment_frequency")
        private String repaymentFrequency;

        @Column(name = "payment_start_date")
        private LocalDate paymentStartDate;

        @Column(name = "payment_end_date")
        private LocalDate paymentEndDate;

        @Column(name = "interest_rate")
        private double interestRate;

        @Column(name = "total_payable")
        private double totalPayable;

        @Column(name = "loan_processing_fee")
        private double loanProcessingFee;

        @Column(name = "agreement_signed")
        private boolean agreementSigned;
    }



