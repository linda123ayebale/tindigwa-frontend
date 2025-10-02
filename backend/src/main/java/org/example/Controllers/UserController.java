package org.example.Controllers;

import lombok.RequiredArgsConstructor;
import org.example.Entities.User;
import org.example.Services.UserService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

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

    @GetMapping("/admins")
    public List<User> getAdmins() {
        return userService.getAllAdmins();
    }
}
