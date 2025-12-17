package org.example.Mappers;

import org.example.DTO.LoanDetailsResponse;
import org.example.DTO.LoanResponse;
import org.example.DTO.CompleteLoanDetailsResponse;
import org.example.Entities.LoanDetails;
import org.example.Entities.LoanProduct;
import org.example.Entities.User;
import org.example.Entities.LoanPayments;
import org.example.Entities.LoanTracking;
import org.example.Repositories.LoanProductRepository;
import org.example.Repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Mapper to convert LoanDetails entities to DTOs
 * Fetches related data (client names, product names, user names) from repositories
 */
@Component
public class LoanMapper {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private LoanProductRepository loanProductRepository;
    
    /**
     * Convert LoanDetails entity to lightweight LoanResponse DTO for table display
     */
    public LoanResponse toLoanResponse(LoanDetails loan) {
        if (loan == null) return null;
        
        LoanResponse dto = new LoanResponse();
        dto.setId(loan.getId());
        dto.setLoanNumber(loan.getLoanNumber());
        dto.setPrincipalAmount(loan.getPrincipalAmount());
        dto.setWorkflowStatus(loan.getWorkflowStatus());
        dto.setLoanStatus(loan.getLoanStatus());
        dto.setCreatedAt(loan.getCreatedAt() != null ? loan.getCreatedAt().toLocalDate() : null);
        dto.setReleaseDate(loan.getReleaseDate());
        dto.setRejectionReason(loan.getRejectionReason());
        
        // Fetch client name from User table
        if (loan.getClientId() != null) {
            Optional<User> clientOpt = userRepository.findById(loan.getClientId());
            dto.setClientName(clientOpt.map(User::getFullName).orElse("Client #" + loan.getClientId()));
        } else {
            dto.setClientName("Unknown Client");
        }
        
        // Fetch product name from LoanProduct table
        if (loan.getProductId() != null) {
            Optional<LoanProduct> productOpt = loanProductRepository.findById(loan.getProductId());
            dto.setLoanProductName(productOpt.map(LoanProduct::getProductName).orElse("N/A"));
        } else {
            dto.setLoanProductName("N/A");
        }
        
        // Fetch loan officer name from User table using createdById
        if (loan.getCreatedById() != null) {
            Optional<User> officerOpt = userRepository.findById(loan.getCreatedById());
            dto.setLoanOfficerName(officerOpt.map(User::getFullName).orElse("Unknown Officer"));
        } else if (loan.getCreatedBy() != null && !loan.getCreatedBy().isEmpty()) {
            // Fallback to createdBy string field if createdById is not available
            dto.setLoanOfficerName(loan.getCreatedBy());
        } else {
            dto.setLoanOfficerName("System User");
        }
        
        return dto;
    }
    
