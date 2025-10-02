package org.example.auth;

import lombok.Data;

@Data
public class SetupRequest {
    private String adminName;
    private String email;
    private String password;
    private String confirmPassword;
}
