package org.example.Controllers;


import org.example.Entities.Roles;
import org.example.Services.RolesServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
public class RolesController {
    @Autowired
    private RolesServices service;

    // Create
    @PostMapping
    public Roles createRole(@RequestBody Roles role) {
        return service.createRole(role);
    }

    // Get all
    @GetMapping
    public List<Roles> getAllRoles() {
        return service.getAllRoles();
    }

    // Get by ID
    @GetMapping("/{id}")
    public Roles getRoleById(@PathVariable Long id) {
        return service.getRoleById(id)
                .orElseThrow(() -> new RuntimeException("Role not found with id: " + id));
    }

    // Update
    @PutMapping("/{id}")
    public Roles updateRole(@PathVariable Long id, @RequestBody Roles role) {
        return service.updateRole(id, role);
    }

    // Delete
    @DeleteMapping("/{id}")
    public void deleteRole(@PathVariable Long id) {
        service.deleteRole(id);
    }

}
