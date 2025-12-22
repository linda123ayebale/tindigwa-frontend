package org.example.auth;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class OtpResponse {
    private boolean requiresOtp;
    private Long userId;
    private String message;
    private Long expiresIn; // Seconds until OTP expires
    private Long resendCooldown; // Seconds until can resend
    private String tempToken; // Temporary token for OTP verification (optional)
    
    // Constructor for successful OTP send
    public OtpResponse(boolean requiresOtp, Long userId, String message, Long expiresIn) {
        this.requiresOtp = requiresOtp;
        this.userId = userId;
        this.message = message;
        this.expiresIn = expiresIn;
    }
}
