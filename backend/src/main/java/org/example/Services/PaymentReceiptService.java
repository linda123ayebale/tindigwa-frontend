package org.example.Services;

import org.example.Entities.LoanPayments;
import org.example.Entities.LoanDetails;
import org.example.Entities.LoanProduct;
import org.example.Entities.LoanInstallmentSchedule;
import org.example.Repositories.LoanPaymentsRepository;
import org.example.Repositories.LoanDetailsRepository;
import org.example.Repositories.LoanProductRepository;
import org.example.Repositories.LoanInstallmentScheduleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PaymentReceiptService {

    @Autowired
    private LoanPaymentsRepository paymentsRepository;

    @Autowired
    private LoanDetailsRepository loanDetailsRepository;

    @Autowired
    private LoanProductRepository loanProductRepository;

    @Autowired
    private LoanInstallmentScheduleRepository installmentRepository;

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd MMM yyyy");

    /**
     * Generate a complete payment receipt
     */
    public Map<String, Object> generateReceipt(Long paymentId) {
        try {
            System.out.println("PaymentReceiptService: Generating receipt for payment ID: " + paymentId);
            
            Optional<LoanPayments> paymentOpt = paymentsRepository.findById(paymentId);
            
            if (paymentOpt.isEmpty()) {
                System.out.println("PaymentReceiptService: Payment not found with ID: " + paymentId);
                return Map.of("error", "Payment not found");
            }

            LoanPayments payment = paymentOpt.get();
            System.out.println("PaymentReceiptService: Found payment - Amount: " + payment.getAmountPaid() + ", Loan ID: " + payment.getLoanId());
            
            Map<String, Object> receipt = new HashMap<>();

        // Receipt Header
        receipt.put("receiptNumber", generateReceiptNumber(payment));
        receipt.put("generatedDate", LocalDate.now().format(DATE_FORMAT));
        receipt.put("generatedTime", java.time.LocalTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss")));

        // Payment Information
        Map<String, Object> paymentInfo = new HashMap<>();
        paymentInfo.put("paymentId", payment.getId());
        paymentInfo.put("paymentDate", payment.getPaymentDate().format(DATE_FORMAT));
        paymentInfo.put("amountPaid", payment.getAmountPaid());
        paymentInfo.put("paymentMethod", payment.getPaymentMethod());
        paymentInfo.put("transactionReference", payment.getReferenceNumber());
        paymentInfo.put("installmentNumber", payment.getInstallmentNumber());
        paymentInfo.put("notes", payment.getNotes());
        receipt.put("payment", paymentInfo);

        // Payment Breakdown
        Map<String, Object> breakdown = new HashMap<>();
        breakdown.put("principalPaid", payment.getPrincipalPaid());
        breakdown.put("interestPaid", payment.getInterestPaid());
        breakdown.put("feesPaid", payment.getFeesPaid());
        breakdown.put("fine", payment.getFine());
        breakdown.put("totalPaid", payment.getAmountPaid());
        receipt.put("breakdown", breakdown);

        // Loan Information
        Optional<LoanDetails> loanOpt = loanDetailsRepository.findById(payment.getLoanId());
        if (loanOpt.isPresent()) {
            LoanDetails loan = loanOpt.get();
            Map<String, Object> loanInfo = new HashMap<>();
            loanInfo.put("loanId", loan.getId());
            loanInfo.put("loanNumber", loan.getLoanNumber());
            loanInfo.put("principalAmount", loan.getPrincipalAmount());
            loanInfo.put("interestRate", loan.getInterestRate());
            loanInfo.put("loanTerm", loan.getLoanDuration() + " " + loan.getDurationUnit());
            loanInfo.put("disbursementDate", loan.getReleaseDate() != null ? 
                loan.getReleaseDate().format(DATE_FORMAT) : null);
            loanInfo.put("maturityDate", loan.getPaymentEndDate() != null ? 
                loan.getPaymentEndDate().format(DATE_FORMAT) : null);
            loanInfo.put("loanStatus", loan.getLoanStatus());
            receipt.put("loan", loanInfo);

            // Loan Product Information
            if (loan.getProductId() != null) {
                Optional<LoanProduct> productOpt = loanProductRepository.findById(loan.getProductId());
                if (productOpt.isPresent()) {
                    LoanProduct product = productOpt.get();
                    Map<String, Object> productInfo = new HashMap<>();
                    productInfo.put("productName", product.getProductName());
                    productInfo.put("interestMethod", product.getInterestMethod());
                    productInfo.put("repaymentFrequency", product.getDefaultRepaymentFrequency());
                    receipt.put("loanProduct", productInfo);
                }
            }

            // Outstanding Balance
            receipt.put("outstandingBalance", payment.getOutstandingBalance());

            // Installment Status
            Optional<LoanInstallmentSchedule> installmentOpt = installmentRepository
                .findByLoanIdAndInstallmentNumber(loan.getId(), payment.getInstallmentNumber());
            
            if (installmentOpt.isPresent()) {
                LoanInstallmentSchedule installment = installmentOpt.get();
                Map<String, Object> installmentInfo = new HashMap<>();
                installmentInfo.put("dueDate", installment.getDueDate().format(DATE_FORMAT));
                installmentInfo.put("scheduledAmount", installment.getScheduledAmount());
                installmentInfo.put("outstandingAmount", installment.getOutstandingAmount());
                installmentInfo.put("status", installment.getStatus());
                installmentInfo.put("isPaid", installment.getIsPaid());
                installmentInfo.put("isLate", installment.getIsLate());
                installmentInfo.put("daysLate", installment.getDaysLate());
                receipt.put("installment", installmentInfo);
            }
        }

        // Payment Status
        Map<String, Object> status = new HashMap<>();
        status.put("isLate", payment.isLate());
        status.put("daysLate", payment.getDaysLate());
        if (payment.isLate() && payment.getDaysLate() > 0) {
            status.put("lateMessage", "Payment was " + payment.getDaysLate() + " day(s) late");
        }
        receipt.put("status", status);

        // Footer
        receipt.put("officialStamp", "Official Payment Receipt");
        receipt.put("notes", "Thank you for your payment. Keep this receipt for your records.");

        System.out.println("PaymentReceiptService: Receipt generated successfully");
        return receipt;
        
        } catch (Exception e) {
            System.err.println("PaymentReceiptService: Error generating receipt: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to generate receipt: " + e.getMessage());
            return error;
        }
    }

    /**
     * Generate a unique receipt number
     */
    private String generateReceiptNumber(LoanPayments payment) {
        // Format: RCP-YYYYMMDD-LOANID-PAYMENTID
        String datePart = payment.getPaymentDate().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        return String.format("RCP-%s-L%d-P%d", datePart, payment.getLoanId(), payment.getId());
    }

    /**
     * Get receipt by receipt number
     */
    public Map<String, Object> getReceiptByNumber(String receiptNumber) {
        // Parse receipt number to extract payment ID
        // Format: RCP-YYYYMMDD-LOANID-PAYMENTID
        try {
            String[] parts = receiptNumber.split("-");
            if (parts.length == 4) {
                String paymentIdStr = parts[3].substring(1); // Remove 'P' prefix
                Long paymentId = Long.parseLong(paymentIdStr);
                return generateReceipt(paymentId);
            }
        } catch (Exception e) {
            // Invalid format
        }
        
        return Map.of("error", "Invalid receipt number format");
    }

    /**
     * Get all receipts for a loan
     */
    public Map<String, Object> getLoanReceipts(Long loanId) {
        List<LoanPayments> payments = paymentsRepository.findByLoanId(loanId);
        
        List<Map<String, Object>> receipts = payments.stream()
            .map(payment -> {
                Map<String, Object> summary = new HashMap<>();
                summary.put("receiptNumber", generateReceiptNumber(payment));
                summary.put("paymentId", payment.getId());
                summary.put("paymentDate", payment.getPaymentDate().format(DATE_FORMAT));
                summary.put("amountPaid", payment.getAmountPaid());
                summary.put("paymentMethod", payment.getPaymentMethod());
                summary.put("installmentNumber", payment.getInstallmentNumber());
                summary.put("isLate", payment.isLate());
                return summary;
            })
            .collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("loanId", loanId);
        result.put("totalReceipts", receipts.size());
        result.put("receipts", receipts);
        result.put("totalAmountPaid", payments.stream().mapToDouble(LoanPayments::getAmountPaid).sum());

        return result;
    }

    /**
     * Get receipt statistics
     */
    public Map<String, Object> getReceiptStatistics() {
        List<LoanPayments> allPayments = paymentsRepository.findAll();
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalReceipts", allPayments.size());
        stats.put("totalAmountReceipted", allPayments.stream()
            .mapToDouble(LoanPayments::getAmountPaid).sum());
        
        // Group by payment method
        Map<String, Long> byMethod = allPayments.stream()
            .collect(Collectors.groupingBy(
                p -> p.getPaymentMethod() != null ? p.getPaymentMethod() : "Unknown",
                Collectors.counting()
            ));
        stats.put("receiptsByMethod", byMethod);
        
        // Recent receipts (last 10)
        List<Map<String, Object>> recent = allPayments.stream()
            .sorted(Comparator.comparing(LoanPayments::getPaymentDate).reversed())
            .limit(10)
            .map(payment -> Map.of(
                "receiptNumber", (Object) generateReceiptNumber(payment),
                "paymentDate", payment.getPaymentDate().format(DATE_FORMAT),
                "amount", payment.getAmountPaid(),
                "loanId", payment.getLoanId()
            ))
            .collect(Collectors.toList());
        stats.put("recentReceipts", recent);
        
        return stats;
    }
}
