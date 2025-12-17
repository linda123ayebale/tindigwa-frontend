package org.example.Controllers;

import org.example.Entities.LoanPayments;
import org.example.Services.PaymentValidationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments/validate")
@CrossOrigin(origins = "http://localhost:3000")
public class PaymentValidationController {

    @Autowired
    private PaymentValidationService validationService;

    /**
     * Validate a payment before processing
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> validatePayment(@RequestBody LoanPayments payment) {
        PaymentValidationService.ValidationResult result = validationService.validatePayment(payment);
        return ResponseEntity.ok(result.toMap());
    }

    /**
     * Quick validation endpoint with just essential fields
     */
    @PostMapping("/quick")
    public ResponseEntity<Map<String, Object>> quickValidate(
            @RequestParam Long loanId,
            @RequestParam Double amount) {
        
        // Create minimal payment object for validation
        LoanPayments payment = new LoanPayments();
        payment.setLoanId(loanId);
        payment.setAmountPaid(amount);
        payment.setPaymentDate(java.time.LocalDate.now());
        payment.setPaymentMethod("Unknown");  // Just for validation
        payment.setPrincipalPaid(0.0);
        payment.setInterestPaid(0.0);
        payment.setFeesPaid(0.0);
        
        PaymentValidationService.ValidationResult result = validationService.validatePayment(payment);
        return ResponseEntity.ok(result.toMap());
    }
}
