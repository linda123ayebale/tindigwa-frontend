package org.example.Repositories;

import org.example.Entities.Branches;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository

public interface BranchesRepository extends JpaRepository<Branches,Long> {
}
