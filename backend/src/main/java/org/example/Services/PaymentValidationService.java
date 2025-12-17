package org.example.Services;

import org.example.Entities.LoanDetails;
import org.example.Entities.LoanPayments;
import org.example.Entities.LoanInstallmentSchedule;
import org.example.Entities.LoanProduct;
import org.example.Repositories.LoanDetailsRepository;
import org.example.Repositories.LoanPaymentsRepository;
import org.example.Repositories.LoanInstallmentScheduleRepository;
import org.example.Repositories.LoanProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;

@Service
public class PaymentValidationService {

    @Autowired
    private LoanDetailsRepository loanRepository;

    @Autowired
    private LoanPaymentsRepository paymentsRepository;

    @Autowired
    private LoanInstallmentScheduleRepository installmentRepository;

    @Autowired
    private LoanProductRepository loanProductRepository;

    /**
     * Validate payment before processing
     */
    public ValidationResult validatePayment(LoanPayments payment) {
        List<String> errors = new ArrayList<>();
        List<String> warnings = new ArrayList<>();

        // Basic field validations
        validateBasicFields(payment, errors);

        if (errors.isEmpty()) {
            // Load loan details
            Optional<LoanDetails> loanOpt = loanRepository.findById(payment.getLoanId());
            
            if (loanOpt.isEmpty()) {
                errors.add("Loan not found with ID: " + payment.getLoanId());
                return new ValidationResult(false, errors, warnings);
            }

            LoanDetails loan = loanOpt.get();

            // Validate loan status
            validateLoanStatus(loan, errors);

            // Validate payment amount
            validatePaymentAmount(payment, loan, errors, warnings);

            // Validate payment date
            validatePaymentDate(payment, loan, errors, warnings);

            // Validate installment schedule
            validateInstallmentSchedule(payment, loan, errors, warnings);

            // Validate duplicate payment
            validateDuplicatePayment(payment, warnings);

            // Business rule validations
            validateBusinessRules(payment, loan, errors, warnings);
        }

        return new ValidationResult(errors.isEmpty(), errors, warnings);
    }

    /**
     * Validate basic required fields
     */
    private void validateBasicFields(LoanPayments payment, List<String> errors) {
        if (payment.getLoanId() == null) {
            errors.add("Loan ID is required");
        }

        if (payment.getAmountPaid() <= 0) {
            errors.add("Payment amount must be greater than zero");
        }

        if (payment.getPaymentDate() == null) {
            errors.add("Payment date is required");
        }

        if (payment.getPaymentMethod() == null || payment.getPaymentMethod().trim().isEmpty()) {
            errors.add("Payment method is required");
        }

        // Validate payment breakdown (primitives don't need null check)
        if (payment.getPrincipalPaid() < 0) {
            errors.add("Principal paid must be zero or greater");
        }

        if (payment.getInterestPaid() < 0) {
            errors.add("Interest paid must be zero or greater");
        }

        if (payment.getFeesPaid() < 0) {
            errors.add("Fees paid must be zero or greater");
        }

        // Verify payment breakdown sums to total
        double breakdown = payment.getPrincipalPaid() + payment.getInterestPaid() + payment.getFeesPaid();
        double fine = payment.getFine();
        
        if (Math.abs(breakdown + fine - payment.getAmountPaid()) > 0.01) {
            errors.add(String.format(
                "Payment breakdown (%.2f) does not match total amount (%.2f)",
                breakdown + fine, payment.getAmountPaid()
            ));
        }
    }

    /**
     * Validate loan status
     */
    private void validateLoanStatus(LoanDetails loan, List<String> errors) {
        if (loan.getLoanStatus() == null) {
            errors.add("Loan status is not set");
            return;
        }

        String status = loan.getLoanStatus().toLowerCase();

        if (status.equals("closed") || status.equals("fully_paid")) {
            errors.add("Cannot accept payment for a closed or fully paid loan");
        }

        if (status.equals("rejected") || status.equals("cancelled")) {
            errors.add("Cannot accept payment for a rejected or cancelled loan");
        }

        if (status.equals("pending") || status.equals("approved")) {
            errors.add("Loan must be disbursed before accepting payments");
        }
    }

