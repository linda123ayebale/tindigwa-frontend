package org.example.Repositories;


import org.example.Entities.LoanDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LoanDetailsRepository extends JpaRepository<LoanDetails,Long> {
    
    // Find loans by lending branch
    List<LoanDetails> findByLendingBranch(String lendingBranch);
    
    // Find loans by client ID
    List<LoanDetails> findByClientId(Long clientId);
    
    // Find loans by status
    List<LoanDetails> findByLoanStatus(String loanStatus);
    
    // Find loans by product ID
    List<LoanDetails> findByProductId(Long productId);
    
    // Find loans by loan number (should be unique)
    LoanDetails findByLoanNumber(String loanNumber);
    
    // Find loans by client ID and status
    List<LoanDetails> findByClientIdAndLoanStatus(Long clientId, String loanStatus);
    
    // Find loans by date range
    List<LoanDetails> findByCreatedAtBetween(java.time.LocalDateTime startDate, java.time.LocalDateTime endDate);
    
    // Count loans by status
    long countByLoanStatus(String loanStatus);
    
    // Count loans by client
    long countByClientId(Long clientId);
    
    // WORKFLOW-RELATED QUERIES
    
    // Find loans by workflow status
    List<LoanDetails> findByWorkflowStatus(String workflowStatus);
    
    // Find loans by creator (loan officer)
    List<LoanDetails> findByCreatedById(Long createdById);
    
    // Find loans by approver (cashier)
    List<LoanDetails> findByApprovedById(Long approvedById);
    
    // Find loans by workflow status and creator
    List<LoanDetails> findByWorkflowStatusAndCreatedById(String workflowStatus, Long createdById);
    
    // Count loans by workflow status
    long countByWorkflowStatus(String workflowStatus);
    
    // Count loans created by a specific user
    long countByCreatedById(Long createdById);
    
    // Count loans approved by a specific user
    long countByApprovedById(Long approvedById);
    
    // ARCHIVE-RELATED QUERIES
    
    // Find all archived loans
    List<LoanDetails> findByArchivedTrue();
    
    // Find all active (non-archived) loans
    List<LoanDetails> findByArchivedFalse();
    
    // Find archived loans by status
    List<LoanDetails> findByArchivedTrueAndLoanStatus(String loanStatus);
    
    // Count archived loans
    long countByArchivedTrue();
}
