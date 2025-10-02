package org.example.Services;

import lombok.RequiredArgsConstructor;
import org.example.Entities.User;
import org.example.Repositories.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    public Optional<User> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public List<Object[]> getUserCountsByRole() {
        return userRepository.countUsersByRole();
    }

    public List<User> getAllClientsWithGuarantors() {
        return userRepository.findAllClientsWithGuarantors();
    }

    public List<User> getAllClients () {
        return userRepository.findAllClientDetails();
    }

    public List<User> getAllLoanOfficersWithNextOfKin() {
        return userRepository.findAllLoanOfficersWithNextOfKin();
    }

    public List<User> getAllAdmins() {
        return userRepository.findAllAdmins();
    }

}
