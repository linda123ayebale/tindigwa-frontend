package org.example.Controllers;

import org.example.DTO.LoanDetailsResponse;
import org.example.DTO.LoanResponse;
import org.example.DTO.CompleteLoanDetailsResponse;
import org.example.Entities.Person;
import org.example.Entities.LoanTracking;
import org.example.Entities.LoanPayments;
import org.example.Entities.User;
import org.example.Mappers.LoanMapper;
import org.example.Repositories.UserRepository;
import org.example.Repositories.LoanPaymentsRepository;
import org.example.Repositories.LoanTrackingRepository;
import org.example.Services.LoanTrackingService;
import org.example.Mappers.PersonMapper;
import org.example.DTO.UserProfileDTO;
import org.example.DTO.EnhancedCompleteLoanResponse;


import org.example.Entities.LoanDetails;
import org.example.Services.LoanDetailsService;
import org.example.Services.LoanWorkflowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fasterxml.jackson.databind.SerializationFeature;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;
import java.util.Optional;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/loans")

public class LoanDetailsController {
    private final LoanDetailsService loanDetailsService;
    private final LoanWorkflowService loanWorkflowService;
    
    @Autowired
    private LoanTrackingService loanTrackingService;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private LoanMapper loanMapper;
    
    @Autowired
    private LoanPaymentsRepository loanPaymentsRepository;
    
    @Autowired
    private LoanTrackingRepository loanTrackingRepository;
    
    @Autowired
    private PersonMapper personMapper;

    @Autowired
    public LoanDetailsController(LoanDetailsService loanDetailsService, LoanWorkflowService loanWorkflowService) {
        this.loanDetailsService = loanDetailsService;
        this.loanWorkflowService = loanWorkflowService;
    }

    // Get all approved loans (main loans list) - now returns DTOs
    @GetMapping
    public ResponseEntity<List<LoanResponse>> getAllLoans() {
        List<LoanResponse> loans = loanWorkflowService.getApprovedLoans();
        return ResponseEntity.ok(loans);
    }
    
    // Get approved loans for enhanced table view
    @GetMapping("/table-view")
    public List<org.example.dto.LoanTableViewDTO> getLoansForTableView() {
        return loanDetailsService.getApprovedLoansForTableView();
    }
    
    // Get rejected loans - now returns DTOs
    @GetMapping("/rejected")
    public ResponseEntity<List<LoanResponse>> getRejectedLoans() {
        List<LoanResponse> loans = loanWorkflowService.getRejectedLoans();
        return ResponseEntity.ok(loans);
    }
    
    // Get rejected loans for table view
    @GetMapping("/rejected/table-view")
    public List<org.example.dto.LoanTableViewDTO> getRejectedLoansForTableView() {
        return loanDetailsService.getRejectedLoansForTableView();
    }
    
    // Get sample loans for testing (temporary endpoint)
    @GetMapping("/table-view/sample")
    public List<org.example.dto.LoanTableViewDTO> getSampleLoansForTableView() {
        return loanDetailsService.getSampleLoansForTableView();
    }
    
    // Admin endpoint: Get all loans regardless of workflow status - returns DTOs
    @GetMapping("/admin/all")
    public ResponseEntity<List<LoanResponse>> getAllLoansForAdmin() {
        List<LoanResponse> loans = loanDetailsService.getAllLoansDTO();
        return ResponseEntity.ok(loans);
    }
    
    // Admin endpoint: Get all loans for table view regardless of status
    @GetMapping("/admin/table-view")
    public List<org.example.dto.LoanTableViewDTO> getAllLoansForTableViewAdmin() {
        return loanDetailsService.getLoansForTableView();
    }

