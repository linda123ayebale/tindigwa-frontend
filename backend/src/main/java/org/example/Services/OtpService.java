package org.example.Services;

import jakarta.mail.MessagingException;
import org.example.Entities.OtpCode;
import org.example.Entities.User;
import org.example.Repositories.OtpCodeRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class OtpService {
    
    private final OtpCodeRepository otpCodeRepository;
    private final EmailService emailService;
    private final SecureRandom secureRandom;
    
    private static final String OTP_PURPOSE_LOGIN = "LOGIN";
    private static final String OTP_PURPOSE_PASSWORD_RESET = "PASSWORD_RESET";
    private static final int OTP_EXPIRY_MINUTES = 5;
    private static final int MAX_ATTEMPTS = 3;
    private static final int RESEND_COOLDOWN_SECONDS = 60;
    
    public OtpService(OtpCodeRepository otpCodeRepository, EmailService emailService) {
        this.otpCodeRepository = otpCodeRepository;
        this.emailService = emailService;
        this.secureRandom = new SecureRandom();
    }
    
    /**
     * Generate a 6-digit OTP code
     */
    public String generateOTP() {
        int otp = 100000 + secureRandom.nextInt(900000);
        return String.valueOf(otp);
    }
    
    /**
     * Generate and send OTP for login
     */
    @Transactional
    public void generateAndSendLoginOtp(User user) throws MessagingException {
        // Invalidate any existing OTPs for this user
        otpCodeRepository.invalidateUserOtps(user.getId(), OTP_PURPOSE_LOGIN);
        
        // Generate new OTP
        String otpCode = generateOTP();
        
        // Save OTP to database
        OtpCode otp = new OtpCode();
        otp.setUserId(user.getId());
        otp.setOtpCode(otpCode);
        otp.setPurpose(OTP_PURPOSE_LOGIN);
        otp.setCreatedAt(LocalDateTime.now());
        otp.setExpiresAt(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES));
        
        otpCodeRepository.save(otp);
        
        // Send email
        emailService.sendOtpEmail(user.getEmail(), otpCode, user.getName());
    }
    
    /**
     * Generate and send OTP for password reset
     */
    @Transactional
    public void generateAndSendPasswordResetOtp(User user) throws MessagingException {
        // Invalidate any existing OTPs for this user
        otpCodeRepository.invalidateUserOtps(user.getId(), OTP_PURPOSE_PASSWORD_RESET);
        
        // Generate new OTP
        String otpCode = generateOTP();
        
        // Save OTP to database
        OtpCode otp = new OtpCode();
        otp.setUserId(user.getId());
        otp.setOtpCode(otpCode);
        otp.setPurpose(OTP_PURPOSE_PASSWORD_RESET);
        otp.setCreatedAt(LocalDateTime.now());
        otp.setExpiresAt(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES));
        
        otpCodeRepository.save(otp);
        
        // Send email
        emailService.sendPasswordResetOtp(user.getEmail(), otpCode, user.getName());
    }
    
    /**
     * Validate OTP code for login
     */
    @Transactional
    public boolean validateLoginOtp(Long userId, String otpCode) {
        return validateOtp(userId, otpCode, OTP_PURPOSE_LOGIN);
    }
    
    /**
     * Validate OTP code for password reset
     */
    @Transactional
    public boolean validatePasswordResetOtp(Long userId, String otpCode) {
        return validateOtp(userId, otpCode, OTP_PURPOSE_PASSWORD_RESET);
    }
    
    /**
     * Core OTP validation logic
     */
    private boolean validateOtp(Long userId, String otpCode, String purpose) {
        Optional<OtpCode> otpOptional = otpCodeRepository.findLatestValidOtp(
            userId, 
            purpose, 
            LocalDateTime.now()
        );
        
        if (otpOptional.isEmpty()) {
            return false;
        }
        
        OtpCode otp = otpOptional.get();
        
        // Check if max attempts reached
        if (otp.isMaxAttemptsReached()) {
            return false;
        }
        
        // Increment attempt count
        otp.incrementAttempt();
        otpCodeRepository.save(otp);
        
        // Validate OTP code
        if (!otp.getOtpCode().equals(otpCode)) {
            return false;
        }
        
        // Check if OTP is still valid
        if (!otp.isValid()) {
            return false;
        }
        
        // Mark OTP as used
        otp.setUsed(true);
        otpCodeRepository.save(otp);
        
        return true;
    }
    
    /**
     * Check if user can resend OTP (cooldown period check)
     */
    public boolean canResendOtp(Long userId, String purpose) {
        Optional<OtpCode> latestOtp = otpCodeRepository.findLatestValidOtp(
            userId, 
            purpose, 
            LocalDateTime.now()
        );
        
        if (latestOtp.isEmpty()) {
            return true; // No existing OTP, can send
        }
        
        OtpCode otp = latestOtp.get();
        LocalDateTime cooldownEnd = otp.getCreatedAt().plusSeconds(RESEND_COOLDOWN_SECONDS);
        
        return LocalDateTime.now().isAfter(cooldownEnd);
    }
    
    /**
     * Get remaining cooldown seconds
     */
    public long getRemainingCooldownSeconds(Long userId, String purpose) {
        Optional<OtpCode> latestOtp = otpCodeRepository.findLatestValidOtp(
            userId, 
            purpose, 
            LocalDateTime.now()
        );
        
        if (latestOtp.isEmpty()) {
            return 0;
        }
        
        OtpCode otp = latestOtp.get();
        LocalDateTime cooldownEnd = otp.getCreatedAt().plusSeconds(RESEND_COOLDOWN_SECONDS);
        LocalDateTime now = LocalDateTime.now();
        
        if (now.isAfter(cooldownEnd)) {
            return 0;
        }
        
        return java.time.Duration.between(now, cooldownEnd).getSeconds();
    }
    
    /**
     * Resend OTP for login
     */
    @Transactional
    public void resendLoginOtp(User user) throws MessagingException {
        if (!canResendOtp(user.getId(), OTP_PURPOSE_LOGIN)) {
            long remainingSeconds = getRemainingCooldownSeconds(user.getId(), OTP_PURPOSE_LOGIN);
            throw new IllegalStateException("Please wait " + remainingSeconds + " seconds before requesting a new code");
        }
        
        generateAndSendLoginOtp(user);
    }
    
    /**
     * Scheduled task to cleanup expired OTPs (runs every hour)
     */
    @Scheduled(fixedDelay = 3600000) // 1 hour
    @Transactional
    public void cleanupExpiredOtps() {
        // Delete expired OTPs
        otpCodeRepository.deleteExpiredOtps(LocalDateTime.now());
        
        // Delete used OTPs older than 24 hours
        otpCodeRepository.deleteUsedOtpsOlderThan(LocalDateTime.now().minusHours(24));
    }
    
    /**
     * Get OTP statistics for a user
     */
    public OtpStats getOtpStats(Long userId, String purpose) {
        Optional<OtpCode> latestOtp = otpCodeRepository.findLatestValidOtp(
            userId, 
            purpose, 
            LocalDateTime.now()
        );
        
        if (latestOtp.isEmpty()) {
            return new OtpStats(false, 0, 0, 0);
        }
        
        OtpCode otp = latestOtp.get();
        long remainingSeconds = java.time.Duration.between(LocalDateTime.now(), otp.getExpiresAt()).getSeconds();
        int remainingAttempts = MAX_ATTEMPTS - otp.getAttemptCount();
        long resendCooldown = getRemainingCooldownSeconds(userId, purpose);
        
        return new OtpStats(true, remainingSeconds, remainingAttempts, resendCooldown);
    }
    
    /**
     * OTP Statistics DTO
     */
    public static class OtpStats {
        private final boolean hasActiveOtp;
        private final long remainingSeconds;
        private final int remainingAttempts;
        private final long resendCooldownSeconds;
        
        public OtpStats(boolean hasActiveOtp, long remainingSeconds, int remainingAttempts, long resendCooldownSeconds) {
            this.hasActiveOtp = hasActiveOtp;
            this.remainingSeconds = Math.max(0, remainingSeconds);
            this.remainingAttempts = Math.max(0, remainingAttempts);
            this.resendCooldownSeconds = Math.max(0, resendCooldownSeconds);
        }
        
        public boolean isHasActiveOtp() { return hasActiveOtp; }
        public long getRemainingSeconds() { return remainingSeconds; }
        public int getRemainingAttempts() { return remainingAttempts; }
        public long getResendCooldownSeconds() { return resendCooldownSeconds; }
    }
}