    /**
     * Validate payment amount against loan outstanding balance
     */
    private void validatePaymentAmount(LoanPayments payment, LoanDetails loan, 
                                       List<String> errors, List<String> warnings) {
        
        // Calculate current outstanding balance
        List<LoanPayments> previousPayments = paymentsRepository.findByLoanId(loan.getId());
        double totalPaid = previousPayments.stream()
            .mapToDouble(LoanPayments::getAmountPaid).sum();

        double totalLoanAmount = loan.getTotalPayable();

        double outstandingBalance = totalLoanAmount - totalPaid;

        if (payment.getAmountPaid() > outstandingBalance + 100) { // Allow small buffer for rounding
            warnings.add(String.format(
                "Payment amount (%.2f) exceeds outstanding balance (%.2f). Overpayment of %.2f will be recorded.",
                payment.getAmountPaid(), outstandingBalance, payment.getAmountPaid() - outstandingBalance
            ));
        }
    }

    /**
     * Validate payment date
     */
    private void validatePaymentDate(LoanPayments payment, LoanDetails loan, 
                                      List<String> errors, List<String> warnings) {
        
        LocalDate paymentDate = payment.getPaymentDate();
        LocalDate today = LocalDate.now();

        // Payment date cannot be in the future
        if (paymentDate.isAfter(today)) {
            errors.add("Payment date cannot be in the future");
        }

        // Payment date cannot be before loan disbursement
        if (loan.getReleaseDate() != null && paymentDate.isBefore(loan.getReleaseDate())) {
            errors.add("Payment date cannot be before loan disbursement date");
        }

        // Warning for very old payments
        if (paymentDate.isBefore(today.minusMonths(6))) {
            warnings.add("Payment date is more than 6 months old. Verify this is correct.");
        }

        // Check if payment is on a future maturity date
        if (loan.getPaymentEndDate() != null && paymentDate.isAfter(loan.getPaymentEndDate())) {
            warnings.add("Payment date is after loan maturity date. Loan may be overdue.");
        }
    }

    /**
     * Validate against installment schedule
     */
    private void validateInstallmentSchedule(LoanPayments payment, LoanDetails loan,
                                             List<String> errors, List<String> warnings) {
        
        // Get installment schedule for the loan
        List<LoanInstallmentSchedule> schedule = installmentRepository.findByLoanIdOrderByInstallmentNumberAsc(loan.getId());

        if (schedule.isEmpty()) {
            warnings.add("No installment schedule found for this loan. Payment will be recorded but may not align with schedule.");
            return;
        }

        // If installment number is specified, validate it
        if (payment.getInstallmentNumber() != null) {
            Optional<LoanInstallmentSchedule> installmentOpt = schedule.stream()
                .filter(i -> i.getInstallmentNumber().equals(payment.getInstallmentNumber()))
                .findFirst();

            if (installmentOpt.isEmpty()) {
                errors.add("Invalid installment number: " + payment.getInstallmentNumber());
                return;
            }

            LoanInstallmentSchedule installment = installmentOpt.get();

            // Check if installment is already fully paid
            if (Boolean.TRUE.equals(installment.getIsPaid())) {
                warnings.add(String.format(
                    "Installment #%d is already marked as paid. This may be an additional payment.",
                    installment.getInstallmentNumber()
                ));
            }

            // Validate payment covers at least the scheduled amount
            double scheduledAmount = installment.getScheduledAmount();
            double alreadyPaid = installment.getPaidAmount() != null ? installment.getPaidAmount() : 0.0;
            double remaining = scheduledAmount - alreadyPaid;

            if (payment.getAmountPaid() < remaining - 0.01) {
                warnings.add(String.format(
                    "Payment amount (%.2f) is less than remaining installment amount (%.2f). This will be a partial payment.",
                    payment.getAmountPaid(), remaining
                ));
            }
        } else {
            // Find next unpaid installment
            Optional<LoanInstallmentSchedule> nextUnpaid = schedule.stream()
                .filter(i -> !Boolean.TRUE.equals(i.getIsPaid()))
                .min(Comparator.comparing(LoanInstallmentSchedule::getInstallmentNumber));

            if (nextUnpaid.isPresent()) {
                warnings.add(String.format(
                    "Installment number not specified. Payment will be applied to installment #%d",
                    nextUnpaid.get().getInstallmentNumber()
                ));
            }
        }
    }

