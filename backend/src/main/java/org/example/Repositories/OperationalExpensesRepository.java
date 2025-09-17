package org.example.Repositories;

import org.example.Entities.OperationalExpenses;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OperationalExpensesRepository extends JpaRepository<OperationalExpenses,Long> {
}
