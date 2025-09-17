package org.example.Services;


import org.example.Entities.ClientsProfile;
import org.example.Repositories.ClientProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
@Service
public class ClientProfileService {
    @Autowired
    private ClientProfileRepository repository;

    // Create

    public ClientsProfile createClient(ClientsProfile client) {

        Optional<ClientsProfile> existingClient = repository.findByNationalIdNumber(client.getNationalIdNumber());

            if (existingClient.isPresent()) {
                throw new DuplicateKeyException("A client with National ID " + client.getNationalIdNumber() + " already exists.");
            }

            return repository.save(client);
//++
//        try {
//            return repository.save(client);
//        } catch (DataIntegrityViolationException e) {
//            // This catch block will be executed if the database unique constraint is violated.
//            // This is where you throw your custom exception with your desired message.
//            // You may want to check the specific error message or SQLState to be
//            // sure it's the nationalIdNumber constraint and not another one.
//            throw new DuplicateKeyException("A client with National ID " + client.getNationalIdNumber() + " already exists.", e);
//        }

        }



    // Read all
    public List<ClientsProfile> getAllClients() {
        return repository.findAll();
    }

    // Read by ID
    public Optional<ClientsProfile> getClientById(Long id) {
        return repository.findById(id);
    }

    // Update
    public ClientsProfile updateClient(Long id, ClientsProfile updatedClient) {
        return repository.findById(id).map(existing -> {
            updatedClient.setId(existing.getId()); // preserve ID
            return repository.save(updatedClient);
        }).orElseThrow(() -> new RuntimeException("Client not found"));
    }

    // Delete
    public void deleteClient(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Client not found");
        }
        repository.deleteById(id);
    }
}
