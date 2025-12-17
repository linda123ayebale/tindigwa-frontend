package org.example.Services;

import org.example.DTO.LoanResponse;
import org.example.DTO.LoanDetailsResponse;
import org.example.DTO.CompleteLoanDetailsResponse;
import org.example.Entities.LoanDetails;
import org.example.Entities.LoanProduct;
import org.example.Entities.User;
import org.example.Events.LoanCreatedEvent;
import org.example.Events.LoanApprovedEvent;
import org.example.Events.LoanRejectedEvent;
import org.example.Events.LoanStatusUpdatedEvent;
import org.example.Mappers.LoanMapper;
import org.example.Repositories.LoanDetailsRepository;
import org.example.Repositories.LoanProductRepository;
import org.example.Repositories.UserRepository;
import org.example.Repositories.LoanPaymentsRepository;
import org.example.Repositories.LoanTrackingRepository;
import org.example.Entities.LoanPayments;
import org.example.Entities.LoanTracking;
import org.example.Services.LoanStatusCalculator;
import org.example.enums.LoanStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class LoanDetailsService {
    
    @Autowired
    private LoanDetailsRepository repository;
    
    @Autowired
    private LoanProductRepository loanProductRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private LoanPaymentsRepository loanPaymentsRepository;
    
    @Autowired
    private LoanTrackingRepository loanTrackingRepository;
    
    @Autowired
    private LoanStatusCalculator loanStatusCalculator;
    
    @Autowired
    private ApplicationEventPublisher eventPublisher;
    
    @Autowired
    private LoanWebSocketService loanWebSocketService;
    
    @Autowired
    private LoanMapper loanMapper;
    
    public LoanDetails createLoan(LoanDetails loan) {
        // Validate client exists
        validateClient(loan.getClientId());
        
        // Get and apply product defaults if productId is provided
        if (loan.getProductId() != null) {
            applyProductDefaults(loan);
        }
        
        // Validate and set interest rate
        validateAndSetInterestRate(loan);
        
        // Calculate processing fee
        calculateProcessingFee(loan);
        
        // Calculate total payable
        calculateTotalPayable(loan);
        
        // Calculate payment dates
        calculatePaymentDates(loan);
        
        // Calculate number of repayments if not set
        if (loan.getNumberOfRepayments() == 0) {
            loan.setNumberOfRepayments(calculateNumberOfRepayments(loan));
        }
        
        // Save to database
        LoanDetails savedLoan = repository.save(loan);
        
        // Publish loan created event for tracking system
        try {
            String actionBy = savedLoan.getCreatedBy() != null ? savedLoan.getCreatedBy() : "SYSTEM";
            eventPublisher.publishEvent(new LoanCreatedEvent(this, savedLoan, actionBy));
        } catch (Exception e) {
            System.err.println("Error publishing loan created event: " + e.getMessage());
        }
        
        return savedLoan;
    }
    
    private void validateClient(Long clientId) {
        if (clientId == null) {
            throw new IllegalArgumentException("Client ID is required");
        }
        
        Optional<User> client = userRepository.findById(clientId);
        if (client.isEmpty()) {
            throw new IllegalArgumentException("Client not found with ID: " + clientId);
        }
        
        if (!client.get().isClient()) {
            throw new IllegalArgumentException("User with ID " + clientId + " is not a client");
        }
    }
    
    private void applyProductDefaults(LoanDetails loan) {
        Optional<LoanProduct> productOpt = loanProductRepository.findById(loan.getProductId());
        
        if (productOpt.isEmpty()) {
            throw new IllegalArgumentException("Loan product not found with ID: " + loan.getProductId());
        }
        
        LoanProduct product = productOpt.get();
        
        if (!product.isActive()) {
            throw new IllegalArgumentException("Loan product is not active: " + product.getProductName());
        }
        
        // Apply product defaults only if not already set
        if (loan.getInterestRate() == 0) {
            loan.setInterestRate(product.getDefaultInterestRate());
        }
        
        if (loan.getInterestMethod() == null) {
            loan.setInterestMethod(product.getInterestMethod());
        }
        
        if (loan.getInterestType() == null) {
            loan.setInterestType(product.getInterestType());
        }
        
        if (loan.getRatePer() == null) {
            loan.setRatePer(product.getRatePer());
        }
        
        if (loan.getRepaymentFrequency() == null) {
            loan.setRepaymentFrequency(product.getDefaultRepaymentFrequency());
        }
        
        if (loan.getGracePeriodDays() == 0) {
            loan.setGracePeriodDays(product.getDefaultGracePeriodDays());
        }
        
        if (loan.getLateFee() == 0) {
            loan.setLateFee(product.getLateFee());
        }
        
        if (loan.getDefaultFee() == 0) {
            loan.setDefaultFee(product.getDefaultFee());
        }
        
        // Product constraints removed - no validation enforced
    }
    
    
    private void validateAndSetInterestRate(LoanDetails loan) {
        if (loan.getInterestRate() <= 0) {
            // Fallback to default 20% if no rate specified
            loan.setInterestRate(20.0); // 20%
        }
    }
    
    private void calculateProcessingFee(LoanDetails loan) {
        double processingFee;
        
        // If product-based fee is available, use it
        if (loan.getProductId() != null) {
            Optional<LoanProduct> productOpt = loanProductRepository.findById(loan.getProductId());
            if (productOpt.isPresent()) {
                LoanProduct product = productOpt.get();
                processingFee = product.calculateProcessingFee(loan.getPrincipalAmount());
            } else {
                processingFee = calculateDefaultProcessingFee(loan.getPrincipalAmount());
            }
        } else {
            processingFee = calculateDefaultProcessingFee(loan.getPrincipalAmount());
        }
        
        // Override with manual fee if set
        if (loan.getProcessingFee() == 0) {
            loan.setProcessingFee(processingFee);
        }
    }
    
    private double calculateDefaultProcessingFee(double amount) {
        if (amount >= 50_000 && amount <= 100_000) return 10_000;
        else if (amount <= 300_000) return 15_000;
        else if (amount <= 500_000) return 20_000;
        else if (amount <= 750_000) return 25_000;
        else if (amount <= 1_000_000) return 30_000;
        else if (amount <= 2_000_000) return 50_000;
        else return 100_000;
    }
    
    private void calculateTotalPayable(LoanDetails loan) {
        double principal = loan.getPrincipalAmount();
        double interestRate = loan.getInterestRate() / 100; // Convert percentage to decimal
        double interestAmount = 0;
        
        // Validate inputs to prevent infinity/NaN
        if (principal <= 0) {
            loan.setTotalPayable(0);
            return;
        }
        
        if (interestRate < 0 || interestRate > 10) { // Cap at 1000% to prevent infinity
            interestRate = 0.20; // Default to 20%
        }
        
        if (loan.getLoanDurationDays() <= 0) {
            // Set default duration if invalid
            loan.setLoanDurationDays(180); // 6 months default
        }
        
        // Calculate interest based on method
        if ("fixed".equalsIgnoreCase(loan.getInterestType()) && loan.getFixedInterestAmount() != null) {
            interestAmount = loan.getFixedInterestAmount();
        } else {
            // Calculate interest based on method and rate
            switch (loan.getInterestMethod() != null ? loan.getInterestMethod().toLowerCase() : "flat") {
                case "flat":
                    // Simple interest: P * R * T
                    if ("year".equalsIgnoreCase(loan.getRatePer())) {
                        double years = Math.min(loan.getLoanDurationDays() / 365.0, 10); // Cap at 10 years
                        interestAmount = principal * interestRate * years;
                    } else if ("month".equalsIgnoreCase(loan.getRatePer())) {
                        double months = Math.min(loan.getLoanDurationDays() / 30.0, 120); // Cap at 10 years
                        interestAmount = principal * interestRate * months;
                    } else {
                        // Daily rate - cap at reasonable limits
                        double days = Math.min(loan.getLoanDurationDays(), 3650); // Cap at 10 years
                        interestAmount = principal * Math.min(interestRate, 0.01) * days; // Cap daily rate at 1%
                    }
                    break;
                    
                case "reducing":
                    // For reducing balance, use simple calculation for now
                    interestAmount = principal * interestRate * 0.6; // Approximation
                    break;
                    
                default:
                    // Default to flat rate
                    if ("month".equalsIgnoreCase(loan.getRatePer())) {
                        double months = Math.min(loan.getLoanDurationDays() / 30.0, 120);
                        interestAmount = principal * interestRate * months;
                    } else {
                        interestAmount = principal * interestRate;
                    }
            }
        }
        
        // Ensure values are finite and reasonable
        if (!Double.isFinite(interestAmount) || interestAmount < 0) {
            interestAmount = principal * 0.2; // Default to 20% of principal
        }
        
        double totalPayable = principal + interestAmount + loan.getProcessingFee();
        
        // Final sanity check
        if (!Double.isFinite(totalPayable) || totalPayable < principal) {
            totalPayable = principal + (principal * 0.2) + loan.getProcessingFee(); // Default calculation
        }
        
        loan.setTotalPayable(totalPayable);
    }
    
    private void calculatePaymentDates(LoanDetails loan) {
        // Set payment start date if not provided
        if (loan.getPaymentStartDate() == null) {
            if (loan.getReleaseDate() != null) {
                // Add grace period to release date
                loan.setPaymentStartDate(loan.getReleaseDate().plusDays(loan.getGracePeriodDays()));
            } else {
                // Default to today plus grace period
                loan.setPaymentStartDate(LocalDate.now().plusDays(loan.getGracePeriodDays()));
            }
        }
        
        // Calculate payment end date
        loan.calculatePaymentEndDate();
        
        // Set first repayment date if not provided
        if (loan.getFirstRepaymentDate() == null) {
            loan.setFirstRepaymentDate(loan.getPaymentStartDate());
        }
        
        // Calculate first repayment amount if not provided
        if (loan.getFirstRepaymentAmount() == null || loan.getFirstRepaymentAmount() == 0) {
            double regularPayment = loan.getTotalPayable() / loan.getNumberOfRepayments();
            loan.setFirstRepaymentAmount(regularPayment);
        }
    }
    
    public void finalizeOnApproval(LoanDetails loan) {
        // Apply product defaults if available
        if (loan.getProductId() != null) {
            try {
                applyProductDefaults(loan);
            } catch (Exception ignored) {}
        }

        // Ensure interest rate present
        validateAndSetInterestRate(loan);
        
        // Ensure loan duration is calculated properly
        if (loan.getLoanDurationDays() == 0 && loan.getLoanDuration() > 0) {
            // Recalculate duration in days
            switch ((loan.getDurationUnit() != null ? loan.getDurationUnit() : "months").toLowerCase()) {
                case "days":
                    loan.setLoanDurationDays(loan.getLoanDuration());
                    break;
                case "weeks":
                    loan.setLoanDurationDays(loan.getLoanDuration() * 7);
                    break;
                case "months":
                    loan.setLoanDurationDays(loan.getLoanDuration() * 30);
                    break;
                case "years":
                    loan.setLoanDurationDays(loan.getLoanDuration() * 365);
                    break;
                default:
                    loan.setLoanDurationDays(loan.getLoanDuration() * 30); // Default to months
            }
        } else if (loan.getLoanDurationDays() == 0) {
            // Set a default duration if not set
            loan.setLoanDuration(6); // 6 months default
            loan.setLoanDurationDays(180); // 6 months in days
        }

        // Calculate or recalculate processing fee
        calculateProcessingFee(loan);

        // Calculate totals and dates - this is critical for balance calculation
        calculateTotalPayable(loan);
        
        // Ensure the totalPayable was calculated correctly
        if (loan.getTotalPayable() == 0 && loan.getPrincipalAmount() > 0) {
            // Force recalculation with basic values
            double principal = loan.getPrincipalAmount();
            double interestRate = loan.getInterestRate() / 100;
            double months = loan.getLoanDurationDays() / 30.0;
            double interestAmount = principal * interestRate * months;
            double totalPayable = principal + interestAmount + loan.getProcessingFee();
            loan.setTotalPayable(totalPayable);
        }
        
        calculatePaymentDates(loan);

        // Ensure number of repayments
        if (loan.getNumberOfRepayments() == 0) {
            loan.setNumberOfRepayments(calculateNumberOfRepayments(loan));
        }

        // Set default release/payment dates if missing
        if (loan.getReleaseDate() == null) {
            loan.setReleaseDate(LocalDate.now());
        }
        if (loan.getPaymentStartDate() == null) {
            loan.setPaymentStartDate(loan.getReleaseDate().plusDays(loan.getGracePeriodDays()));
        }
        // Recompute end date once more to reflect any changes
        loan.calculatePaymentEndDate();

        // Move status to open on approval
        loan.setLoanStatus("open");
    }

    private int calculateNumberOfRepayments(LoanDetails loan) {
        if (loan.getRepaymentFrequency() == null) {
            return 1;
        }
        
        switch (loan.getRepaymentFrequency().toLowerCase()) {
            case "daily":
                return loan.getLoanDurationDays();
            case "weekly":
                return Math.max(1, loan.getLoanDurationDays() / 7);
            case "monthly":
                return Math.max(1, loan.getLoanDurationDays() / 30);
            case "quarterly":
                return Math.max(1, loan.getLoanDurationDays() / 90);
            case "yearly":
                return Math.max(1, loan.getLoanDurationDays() / 365);
            default:
                return Math.max(1, loan.getLoanDurationDays() / 30); // Default to monthly
        }
    }
    
    public Optional<LoanDetails> getLoanById(Long id) {
        return repository.findById(id);
    }

    public LoanDetails updateLoan(Long id, LoanDetails updatedLoan) {
        return repository.findById(id).map(existingLoan -> {
            // Update basic fields
            existingLoan.setPrincipalAmount(updatedLoan.getPrincipalAmount());
            existingLoan.setPaymentStartDate(updatedLoan.getPaymentStartDate());
            existingLoan.setLoanDurationDays(updatedLoan.getLoanDurationDays());
            existingLoan.setLendingBranch(updatedLoan.getLendingBranch());
            existingLoan.setInterestRate(updatedLoan.getInterestRate());
            existingLoan.setRepaymentFrequency(updatedLoan.getRepaymentFrequency());
            existingLoan.setLoanStatus(updatedLoan.getLoanStatus());
            existingLoan.setDescription(updatedLoan.getDescription());

            // Re-calculate all derived fields
            calculateProcessingFee(existingLoan);
            calculateTotalPayable(existingLoan);
            calculatePaymentDates(existingLoan);
            
            return repository.save(existingLoan);
        }).orElseThrow(() -> new RuntimeException("Loan not found with id: " + id));
    }

    public void deleteLoan(Long id) {
        if (!repository.existsById(id)) {
            throw new IllegalArgumentException("Loan not found with id: " + id);
        }
        
        // Check if loan has payments - you might want to prevent deletion of loans with payments
        boolean hasPayments = loanPaymentsRepository.hasAnyPayments(id);
        if (hasPayments) {
            throw new IllegalStateException("Cannot delete loan with existing payments. Please reverse payments first.");
        }
        
        repository.deleteById(id);
    }

    public List<LoanDetails> getLoansByBranch(String branch) {
        return repository.findByLendingBranch(branch);
    }
    
    /**
     * Get loans by branch - returns DTOs
     */
    public List<LoanResponse> getLoansByBranchDTO(String branch) {
        List<LoanDetails> loans = repository.findByLendingBranch(branch);
        return loans.stream()
                .map(loanMapper::toLoanResponse)
                .collect(Collectors.toList());
    }
    
    public List<LoanDetails> getAllLoans() {
        return repository.findAll();
    }
    
    /**
     * Get all loans regardless of status - returns DTOs for admin view
     */
    public List<LoanResponse> getAllLoansDTO() {
        List<LoanDetails> loans = repository.findAll();
        return loans.stream()
                .map(loanMapper::toLoanResponse)
                .collect(Collectors.toList());
    }
    
    // Get only approved loans (for main loans list)
    public List<LoanDetails> getApprovedLoans() {
        return repository.findByWorkflowStatus("APPROVED");
    }
    
    // Get only rejected loans
    public List<LoanDetails> getRejectedLoans() {
        return repository.findByWorkflowStatus("REJECTED");
    }
    
    public List<LoanDetails> getLoansByClient(Long clientId) {
        return repository.findByClientId(clientId);
    }
    
    /**
     * Count total number of loans for a client (used to determine first-time borrower status)
     * @param clientId the client ID
     * @return count of all loans (regardless of status)
     */
    public long countLoansByClient(Long clientId) {
        return repository.countByClientId(clientId);
    }
    
    public List<LoanDetails> getLoansByStatus(String status) {
        return repository.findByLoanStatus(status);
    }
    
    // Enhanced method for loan table view with calculated fields (all loans)
    public List<org.example.dto.LoanTableViewDTO> getLoansForTableView() {
        List<LoanDetails> loans = repository.findAll();
        return loans.stream().map(this::convertToTableViewDTO).collect(Collectors.toList());
    }
    
    // Enhanced method for approved loans table view (main loans list)
    public List<org.example.dto.LoanTableViewDTO> getApprovedLoansForTableView() {
        List<LoanDetails> approvedLoans = repository.findByWorkflowStatus("APPROVED");
        return approvedLoans.stream().map(this::convertToTableViewDTO).collect(Collectors.toList());
    }
    
    // Enhanced method for rejected loans table view
    public List<org.example.dto.LoanTableViewDTO> getRejectedLoansForTableView() {
        List<LoanDetails> rejectedLoans = repository.findByWorkflowStatus("REJECTED");
        return rejectedLoans.stream().map(this::convertToTableViewDTO).collect(Collectors.toList());
    }
    
    private org.example.dto.LoanTableViewDTO convertToTableViewDTO(LoanDetails loan) {
        org.example.dto.LoanTableViewDTO dto = new org.example.dto.LoanTableViewDTO();
        
        // Basic loan info
        dto.setId(loan.getId());
        dto.setLoanNumber(loan.getLoanNumber());
        dto.setReleased(loan.getReleaseDate());
        dto.setMaturity(loan.getPaymentEndDate());
        dto.setRepayment(formatRepaymentFrequency(loan.getRepaymentFrequency()));
        // Status will be calculated later in the method using business rules
        
        // Amounts
        dto.setPrincipal(loan.getPrincipalAmount());
        dto.setPrincipalFormatted( formatCurrency(loan.getPrincipalAmount()));
        dto.setFees(loan.getProcessingFee());
        dto.setFeesFormatted(formatCurrency(loan.getProcessingFee()));
        dto.setDue(loan.getTotalPayable());
        dto.setDueFormatted(formatCurrency(loan.getTotalPayable()));
        
        // Interest rate formatting
        if ("fixed".equalsIgnoreCase(loan.getInterestType()) && loan.getFixedInterestAmount() != null) {
            dto.setInterestRate(formatCurrency(loan.getFixedInterestAmount()) + " Per " + 
                capitalizeFirst(loan.getRatePer()));
        } else {
            dto.setInterestRate(loan.getInterestRate() + "% Per " + capitalizeFirst(loan.getRatePer()));
        }
        
        // Get client name
        dto.setName(getClientName(loan.getClientId()));
        
        // Calculate payment summary from payments table
        calculatePaymentSummary(dto, loan.getId());
        
        // Calculate balance
        dto.setBalance(dto.getDue() - dto.getPaid());
        dto.setBalanceFormatted(formatCurrency(dto.getBalance()));
        
        // Calculate actual loan status using business rules
        boolean hasPayments = loanPaymentsRepository.hasAnyPayments(loan.getId());
        LoanStatusCalculator.LoanStatusInfo statusInfo = loanStatusCalculator.getStatusInfo(loan, dto.getPaid(), hasPayments);
        
        // Set status information
        dto.setStatus(statusInfo.getDisplayName());
        dto.setStatusBadgeClass(statusInfo.getCssClass());
        dto.setFullyPaid(statusInfo.getStatus() == LoanStatus.CLOSED);
        dto.setOverdue(statusInfo.getStatus() == LoanStatus.OVERDUE || statusInfo.getStatus() == LoanStatus.DEFAULTED);
        
        // Action permissions
        dto.setCanModify(canModifyLoan(loan));
        dto.setCanViewDetails(true); // All loans can be viewed
        
        return dto;
    }
    
    private String getClientName(Long clientId) {
        try {
            Optional<User> userOpt = userRepository.findById(clientId);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                return user.getFullName();
            }
            return "Unknown Client";
        } catch (Exception e) {
            return "Client " + clientId;
        }
    }
    
    private void calculatePaymentSummary(org.example.dto.LoanTableViewDTO dto, Long loanId) {
        try {
            // Get payment totals from LoanPayments table
            Double totalPaid = loanPaymentsRepository.getTotalPaidByLoanId(loanId);
            Double totalPenalty = loanPaymentsRepository.getTotalPenaltyByLoanId(loanId);
            
            dto.setPaid(totalPaid != null ? totalPaid : 0.0);
            dto.setPaidFormatted(formatCurrency(dto.getPaid()));
            dto.setPenalty(totalPenalty != null ? totalPenalty : 0.0);
            dto.setPenaltyFormatted(formatCurrency(dto.getPenalty()));
        } catch (Exception e) {
            dto.setPaid(0.0);
            dto.setPaidFormatted(formatCurrency(0.0));
            dto.setPenalty(0.0);
            dto.setPenaltyFormatted(formatCurrency(0.0));
        }
    }
    
    private String formatRepaymentFrequency(String frequency) {
        if (frequency == null) return "Monthly";
        return capitalizeFirst(frequency);
    }
    
    private String capitalizeFirst(String str) {
        if (str == null || str.isEmpty()) return str;
        return str.substring(0, 1).toUpperCase() + str.substring(1).toLowerCase();
    }
    
    private String formatCurrency(double amount) {
        // Format currency as Ugandan Shillings with thousands separators
        return String.format("USh %,.0f", amount);
    }
    
    private boolean canModifyLoan(LoanDetails loan) {
        // Calculate current status to determine if loan can be modified
        boolean hasPayments = loanPaymentsRepository.hasAnyPayments(loan.getId());
        Double totalPaid = loanPaymentsRepository.getTotalPaidByLoanId(loan.getId());
        LoanStatus currentStatus = loanStatusCalculator.calculateLoanStatus(loan, totalPaid != null ? totalPaid : 0.0, hasPayments);
        
        // Loans can be modified if they're not closed or defaulted
        return currentStatus != LoanStatus.CLOSED && currentStatus != LoanStatus.DEFAULTED;
    }
    
    // Temporary method to provide sample data for testing
    public List<org.example.dto.LoanTableViewDTO> getSampleLoansForTableView() {
        List<org.example.dto.LoanTableViewDTO> sampleLoans = new ArrayList<>();
        
        // Sample loan 1 - Closed (Fully Paid)
        org.example.dto.LoanTableViewDTO loan1 = new org.example.dto.LoanTableViewDTO();
        loan1.setId(1L);
        loan1.setLoanNumber("LN-1000016");
        loan1.setName("Melissa Aviso");
        loan1.setReleased(LocalDate.of(2016, 8, 10));
        loan1.setMaturity(LocalDate.of(2016, 8, 22));
        loan1.setRepayment("Daily");
        loan1.setPrincipal(2000);
        loan1.setPrincipalFormatted("USh 2,000");
        loan1.setInterestRate("5% Per Month");
        loan1.setFees(90);
        loan1.setFeesFormatted("USh 90");
        loan1.setPenalty(0);
        loan1.setPenaltyFormatted("USh 0");
        loan1.setDue(2390);
        loan1.setDueFormatted("USh 2,390");
        loan1.setPaid(2390);
        loan1.setPaidFormatted("USh 2,390");
        loan1.setBalance(0);
        loan1.setBalanceFormatted("USh 0");
        loan1.setStatus("Closed");
        loan1.setStatusBadgeClass("closed");
        loan1.setFullyPaid(true);
        loan1.setOverdue(false);
        loan1.setCanModify(false);
        loan1.setCanViewDetails(true);
        sampleLoans.add(loan1);
        
        // Sample loan 2 - Open
        org.example.dto.LoanTableViewDTO loan2 = new org.example.dto.LoanTableViewDTO();
        loan2.setId(2L);
        loan2.setLoanNumber("LN-1000373");
        loan2.setName("Melissa Aviso");
        loan2.setReleased(LocalDate.of(2018, 5, 10));
        loan2.setMaturity(LocalDate.of(2018, 10, 10));
        loan2.setRepayment("Monthly");
        loan2.setPrincipal(2000);
        loan2.setPrincipalFormatted("USh 2,000");
        loan2.setInterestRate("20% Per Year");
        loan2.setFees(300);
        loan2.setFeesFormatted("USh 300");
        loan2.setPenalty(0);
        loan2.setPenaltyFormatted("USh 0");
        loan2.setDue(2500);
        loan2.setDueFormatted("USh 2,500");
        loan2.setPaid(0);
        loan2.setPaidFormatted("USh 0");
        loan2.setBalance(2500);
        loan2.setBalanceFormatted("USh 2,500");
        loan2.setStatus("Open");
        loan2.setStatusBadgeClass("open");
        loan2.setFullyPaid(false);
        loan2.setOverdue(false);
        loan2.setCanModify(true);
        loan2.setCanViewDetails(true);
        sampleLoans.add(loan2);
        
        // Sample loan 3 - In Progress
        org.example.dto.LoanTableViewDTO loan3 = new org.example.dto.LoanTableViewDTO();
        loan3.setId(3L);
        loan3.setLoanNumber("LN-1000023");
        loan3.setName("Melissa Aviso");
        loan3.setReleased(LocalDate.of(2018, 1, 6));
        loan3.setMaturity(LocalDate.of(2018, 1, 22));
        loan3.setRepayment("Daily");
        loan3.setPrincipal(10000.10);
        loan3.setPrincipalFormatted("USh 10,000.10");
        loan3.setInterestRate("10% Per Day");
        loan3.setFees(0);
        loan3.setFeesFormatted("USh 0");
        loan3.setPenalty(260);
        loan3.setPenaltyFormatted("USh 260");
        loan3.setDue(11260.11);
        loan3.setDueFormatted("USh 11,260.11");
        loan3.setPaid(11260.11);
        loan3.setPaidFormatted("USh 11,260.11");
        loan3.setBalance(0);
        loan3.setBalanceFormatted("USh 0");
        loan3.setStatus("Closed");
        loan3.setStatusBadgeClass("closed");
        loan3.setFullyPaid(true);
        loan3.setOverdue(false);
        loan3.setCanModify(false);
        loan3.setCanViewDetails(true);
        sampleLoans.add(loan3);
        
        return sampleLoans;
    }
    
    /**
     * Recalculate totalPayable for all loans that have zero or incorrect totalPayable
     * This is useful for fixing loans that were created before proper calculation logic
     */
    public int recalculateTotalPayableForAllLoans() {
        List<LoanDetails> allLoans = repository.findAll();
        int updatedCount = 0;
        
        for (LoanDetails loan : allLoans) {
            try {
                // Fix loans with zero or very low totalPayable (less than principal)
                if (loan.getTotalPayable() == 0 || loan.getTotalPayable() < loan.getPrincipalAmount()) {
                    recalculateLoanFinancials(loan);
                    
                    // Double-check that all values are finite before saving
                    if (isLoanDataValid(loan)) {
                        repository.save(loan);
                        updatedCount++;
                    } else {
                        // Log the problem loan but don't save it
                        System.err.println("Skipping loan ID " + loan.getId() + " due to invalid calculated values");
                    }
                }
            } catch (Exception e) {
                System.err.println("Error processing loan ID " + loan.getId() + ": " + e.getMessage());
            }
        }
        
        return updatedCount;
    }
    
    /**
     * Check if all loan financial data is valid (finite numbers)
     */
    private boolean isLoanDataValid(LoanDetails loan) {
        return Double.isFinite(loan.getTotalPayable()) && 
               Double.isFinite(loan.getProcessingFee()) && 
               Double.isFinite(loan.getInterestRate()) &&
               loan.getTotalPayable() >= loan.getPrincipalAmount() &&
               loan.getTotalPayable() > 0 &&
               (loan.getFirstRepaymentAmount() == null || Double.isFinite(loan.getFirstRepaymentAmount()));
    }
    
    /**
     * Recalculate all financial aspects of a loan
     */
    private void recalculateLoanFinancials(LoanDetails loan) {
        try {
            // Ensure basic fields are set
            validateAndSetInterestRate(loan);
            
            // Ensure loan duration is calculated
            if (loan.getLoanDurationDays() == 0) {
                if (loan.getLoanDuration() > 0) {
                    // Use existing duration
                    switch ((loan.getDurationUnit() != null ? loan.getDurationUnit() : "months").toLowerCase()) {
                        case "days":
                            loan.setLoanDurationDays(loan.getLoanDuration());
                            break;
                        case "weeks":
                            loan.setLoanDurationDays(loan.getLoanDuration() * 7);
                            break;
                        case "months":
                            loan.setLoanDurationDays(loan.getLoanDuration() * 30);
                            break;
                        case "years":
                            loan.setLoanDurationDays(loan.getLoanDuration() * 365);
                            break;
                        default:
                            loan.setLoanDurationDays(loan.getLoanDuration() * 30);
                    }
                } else {
                    // Set default 6 months
                    loan.setLoanDuration(6);
                    loan.setLoanDurationDays(180);
                    loan.setDurationUnit("months");
                }
            }
            
            // Calculate processing fee
            calculateProcessingFee(loan);
            
            // Calculate total payable
            calculateTotalPayable(loan);
            
            // Validate all calculated values before saving
            validateCalculatedValues(loan);
            
            // Calculate payment dates if missing
            if (loan.getPaymentStartDate() == null || loan.getPaymentEndDate() == null) {
                calculatePaymentDates(loan);
            }
            
            // Set number of repayments if missing
            if (loan.getNumberOfRepayments() == 0) {
                loan.setNumberOfRepayments(calculateNumberOfRepayments(loan));
            }
        } catch (Exception e) {
            // If anything goes wrong, set safe default values
            setDefaultLoanValues(loan);
        }
    }
    
    /**
     * Validate all calculated values to prevent database errors
     */
    private void validateCalculatedValues(LoanDetails loan) {
        // Check for infinity or NaN values
        if (!Double.isFinite(loan.getTotalPayable())) {
            loan.setTotalPayable(loan.getPrincipalAmount() * 1.2); // Default 20% total interest
        }
        
        if (!Double.isFinite(loan.getProcessingFee())) {
            loan.setProcessingFee(0);
        }
        
        if (!Double.isFinite(loan.getInterestRate()) || loan.getInterestRate() < 0) {
            loan.setInterestRate(20.0); // Default 20%
        }
        
        if (loan.getFirstRepaymentAmount() != null && !Double.isFinite(loan.getFirstRepaymentAmount())) {
            loan.setFirstRepaymentAmount(loan.getTotalPayable() / Math.max(loan.getNumberOfRepayments(), 1));
        }
    }
    
    /**
     * Set safe default values for a loan
     */
    private void setDefaultLoanValues(LoanDetails loan) {
        loan.setInterestRate(20.0);
        loan.setLoanDuration(6);
        loan.setLoanDurationDays(180);
        loan.setDurationUnit("months");
        loan.setRepaymentFrequency("monthly");
        loan.setInterestMethod("flat");
        loan.setRatePer("month");
        loan.setProcessingFee(calculateDefaultProcessingFee(loan.getPrincipalAmount()));
        loan.setTotalPayable(loan.getPrincipalAmount() * 1.2); // 20% interest
        loan.setNumberOfRepayments(6);
    }
    
    /**
     * Simple fix for loans with zero totalPayable - uses basic 20% interest calculation
     */
    public int fixLoansWithZeroTotalPayable() {
        List<LoanDetails> allLoans = repository.findAll();
        int updatedCount = 0;
        
        for (LoanDetails loan : allLoans) {
            if (loan.getTotalPayable() == 0 && loan.getPrincipalAmount() > 0) {
                // Simple calculation: Principal + 20% interest + processing fee
                double principal = loan.getPrincipalAmount();
                double interestAmount = principal * 0.2; // 20% interest
                double processingFee = calculateSimpleProcessingFee(principal);
                double totalPayable = principal + interestAmount + processingFee;
                
                // Update the loan
                loan.setTotalPayable(totalPayable);
                loan.setProcessingFee(processingFee);
                loan.setInterestRate(20.0);
                loan.setInterestMethod("flat");
                loan.setRatePer("loan");
                loan.setLoanStatus("open"); // Set status to open instead of approved
                
                // Set default duration if missing
                if (loan.getLoanDurationDays() == 0) {
                    loan.setLoanDuration(6);
                    loan.setLoanDurationDays(180);
                    loan.setDurationUnit("months");
                }
                
                // Set repayments if missing
                if (loan.getNumberOfRepayments() == 0) {
                    loan.setNumberOfRepayments(6);
                }
                
                repository.save(loan);
                updatedCount++;
            }
        }
        
        return updatedCount;
    }
    
    /**
     * Simple processing fee calculation
     */
    private double calculateSimpleProcessingFee(double amount) {
        if (amount <= 50_000) return 5_000;
        else if (amount <= 100_000) return 10_000;
        else if (amount <= 500_000) return 15_000;
        else return 20_000;
    }

    /**
     * Approve a loan application
     * Harmonization: Updates workflowStatus to APPROVED, synchronizes loanStatus to OPEN
     */
    public LoanDetails approveLoan(Long loanId, Long approvedById) {
        LoanDetails loan = repository.findById(loanId)
            .orElseThrow(() -> new IllegalArgumentException("Loan not found with id: " + loanId));
        
        // ✅ FIXED: Check workflowStatus for admin workflow actions
        if (!"PENDING_APPROVAL".equals(loan.getWorkflowStatus())) {
            throw new IllegalStateException("Can only approve loans with workflowStatus PENDING_APPROVAL. Current workflowStatus: " + loan.getWorkflowStatus());
        }
        
        // Update workflowStatus (admin workflow)
        loan.setWorkflowStatus("APPROVED");
        loan.setApprovedById(approvedById);
        loan.setApprovalDate(java.time.LocalDateTime.now());
        
        // ✅ FIXED: Synchronize loanStatus (operational status)
        synchronizeStatusesAfterApproval(loan);
        
        LoanDetails savedLoan = repository.save(loan);
        
        // Publish LoanApprovedEvent for WebSocket broadcast and audit logging
        try {
            String actionBy = approvedById != null ? String.valueOf(approvedById) : "SYSTEM";
            eventPublisher.publishEvent(new LoanApprovedEvent(this, savedLoan, actionBy));
        } catch (Exception e) {
            System.err.println("Error publishing loan approved event: " + e.getMessage());
        }
        
        return savedLoan;
    }
    
    /**
     * Reject a loan application
     * Harmonization: Updates workflowStatus to REJECTED, synchronizes loanStatus to CLOSED
     */
    public LoanDetails rejectLoan(Long loanId, Long rejectedById, String rejectionReason) {
        LoanDetails loan = repository.findById(loanId)
            .orElseThrow(() -> new IllegalArgumentException("Loan not found with id: " + loanId));
        
        // ✅ FIXED: Check workflowStatus for admin workflow actions
        if (!"PENDING_APPROVAL".equals(loan.getWorkflowStatus())) {
            throw new IllegalStateException("Can only reject loans with workflowStatus PENDING_APPROVAL. Current workflowStatus: " + loan.getWorkflowStatus());
        }
        
        // Update workflowStatus (admin workflow)
        loan.setWorkflowStatus("REJECTED");
        loan.setRejectedById(rejectedById);
        loan.setRejectionReason(rejectionReason);
        
        // ✅ FIXED: Synchronize loanStatus (operational status)
        synchronizeStatusesAfterRejection(loan);
        
        LoanDetails savedLoan = repository.save(loan);
        
        // Publish LoanRejectedEvent for WebSocket broadcast and audit logging
        try {
            String actionBy = rejectedById != null ? String.valueOf(rejectedById) : "SYSTEM";
            eventPublisher.publishEvent(new LoanRejectedEvent(this, savedLoan, actionBy, rejectionReason));
        } catch (Exception e) {
            System.err.println("Error publishing loan rejected event: " + e.getMessage());
        }
        
        return savedLoan;
    }
    
    /**
     * Disburse an approved loan
     * Harmonization: Updates workflowStatus to DISBURSED, synchronizes loanStatus to ACTIVE
     */
    public LoanDetails disburseLoan(Long loanId, Long disbursedById) {
        LoanDetails loan = repository.findById(loanId)
            .orElseThrow(() -> new IllegalArgumentException("Loan not found with id: " + loanId));
        
        // ✅ FIXED: Check workflowStatus for admin workflow actions
        if (!"APPROVED".equals(loan.getWorkflowStatus())) {
            throw new IllegalStateException("Can only disburse loans with workflowStatus APPROVED. Current workflowStatus: " + loan.getWorkflowStatus());
        }
        
        // Update workflowStatus (admin workflow)
        loan.setWorkflowStatus("DISBURSED");
        loan.setDisbursedAt(java.time.LocalDateTime.now());
        // Note: disbursed_by_id doesn't exist yet, but we can track via separate field if needed
        
        // ✅ FIXED: Synchronize loanStatus (operational status)
        synchronizeStatusesAfterDisbursement(loan);
        
        LoanDetails savedLoan = repository.save(loan);
        // Database trigger will create loan_tracking entry automatically
        
        // Broadcast loan disbursement via WebSocket
        try {
            loanWebSocketService.broadcastLoanDisbursed(
                savedLoan.getId(),
                savedLoan.getLoanNumber(),
                savedLoan.getPrincipalAmount()
            );
            loanWebSocketService.broadcastToLoanDetails(savedLoan.getId());
        } catch (Exception e) {
            System.err.println("Error broadcasting loan disbursement: " + e.getMessage());
        }
        
        // Publish LoanStatusUpdatedEvent for audit logging
        try {
            String actionBy = disbursedById != null ? String.valueOf(disbursedById) : "SYSTEM";
            eventPublisher.publishEvent(new LoanStatusUpdatedEvent(this, savedLoan, actionBy, "APPROVED", "DISBURSED"));
        } catch (Exception e) {
            System.err.println("Error publishing loan status updated event: " + e.getMessage());
        }
        
        return savedLoan;
    }
    
    /**
     * Check if loan can be modified (only in PENDING_APPROVAL state)
     * ✅ FIXED: Check workflowStatus for admin permissions
     */
    public boolean canEditLoan(Long loanId) {
        LoanDetails loan = repository.findById(loanId).orElse(null);
        if (loan == null) return false;
        return "PENDING_APPROVAL".equals(loan.getWorkflowStatus());
    }
    
    // ============================================================================
    // STATUS HARMONIZATION HELPER METHODS
    // ============================================================================
    
    /**
     * Synchronize loanStatus after loan approval
     * PENDING_APPROVAL → APPROVED workflow means OPEN loan status
     */
    private void synchronizeStatusesAfterApproval(LoanDetails loan) {
        loan.setLoanStatus("OPEN");
    }
    
    /**
     * Synchronize loanStatus after loan rejection
     * REJECTED workflow means CLOSED loan status
     */
    private void synchronizeStatusesAfterRejection(LoanDetails loan) {
        loan.setLoanStatus("CLOSED");
    }
    
    /**
     * Synchronize loanStatus after loan disbursement
     * DISBURSED workflow means OPEN loan status (initially, until first payment)
     */
    private void synchronizeStatusesAfterDisbursement(LoanDetails loan) {
        loan.setLoanStatus("OPEN");
    }
    
    /**
     * General synchronization method - ensures statuses are harmonized
     * Call this whenever workflowStatus changes manually
     */
    public void synchronizeStatuses(LoanDetails loan) {
        String workflowStatus = loan.getWorkflowStatus();
        
        switch (workflowStatus) {
            case "PENDING_APPROVAL":
                loan.setLoanStatus("OPEN");
                break;
            case "APPROVED":
                loan.setLoanStatus("OPEN");
                break;
            case "DISBURSED":
                // For disbursed loans, only set to OPEN if not already set to operational status
                if (loan.getLoanStatus() == null || 
                    !"OPEN,IN_PROGRESS,OVERDUE,CLOSED,DEFAULTED".contains(loan.getLoanStatus())) {
                    loan.setLoanStatus("OPEN");
                }
                break;
            case "REJECTED":
                loan.setLoanStatus("CLOSED");
                break;
            default:
                loan.setLoanStatus("OPEN");
        }
    }
    
    // WebSocket events are now handled by LoanEventListener via Spring Events
    // This ensures consistent event-driven architecture across the application
    
    /**
     * Update loanStatus based on payment progress and time
     * ✅ BUSINESS RULES IMPLEMENTED:
     * - OPEN → No installment made yet after disbursement
     * - IN_PROGRESS → At least one installment made, not fully paid, before maturity
     * - CLOSED → Fully paid before maturity date
     * - OVERDUE → Any payment made after maturity date OR not fully paid after maturity
     * - DEFAULTED → No payment made for 180 days after maturity date
     */
    public void updateLoanStatusBasedOnPayments(LoanDetails loan) {
        String workflowStatus = loan.getWorkflowStatus();
        
        // For pending loans, use OPEN
        if ("PENDING_APPROVAL".equals(workflowStatus)) {
            loan.setLoanStatus("OPEN");
            return;
        }
        
        // For rejected loans, use CLOSED
        if ("REJECTED".equals(workflowStatus)) {
            loan.setLoanStatus("CLOSED");
            return;
        }
        
        // For approved but not yet disbursed loans, use OPEN
        if ("APPROVED".equals(workflowStatus)) {
            loan.setLoanStatus("OPEN");
            return;
        }
        
        // For disbursed loans, calculate based on payments and time
        if ("DISBURSED".equals(workflowStatus)) {
            Double totalPaidAmount = loanPaymentsRepository.getTotalPaidByLoanId(loan.getId());
            double totalPaid = totalPaidAmount != null ? totalPaidAmount : 0.0;
            double totalPayable = loan.getTotalPayable() > 0 ? loan.getTotalPayable() : loan.getPrincipalAmount();
            
            LocalDate maturityDate = loan.getPaymentEndDate();
            LocalDate today = LocalDate.now();
            
            // ✅ RULE 1: No payments made yet
            if (totalPaid <= 0) {
                // Check if 180+ days after maturity with no payment
                if (maturityDate != null && today.isAfter(maturityDate.plusDays(180))) {
                    loan.setLoanStatus("DEFAULTED");
                } else {
                    loan.setLoanStatus("OPEN");
                }
                return;
            }
            
            // ✅ RULE 2: Partial payments made (not fully paid)
            if (totalPaid > 0 && totalPaid < totalPayable) {
                // Check if after maturity date
                if (maturityDate != null && today.isAfter(maturityDate)) {
                    loan.setLoanStatus("OVERDUE");
                } else {
                    loan.setLoanStatus("IN_PROGRESS");
                }
                return;
            }
            
            // ✅ RULE 3: Fully paid (totalPaid >= totalPayable)
            if (totalPaid >= totalPayable) {
                // Check if paid before or after maturity
                if (maturityDate != null && today.isBefore(maturityDate)) {
                    loan.setLoanStatus("CLOSED");
                } else {
                    // Fully paid but after maturity = OVERDUE (was late but now cleared)
                    loan.setLoanStatus("OVERDUE");
                }
                return;
            }
            
            // Fallback (shouldn't reach here)
            loan.setLoanStatus("OPEN");
        }
    }
    
    /**
     * Manual trigger to update all loan statuses
     * Can be called anytime to refresh loan statuses based on payments and maturity dates
     */
    @Transactional
    public void updateAllLoanStatuses() {
        System.out.println("Starting loan status update...");
        
        List<LoanDetails> allLoans = repository.findAll();
        int updatedCount = 0;
        
        for (LoanDetails loan : allLoans) {
            String oldStatus = loan.getLoanStatus();
            updateLoanStatusBasedOnPayments(loan);
            String newStatus = loan.getLoanStatus();
            
            if (!oldStatus.equals(newStatus)) {
                repository.save(loan);
                updatedCount++;
                System.out.println("Updated loan " + loan.getLoanNumber() + ": " + oldStatus + " → " + newStatus);
            }
        }
        
        System.out.println("Loan status update completed. Updated " + updatedCount + " loans.");
    }
    
    /**
     * Get complete loan details for frontend loan details page
     * Returns consolidated data including client, officer, tracking, payments, and workflow history
     */
    public CompleteLoanDetailsResponse getCompleteLoanDetails(Long id) {
        // Fetch loan
        LoanDetails loan = repository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Loan not found with ID: " + id));
        
        // Fetch client
        User client = userRepository.findById(loan.getClientId()).orElse(null);
        
        // Fetch loan officer (creator)
        User officer = userRepository.findById(loan.getCreatedById()).orElse(null);
        
        // Fetch payments
        List<LoanPayments> payments = loanPaymentsRepository.findByLoanIdOrderByPaymentDateDesc(loan.getId());
        
        // Fetch tracking
        LoanTracking tracking = loanTrackingRepository.findByLoanId(loan.getId()).orElse(null);
        
        // Build workflow history from loan audit fields
        List<CompleteLoanDetailsResponse.WorkflowHistoryDTO> workflowHistory = buildWorkflowHistory(loan);
        
        // Map to response DTO
        return loanMapper.toCompleteLoanResponse(loan, client, officer, payments, tracking, workflowHistory);
    }
    
    /**
     * Build workflow history from loan audit fields
     * Since we don't have a separate workflow_history table, we construct it from loan metadata
     */
    private List<CompleteLoanDetailsResponse.WorkflowHistoryDTO> buildWorkflowHistory(LoanDetails loan) {
        List<CompleteLoanDetailsResponse.WorkflowHistoryDTO> history = new ArrayList<>();
        
        // Loan created
        if (loan.getCreatedAt() != null) {
            history.add(CompleteLoanDetailsResponse.WorkflowHistoryDTO.builder()
                .action("CREATED")
                .performedBy(loan.getCreatedBy() != null ? loan.getCreatedBy() : "System")
                .timestamp(loan.getCreatedAt())
                .notes("Loan application created")
                .build());
        }
        
        // Loan approved
        if (loan.getApprovalDate() != null && "APPROVED".equals(loan.getWorkflowStatus())) {
            String approverName = "Cashier";
            if (loan.getApprovedById() != null) {
                Optional<User> approver = userRepository.findById(loan.getApprovedById());
                approverName = approver.map(User::getFullName).orElse("User #" + loan.getApprovedById());
            }
            
            history.add(CompleteLoanDetailsResponse.WorkflowHistoryDTO.builder()
                .action("APPROVED")
                .performedBy(approverName)
                .timestamp(loan.getApprovalDate())
                .notes("Loan approved by cashier")
                .build());
        }
        
        // Loan rejected
        if ("REJECTED".equals(loan.getWorkflowStatus())) {
            String rejectorName = "Cashier";
            if (loan.getRejectedById() != null) {
                Optional<User> rejector = userRepository.findById(loan.getRejectedById());
                rejectorName = rejector.map(User::getFullName).orElse("User #" + loan.getRejectedById());
            }
            
            history.add(CompleteLoanDetailsResponse.WorkflowHistoryDTO.builder()
                .action("REJECTED")
                .performedBy(rejectorName)
                .timestamp(loan.getUpdatedAt() != null ? loan.getUpdatedAt() : loan.getCreatedAt())
                .notes(loan.getRejectionReason() != null ? loan.getRejectionReason() : "Loan rejected")
                .build());
        }
        
        // Loan disbursed
        if (loan.getDisbursedAt() != null) {
            history.add(CompleteLoanDetailsResponse.WorkflowHistoryDTO.builder()
                .action("DISBURSED")
                .performedBy(loan.getDisbursedBy() != null ? loan.getDisbursedBy() : "Cashier")
                .timestamp(loan.getDisbursedAt())
                .notes("Loan disbursed to client")
                .build());
        }
        
        return history;
    }
    
    /**
     * Get all archived loans
     */
    public List<org.example.dto.LoanTableViewDTO> getArchivedLoans() {
        List<LoanDetails> archivedLoans = repository.findByArchivedTrue();
        return archivedLoans.stream()
            .map(this::convertToTableViewDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Archive a loan - only COMPLETED loans can be archived
     */
    @Transactional
    public LoanDetails archiveLoan(Long loanId) {
        LoanDetails loan = repository.findById(loanId)
            .orElseThrow(() -> new IllegalArgumentException("Loan not found with ID: " + loanId));
        
        // Validation: Only COMPLETED loans can be archived
        if (!"COMPLETED".equalsIgnoreCase(loan.getLoanStatus())) {
            throw new IllegalStateException(
                "Only COMPLETED loans can be archived. Current status: " + loan.getLoanStatus()
            );
        }
        
        // Archive the loan
        loan.setArchived(true);
        loan.setArchivedDate(LocalDateTime.now());
        LoanDetails savedLoan = repository.save(loan);
        
        // Publish WebSocket event
        try {
            loanWebSocketService.notifyLoanArchived(savedLoan);
        } catch (Exception e) {
            System.err.println("Error notifying loan archived: " + e.getMessage());
        }
        
        return savedLoan;
    }
    
    /**
     * Unarchive a loan - restore to active loans list
     */
    @Transactional
    public LoanDetails unarchiveLoan(Long loanId) {
        LoanDetails loan = repository.findById(loanId)
            .orElseThrow(() -> new IllegalArgumentException("Loan not found with ID: " + loanId));
        
        // Validation: Loan must be archived
        if (!loan.isArchived()) {
            throw new IllegalStateException("Loan is not archived");
        }
        
        // Unarchive the loan
        loan.setArchived(false);
        loan.setArchivedDate(null);
        LoanDetails savedLoan = repository.save(loan);
        
        // Publish WebSocket event
        try {
            loanWebSocketService.notifyLoanUnarchived(savedLoan);
        } catch (Exception e) {
            System.err.println("Error notifying loan unarchived: " + e.getMessage());
        }
        
        return savedLoan;
    }

}
