package org.example.Repositories;

import org.example.Entities.Sequence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import java.util.Optional;

@Repository
public interface SequenceRepository extends JpaRepository<Sequence, Long> {
    
    /**
     * Find sequence by module prefix, branch code, and year-month
     * Uses pessimistic locking to prevent race conditions during ID generation
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM Sequence s WHERE s.modulePrefix = :modulePrefix " +
           "AND s.branchCode = :branchCode AND s.yearMonth = :yearMonth")
    Optional<Sequence> findByModulePrefixAndBranchCodeAndYearMonthForUpdate(
            @Param("modulePrefix") String modulePrefix,
            @Param("branchCode") String branchCode,
            @Param("yearMonth") String yearMonth
    );
    
    /**
     * Find sequence without locking (for read-only queries)
     */
    Optional<Sequence> findByModulePrefixAndBranchCodeAndYearMonth(
            String modulePrefix, 
            String branchCode, 
            String yearMonth
    );
}
