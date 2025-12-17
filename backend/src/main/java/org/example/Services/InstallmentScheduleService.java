package org.example.Services;

import org.example.Entities.LoanDetails;
import org.example.Entities.LoanInstallmentSchedule;
import org.example.Entities.LoanProduct;
import org.example.Events.InstallmentScheduleGeneratedEvent;
import org.example.Repositories.LoanDetailsRepository;
import org.example.Repositories.LoanInstallmentScheduleRepository;
import org.example.Repositories.LoanProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Service for generating and managing loan installment schedules
 * Handles flat, reducing balance, and compound interest methods
 */
@Service
@Transactional
public class InstallmentScheduleService {
    
    @Autowired
    private LoanInstallmentScheduleRepository installmentRepository;
    
    @Autowired
    private LoanDetailsRepository loanRepository;
    
    @Autowired
    private LoanProductRepository productRepository;
    
    @Autowired
    private ApplicationEventPublisher eventPublisher;
    
    /**
     * Generate complete installment schedule for a loan
     * Called when loan is disbursed
     */
    public List<LoanInstallmentSchedule> generateSchedule(Long loanId) {
        // Get loan details
        LoanDetails loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new RuntimeException("Loan not found: " + loanId));
        
        // Get loan product for additional config
        LoanProduct product = null;
        if (loan.getProductId() != null) {
            product = productRepository.findById(loan.getProductId()).orElse(null);
        }
        
        // Delete existing schedule if any (regeneration)
        installmentRepository.deleteByLoanId(loanId);
        
        // Generate installments based on interest method
        List<LoanInstallmentSchedule> installments;
        String interestMethod = loan.getInterestMethod() != null ? loan.getInterestMethod().toLowerCase() : "flat";
        
        switch (interestMethod) {
            case "reducing":
            case "reducing_balance":
                installments = generateReducingBalanceSchedule(loan, product);
                break;
            case "compound":
                installments = generateCompoundInterestSchedule(loan, product);
                break;
            case "flat":
            default:
                installments = generateFlatRateSchedule(loan, product);
                break;
        }
        
        // Save all installments
        List<LoanInstallmentSchedule> savedInstallments = installmentRepository.saveAll(installments);
        
        // Publish event
        List<Long> installmentIds = savedInstallments.stream()
                .map(LoanInstallmentSchedule::getId)
                .toList();
        
        eventPublisher.publishEvent(new InstallmentScheduleGeneratedEvent(this, loan, installmentIds));
        
