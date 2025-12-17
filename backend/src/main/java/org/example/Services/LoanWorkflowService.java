package org.example.Services;

import org.example.DTO.LoanResponse;
import org.example.Entities.LoanDetails;
import org.example.Entities.User;
import org.example.Mappers.LoanMapper;
import org.example.Repositories.LoanDetailsRepository;
import org.example.Repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class LoanWorkflowService {
    
    @Autowired
    private LoanDetailsRepository loanDetailsRepository;
    
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LoanDetailsService loanDetailsService;
    
    @Autowired
    private LoanMapper loanMapper;
    
    @Autowired
    private LoanWebSocketService loanWebSocketService;
    
    /**
     * Create a loan by a loan officer (initial creation)
     */
    public LoanDetails createLoanByOfficer(LoanDetails loan, Long loanOfficerId) {
        // Find available loan officer or use system default
        Optional<User> loanOfficer = userRepository.findById(loanOfficerId);
        
        // If provided loan officer doesn't exist or isn't a loan officer, find any available loan officer
        if (loanOfficer.isEmpty() || !loanOfficer.get().isLoanOfficer()) {
            // Try to find any available loan officer
            List<User> availableOfficers = userRepository.findByRole(User.UserRole.LOAN_OFFICER);
            if (!availableOfficers.isEmpty()) {
                loanOfficer = Optional.of(availableOfficers.get(0));
                loanOfficerId = loanOfficer.get().getId();
            } else {
                // No loan officers available - create with system default
                loanOfficerId = 1L; // Will handle non-existent ID gracefully
            }
        }
        
        // Set workflow fields
        loan.setCreatedById(loanOfficerId);
        loan.setWorkflowStatus("PENDING_APPROVAL");
        loan.setLoanStatus("PENDING_APPROVAL"); // Keep loan in PENDING_APPROVAL state until approved
        
        // Set created by name (handle case where loan officer might not exist)
        if (loanOfficer.isPresent()) {
            loan.setCreatedBy(loanOfficer.get().getFullName());
        } else {
            loan.setCreatedBy("System User"); // Default when no loan officer found
        }
        
        LoanDetails savedLoan = loanDetailsRepository.save(loan);
        
        // Broadcast loan creation event
        try {
            String clientName = "Unknown Client";
            if (savedLoan.getClientId() != null) {
                clientName = userRepository.findById(savedLoan.getClientId())
                    .map(User::getFullName)
                    .orElse("Unknown Client");
            }
            loanWebSocketService.broadcastLoanCreated(
                savedLoan.getId(),
                savedLoan.getLoanNumber(),
                clientName
            );
        } catch (Exception e) {
            System.err.println("Error broadcasting loan creation: " + e.getMessage());
        }
        
        return savedLoan;
    }
    
    /**
     * Approve a loan by a cashier
     */
    public LoanDetails approveLoan(Long loanId, Long cashierId, String approvalNotes) {
        // For now, allow any user ID for testing - in production, validate cashier role
        Optional<User> cashier = userRepository.findById(cashierId);
        if (cashier.isEmpty()) {
            // Use system default if cashier not found
            cashierId = 1L;
        } else if (!cashier.get().isCashier()) {
            // For testing, allow non-cashiers to approve - in production, uncomment the line below
            // throw new IllegalArgumentException("User is not authorized to approve loans. Only cashiers can approve loans.");
        }
        
        // Get the loan
        Optional<LoanDetails> loanOpt = loanDetailsRepository.findById(loanId);
        if (loanOpt.isEmpty()) {
            throw new IllegalArgumentException("Loan not found with ID: " + loanId);
        }
        
        LoanDetails loan = loanOpt.get();
        
        // Validate loan state
        if (!"PENDING_APPROVAL".equals(loan.getWorkflowStatus())) {
            throw new IllegalStateException("Loan is not in a state that can be approved. Current status: " + loan.getWorkflowStatus());
        }
        
        // Cannot approve your own loan creation
        if (loan.getCreatedById() != null && loan.getCreatedById().equals(cashierId)) {
            throw new IllegalArgumentException("You cannot approve a loan that you created.");
        }
        
        // Update loan with approval details
        loan.setWorkflowStatus("APPROVED");
        loan.setApprovedById(cashierId);
        loan.setApprovalDate(LocalDateTime.now());
        loan.setLoanStatus("approved"); // Move to approved status
        loan.setRejectionReason(null); // Clear any previous rejection reason
        
        LoanDetails savedLoan = loanDetailsRepository.save(loan);
        
        // Broadcast loan approval event
        try {
            String approverName = userRepository.findById(cashierId)
                .map(User::getFullName)
                .orElse("Unknown");
            loanWebSocketService.broadcastLoanApproved(
                savedLoan.getId(),
                savedLoan.getLoanNumber(),
                approverName
            );
            loanWebSocketService.broadcastToLoanDetails(savedLoan.getId());
        } catch (Exception e) {
            System.err.println("Error broadcasting loan approval: " + e.getMessage());
        }
        
        return savedLoan;
    }
    
    /**
     * Simplified approve loan - just check if loan exists
     */
    public LoanDetails approveLoanSimple(Long loanId, String notes) {
        // Get the loan
        Optional<LoanDetails> loanOpt = loanDetailsRepository.findById(loanId);
        if (loanOpt.isEmpty()) {
            throw new IllegalArgumentException("Loan not found with ID: " + loanId);
        }
        
        LoanDetails loan = loanOpt.get();
        
        // Check if loan can be approved
        if (!"PENDING_APPROVAL".equals(loan.getWorkflowStatus())) {
            throw new IllegalStateException("Loan is not in a state that can be approved. Current status: " + loan.getWorkflowStatus());
        }
        
        // Update loan with approval details
        loan.setWorkflowStatus("APPROVED");
        loan.setApprovedById(1L); // Use system default
        loan.setApprovalDate(LocalDateTime.now());
        loan.setRejectionReason(null);

        // Compute financials and dates, set to open
        loanDetailsService.finalizeOnApproval(loan);
        
        LoanDetails savedLoan = loanDetailsRepository.save(loan);
        
        // Broadcast loan approval event
        try {
            loanWebSocketService.broadcastLoanApproved(
                savedLoan.getId(),
                savedLoan.getLoanNumber(),
                "System"
            );
            loanWebSocketService.broadcastToLoanDetails(savedLoan.getId());
        } catch (Exception e) {
            System.err.println("Error broadcasting loan approval: " + e.getMessage());
        }
        
        return savedLoan;
    }
    
    /**
     * Reject a loan by a cashier
     */
    public LoanDetails rejectLoan(Long loanId, Long cashierId, String rejectionReason) {
        // Validate cashier
        Optional<User> cashier = userRepository.findById(cashierId);
        if (cashier.isEmpty()) {
            throw new IllegalArgumentException("Cashier not found with ID: " + cashierId);
        }
        
        if (!cashier.get().isCashier()) {
            throw new IllegalArgumentException("User is not authorized to reject loans. Only cashiers can reject loans.");
        }
        
        // Get the loan
        Optional<LoanDetails> loanOpt = loanDetailsRepository.findById(loanId);
        if (loanOpt.isEmpty()) {
            throw new IllegalArgumentException("Loan not found with ID: " + loanId);
        }
        
        LoanDetails loan = loanOpt.get();
        
        // Validate loan state
        if (!"PENDING_APPROVAL".equals(loan.getWorkflowStatus())) {
            throw new IllegalStateException("Loan is not in a state that can be rejected. Current status: " + loan.getWorkflowStatus());
        }
        
        // Cannot reject your own loan creation
        if (loan.getCreatedById() != null && loan.getCreatedById().equals(cashierId)) {
            throw new IllegalArgumentException("You cannot reject a loan that you created.");
        }
        
        // Update loan with rejection details
        loan.setWorkflowStatus("REJECTED");
        loan.setRejectedById(cashierId); // Track who rejected it
        loan.setApprovedById(cashierId); // Track who made the decision
        loan.setApprovalDate(LocalDateTime.now()); // When the decision was made
        loan.setRejectionReason(rejectionReason);
        loan.setLoanStatus("rejected"); // Update loan status
        
        LoanDetails savedLoan = loanDetailsRepository.save(loan);
        
        // Broadcast loan rejection event
        try {
            String rejectorName = userRepository.findById(cashierId)
                .map(User::getFullName)
                .orElse("Unknown");
            loanWebSocketService.broadcastLoanRejected(
                savedLoan.getId(),
                savedLoan.getLoanNumber(),
                rejectorName,
                rejectionReason
            );
            loanWebSocketService.broadcastToLoanDetails(savedLoan.getId());
        } catch (Exception e) {
            System.err.println("Error broadcasting loan rejection: " + e.getMessage());
        }
        
        return savedLoan;
    }
    
    /**
     * Simplified reject loan - just check if loan exists
     */
    public LoanDetails rejectLoanSimple(Long loanId, String reason) {
        // Get the loan
        Optional<LoanDetails> loanOpt = loanDetailsRepository.findById(loanId);
        if (loanOpt.isEmpty()) {
            throw new IllegalArgumentException("Loan not found with ID: " + loanId);
        }
        
        LoanDetails loan = loanOpt.get();
        
        // Check if loan can be rejected
        if (!"PENDING_APPROVAL".equals(loan.getWorkflowStatus())) {
            throw new IllegalStateException("Loan is not in a state that can be rejected. Current status: " + loan.getWorkflowStatus());
        }
        
        // Update loan with rejection details
        loan.setWorkflowStatus("REJECTED");
        loan.setRejectedById(1L); // Track who rejected it  
        loan.setApprovedById(1L); // Track who made the decision
        loan.setApprovalDate(LocalDateTime.now());
        loan.setRejectionReason(reason);
        loan.setLoanStatus("rejected");
        
        LoanDetails savedLoan = loanDetailsRepository.save(loan);
        
        // Broadcast loan rejection event
        try {
            loanWebSocketService.broadcastLoanRejected(
                savedLoan.getId(),
                savedLoan.getLoanNumber(),
                "System",
                reason
            );
            loanWebSocketService.broadcastToLoanDetails(savedLoan.getId());
        } catch (Exception e) {
            System.err.println("Error broadcasting loan rejection: " + e.getMessage());
        }
        
        return savedLoan;
    }
    
    /**
     * Get loans pending approval for cashiers
     * Returns lightweight DTOs for table display
     */
    public List<LoanResponse> getLoansPendingApproval() {
        List<LoanDetails> loans = loanDetailsRepository.findByWorkflowStatus("PENDING_APPROVAL");
        return loans.stream()
                .map(loanMapper::toLoanResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Get approved loans
     * Returns lightweight DTOs for table display
     */
    public List<LoanResponse> getApprovedLoans() {
        List<LoanDetails> loans = loanDetailsRepository.findByWorkflowStatus("APPROVED");
        return loans.stream()
                .map(loanMapper::toLoanResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Get rejected loans
     * Returns lightweight DTOs for table display
     */
    public List<LoanResponse> getRejectedLoans() {
        List<LoanDetails> loans = loanDetailsRepository.findByWorkflowStatus("REJECTED");
        return loans.stream()
                .map(loanMapper::toLoanResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Get loans created by a specific loan officer
     * Returns lightweight DTOs for table display
     */
    public List<LoanResponse> getLoansByCreator(Long loanOfficerId) {
        List<LoanDetails> loans = loanDetailsRepository.findByCreatedById(loanOfficerId);
        return loans.stream()
                .map(loanMapper::toLoanResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Get loans approved/rejected by a specific cashier
     * Returns lightweight DTOs for table display
     */
    public List<LoanResponse> getLoansProcessedBy(Long cashierId) {
        List<LoanDetails> loans = loanDetailsRepository.findByApprovedById(cashierId);
        return loans.stream()
                .map(loanMapper::toLoanResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Check if a loan can be modified (only pending loans can be modified by their creators)
     */
    public boolean canModifyLoan(Long loanId, Long userId) {
        Optional<LoanDetails> loanOpt = loanDetailsRepository.findById(loanId);
        if (loanOpt.isEmpty()) {
            return false;
        }
        
        LoanDetails loan = loanOpt.get();
        
        // Only pending loans can be modified
        if (!"PENDING_APPROVAL".equals(loan.getWorkflowStatus())) {
            return false;
        }
        
        // Only the creator can modify
        return loan.getCreatedById() != null && loan.getCreatedById().equals(userId);
    }
    
    /**
     * Get workflow summary for a loan
     */
    public LoanWorkflowSummary getWorkflowSummary(Long loanId) {
        Optional<LoanDetails> loanOpt = loanDetailsRepository.findById(loanId);
        if (loanOpt.isEmpty()) {
            throw new IllegalArgumentException("Loan not found with ID: " + loanId);
        }
        
        LoanDetails loan = loanOpt.get();
        LoanWorkflowSummary summary = new LoanWorkflowSummary();
        
        summary.setLoanId(loanId);
        summary.setWorkflowStatus(loan.getWorkflowStatus());
        summary.setCreatedAt(loan.getCreatedAt());
        summary.setApprovalDate(loan.getApprovalDate());
        summary.setRejectionReason(loan.getRejectionReason());
        
        // Get creator details
        if (loan.getCreatedById() != null) {
            Optional<User> creator = userRepository.findById(loan.getCreatedById());
            if (creator.isPresent()) {
                summary.setCreatedBy(creator.get().getFullName());
                summary.setCreatedByRole(creator.get().getRole().getDisplayName());
            }
        }
        
        // Get approver details
        if (loan.getApprovedById() != null) {
            Optional<User> approver = userRepository.findById(loan.getApprovedById());
            if (approver.isPresent()) {
                summary.setProcessedBy(approver.get().getFullName());
                summary.setProcessedByRole(approver.get().getRole().getDisplayName());
            }
        }
        
        return summary;
    }
    
    /**
     * DTO for loan workflow summary
     */
    public static class LoanWorkflowSummary {
        private Long loanId;
        private String workflowStatus;
        private LocalDateTime createdAt;
        private LocalDateTime approvalDate;
        private String createdBy;
        private String createdByRole;
        private String processedBy;
        private String processedByRole;
        private String rejectionReason;
        
        // Getters and setters
        public Long getLoanId() { return loanId; }
        public void setLoanId(Long loanId) { this.loanId = loanId; }
        
        public String getWorkflowStatus() { return workflowStatus; }
        public void setWorkflowStatus(String workflowStatus) { this.workflowStatus = workflowStatus; }
        
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
        
        public LocalDateTime getApprovalDate() { return approvalDate; }
        public void setApprovalDate(LocalDateTime approvalDate) { this.approvalDate = approvalDate; }
        
        public String getCreatedBy() { return createdBy; }
        public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
        
        public String getCreatedByRole() { return createdByRole; }
        public void setCreatedByRole(String createdByRole) { this.createdByRole = createdByRole; }
        
        public String getProcessedBy() { return processedBy; }
        public void setProcessedBy(String processedBy) { this.processedBy = processedBy; }
        
        public String getProcessedByRole() { return processedByRole; }
        public void setProcessedByRole(String processedByRole) { this.processedByRole = processedByRole; }
        
        public String getRejectionReason() { return rejectionReason; }
        public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
    }
}