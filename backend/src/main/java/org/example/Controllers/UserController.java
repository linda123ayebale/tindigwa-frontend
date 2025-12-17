package org.example.Controllers;

import lombok.RequiredArgsConstructor;
import org.example.Entities.User;
import org.example.Services.UserService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/role-counts")
    public List<Object[]> getUserCountsByRole() {
        return userService.getUserCountsByRole();
    }

    @GetMapping("/clients")
    public List<User> getClientsWithGuarantors() {
        return userService.getAllClientsWithGuarantors();
    }

    @GetMapping("/loan-officers")
    public List<User> getLoanOfficersWithNextOfKin() {
        return userService.getAllLoanOfficersWithNextOfKin();
    }

    @GetMapping("/cashiers")
    public List<User> getCashiers() {
        return userService.getAllCashiers();
    }

    @GetMapping("/admins")
    public List<User> getAdmins() {
        return userService.getAllAdmins();
    }
    
    @GetMapping("/staff-roles")
    public List<Map<String, String>> getStaffRoles() {
        return Arrays.stream(User.UserRole.values())
                .filter(role -> role != User.UserRole.CLIENT && role != User.UserRole.ADMIN) // Only staff roles
                .map(role -> Map.of(
                    "name", role.name(),
                    "displayName", role.getDisplayName()
                ))
                .collect(Collectors.toList());
    }
    
    @GetMapping("/all-roles")
    public List<Map<String, String>> getAllRoles() {
        return Arrays.stream(User.UserRole.values())
                .map(role -> Map.of(
                    "name", role.name(),
                    "displayName", role.getDisplayName()
                ))
                .collect(Collectors.toList());
    }
}