        return savedInstallments;
    }
    
    /**
     * Generate schedule for FLAT interest rate
     * Interest is calculated on principal and split equally across installments
     */
    private List<LoanInstallmentSchedule> generateFlatRateSchedule(LoanDetails loan, LoanProduct product) {
        List<LoanInstallmentSchedule> installments = new ArrayList<>();
        
        // Calculate total amounts
        double principal = loan.getPrincipalAmount();
        double totalPayable = loan.getTotalPayable();
        double totalInterest = totalPayable - principal - loan.getProcessingFee();
        double processingFee = loan.getProcessingFee();
        
        int numberOfInstallments = loan.getNumberOfRepayments();
        
        // Calculate equal installment amount
        double equalInstallmentAmount = totalPayable / numberOfInstallments;
        
        // Calculate portions for each installment
        double interestPerInstallment = totalInterest / numberOfInstallments;
        double principalPerInstallment = principal / numberOfInstallments;
        double feePerInstallment = processingFee / numberOfInstallments;
        
        // Get start date and frequency
        LocalDate dueDate = loan.getFirstRepaymentDate() != null ? 
                loan.getFirstRepaymentDate() : loan.getPaymentStartDate();
        
        if (dueDate == null) {
            dueDate = loan.getReleaseDate() != null ? 
                    loan.getReleaseDate().plusDays(getDaysForFrequency(loan.getRepaymentFrequency())) : 
                    LocalDate.now().plusDays(30);
        }
        
        int gracePeriodDays = loan.getGracePeriodDays();
        double cumulativePaid = 0.0;
        double cumulativeOutstanding = totalPayable;
        
        // Generate each installment
        for (int i = 1; i <= numberOfInstallments; i++) {
            LoanInstallmentSchedule installment = new LoanInstallmentSchedule();
            
            // Basic info
            installment.setLoanId(loan.getId());
            installment.setInstallmentNumber(i);
            installment.setDueDate(dueDate);
            
            // Scheduled amounts
            installment.setScheduledAmount(equalInstallmentAmount);
            installment.setPrincipalPortion(principalPerInstallment);
            installment.setInterestPortion(interestPerInstallment);
            installment.setFeesPortion(feePerInstallment);
            
            // Grace period
            installment.setGracePeriodDays(gracePeriodDays);
            if (gracePeriodDays > 0) {
                installment.setGraceExpiryDate(dueDate.plusDays(gracePeriodDays));
            }
            
            // Balance tracking
            installment.setOutstandingAmount(equalInstallmentAmount);
            installment.setCumulativePaid(cumulativePaid);
            installment.setCumulativeOutstanding(cumulativeOutstanding);
            
            cumulativeOutstanding -= equalInstallmentAmount;
            
            installments.add(installment);
            
            // Calculate next due date based on frequency
            dueDate = calculateNextDueDate(dueDate, loan.getRepaymentFrequency());
        }
        
        return installments;
    }
    
    /**
     * Generate schedule for REDUCING BALANCE interest
     * Interest calculated on remaining principal
     */
    private List<LoanInstallmentSchedule> generateReducingBalanceSchedule(LoanDetails loan, LoanProduct product) {
        List<LoanInstallmentSchedule> installments = new ArrayList<>();
        
        double principal = loan.getPrincipalAmount();
        double annualRate = loan.getInterestRate();
        int numberOfInstallments = loan.getNumberOfRepayments();
        int gracePeriodDays = loan.getGracePeriodDays();
        
        // Calculate periodic interest rate
        double periodicRate = calculatePeriodicRate(annualRate, loan.getRepaymentFrequency(), loan.getRatePer());
        
        // Calculate EMI using reducing balance formula
        double emi = calculateEMI(principal, periodicRate, numberOfInstallments);
        
        // Get start date
        LocalDate dueDate = loan.getFirstRepaymentDate() != null ? 
                loan.getFirstRepaymentDate() : loan.getPaymentStartDate();
        
        if (dueDate == null) {
            dueDate = loan.getReleaseDate() != null ? 
                    loan.getReleaseDate().plusDays(getDaysForFrequency(loan.getRepaymentFrequency())) : 
                    LocalDate.now().plusDays(30);
        }
        
        double remainingPrincipal = principal;
        double cumulativePaid = 0.0;
        
        // Processing fees - add to first installment
        double processingFee = loan.getProcessingFee();
        
        // Generate each installment
        for (int i = 1; i <= numberOfInstallments; i++) {
            // Calculate interest on remaining principal
            double interestAmount = remainingPrincipal * periodicRate;
            double principalAmount = emi - interestAmount;
            
            // Add fees to first installment
            double fees = (i == 1) ? processingFee : 0.0;
            double scheduledAmount = emi + fees;
            
            LoanInstallmentSchedule installment = new LoanInstallmentSchedule();
            
            // Basic info
            installment.setLoanId(loan.getId());
            installment.setInstallmentNumber(i);
            installment.setDueDate(dueDate);
            
            // Scheduled amounts
            installment.setScheduledAmount(scheduledAmount);
            installment.setPrincipalPortion(principalAmount);
            installment.setInterestPortion(interestAmount);
            installment.setFeesPortion(fees);
            
            // Grace period
            installment.setGracePeriodDays(gracePeriodDays);
            if (gracePeriodDays > 0) {
                installment.setGraceExpiryDate(dueDate.plusDays(gracePeriodDays));
            }
            
            // Balance tracking
            installment.setOutstandingAmount(scheduledAmount);
            installment.setCumulativePaid(cumulativePaid);
            
            remainingPrincipal -= principalAmount;
            installment.setCumulativeOutstanding(remainingPrincipal);
            
            installments.add(installment);
            
            // Next due date
            dueDate = calculateNextDueDate(dueDate, loan.getRepaymentFrequency());
        }
        
        return installments;
    }
    
    /**
     * Generate schedule for COMPOUND interest
     * Interest compounds at each period
     */
    private List<LoanInstallmentSchedule> generateCompoundInterestSchedule(LoanDetails loan, LoanProduct product) {
        List<LoanInstallmentSchedule> installments = new ArrayList<>();
        
        double principal = loan.getPrincipalAmount();
        double annualRate = loan.getInterestRate();
        int numberOfInstallments = loan.getNumberOfRepayments();
        int gracePeriodDays = loan.getGracePeriodDays();
        
        // Calculate periodic rate
        double periodicRate = calculatePeriodicRate(annualRate, loan.getRepaymentFrequency(), loan.getRatePer());
        
        // Calculate total compound amount
        double compoundMultiplier = Math.pow(1 + periodicRate, numberOfInstallments);
        double totalCompoundAmount = principal * compoundMultiplier;
        double equalInstallment = totalCompoundAmount / numberOfInstallments;
        
        // Get start date
        LocalDate dueDate = loan.getFirstRepaymentDate() != null ? 
                loan.getFirstRepaymentDate() : loan.getPaymentStartDate();
        
        if (dueDate == null) {
            dueDate = loan.getReleaseDate() != null ? 
                    loan.getReleaseDate().plusDays(getDaysForFrequency(loan.getRepaymentFrequency())) : 
                    LocalDate.now().plusDays(30);
        }
        
        double remainingAmount = totalCompoundAmount;
        double processingFee = loan.getProcessingFee();
        double feePerInstallment = processingFee / numberOfInstallments;
        
        // Generate installments
        for (int i = 1; i <= numberOfInstallments; i++) {
            LoanInstallmentSchedule installment = new LoanInstallmentSchedule();
            
            // Calculate portions (simplified - equal split of compound amount)
            double principalPortion = principal / numberOfInstallments;
            double interestPortion = equalInstallment - principalPortion;
            
            installment.setLoanId(loan.getId());
            installment.setInstallmentNumber(i);
            installment.setDueDate(dueDate);
            
            installment.setScheduledAmount(equalInstallment + feePerInstallment);
            installment.setPrincipalPortion(principalPortion);
            installment.setInterestPortion(interestPortion);
            installment.setFeesPortion(feePerInstallment);
            
            installment.setGracePeriodDays(gracePeriodDays);
            if (gracePeriodDays > 0) {
                installment.setGraceExpiryDate(dueDate.plusDays(gracePeriodDays));
            }
            
            installment.setOutstandingAmount(equalInstallment + feePerInstallment);
            remainingAmount -= equalInstallment;
            installment.setCumulativeOutstanding(remainingAmount);
            
            installments.add(installment);
            
            dueDate = calculateNextDueDate(dueDate, loan.getRepaymentFrequency());
        }
        
        return installments;
    }
    
    /**
     * Calculate EMI for reducing balance
     * Formula: EMI = [P x R x (1+R)^N] / [(1+R)^N-1]
     */
    private double calculateEMI(double principal, double rate, int periods) {
        if (rate == 0) {
            return principal / periods;
        }
        
        double onePlusR = 1 + rate;
        double onePlusRPowerN = Math.pow(onePlusR, periods);
        
        return (principal * rate * onePlusRPowerN) / (onePlusRPowerN - 1);
    }
    
    /**
     * Calculate periodic interest rate based on annual rate and frequency
     */
    private double calculatePeriodicRate(double annualRate, String frequency, String ratePer) {
        double rateDecimal = annualRate / 100.0;
        
        // If rate is already per the repayment frequency, return it
        if (ratePer != null && ratePer.equalsIgnoreCase(frequency)) {
            return rateDecimal;
        }
        
        // Convert annual rate to periodic rate
        if ("year".equalsIgnoreCase(ratePer) || ratePer == null) {
            switch (frequency.toLowerCase()) {
                case "daily": return rateDecimal / 365;
                case "weekly": return rateDecimal / 52;
                case "biweekly": return rateDecimal / 26;
                case "monthly": return rateDecimal / 12;
                case "quarterly": return rateDecimal / 4;
                default: return rateDecimal / 12; // Default to monthly
            }
        }
        
        // If rate is per month, convert to periodic
        if ("month".equalsIgnoreCase(ratePer)) {
            switch (frequency.toLowerCase()) {
                case "daily": return rateDecimal / 30;
                case "weekly": return rateDecimal / 4;
                case "biweekly": return rateDecimal / 2;
                case "monthly": return rateDecimal;
                case "quarterly": return rateDecimal * 3;
                default: return rateDecimal;
            }
        }
        
        return rateDecimal / 12; // Default
    }
    
    /**
     * Calculate next due date based on frequency
     */
    private LocalDate calculateNextDueDate(LocalDate currentDate, String frequency) {
        if (frequency == null) frequency = "monthly";
        
        switch (frequency.toLowerCase()) {
            case "daily": return currentDate.plusDays(1);
            case "weekly": return currentDate.plusWeeks(1);
            case "biweekly": return currentDate.plusWeeks(2);
            case "monthly": return currentDate.plusMonths(1);
            case "quarterly": return currentDate.plusMonths(3);
            case "yearly": return currentDate.plusYears(1);
            default: return currentDate.plusMonths(1);
        }
    }
    
    /**
     * Get days for frequency (used for first due date calculation)
     */
    private int getDaysForFrequency(String frequency) {
        if (frequency == null) return 30;
        
        switch (frequency.toLowerCase()) {
            case "daily": return 1;
            case "weekly": return 7;
            case "biweekly": return 14;
            case "monthly": return 30;
            case "quarterly": return 90;
            case "yearly": return 365;
            default: return 30;
        }
    }
    
    /**
     * Get all installments for a loan
     */
    public List<LoanInstallmentSchedule> getScheduleForLoan(Long loanId) {
        return installmentRepository.findByLoanIdOrderByInstallmentNumberAsc(loanId);
    }
    
    /**
     * Get next unpaid installment for a loan
     */
    public LoanInstallmentSchedule getNextUnpaidInstallment(Long loanId) {
        return installmentRepository.findNextUnpaidInstallment(loanId).orElse(null);
    }
    
    /**
     * Update installment status (called by scheduled jobs)
     */
    public void updateInstallmentStatuses() {
        List<LoanInstallmentSchedule> unpaidInstallments = installmentRepository.findByStatus("PENDING");
        
        for (LoanInstallmentSchedule installment : unpaidInstallments) {
            installment.updateStatus();
            installmentRepository.save(installment);
        }
    }
}
