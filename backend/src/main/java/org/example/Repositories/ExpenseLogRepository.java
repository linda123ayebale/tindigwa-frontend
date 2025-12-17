package org.example.Repositories;

import org.example.Entities.ExpenseLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExpenseLogRepository extends JpaRepository<ExpenseLog, Long> {
    List<ExpenseLog> findByExpenseIdOrderByActionAtDesc(Long expenseId);
}
