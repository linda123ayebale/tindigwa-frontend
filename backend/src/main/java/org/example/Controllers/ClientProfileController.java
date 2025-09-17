package org.example.Controllers;



import org.example.Entities.ClientsProfile;
import org.example.Services.ClientProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clients")
public class ClientProfileController {
    @Autowired
    private ClientProfileService service;

    // Create
    @PostMapping
    public ClientsProfile createClient(@RequestBody ClientsProfile client) {
        return service.createClient(client);
    }

    // Read all
    @GetMapping
    public List<ClientsProfile> getAllClients() {
        return service.getAllClients();
    }

    // Read by ID
    @GetMapping("/{id}")
    public ClientsProfile getClientById(@PathVariable Long id) {
        return service.getClientById(id)
                .orElseThrow(() -> new RuntimeException("Client not found with id: " + id));
    }

    // Update
    @PutMapping("/{id}")
    public ClientsProfile updateClient(@PathVariable Long id, @RequestBody ClientsProfile client) {
        return service.updateClient(id, client);
    }

    // Delete
    @DeleteMapping("/{id}")
    public void deleteClient(@PathVariable Long id) {
        service.deleteClient(id);
    }
}