    /**
     * Check for potential duplicate payments
     */
    private void validateDuplicatePayment(LoanPayments payment, List<String> warnings) {
        if (payment.getReferenceNumber() != null && !payment.getReferenceNumber().trim().isEmpty()) {
            // Check for existing payment with same reference number
            Optional<LoanPayments> existingPayment = paymentsRepository.findByReferenceNumber(
                payment.getReferenceNumber()
            );

            if (existingPayment.isPresent()) {
                warnings.add(String.format(
                    "A payment with reference number '%s' already exists. Verify this is not a duplicate.",
                    payment.getReferenceNumber()
                ));
            }
        }

        // Check for payments with same amount and date for this loan
        List<LoanPayments> sameAmountPayments = paymentsRepository.findByLoanId(payment.getLoanId())
        .stream()
        .filter(p -> p.getPaymentDate().equals(payment.getPaymentDate()))
        .filter(p -> Math.abs(p.getAmountPaid() - payment.getAmountPaid()) < 0.01)
        .toList();

        if (!sameAmountPayments.isEmpty()) {
            warnings.add(String.format(
                "A payment of similar amount (%.2f) was already recorded on %s. Verify this is not a duplicate.",
                payment.getAmountPaid(), payment.getPaymentDate()
            ));
        }
    }

    /**
     * Validate business rules
     */
    private void validateBusinessRules(LoanPayments payment, LoanDetails loan,
                                        List<String> errors, List<String> warnings) {
        
        Optional<LoanProduct> productOpt = loanProductRepository.findById(loan.getProductId());
        if (productOpt.isEmpty()) {
            return;
        }

        LoanProduct product = productOpt.get();

        // Validate grace period
        if (product.getDefaultGracePeriodDays() > 0) {
            if (payment.getInstallmentNumber() != null) {
                Optional<LoanInstallmentSchedule> installmentOpt = installmentRepository
                    .findByLoanIdAndInstallmentNumber(loan.getId(), payment.getInstallmentNumber());

                if (installmentOpt.isPresent()) {
                    LoanInstallmentSchedule installment = installmentOpt.get();
                    LocalDate dueDate = installment.getDueDate();
                    LocalDate gracePeriodEnd = dueDate.plusDays(product.getDefaultGracePeriodDays());

                    if (payment.getPaymentDate().isAfter(gracePeriodEnd)) {
                        warnings.add(String.format(
                            "Payment is being made after grace period ended on %s. Late fees may apply.",
                            gracePeriodEnd
                        ));
                    }
                }
            }
        }
    }

    /**
     * Validation result class
     */
    public static class ValidationResult {
        private final boolean valid;
        private final List<String> errors;
        private final List<String> warnings;

        public ValidationResult(boolean valid, List<String> errors, List<String> warnings) {
            this.valid = valid;
            this.errors = errors;
            this.warnings = warnings;
        }

        public boolean isValid() {
            return valid;
        }

        public List<String> getErrors() {
            return errors;
        }

        public List<String> getWarnings() {
            return warnings;
        }

        public Map<String, Object> toMap() {
            Map<String, Object> result = new HashMap<>();
            result.put("valid", valid);
            result.put("errors", errors);
            result.put("warnings", warnings);
            return result;
        }
    }
}
