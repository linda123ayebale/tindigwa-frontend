package org.example.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoanTableViewDTO {
    private Long id;
    private String loanNumber;
    private String name;                    // Client full name
    private LocalDate released;             // Release date
    private LocalDate maturity;             // Payment end date
    private String repayment;               // Repayment frequency
    private String principalFormatted;      // Formatted principal amount
    private double principal;               // Raw principal amount
    private String interestRate;            // Interest rate display
    private String feesFormatted;           // Formatted fees
    private double fees;                    // Raw fees amount
    private String penaltyFormatted;        // Formatted penalty
    private double penalty;                 // Raw penalty amount
    private String dueFormatted;            // Formatted total due
    private double due;                     // Raw total due
    private String paidFormatted;           // Formatted amount paid
    private double paid;                    // Raw amount paid
    private String balanceFormatted;        // Formatted balance
    private double balance;                 // Raw balance
    private String status;                  // Loan status
    private String statusBadgeClass;        // CSS class for status badge
    private boolean isOverdue;              // Whether loan is overdue
    private boolean isFullyPaid;            // Whether loan is fully paid
    
    // Additional fields for actions
    private boolean canModify;              // Whether loan can be modified
    private boolean canViewDetails;         // Whether details can be viewed
}