    @PostMapping
    public ResponseEntity<?> createLoan(@RequestBody Object requestBody) {
        try {
            LoanDetails loanToCreate;
            Long loanOfficerId;
            
            // Try to handle both new format (LoanCreateRequest) and legacy format (LoanDetails)
            if (requestBody instanceof LoanDetails) {
                // Legacy format - direct LoanDetails object
                loanToCreate = (LoanDetails) requestBody;
                loanOfficerId = 1L; // Default loan officer ID for legacy requests
            } else {
                // Try to parse as LoanCreateRequest
                    try {
                        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                        mapper.registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());
                        mapper.disable(com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
                        LoanCreateRequest request = mapper.convertValue(requestBody, LoanCreateRequest.class);
                    
                    if (request.getLoan() == null) {
                        return ResponseEntity.badRequest().body("{\"error\":\"Loan details are required\"}");
                    }
                    if (request.getLoanOfficerId() == null) {
                        return ResponseEntity.badRequest().body("{\"error\":\"Loan officer ID is required for new format\"}");
                    }
                    
                    loanToCreate = request.getLoan();
                    loanOfficerId = request.getLoanOfficerId();
                } catch (Exception e) {
                    // If neither format works, try direct LoanDetails conversion with loanOfficerId extraction
                    try {
                        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                        mapper.registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());
                        mapper.disable(com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
                        
                        // First, try to extract loanOfficerId from the request body
                        if (requestBody instanceof java.util.Map) {
                            java.util.Map<String, Object> requestMap = (java.util.Map<String, Object>) requestBody;
                            Object loanOfficerIdObj = requestMap.get("loanOfficerId");
                            
                            if (loanOfficerIdObj != null) {
                                if (loanOfficerIdObj instanceof Number) {
                                    loanOfficerId = ((Number) loanOfficerIdObj).longValue();
                                } else {
                                    loanOfficerId = Long.parseLong(loanOfficerIdObj.toString());
                                }
                            } else {
                                loanOfficerId = 1L; // Default loan officer ID
                            }
                        } else {
                            loanOfficerId = 1L; // Default loan officer ID
                        }
                        
                        // Convert to LoanDetails (Jackson will ignore unknown fields like loanOfficerId)
                        loanToCreate = mapper.convertValue(requestBody, LoanDetails.class);
                        
                    } catch (Exception ex) {
                        System.err.println("JSON parsing error - LoanCreateRequest: " + e.getMessage());
                        System.err.println("JSON parsing error - LoanDetails: " + ex.getMessage());
                        System.err.println("Request body: " + requestBody.toString());
                        return ResponseEntity.badRequest().body("{\"error\":\"Invalid request format. Expected LoanDetails or LoanCreateRequest. Details: " + ex.getMessage() + "\"}");
                    }
                }
            }
            
            // Create loan using workflow service
            LoanDetails loan = loanWorkflowService.createLoanByOfficer(loanToCreate, loanOfficerId);
            LoanDetailsResponse response = loanMapper.toLoanDetailsResponse(loan);
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("{\"error\":\"" + e.getMessage() + "\"}");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("{\"error\":\"Internal server error: " + e.getMessage() + "\"}");
        }
    }
    
    // Legacy endpoint for backward compatibility
    @PostMapping("/legacy")
    public ResponseEntity<?> createLoanLegacy(@RequestBody LoanDetails loanDetails) {
        try {
            // Use system default - the workflow service will find an available loan officer automatically
            Long defaultLoanOfficerId = 1L;
            
            LoanDetails loan = loanWorkflowService.createLoanByOfficer(loanDetails, defaultLoanOfficerId);
            LoanDetailsResponse response = loanMapper.toLoanDetailsResponse(loan);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("{\"error\":\"" + e.getMessage() + "\"}");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("{\"error\":\"Internal server error: " + e.getMessage() + "\"}");
        }
    }
    
    // Check if client is a first-time borrower (for registration fee calculation)
    @GetMapping("/client/{clientId}/is-first-time")
    public ResponseEntity<Map<String, Object>> isFirstTimeBorrower(@PathVariable Long clientId) {
        try {
            long loanCount = loanDetailsService.countLoansByClient(clientId);
            boolean isFirstTime = (loanCount == 0);
            
            Map<String, Object> response = new HashMap<>();
            response.put("clientId", clientId);
            response.put("isFirstTime", isFirstTime);
            response.put("loanCount", loanCount);
            response.put("message", isFirstTime ? "First-time borrower - registration fee applicable" : "Returning client - registration fee waived");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Error checking client status: " + e.getMessage()));
        }
    }
    
