package org.example.Services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.Entities.LoanProduct;
import org.example.Repositories.LoanProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Service for managing Loan Products with auto-generated product codes
 */
@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class LoanProductService {
    
    private final LoanProductRepository loanProductRepository;
    private final UniqueIdGenerator uniqueIdGenerator;
    private final UserAttributionService userAttributionService;
    
    /**
     * Create a new loan product with auto-generated product code and current user as creator
     * Uses the same pattern as Expenses module
     */
    public LoanProduct createLoanProduct(LoanProduct loanProduct) {
        // Auto-generate product code using Universal ID Generator
        String productCode = uniqueIdGenerator.generateId("LP");
        loanProduct.setProductCode(productCode);
        
        // Set user ID from currently logged-in user (from JWT token) - same as Expenses
        Long currentUserId = userAttributionService.getCurrentUserId();
        
        if (currentUserId != null) {
            loanProduct.setCreatedByUserId(currentUserId);
            log.info("🔑 JWT User Attribution: Retrieved user ID '{}' from security context", currentUserId);
        } else {
            log.warn("⚠️ No authenticated user found, createdByUserId will be null");
        }
        
        log.info("🎯 Creating loan product with auto-generated code: {} by user ID: {}", productCode, currentUserId);
        
        LoanProduct savedProduct = loanProductRepository.save(loanProduct);
        
        log.info("✅ Loan product created successfully: {} ({}) by user ID: {}", 
                savedProduct.getProductName(), savedProduct.getProductCode(), currentUserId);
        
        return savedProduct;
    }
    
    /**
     * Update existing loan product (code cannot be changed)
     */
    public LoanProduct updateLoanProduct(Long id, LoanProduct loanProduct) {
        return loanProductRepository.findById(id)
                .map(existingProduct -> {
                    // Update fields but preserve the original product code
                    existingProduct.setProductName(loanProduct.getProductName());
                    existingProduct.setDescription(loanProduct.getDescription());
                    existingProduct.setDefaultInterestRate(loanProduct.getDefaultInterestRate());
                    existingProduct.setInterestMethod(loanProduct.getInterestMethod());
                    existingProduct.setInterestType(loanProduct.getInterestType());
                    existingProduct.setRatePer(loanProduct.getRatePer());
                    existingProduct.setMinDuration(loanProduct.getMinDuration());
                    existingProduct.setMaxDuration(loanProduct.getMaxDuration());
                    existingProduct.setDefaultDuration(loanProduct.getDefaultDuration());
                    existingProduct.setDurationUnit(loanProduct.getDurationUnit());
                    existingProduct.setMinAmount(loanProduct.getMinAmount());
                    existingProduct.setMaxAmount(loanProduct.getMaxAmount());
                    existingProduct.setAllowedRepaymentFrequencies(loanProduct.getAllowedRepaymentFrequencies());
                    existingProduct.setDefaultRepaymentFrequency(loanProduct.getDefaultRepaymentFrequency());
                    existingProduct.setProcessingFeeType(loanProduct.getProcessingFeeType());
                    existingProduct.setProcessingFeeValue(loanProduct.getProcessingFeeValue());
                    existingProduct.setLateFee(loanProduct.getLateFee());
                    existingProduct.setDefaultFee(loanProduct.getDefaultFee());
                    existingProduct.setDefaultGracePeriodDays(loanProduct.getDefaultGracePeriodDays());
                    existingProduct.setRegistrationFeeTiers(loanProduct.getRegistrationFeeTiers());
                    existingProduct.setPenaltyRate(loanProduct.getPenaltyRate());
                    existingProduct.setRequiresGuarantor(loanProduct.isRequiresGuarantor());
                    existingProduct.setRequiresCollateral(loanProduct.isRequiresCollateral());
                    existingProduct.setActive(loanProduct.isActive());
                    
                    return loanProductRepository.save(existingProduct);
                })
                .orElseThrow(() -> new RuntimeException("Loan product not found with id: " + id));
    }
    
    /**
     * Get all loan products
     */
    public List<LoanProduct> getAllLoanProducts(boolean activeOnly) {
        if (activeOnly) {
            return loanProductRepository.findByActiveTrue();
        }
        return loanProductRepository.findAll();
    }
    
    /**
     * Get loan product by ID
     */
    public Optional<LoanProduct> getLoanProductById(Long id) {
        return loanProductRepository.findById(id);
    }
    
    /**
     * Get loan product by code
     */
    public Optional<LoanProduct> getLoanProductByCode(String productCode) {
        return loanProductRepository.findByProductCode(productCode);
    }
    
    /**
     * Deactivate loan product (soft delete)
     */
    public void deactivateLoanProduct(Long id) {
        loanProductRepository.findById(id).ifPresent(product -> {
            product.setActive(false);
            loanProductRepository.save(product);
            log.info("Deactivated loan product: {} ({})", product.getProductName(), product.getProductCode());
        });
    }
    
    /**
     * Search loan products by name
     */
    public List<LoanProduct> searchLoanProductsByName(String name) {
        return loanProductRepository.findByProductNameContainingIgnoreCase(name);
    }
    
    /**
     * Get products suitable for a specific loan amount
     */
    public List<LoanProduct> getProductsForAmount(double amount) {
        return loanProductRepository.findByAmountRange(amount);
    }
    
    /**
     * Get products that require guarantor
     */
    public List<LoanProduct> getProductsRequiringGuarantor() {
        return loanProductRepository.findByRequiresGuarantorTrueAndActiveTrue();
    }
}