    /**
     * Convert LoanDetails entity to complete LoanDetailsResponse DTO for details view
     */
    public LoanDetailsResponse toLoanDetailsResponse(LoanDetails loan) {
        if (loan == null) return null;
        
        LoanDetailsResponse dto = new LoanDetailsResponse();
        
        // Identification
        dto.setId(loan.getId());
        dto.setLoanNumber(loan.getLoanNumber());
        dto.setLoanTitle(loan.getLoanTitle());
        dto.setDescription(loan.getDescription());
        
        // Client & Product IDs
        dto.setClientId(loan.getClientId());
        dto.setProductId(loan.getProductId());
        dto.setLendingBranch(loan.getLendingBranch());
        
        // Fetch client name
        if (loan.getClientId() != null) {
            Optional<User> clientOpt = userRepository.findById(loan.getClientId());
            dto.setClientName(clientOpt.map(User::getFullName).orElse("Client #" + loan.getClientId()));
        } else {
            dto.setClientName("Unknown Client");
        }
        
        // Fetch product name
        if (loan.getProductId() != null) {
            Optional<LoanProduct> productOpt = loanProductRepository.findById(loan.getProductId());
            dto.setLoanProductName(productOpt.map(LoanProduct::getProductName).orElse("N/A"));
        } else {
            dto.setLoanProductName("N/A");
        }
        
        // Principal & Disbursement
        dto.setPrincipalAmount(loan.getPrincipalAmount());
        dto.setReleaseDate(loan.getReleaseDate());
        dto.setDisbursedBy(loan.getDisbursedBy());
        dto.setCashBankAccount(loan.getCashBankAccount());
        dto.setDisbursedAt(loan.getDisbursedAt());
        
        // Interest Configuration
        dto.setInterestMethod(loan.getInterestMethod());
        dto.setInterestType(loan.getInterestType());
        dto.setInterestRate(loan.getInterestRate());
        dto.setFixedInterestAmount(loan.getFixedInterestAmount());
        dto.setRatePer(loan.getRatePer());
        dto.setEffectiveInterestRate(loan.getInterestRate()); // Can calculate if needed
        
        // Duration
        dto.setLoanDuration(loan.getLoanDuration());
        dto.setDurationUnit(loan.getDurationUnit());
        dto.setLoanDurationDays(loan.getLoanDurationDays());
        
        // Repayment Configuration
        dto.setRepaymentFrequency(loan.getRepaymentFrequency());
        dto.setNumberOfRepayments(loan.getNumberOfRepayments());
        dto.setGracePeriodDays(loan.getGracePeriodDays());
        dto.setPaymentStartDate(loan.getPaymentStartDate());
        dto.setPaymentEndDate(loan.getPaymentEndDate());
        dto.setFirstRepaymentDate(loan.getFirstRepaymentDate());
        dto.setFirstRepaymentAmount(loan.getFirstRepaymentAmount());
        
        // Fees & Charges
        dto.setProcessingFee(loan.getProcessingFee());
        dto.setLateFee(loan.getLateFee());
        dto.setDefaultFee(loan.getDefaultFee());
        
        // Calculated Amounts
        dto.setTotalPayable(loan.getTotalPayable());
        
        // Status & Workflow
        dto.setLoanStatus(loan.getLoanStatus());
        dto.setWorkflowStatus(loan.getWorkflowStatus());
        dto.setAgreementSigned(loan.isAgreementSigned());
        
        // Audit & Workflow Details
        dto.setCreatedAt(loan.getCreatedAt());
        dto.setUpdatedAt(loan.getUpdatedAt());
        dto.setCreatedById(loan.getCreatedById());
        dto.setCreatedBy(loan.getCreatedBy());
        dto.setApprovedById(loan.getApprovedById());
        dto.setApprovalDate(loan.getApprovalDate());
        dto.setRejectedById(loan.getRejectedById());
        dto.setRejectionReason(loan.getRejectionReason());
        
        // Fetch approver name
        if (loan.getApprovedById() != null) {
            Optional<User> approverOpt = userRepository.findById(loan.getApprovedById());
            dto.setApprovedBy(approverOpt.map(User::getFullName).orElse("User #" + loan.getApprovedById()));
        }
        
        // Fetch rejector name
        if (loan.getRejectedById() != null) {
            Optional<User> rejectorOpt = userRepository.findById(loan.getRejectedById());
            dto.setRejectedBy(rejectorOpt.map(User::getFullName).orElse("User #" + loan.getRejectedById()));
        }
        
        return dto;
    }
    
