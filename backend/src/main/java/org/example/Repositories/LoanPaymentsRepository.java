package org.example.Repositories;


import org.example.Entities.LoanPayments;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LoanPaymentsRepository extends JpaRepository<LoanPayments,Long> {
}
