package org.example.Repositories;


import org.example.Entities.LoanDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LoanDetailsRepository extends JpaRepository<LoanDetails,Long> {
    List<LoanDetails> findByLendingBranch(String lendingBranch);
}
