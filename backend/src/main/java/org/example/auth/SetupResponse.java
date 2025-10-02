package org.example.auth;

import lombok.Data;

@Data
public class SetupResponse {
    private String token;
    private String message;
    private UserInfo user;
    
    @Data
    public static class UserInfo {
        private Long id;
        private String name;
        private String email;
        private String role;
        private String branch;
    }
}
