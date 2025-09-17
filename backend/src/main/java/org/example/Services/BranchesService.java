package org.example.Services;


import org.example.Entities.Branches;
import org.example.Repositories.BranchesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
@Service
public class BranchesService {
    @Autowired
    private BranchesRepository repository;

    // Create
    public Branches createBranch(Branches branch) {
        return repository.save(branch);
    }

    // Read all
    public List<Branches> getAllBranches() {
        return repository.findAll();
    }

    // Read by ID
    public Optional<Branches> getBranchById(Long id) {
        return repository.findById(id);
    }

    // Update
    public Branches updateBranch(Long id, Branches updatedBranch) {
        return repository.findById(id)
                .map(branch -> {
                    branch.setBranchName(updatedBranch.getBranchName());
                    branch.setLocation(updatedBranch.getLocation());
                    branch.setLoanOfficerId(updatedBranch.getLoanOfficerId());
                    return repository.save(branch);
                }).orElseThrow(() -> new RuntimeException("Branch not found"));
    }

    // Delete
    public void deleteBranch(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Branch not found");
        }
        repository.deleteById(id);
    }
}
