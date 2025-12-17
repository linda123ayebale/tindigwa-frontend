package org.example.Controllers;

import org.example.Services.PaymentReceiptService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments/receipts")
@CrossOrigin(origins = "http://localhost:3000")
public class PaymentReceiptController {

    @Autowired
    private PaymentReceiptService receiptService;

    /**
     * Generate receipt for a payment
     */
    @GetMapping("/{paymentId}")
    public ResponseEntity<Map<String, Object>> getPaymentReceipt(@PathVariable Long paymentId) {
        try {
            System.out.println("Fetching receipt for payment ID: " + paymentId);
            Map<String, Object> receipt = receiptService.generateReceipt(paymentId);
            
            if (receipt.containsKey("error")) {
                System.out.println("Receipt generation failed: " + receipt.get("error"));
                return ResponseEntity.status(404).body(receipt);
            }
            
            System.out.println("Receipt generated successfully for payment ID: " + paymentId);
            return ResponseEntity.ok(receipt);
        } catch (Exception e) {
            System.err.println("Error generating receipt: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to generate receipt: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    /**
     * Get receipt by receipt number
     */
    @GetMapping("/number/{receiptNumber}")
    public ResponseEntity<Map<String, Object>> getReceiptByNumber(@PathVariable String receiptNumber) {
        Map<String, Object> receipt = receiptService.getReceiptByNumber(receiptNumber);
        
        if (receipt.containsKey("error")) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok(receipt);
    }

    /**
     * Get all receipts for a loan
     */
    @GetMapping("/loan/{loanId}")
    public ResponseEntity<Map<String, Object>> getLoanReceipts(@PathVariable Long loanId) {
        return ResponseEntity.ok(receiptService.getLoanReceipts(loanId));
    }

    /**
     * Get receipt summary statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getReceiptStatistics() {
        return ResponseEntity.ok(receiptService.getReceiptStatistics());
    }

    /**
     * Generate PDF receipt (future enhancement)
     */
    @GetMapping("/{paymentId}/pdf")
    public ResponseEntity<String> generatePDFReceipt(@PathVariable Long paymentId) {
        Map<String, Object> result = Map.of(
            "message", "PDF generation feature coming soon",
            "paymentId", paymentId
        );
        return ResponseEntity.ok("PDF generation not yet implemented");
    }

    /**
     * Email receipt to client (future enhancement)
     */
    @PostMapping("/{paymentId}/email")
    public ResponseEntity<Map<String, Object>> emailReceipt(
            @PathVariable Long paymentId,
            @RequestBody Map<String, String> emailRequest) {
        
        Map<String, Object> result = Map.of(
            "message", "Email notification feature coming soon",
            "paymentId", paymentId,
            "email", emailRequest.getOrDefault("email", "")
        );
        return ResponseEntity.ok(result);
    }
}
