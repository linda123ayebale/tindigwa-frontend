package org.example.Controllers;

import org.example.Entities.LoanPayments;
import org.example.Entities.LoanDetails;
import org.example.Services.LoanPaymentsService;
import org.example.Services.PaymentProcessingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class LoanPaymentsController {
    @Autowired
    private LoanPaymentsService service;

    // Enhanced Create - Basic payment creation
    @PostMapping
    public ResponseEntity<?> createPayment(@RequestBody LoanPayments payment) {
        try {
            LoanPayments createdPayment = service.createPayment(payment);
            return ResponseEntity.ok(createdPayment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }
    
    // Advanced payment processing with full calculation
    @PostMapping("/process")
    public ResponseEntity<?> processPayment(@RequestBody PaymentProcessingRequest request) {
        try {
            // Validate request
            if (request.getLoanId() == null || request.getAmount() <= 0) {
                return ResponseEntity.badRequest().body("{\"error\":\"Invalid payment request\"}");
            }
            
            // Create payment request
            PaymentProcessingService.PaymentRequest paymentRequest = new PaymentProcessingService.PaymentRequest(
                request.getLoanId(),
                request.getAmount(),
                request.getPaymentDate() != null ? request.getPaymentDate() : LocalDate.now(),
                request.getPaymentMethod()
            );
            
            paymentRequest.setReferenceNumber(request.getReferenceNumber());
            paymentRequest.setNotes(request.getNotes());
            paymentRequest.setCreatedBy(request.getCreatedBy());
            
            // Process payment
            PaymentProcessingService.PaymentResult result = service.processPayment(paymentRequest);
            
            if (result.isSuccess()) {
                return ResponseEntity.ok(result);
            } else {
                return ResponseEntity.badRequest().body("{\"error\":\"" + result.getMessage() + "\"}");
            }
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("{\"error\":\"Payment processing failed: " + e.getMessage() + "\"}");
        }
    }

    // Read all payments
    @GetMapping
    public List<LoanPayments> getAllPayments() {
        return service.getAllPayments();
    }
    
    // Get payments by loan ID
    @GetMapping("/loan/{loanId}")
    public List<LoanPayments> getPaymentsByLoan(@PathVariable Long loanId) {
        return service.getPaymentsByLoanId(loanId);
    }
    
    // Get payment history for a loan (chronological order)
    @GetMapping("/loan/{loanId}/history")
    public List<LoanPayments> getPaymentHistory(@PathVariable Long loanId) {
        return service.getPaymentHistory(loanId);
    }
    
    // Get payments by status
    @GetMapping("/status/{status}")
    public List<LoanPayments> getPaymentsByStatus(@PathVariable String status) {
        return service.getPaymentsByStatus(status);
    }
    
    // Get payments by method
    @GetMapping("/method/{method}")
    public List<LoanPayments> getPaymentsByMethod(@PathVariable String method) {
        return service.getPaymentsByMethod(method);
    }
    
    // Get payments in date range
    @GetMapping("/date-range")
    public List<LoanPayments> getPaymentsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return service.getPaymentsByDateRange(startDate, endDate);
    }
    
    // Get late payments
    @GetMapping("/late")
    public List<LoanPayments> getLatePayments() {
        return service.getLatePayments();
    }
    
    // Get partial payments
    @GetMapping("/partial")
    public List<LoanPayments> getPartialPayments() {
        return service.getPartialPayments();
    }
    
    // Get overpayments
    @GetMapping("/overpayments")
    public List<LoanPayments> getOverpayments() {
        return service.getOverpayments();
    }

    // Read payment by ID
    @GetMapping("/{id}")
    public ResponseEntity<LoanPayments> getPaymentById(@PathVariable Long id) {
        return service.getPaymentById(id)
                .map(payment -> ResponseEntity.ok(payment))
                .orElse(ResponseEntity.notFound().build());
    }
    
    // Get latest payment for loan
    @GetMapping("/loan/{loanId}/latest")
    public ResponseEntity<LoanPayments> getLatestPaymentForLoan(@PathVariable Long loanId) {
        return service.getLatestPaymentForLoan(loanId)
                .map(payment -> ResponseEntity.ok(payment))
                .orElse(ResponseEntity.notFound().build());
    }
    
    // Get payment by reference number
    @GetMapping("/reference/{referenceNumber}")
    public ResponseEntity<LoanPayments> getPaymentByReference(@PathVariable String referenceNumber) {
        return service.getPaymentByReference(referenceNumber)
                .map(payment -> ResponseEntity.ok(payment))
                .orElse(ResponseEntity.notFound().build());
    }

    // Update payment
    @PutMapping("/{id}")
    public ResponseEntity<?> updatePayment(@PathVariable Long id, @RequestBody LoanPayments payment) {
        try {
            LoanPayments updatedPayment = service.updatePayment(id, payment);
            return ResponseEntity.ok(updatedPayment);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }
    
    // Update payment status
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updatePaymentStatus(@PathVariable Long id, @RequestBody Map<String, String> statusUpdate) {
        try {
            String newStatus = statusUpdate.get("status");
            if (newStatus == null || newStatus.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("{\"error\":\"Status is required\"}");
            }
            
            LoanPayments updatedPayment = service.updatePaymentStatus(id, newStatus);
            return ResponseEntity.ok(updatedPayment);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }
    
    // Cancel payment (soft delete)
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<?> cancelPayment(@PathVariable Long id, @RequestBody Map<String, String> cancelRequest) {
        try {
            String reason = cancelRequest.get("reason");
            if (reason == null || reason.trim().isEmpty()) {
                reason = "Cancelled by user";
            }
            
            LoanPayments cancelledPayment = service.cancelPayment(id, reason);
            return ResponseEntity.ok(cancelledPayment);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }

    // Hard delete (use with caution)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePayment(@PathVariable Long id) {
        try {
            service.deletePayment(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }
    
    // FINANCIAL SUMMARY ENDPOINTS
    
    // Get payment summary for loan
    @GetMapping("/loan/{loanId}/summary")
    public ResponseEntity<PaymentProcessingService.PaymentSummary> getPaymentSummary(@PathVariable Long loanId) {
        PaymentProcessingService.PaymentSummary summary = service.getPaymentSummary(loanId);
        return ResponseEntity.ok(summary);
    }
    
    // Get loan balance with detailed breakdown
    @GetMapping("/loan/{loanId}/balance")
    public ResponseEntity<?> getLoanBalance(@PathVariable Long loanId) {
        PaymentProcessingService.LoanBalance balance = service.getLoanBalance(loanId);
        if (balance == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(balance);
    }
    
    // Get total paid for loan
    @GetMapping("/loan/{loanId}/total-paid")
    public ResponseEntity<Double> getTotalPaidForLoan(@PathVariable Long loanId) {
        Double totalPaid = service.getTotalPaidForLoan(loanId);
        return ResponseEntity.ok(totalPaid != null ? totalPaid : 0.0);
    }
    
    // Get outstanding balance for loan
    @GetMapping("/loan/{loanId}/outstanding")
    public ResponseEntity<Double> getOutstandingBalance(@PathVariable Long loanId) {
        Double outstanding = service.getOutstandingBalance(loanId);
        return ResponseEntity.ok(outstanding != null ? outstanding : 0.0);
    }
    
    // Check if loan has payments
    @GetMapping("/loan/{loanId}/has-payments")
    public ResponseEntity<Boolean> hasPayments(@PathVariable Long loanId) {
        boolean hasPayments = service.hasPayments(loanId);
        return ResponseEntity.ok(hasPayments);
    }
    
    // UPCOMING PAYMENTS & ANALYTICS
    
    // Get upcoming due payments (next 7, 14, or 30 days)
    @GetMapping("/upcoming")
    public ResponseEntity<?> getUpcomingPayments(
            @RequestParam(required = false, defaultValue = "7") int days) {
        try {
            LocalDate startDate = LocalDate.now();
            LocalDate endDate = startDate.plusDays(days);
            List<LoanPayments> upcomingPayments = service.getPaymentsByDateRange(startDate, endDate);
            return ResponseEntity.ok(upcomingPayments);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body("{\"error\":\"Failed to fetch upcoming payments: " + e.getMessage() + "\"}");
        }
    }
    
    // NOTE: Analytics endpoints moved to PaymentAnalyticsController
    // to avoid duplicate mappings and maintain separation of concerns
    
    // Legacy payment analytics endpoint - redirects to dedicated analytics controller
    @GetMapping("/analytics")
    public ResponseEntity<?> getPaymentAnalytics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            if (startDate == null) startDate = LocalDate.now().minusMonths(1);
            if (endDate == null) endDate = LocalDate.now();
            
            List<LoanPayments> payments = service.getPaymentsByDateRange(startDate, endDate);
            
            // Calculate analytics
            double totalAmount = payments.stream()
                .mapToDouble(p -> p.getAmountPaid())
                .sum();
            
            long totalCount = payments.size();
            long lateCount = payments.stream().filter(p -> p.isLate()).count();
            long onTimeCount = totalCount - lateCount;
            
            // Group by payment method
            Map<String, Long> byMethod = payments.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                    p -> p.getPaymentMethod() != null ? p.getPaymentMethod() : "Unknown",
                    java.util.stream.Collectors.counting()
                ));
            
            // Group by status
            Map<String, Long> byStatus = payments.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                    p -> p.getPaymentStatus() != null ? p.getPaymentStatus() : "Unknown",
                    java.util.stream.Collectors.counting()
                ));
            
            Map<String, Object> analytics = new java.util.HashMap<>();
            analytics.put("totalAmount", totalAmount);
            analytics.put("totalCount", totalCount);
            analytics.put("lateCount", lateCount);
            analytics.put("onTimeCount", onTimeCount);
            analytics.put("latePercentage", totalCount > 0 ? (lateCount * 100.0 / totalCount) : 0);
            analytics.put("onTimePercentage", totalCount > 0 ? (onTimeCount * 100.0 / totalCount) : 0);
            analytics.put("byPaymentMethod", byMethod);
            analytics.put("byStatus", byStatus);
            analytics.put("averagePayment", totalCount > 0 ? totalAmount / totalCount : 0);
            analytics.put("startDate", startDate);
            analytics.put("endDate", endDate);
            
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body("{\"error\":\"Failed to generate analytics: " + e.getMessage() + "\"}");
        }
    }
    
    // VALIDATION ENDPOINTS
    
    // Validate payment amount
    @GetMapping("/loan/{loanId}/validate-amount/{amount}")
    public ResponseEntity<Boolean> validatePaymentAmount(@PathVariable Long loanId, @PathVariable double amount) {
        boolean isValid = service.isValidPaymentAmount(loanId, amount);
        return ResponseEntity.ok(isValid);
    }
    
    // Validate payment date
    @GetMapping("/validate-date")
    public ResponseEntity<Boolean> validatePaymentDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate paymentDate) {
        boolean isValid = service.isValidPaymentDate(paymentDate);
        return ResponseEntity.ok(isValid);
    }
    
    // Payment processing request DTO
    public static class PaymentProcessingRequest {
        private Long loanId;
        private double amount;
        private LocalDate paymentDate;
        private String paymentMethod;
        private String referenceNumber;
        private String notes;
        private Long createdBy;

        // Getters and Setters
        public Long getLoanId() { return loanId; }
        public void setLoanId(Long loanId) { this.loanId = loanId; }
        public double getAmount() { return amount; }
        public void setAmount(double amount) { this.amount = amount; }
        public LocalDate getPaymentDate() { return paymentDate; }
        public void setPaymentDate(LocalDate paymentDate) { this.paymentDate = paymentDate; }
        public String getPaymentMethod() { return paymentMethod; }
        public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
        public String getReferenceNumber() { return referenceNumber; }
        public void setReferenceNumber(String referenceNumber) { this.referenceNumber = referenceNumber; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
        public Long getCreatedBy() { return createdBy; }
        public void setCreatedBy(Long createdBy) { this.createdBy = createdBy; }
    }
    
    // NEW ENDPOINTS for workflow-compliant payment operations
    
    /**
     * Reverse a payment - sets status to REVERSED
     */
    @PostMapping("/{id}/reverse")
    public ResponseEntity<?> reversePayment(
        @PathVariable Long id,
        @RequestBody(required = false) java.util.Map<String, Object> requestBody) {
        try {
            Long reversedById = 1L; // Default
            String reason = "Payment reversed by admin";
            
            if (requestBody != null) {
                if (requestBody.containsKey("reversedBy")) {
                    Object reversedByObj = requestBody.get("reversedBy");
                    if (reversedByObj instanceof Number) {
                        reversedById = ((Number) reversedByObj).longValue();
                    }
                }
                if (requestBody.containsKey("reason")) {
                    reason = requestBody.get("reason").toString();
                }
            }
            
            LoanPayments reversedPayment = service.reversePayment(id, reversedById, reason);
            return ResponseEntity.ok(reversedPayment);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.status(409).body(java.util.Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(java.util.Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Record a new payment with tracking updates and WebSocket notifications
     */
    @PostMapping("/record")
    public ResponseEntity<?> recordPayment(@RequestBody java.util.Map<String, Object> requestBody) {
        try {
            // Extract and validate parameters
            if (!requestBody.containsKey("loanId") || !requestBody.containsKey("amountPaid")) {
                return ResponseEntity.badRequest().body(java.util.Map.of("error", "loanId and amountPaid are required"));
            }
            
            Long loanId = ((Number) requestBody.get("loanId")).longValue();
            double amountPaid = ((Number) requestBody.get("amountPaid")).doubleValue();
            
            // Parse payment date
            LocalDate paymentDate = LocalDate.now();
            if (requestBody.containsKey("paymentDate")) {
                paymentDate = LocalDate.parse(requestBody.get("paymentDate").toString());
            }
            
            String paymentMethod = requestBody.getOrDefault("paymentMethod", "CASH").toString();
            String referenceNumber = requestBody.getOrDefault("referenceNumber", "").toString();
            String notes = requestBody.getOrDefault("notes", "").toString();
            
            LoanPayments recordedPayment = service.recordPayment(
                loanId, amountPaid, paymentDate, paymentMethod, referenceNumber, notes
            );
            
            return ResponseEntity.ok(recordedPayment);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(java.util.Map.of("error", "Failed to record payment: " + e.getMessage()));
        }
    }
    
    /**
     * Get payment receipt - always allowed
     */
    @GetMapping("/{id}/receipt")
    public ResponseEntity<?> getPaymentReceipt(@PathVariable Long id) {
        try {
            LoanPayments payment = service.getPaymentById(id)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found with id: " + id));
            
            // Get loan details for receipt
            LoanDetails loan = service.getLoanDetailsByPaymentId(id);
            
            java.util.Map<String, Object> receipt = new java.util.HashMap<>();
            receipt.put("paymentId", payment.getId());
            receipt.put("paymentNumber", payment.getPaymentNumber());
            receipt.put("paymentDate", payment.getPaymentDate());
            receipt.put("amountPaid", payment.getAmountPaid());
            receipt.put("paymentMethod", payment.getPaymentMethod());
            receipt.put("referenceNumber", payment.getReferenceNumber());
            receipt.put("paymentStatus", payment.getPaymentStatus());
            receipt.put("notes", payment.getNotes());
            
            if (loan != null) {
                receipt.put("loanNumber", loan.getLoanNumber());
                receipt.put("clientId", loan.getClientId());
                receipt.put("principalAmount", loan.getPrincipalAmount());
            }
            
            receipt.put("generatedAt", java.time.LocalDateTime.now());
            
            return ResponseEntity.ok(receipt);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(java.util.Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Edit payment - only allowed when status = RECORDED
     */
    @PutMapping("/{id}/edit")
    public ResponseEntity<?> editPayment(
        @PathVariable Long id,
        @RequestBody java.util.Map<String, Object> updates) {
        try {
            LoanPayments payment = service.getPaymentById(id)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found with id: " + id));
            
            // Guard: Only RECORDED payments can be edited
            if (!"RECORDED".equalsIgnoreCase(payment.getPaymentStatus())) {
                return ResponseEntity.status(409)
                    .body(java.util.Map.of("error", "Can only edit payments with status RECORDED. Current status: " + payment.getPaymentStatus()));
            }
            
            // Update allowed fields
            if (updates.containsKey("amountPaid")) {
                payment.setAmountPaid(((Number) updates.get("amountPaid")).doubleValue());
            }
            if (updates.containsKey("paymentDate")) {
                payment.setPaymentDate(java.time.LocalDate.parse(updates.get("paymentDate").toString()));
            }
            if (updates.containsKey("paymentMethod")) {
                payment.setPaymentMethod(updates.get("paymentMethod").toString());
            }
            if (updates.containsKey("referenceNumber")) {
                payment.setReferenceNumber(updates.get("referenceNumber").toString());
            }
            if (updates.containsKey("notes")) {
                payment.setNotes(updates.get("notes").toString());
            }
            
            payment.setUpdatedAt(java.time.LocalDateTime.now());
            LoanPayments updatedPayment = service.updatePayment(id, payment);
            
            return ResponseEntity.ok(updatedPayment);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(java.util.Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Soft delete payment - only allowed when status = RECORDED and no financial impact
     */
    @DeleteMapping("/{id}/soft-delete")
    public ResponseEntity<?> softDeletePayment(@PathVariable Long id) {
        try {
            LoanPayments payment = service.getPaymentById(id)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found with id: " + id));
            
            // Guard: Only RECORDED payments can be deleted
            if (!"RECORDED".equalsIgnoreCase(payment.getPaymentStatus())) {
                return ResponseEntity.status(409)
                    .body(java.util.Map.of("error", "Can only delete payments with status RECORDED. Current status: " + payment.getPaymentStatus()));
            }
            
            // Soft delete - mark as CANCELLED
            payment.setPaymentStatus("CANCELLED");
            payment.setNotes((payment.getNotes() != null ? payment.getNotes() + " | " : "") + "CANCELLED/DELETED");
            payment.setUpdatedAt(java.time.LocalDateTime.now());
            service.updatePayment(id, payment);
            
            return ResponseEntity.ok(java.util.Map.of("message", "Payment deleted successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(java.util.Map.of("error", e.getMessage()));
        }
    }
}
