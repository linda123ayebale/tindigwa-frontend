package org.example.Services;

import org.example.Entities.Branches;
import org.example.Repositories.BranchesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class BranchesService {

    private final BranchesRepository repository;

    @Autowired
    private UniqueIdGenerator uniqueIdGenerator;

    public BranchesService(BranchesRepository repository) {
        this.repository = repository;
    }

    public Branches createBranch(Branches branch) {

        // Generate correct BR + YY + XXXX ID
        String generatedCode = uniqueIdGenerator.generateBranchId();
        branch.setBranchCode(generatedCode);

        if (branch.getBranchName() == null || branch.getLocation() == null) {
            throw new IllegalArgumentException("Branch name and location are required");
        }

        return repository.save(branch);
    }

    public List<Branches> getAllBranches() {
        return repository.findAll();
    }

    public Optional<Branches> getBranchById(Long id) {
        return repository.findById(id);
    }

    public Branches updateBranch(Long id, Branches updatedBranch) {
        return repository.findById(id)
                .map(existing -> {
                    existing.setBranchName(updatedBranch.getBranchName());
                    existing.setLocation(updatedBranch.getLocation());
                    // branchCode SHOULD NOT be changed after creation
                    return repository.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("Branch not found"));
    }

    public void deleteBranch(Long id) {
        repository.deleteById(id);
    }
}
