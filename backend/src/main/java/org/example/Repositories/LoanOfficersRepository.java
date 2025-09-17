package org.example.Repositories;


import org.example.Entities.LoanOfficer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LoanOfficersRepository extends JpaRepository<LoanOfficer,Long> {
    Optional<LoanOfficer> findByUsername(String username);
}