    /**
     * Convert LoanDetails + related entities to CompleteLoanDetailsResponse
     * Used by /api/loans/{id}/complete endpoint
     */
    public CompleteLoanDetailsResponse toCompleteLoanResponse(
            LoanDetails loan,
            User client,
            User officer,
            List<LoanPayments> payments,
            LoanTracking tracking,
            List<CompleteLoanDetailsResponse.WorkflowHistoryDTO> workflowHistory) {
        
        if (loan == null) return null;
        
        // Build loan DTO
        CompleteLoanDetailsResponse.LoanDTO loanDTO = CompleteLoanDetailsResponse.LoanDTO.builder()
            .id(loan.getId())
            .loanNumber(loan.getLoanNumber())
            .principalAmount(loan.getPrincipalAmount())
            .totalPayable(loan.getTotalPayable())
            .interestRate(loan.getInterestRate())
            .duration(loan.getLoanDuration())
            .durationUnit(loan.getDurationUnit())
            .repaymentFrequency(loan.getRepaymentFrequency())
            .numberOfRepayments(loan.getNumberOfRepayments())
            .workflowStatus(loan.getWorkflowStatus())
            .loanStatus(loan.getLoanStatus())
            .createdAt(loan.getCreatedAt())
            .approvalDate(loan.getApprovalDate())
            .disbursedAt(loan.getDisbursedAt())
            .rejectionReason(loan.getRejectionReason())
            .rejectedBy(null)  // Will be set below from rejectedById
            .lendingBranch(loan.getLendingBranch())
            .gracePeriodDays(loan.getGracePeriodDays())
            .interestMethod(loan.getInterestMethod())
            .releaseDate(loan.getReleaseDate())
            .paymentStartDate(loan.getPaymentStartDate())
            .paymentEndDate(loan.getPaymentEndDate())
            .processingFee(loan.getProcessingFee())
            .lateFee(loan.getLateFee())
            .build();
        
        // Fetch and set product name
        if (loan.getProductId() != null) {
            Optional<LoanProduct> productOpt = loanProductRepository.findById(loan.getProductId());
            loanDTO.setProductName(productOpt.map(LoanProduct::getProductName).orElse("N/A"));
        }
        
        // Fetch and set rejectedBy name
        if (loan.getRejectedById() != null) {
            Optional<User> rejector = userRepository.findById(loan.getRejectedById());
            loanDTO.setRejectedBy(rejector.map(User::getFullName).orElse("User #" + loan.getRejectedById()));
        }
        
        // Build client DTO
        CompleteLoanDetailsResponse.LoanClientDTO clientDTO = null;
        if (client != null && client.getPerson() != null) {
            clientDTO = CompleteLoanDetailsResponse.LoanClientDTO.builder()
                .id(client.getId())
                .fullName(client.getFullName())
                .email(client.getEmail())
                .phone(client.getPerson().getContact())
                .address(client.getPerson().getVillage() + ", " + client.getPerson().getParish())
                .district(client.getPerson().getDistrict())
                .nationalId(client.getPerson().getNationalId())
                .build();
        }
        
        // Build loan officer DTO
        CompleteLoanDetailsResponse.LoanOfficerDTO officerDTO = null;
        if (officer != null) {
            officerDTO = CompleteLoanDetailsResponse.LoanOfficerDTO.builder()
                .id(officer.getId())
                .fullName(officer.getFullName())
                .email(officer.getEmail())
                .phone(officer.getPerson() != null ? officer.getPerson().getContact() : null)
                .branch(officer.getBranch())
                .role(officer.getRole() != null ? officer.getRole().name() : null)
                .build();
        }
        
        // Build tracking DTO
        CompleteLoanDetailsResponse.LoanTrackingDTO trackingDTO = null;
        if (tracking != null) {
            trackingDTO = CompleteLoanDetailsResponse.LoanTrackingDTO.builder()
                .amountPaid(tracking.getCumulativePayment())
                .balance(tracking.getOutstandingBalance())
                .installmentsPaid(tracking.getInstallmentsPaid())
                .totalInstallments(tracking.getTotalInstallments())
                .penalty(tracking.getCumulativePenalty())
                .status(tracking.getLoanStatus())
                .lastPaymentDate(tracking.getLastPaymentDate())
                .nextPaymentDate(tracking.getNextPaymentDueDate())
                .nextPaymentAmount(tracking.getExpectedPaymentAmount())
                .build();
        }
        
        // Build payment DTOs
        List<CompleteLoanDetailsResponse.LoanPaymentDTO> paymentDTOs = null;
        if (payments != null) {
            paymentDTOs = payments.stream()
                .map(payment -> {
                    // Get user who recorded the payment
                    String recordedByName = "System";
                    if (payment.getCreatedBy() != null) {
                        Optional<User> recorder = userRepository.findById(payment.getCreatedBy());
                        recordedByName = recorder.map(User::getFullName).orElse("User #" + payment.getCreatedBy());
                    }
                    
                    return CompleteLoanDetailsResponse.LoanPaymentDTO.builder()
                        .id(payment.getId())
                        .paymentDate(payment.getPaymentDate())
                        .amount(payment.getAmountPaid())
                        .method(payment.getPaymentMethod())
                        .reference(payment.getReferenceNumber())
                        .status(payment.getPaymentStatus())
                        .notes(payment.getNotes())
                        .recordedBy(recordedByName)
                        .build();
                })
                .collect(Collectors.toList());
        }
        
        // Build complete response
        return CompleteLoanDetailsResponse.builder()
            .loan(loanDTO)
            .client(clientDTO)
            .loanOfficer(officerDTO)
            .tracking(trackingDTO)
            .payments(paymentDTOs)
            .workflowHistory(workflowHistory)
            .build();
    }
}