    // Get single loan details - returns full DTO
    @GetMapping("/{id}")
    public ResponseEntity<LoanDetailsResponse> getLoan(@PathVariable Long id) {
        LoanDetails loan = loanDetailsService.getLoanById(id)
                .orElseThrow(() -> new RuntimeException("Loan not found with id: " + id));
        LoanDetailsResponse response = loanMapper.toLoanDetailsResponse(loan);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get comprehensive loan details with unified person representation
     * Uses PersonMapper to convert all person entities to UserProfileDTO
     * Returns complete data without N/A placeholders
     * 
     * @param id Loan ID
     * @return Enhanced complete loan response with all related data
     */
    @GetMapping("/{id}/complete")
    public ResponseEntity<?> getCompleteLoanDetails(@PathVariable Long id) {
        try {
            // 1️⃣ Find the loan - return 404 if not exists
            Optional<LoanDetails> optionalLoan = loanDetailsService.getLoanById(id);
            if (optionalLoan.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                        "error", "Loan not found",
                        "message", "No loan exists with ID " + id
                    ));
            }

            LoanDetails loan = optionalLoan.get();
            Map<String, Object> response = new HashMap<>();
            
            // Add loan data
            response.put("loan", loan);

            // 2️⃣ Get client info using PersonMapper
            UserProfileDTO client = null;
            if (loan.getClientId() != null) {
                Optional<User> clientOpt = userRepository.findById(loan.getClientId());
                client = clientOpt.map(u -> personMapper.toUserProfile(u, "Client"))
                    .orElse(personMapper.toUserProfile((User) null, "Client"));
            } else {
                client = personMapper.toUserProfile((User) null, "Client");
            }
            response.put("client", client);

            // 3️⃣ Get loan officer info using PersonMapper
            UserProfileDTO loanOfficer = null;
            if (loan.getCreatedById() != null) {
                Optional<User> officerOpt = userRepository.findById(loan.getCreatedById());
                loanOfficer = officerOpt.map(u -> personMapper.toUserProfile(u, "Loan Officer"))
                    .orElse(personMapper.toUserProfile((User) null, "Loan Officer"));
            } else {
                loanOfficer = personMapper.toUserProfile((User) null, "Loan Officer");
            }
            response.put("loanOfficer", loanOfficer);

            // 4️⃣ Get guarantors and next of kin (if client user exists)
            List<UserProfileDTO> guarantors = new ArrayList<>();
            List<UserProfileDTO> nextOfKin = new ArrayList<>();
            
            if (loan.getClientId() != null) {
                userRepository.findById(loan.getClientId()).ifPresent(clientUser -> {
                    if (clientUser.getGuarantor() != null) {
                        guarantors.add(personMapper.toUserProfile(clientUser.getGuarantor()));
                    }
                    if (clientUser.getNextOfKin() != null) {
                        nextOfKin.add(personMapper.toUserProfile(clientUser.getNextOfKin()));
                    }
                });
            }
            response.put("guarantors", guarantors);
            response.put("nextOfKin", nextOfKin);

            // 5️⃣ Get payments with enhanced user info
            List<EnhancedCompleteLoanResponse.PaymentDTO> payments = new ArrayList<>();
            try {
                List<LoanPayments> paymentEntities = loanPaymentsRepository.findByLoanIdOrderByPaymentDateDesc(loan.getId());
                for (LoanPayments payment : paymentEntities) {
                    String recordedBy = "Unknown";
                    if (payment.getCreatedBy() != null) {
                        Optional<User> userOpt = userRepository.findById(payment.getCreatedBy());
                        recordedBy = userOpt.map(User::getFullName).orElse("User #" + payment.getCreatedBy());
                    }
                    
                    payments.add(EnhancedCompleteLoanResponse.PaymentDTO.builder()
                        .id(payment.getId())
                        .paymentNumber(payment.getPaymentNumber())
                        .paymentDate(payment.getPaymentDate())
                        .amountPaid(payment.getAmountPaid())
                        .paymentMethod(payment.getPaymentMethod())
                        .referenceNumber(payment.getReferenceNumber())
                        .notes(payment.getNotes())
                        .principalPaid(payment.getPrincipalPaid())
                        .interestPaid(payment.getInterestPaid())
                        .feesPaid(payment.getFeesPaid())
                        .fine(payment.getFine())
                        .outstandingBalance(payment.getOutstandingBalance())
                        .paymentStatus(payment.getPaymentStatus())
                        .late(payment.isLate())
                        .daysLate(payment.getDaysLate())
                        .recordedBy(recordedBy)
                        .createdAt(payment.getCreatedAt())
                        .build());
                }
            } catch (Exception e) {
                System.err.println("Warning: Could not fetch payments for loan " + id + ": " + e.getMessage());
            }
            response.put("payments", payments);

            // 6️⃣ Get tracking data
            LoanTracking tracking = null;
            try {
                Optional<LoanTracking> trackingOpt = loanTrackingRepository.findByLoanId(id);
                tracking = trackingOpt.orElse(null);
                response.put("tracking", tracking);
            } catch (Exception e) {
                System.err.println("Warning: Could not fetch tracking for loan " + id + ": " + e.getMessage());
                response.put("tracking", null);
            }

            // 7️⃣ Get workflow history with complete user names
            try {
                List<EnhancedCompleteLoanResponse.WorkflowEventDTO> workflowHistory = buildEnhancedWorkflowHistory(loan);
                response.put("workflowHistory", workflowHistory);
            } catch (Exception e) {
                System.err.println("Warning: Could not build workflow history for loan " + id + ": " + e.getMessage());
                response.put("workflowHistory", new ArrayList<>());
            }

            // 8️⃣ Build comprehensive financial summary
            try {
                buildFinancialSummary(response, loan, tracking, payments);
            } catch (Exception e) {
                System.err.println("Warning: Could not build financial summary for loan " + id + ": " + e.getMessage());
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("❌ Error fetching complete loan details for ID " + id + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "error", "Failed to fetch complete loan details",
                    "message", e.getMessage() != null ? e.getMessage() : "Unknown error",
                    "loanId", id
                ));
        }
    }
    
    /**
     * Build enhanced workflow history with complete user names from database
     * Returns full names instead of "User #1" placeholders
     */
    private List<EnhancedCompleteLoanResponse.WorkflowEventDTO> buildEnhancedWorkflowHistory(LoanDetails loan) {
        List<EnhancedCompleteLoanResponse.WorkflowEventDTO> history = new ArrayList<>();
        
        try {
            // Loan created
            if (loan.getCreatedAt() != null) {
                String creatorName = "System";
                if (loan.getCreatedById() != null) {
                    creatorName = userRepository.findById(loan.getCreatedById())
                        .map(User::getFullName)
                        .orElse("Unknown");
                }
                
                history.add(EnhancedCompleteLoanResponse.WorkflowEventDTO.builder()
                    .action("CREATED")
                    .performedBy(creatorName)
                    .timestamp(loan.getCreatedAt())
                    .notes("Loan application created")
                    .build());
            }
            
            // Loan approved
            if (loan.getApprovalDate() != null && ("APPROVED".equals(loan.getWorkflowStatus()) || "DISBURSED".equals(loan.getWorkflowStatus()))) {
                String approverName = "Unknown";
                if (loan.getApprovedById() != null) {
                    approverName = userRepository.findById(loan.getApprovedById())
                        .map(User::getFullName)
                        .orElse("Unknown");
                }
                
                history.add(EnhancedCompleteLoanResponse.WorkflowEventDTO.builder()
                    .action("APPROVED")
                    .performedBy(approverName)
                    .timestamp(loan.getApprovalDate())
                    .notes("Loan approved")
                    .build());
            }
            
            // Loan rejected
            if ("REJECTED".equals(loan.getWorkflowStatus())) {
                String rejectorName = "Unknown";
                if (loan.getRejectedById() != null) {
                    rejectorName = userRepository.findById(loan.getRejectedById())
                        .map(User::getFullName)
                        .orElse("Unknown");
                }
                
                history.add(EnhancedCompleteLoanResponse.WorkflowEventDTO.builder()
                    .action("REJECTED")
                    .performedBy(rejectorName)
                    .timestamp(loan.getUpdatedAt() != null ? loan.getUpdatedAt() : loan.getCreatedAt())
                    .notes(loan.getRejectionReason() != null ? loan.getRejectionReason() : "Loan rejected")
                    .build());
            }
            
            // Loan disbursed
            if (loan.getDisbursedAt() != null) {
                String disburserName = "Unknown";
                // Note: disbursedBy is currently a string field, not ID
                // If it becomes an ID in the future, resolve it like the others
                if (loan.getDisbursedBy() != null && !loan.getDisbursedBy().isEmpty()) {
                    disburserName = loan.getDisbursedBy();
                }
                
                history.add(EnhancedCompleteLoanResponse.WorkflowEventDTO.builder()
                    .action("DISBURSED")
                    .performedBy(disburserName)
                    .timestamp(loan.getDisbursedAt())
                    .notes("Loan disbursed to client")
                    .build());
            }
        } catch (Exception e) {
            System.err.println("Warning: Error building enhanced workflow history: " + e.getMessage());
        }
        
        return history;
    }

    // Update loan - returns DTO
    @PutMapping("/{id}")
    public ResponseEntity<LoanDetailsResponse> updateLoan(@PathVariable Long id, @RequestBody LoanDetails loan) {
        LoanDetails updatedLoan = loanDetailsService.updateLoan(id, loan);
        LoanDetailsResponse response = loanMapper.toLoanDetailsResponse(updatedLoan);
        return ResponseEntity.ok(response);
    }
    
    // Delete loan
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteLoan(@PathVariable Long id) {
        try {
            loanDetailsService.deleteLoan(id);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }

    // Retrieve all loans by lending branch - returns DTOs
    @GetMapping("/branch/{branch}")
    public ResponseEntity<List<LoanResponse>> getLoansByBranch(@PathVariable String branch) {
        List<LoanResponse> loans = loanDetailsService.getLoansByBranchDTO(branch);
        return ResponseEntity.ok(loans);
    }
    
    // WORKFLOW ENDPOINTS
    
    // Get loans pending approval (for cashiers)
    @GetMapping("/pending-approval")
    public ResponseEntity<List<LoanResponse>> getLoansPendingApproval() {
        List<LoanResponse> loans = loanWorkflowService.getLoansPendingApproval();
        return ResponseEntity.ok(loans);
    }
    
    // Get approved loans
    @GetMapping("/approved")
    public ResponseEntity<List<LoanResponse>> getApprovedLoans() {
        List<LoanResponse> loans = loanWorkflowService.getApprovedLoans();
        return ResponseEntity.ok(loans);
    }
    
    // Get loans created by a specific loan officer - returns DTOs
    @GetMapping("/created-by/{loanOfficerId}")
    public ResponseEntity<List<LoanResponse>> getLoansByCreator(@PathVariable Long loanOfficerId) {
        List<LoanResponse> loans = loanWorkflowService.getLoansByCreator(loanOfficerId);
        return ResponseEntity.ok(loans);
    }
    
    // Get loans processed by a specific cashier - returns DTOs
    @GetMapping("/processed-by/{cashierId}")
    public ResponseEntity<List<LoanResponse>> getLoansProcessedBy(@PathVariable Long cashierId) {
        List<LoanResponse> loans = loanWorkflowService.getLoansProcessedBy(cashierId);
        return ResponseEntity.ok(loans);
    }
    
    // Old approve/reject endpoints - DISABLED to avoid ambiguous mapping with new workflow endpoints
    // Use the new endpoints with proper guards in the NEW WORKFLOW ENDPOINTS section instead
    
    // Get workflow summary for a loan
    @GetMapping("/{loanId}/workflow")
    public ResponseEntity<LoanWorkflowService.LoanWorkflowSummary> getWorkflowSummary(@PathVariable Long loanId) {
        try {
            LoanWorkflowService.LoanWorkflowSummary summary = loanWorkflowService.getWorkflowSummary(loanId);
            return ResponseEntity.ok(summary);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    // Check if user can modify a loan
    @GetMapping("/{loanId}/can-modify/{userId}")
    public ResponseEntity<Boolean> canModifyLoan(@PathVariable Long loanId, @PathVariable Long userId) {
        boolean canModify = loanWorkflowService.canModifyLoan(loanId, userId);
        return ResponseEntity.ok(canModify);
    }
    
    // Admin endpoint: Recalculate totalPayable for all loans that have zero totalPayable
    @PostMapping("/admin/recalculate-balances")
    public ResponseEntity<?> recalculateBalances() {
        try {
            int updated = loanDetailsService.recalculateTotalPayableForAllLoans();
            return ResponseEntity.ok("{\"message\":\"Updated " + updated + " loans with recalculated totalPayable\"}");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }
    
    // Admin endpoint: Quick fix for loans with zero totalPayable using simple calculation
    @PostMapping("/admin/fix-zero-balances")
    public ResponseEntity<?> fixZeroBalances() {
        try {
            int updated = loanDetailsService.fixLoansWithZeroTotalPayable();
            return ResponseEntity.ok("{\"message\":\"Fixed " + updated + " loans with zero totalPayable\"}");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }
    
    // REQUEST DTOs
    
    public static class LoanCreateRequest {
        private LoanDetails loan;
        private Long loanOfficerId;
        
        public LoanDetails getLoan() { return loan; }
        public void setLoan(LoanDetails loan) { this.loan = loan; }
        
        public Long getLoanOfficerId() { return loanOfficerId; }
        public void setLoanOfficerId(Long loanOfficerId) { this.loanOfficerId = loanOfficerId; }
    }
    
    public static class ApprovalRequest {
        private Long cashierId;
        private String notes;
        
        public Long getCashierId() { return cashierId; }
        public void setCashierId(Long cashierId) { this.cashierId = cashierId; }
        
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }
    
    public static class RejectionRequest {
        private Long cashierId;
        private String reason;
        
        public Long getCashierId() { return cashierId; }
        public void setCashierId(Long cashierId) { this.cashierId = cashierId; }
        
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }
    
    // NEW WORKFLOW ENDPOINTS with proper guards and status transitions
    
    /**
     * Approve a loan - updates status from PENDING_APPROVAL to APPROVED
     */
    @PostMapping("/{id}/approve")
    public ResponseEntity<?> approveNewLoan(
        @PathVariable Long id,
        @RequestBody(required = false) java.util.Map<String, Object> requestBody) {
        try {
            Long approvedById = 1L; // Default
            if (requestBody != null && requestBody.containsKey("approvedBy")) {
                Object approvedByObj = requestBody.get("approvedBy");
                if (approvedByObj instanceof Number) {
                    approvedById = ((Number) approvedByObj).longValue();
                } else if (approvedByObj instanceof String) {
                    // Treat as username, use default ID
                    approvedById = 1L;
                }
            }
            
            LoanDetails approvedLoan = loanDetailsService.approveLoan(id, approvedById);
            LoanDetailsResponse response = loanMapper.toLoanDetailsResponse(approvedLoan);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.status(409).body(java.util.Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(java.util.Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Reject a loan - updates status from PENDING_APPROVAL to REJECTED
     */
    @PostMapping("/{id}/reject")
    public ResponseEntity<?> rejectNewLoan(
        @PathVariable Long id,
        @RequestBody(required = false) java.util.Map<String, Object> requestBody) {
        try {
            Long rejectedById = 1L; // Default
            String reason = "Rejected by manager";
            
            if (requestBody != null) {
                if (requestBody.containsKey("rejectedBy")) {
                    Object rejectedByObj = requestBody.get("rejectedBy");
                    if (rejectedByObj instanceof Number) {
                        rejectedById = ((Number) rejectedByObj).longValue();
                    }
                }
                if (requestBody.containsKey("reason")) {
                    reason = requestBody.get("reason").toString();
                }
            }
            
            LoanDetails rejectedLoan = loanDetailsService.rejectLoan(id, rejectedById, reason);
            LoanDetailsResponse response = loanMapper.toLoanDetailsResponse(rejectedLoan);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.status(409).body(java.util.Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(java.util.Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Disburse a loan - updates status from APPROVED to DISBURSED
     * Triggers loan_tracking creation via database trigger
     */
    @PostMapping("/{id}/disburse")
    public ResponseEntity<?> disburseLoan(
        @PathVariable Long id,
        @RequestBody(required = false) java.util.Map<String, Object> requestBody) {
        try {
            Long disbursedById = 1L; // Default
            if (requestBody != null && requestBody.containsKey("disbursedBy")) {
                Object disbursedByObj = requestBody.get("disbursedBy");
                if (disbursedByObj instanceof Number) {
                    disbursedById = ((Number) disbursedByObj).longValue();
                }
            }
            
            LoanDetails disbursedLoan = loanDetailsService.disburseLoan(id, disbursedById);
            LoanDetailsResponse response = loanMapper.toLoanDetailsResponse(disbursedLoan);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.status(409).body(java.util.Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(java.util.Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Get all archived loans
     */
    @GetMapping("/archived")
    public ResponseEntity<List<org.example.dto.LoanTableViewDTO>> getArchivedLoans() {
        List<org.example.dto.LoanTableViewDTO> loans = loanDetailsService.getArchivedLoans();
        return ResponseEntity.ok(loans);
    }
    
    /**
     * Archive a loan - only COMPLETED loans can be archived
     */
    @PostMapping("/{id}/archive")
    public ResponseEntity<?> archiveLoan(@PathVariable Long id) {
        try {
            LoanDetails archivedLoan = loanDetailsService.archiveLoan(id);
            LoanDetailsResponse response = loanMapper.toLoanDetailsResponse(archivedLoan);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.status(409).body(java.util.Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(java.util.Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Unarchive a loan - restore archived loan to active list
     */
    @PostMapping("/{id}/unarchive")
    public ResponseEntity<?> unarchiveLoan(@PathVariable Long id) {
        try {
            LoanDetails unarchivedLoan = loanDetailsService.unarchiveLoan(id);
            LoanDetailsResponse response = loanMapper.toLoanDetailsResponse(unarchivedLoan);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.status(409).body(java.util.Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(java.util.Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Build comprehensive financial summary from loan, tracking, and payment data
     * Populates all financial metrics for the enhanced complete loan response
     */
    private void buildFinancialSummary(
            Map<String, Object> response,
            LoanDetails loan,
            LoanTracking tracking,
            List<EnhancedCompleteLoanResponse.PaymentDTO> payments) {
        
        java.math.BigDecimal zero = java.math.BigDecimal.ZERO;
        
        // ===== FEES =====
        response.put("processingFee", loan.getProcessingFee() > 0 ? 
            java.math.BigDecimal.valueOf(loan.getProcessingFee()) : zero);
        response.put("lateFee", loan.getLateFee() > 0 ? 
            java.math.BigDecimal.valueOf(loan.getLateFee()) : zero);
        response.put("insuranceFee", zero); // Not in current schema
        response.put("penaltyFee", tracking != null && tracking.getCumulativePenalty() != null ? 
            java.math.BigDecimal.valueOf(tracking.getCumulativePenalty()) : zero);
        
        // ===== PAYMENT TOTALS (from tracking or calculate from payments) =====
        if (tracking != null) {
            response.put("totalPaid", tracking.getCumulativePayment() != null ? 
                java.math.BigDecimal.valueOf(tracking.getCumulativePayment()) : zero);
            response.put("principalPaid", tracking.getCumulativePrincipalPaid() != null ? 
                java.math.BigDecimal.valueOf(tracking.getCumulativePrincipalPaid()) : zero);
            response.put("interestPaid", tracking.getCumulativeInterestPaid() != null ? 
                java.math.BigDecimal.valueOf(tracking.getCumulativeInterestPaid()) : zero);
            response.put("feesPaid", tracking.getCumulativeFeesPaid() != null ? 
                java.math.BigDecimal.valueOf(tracking.getCumulativeFeesPaid()) : zero);
        } else {
            // Calculate from payments if tracking doesn't exist
            double totalPaid = 0.0;
            double principalPaid = 0.0;
            double interestPaid = 0.0;
            double feesPaid = 0.0;
            
            for (EnhancedCompleteLoanResponse.PaymentDTO payment : payments) {
                if (payment.getAmountPaid() != null) totalPaid += payment.getAmountPaid();
                if (payment.getPrincipalPaid() != null) principalPaid += payment.getPrincipalPaid();
                if (payment.getInterestPaid() != null) interestPaid += payment.getInterestPaid();
                if (payment.getFeesPaid() != null) feesPaid += payment.getFeesPaid();
            }
            
            response.put("totalPaid", java.math.BigDecimal.valueOf(totalPaid));
            response.put("principalPaid", java.math.BigDecimal.valueOf(principalPaid));
            response.put("interestPaid", java.math.BigDecimal.valueOf(interestPaid));
            response.put("feesPaid", java.math.BigDecimal.valueOf(feesPaid));
        }
        
        // ===== OUTSTANDING BALANCES =====
        if (tracking != null) {
            response.put("outstandingBalance", tracking.getOutstandingBalance() != null ? 
                java.math.BigDecimal.valueOf(tracking.getOutstandingBalance()) : zero);
            response.put("outstandingPrincipal", tracking.getOutstandingPrincipal() != null ? 
                java.math.BigDecimal.valueOf(tracking.getOutstandingPrincipal()) : zero);
            response.put("outstandingInterest", tracking.getOutstandingInterest() != null ? 
                java.math.BigDecimal.valueOf(tracking.getOutstandingInterest()) : zero);
        } else {
            // Calculate from loan data
            double outstanding = loan.getTotalPayable() - 
                ((java.math.BigDecimal) response.get("totalPaid")).doubleValue();
            response.put("outstandingBalance", java.math.BigDecimal.valueOf(Math.max(0, outstanding)));
            response.put("outstandingPrincipal", zero);
            response.put("outstandingInterest", zero);
        }
        
        // ===== NEXT PAYMENT =====
        if (tracking != null) {
            response.put("nextPaymentAmount", tracking.getExpectedPaymentAmount() != null ? 
                java.math.BigDecimal.valueOf(tracking.getExpectedPaymentAmount()) : zero);
            response.put("nextPaymentDue", tracking.getNextPaymentDueDate());
        } else {
            // Calculate expected installment amount
            if (loan.getNumberOfRepayments() > 0) {
                double installment = loan.getTotalPayable() / loan.getNumberOfRepayments();
                response.put("nextPaymentAmount", java.math.BigDecimal.valueOf(installment));
            } else {
                response.put("nextPaymentAmount", zero);
            }
            response.put("nextPaymentDue", loan.getFirstRepaymentDate());
        }
        
        // ===== KEY DATES =====
        response.put("applicationDate", loan.getCreatedAt() != null ? 
            loan.getCreatedAt().toLocalDate() : null);
        response.put("approvalDate", loan.getApprovalDate() != null ? 
            loan.getApprovalDate().toLocalDate() : null);
        response.put("disbursementDate", loan.getDisbursedAt() != null ? 
            loan.getDisbursedAt().toLocalDate() : loan.getReleaseDate());
        response.put("firstRepaymentDate", loan.getFirstRepaymentDate());
        response.put("maturityDate", loan.getPaymentEndDate());
        response.put("lastPaymentDate", tracking != null ? tracking.getLastPaymentDate() : null);
        
        // ===== LOAN TERMS =====
        response.put("repaymentFrequency", loan.getRepaymentFrequency());
        response.put("numberOfInstallments", loan.getNumberOfRepayments());
        response.put("installmentsPaid", tracking != null ? tracking.getInstallmentsPaid() : 0);
        response.put("installmentsRemaining", tracking != null ? tracking.getInstallmentsRemaining() : 
            loan.getNumberOfRepayments());
        response.put("gracePeriodDays", loan.getGracePeriodDays());
        response.put("interestMethod", loan.getInterestMethod());
        response.put("interestRate", loan.getInterestRate());
        
        // ===== LOAN CLASSIFICATION =====
        response.put("loanProduct", loan.getProductId() != null ? loan.getProductId().toString() : "N/A");
        response.put("loanCategory", "N/A"); // Not in current schema
        response.put("loanType", "N/A"); // Not in current schema
        response.put("loanPurpose", loan.getDescription());
        
        // ===== DISBURSEMENT INFO =====
        response.put("disbursedByUser", loan.getDisbursedBy());
        response.put("disbursedAccount", loan.getCashBankAccount());
        
        // ===== COLLATERAL INFO =====
        response.put("collateralDescription", "N/A"); // Not in current schema
        response.put("collateralValue", zero); // Not in current schema
    }

}
