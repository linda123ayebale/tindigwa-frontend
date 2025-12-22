package org.example.Entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "otp_codes")
public class OtpCode {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private Long userId;
    
    @Column(nullable = false, length = 6)
    private String otpCode;
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    @Column(nullable = false)
    private LocalDateTime expiresAt;
    
    @Column(nullable = false)
    private boolean isUsed = false;
    
    @Column(nullable = false, length = 50)
    private String purpose; // LOGIN, PASSWORD_RESET, etc.
    
    @Column(nullable = false)
    private int attemptCount = 0;
    
    @Column
    private LocalDateTime lastAttemptAt;
    
    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (expiresAt == null) {
            // Default expiry: 5 minutes from creation
            expiresAt = createdAt.plusMinutes(5);
        }
    }
    
    /**
     * Check if OTP is still valid (not expired and not used)
     */
    public boolean isValid() {
        return !isUsed && LocalDateTime.now().isBefore(expiresAt);
    }
    
    /**
     * Check if OTP is expired
     */
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }
    
    /**
     * Increment attempt count
     */
    public void incrementAttempt() {
        this.attemptCount++;
        this.lastAttemptAt = LocalDateTime.now();
    }
    
    /**
     * Check if max attempts reached (3 attempts)
     */
    public boolean isMaxAttemptsReached() {
        return attemptCount >= 3;
    }
}
