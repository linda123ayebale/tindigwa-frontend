package org.example.Services;


import org.example.Entities.Roles;
import org.example.Repositories.RolesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
@Service
public class RolesServices {
    @Autowired
    private RolesRepository repository;

    // Create
    public Roles createRole(Roles role) {
        return repository.save(role);
    }

    // Read all
    public List<Roles> getAllRoles() {
        return repository.findAll();
    }

    // Read by ID
    public Optional<Roles> getRoleById(Long id) {
        return repository.findById(id);
    }

    // Update
    public Roles updateRole(Long id, Roles updatedRole) {
        return repository.findById(id)
                .map(existing -> {
                    updatedRole.setId(existing.getId()); // Keep the ID
                    return repository.save(updatedRole);
                }).orElseThrow(() -> new RuntimeException("Role not found with id: " + id));
    }

    // Delete
    public void deleteRole(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Role not found with id: " + id);
        }
        repository.deleteById(id);
    }
}
