package org.example.Repositories;

import org.example.Entities.MonthlyReports;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MonthlyReportsRepository extends JpaRepository<MonthlyReports,Long> {
}
