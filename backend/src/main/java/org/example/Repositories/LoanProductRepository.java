package org.example.Repositories;

import org.example.Entities.LoanProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LoanProductRepository extends JpaRepository<LoanProduct, Long> {
    
    // Find by product code
    Optional<LoanProduct> findByProductCode(String productCode);
    
    // Find all active products
    List<LoanProduct> findByActiveTrue();
    
    // Find products by name (case insensitive)
    @Query("SELECT lp FROM LoanProduct lp WHERE LOWER(lp.productName) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<LoanProduct> findByProductNameContainingIgnoreCase(String name);
    
    // Find products within amount range
    @Query("SELECT lp FROM LoanProduct lp WHERE lp.minAmount <= :amount AND lp.maxAmount >= :amount AND lp.active = true")
    List<LoanProduct> findByAmountRange(double amount);
    
    // Find products by interest method
    List<LoanProduct> findByInterestMethodAndActiveTrue(String interestMethod);
    
    // Check if product code exists
    boolean existsByProductCode(String productCode);
    
    // Find products that require guarantor
    List<LoanProduct> findByRequiresGuarantorTrueAndActiveTrue();
    
    // Find products by duration constraints
    @Query("SELECT lp FROM LoanProduct lp WHERE lp.minDuration <= :duration AND lp.maxDuration >= :duration AND lp.active = true")
    List<LoanProduct> findByDurationRange(int duration);
}