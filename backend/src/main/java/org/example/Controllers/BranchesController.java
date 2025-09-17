package org.example.Controllers;


import org.example.Entities.Branches;
import org.example.Services.BranchesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/branches")
public class BranchesController {
    @Autowired
    private BranchesService service;

    // Create
    @PostMapping
    public Branches createBranch(@RequestBody Branches branch) {
        return service.createBranch(branch);
    }

    // Read all
    @GetMapping
    public List<Branches> getAllBranches() {
        return service.getAllBranches();
    }

    // Read by ID
    @GetMapping("/{id}")
    public Branches getBranchById(@PathVariable Long id) {
        return service.getBranchById(id)
                .orElseThrow(() -> new RuntimeException("Branch not found"));
    }

    // Update
    @PutMapping("/{id}")
    public Branches updateBranch(@PathVariable Long id, @RequestBody Branches updatedBranch) {
        return service.updateBranch(id, updatedBranch);
    }

    // Delete
    @DeleteMapping("/{id}")
    public void deleteBranch(@PathVariable Long id) {
        service.deleteBranch(id);
    }

}
