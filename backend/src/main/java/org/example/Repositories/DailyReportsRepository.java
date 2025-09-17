package org.example.Repositories;

import org.example.Entities.DailyReports;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DailyReportsRepository extends JpaRepository<DailyReports,Long> {
}
