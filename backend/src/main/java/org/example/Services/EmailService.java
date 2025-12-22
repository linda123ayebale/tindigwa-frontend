package org.example.Services;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class EmailService {
    
    private final JavaMailSender mailSender;
    
    @Value("${spring.mail.from.email:noreply@tindigwa.com}")
    private String fromEmail;
    
    @Value("${spring.mail.from.name:Tindigwa Loan Management}")
    private String fromName;
    
    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }
    
    /**
     * Send OTP code via email
     */
    public void sendOtpEmail(String toEmail, String otpCode, String userName) throws MessagingException {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail, fromName);
            helper.setTo(toEmail);
            helper.setSubject("Your CashTank Finance Login Verification Code");
            
            String htmlContent = buildOtpEmailHtml(otpCode, userName);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
        } catch (java.io.UnsupportedEncodingException e) {
            throw new MessagingException("Error encoding email", e);
        }
    }
    
    /**
     * Build professional HTML email template for OTP
     */
    private String buildOtpEmailHtml(String otpCode, String userName) {
        String currentTime = LocalDateTime.now().format(DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm"));
        
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "    <meta charset=\"UTF-8\">" +
                "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">" +
                "</head>" +
                "<body style=\"margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f7fa;\">" +
                "    <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"background-color: #f5f7fa; padding: 40px 20px;\">" +
                "        <tr>" +
                "            <td align=\"center\">" +
                "                <table width=\"600\" cellpadding=\"0\" cellspacing=\"0\" style=\"background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);\">" +
                "                    <!-- Header -->" +
                "                    <tr>" +
                "                        <td style=\"background: linear-gradient(135deg, #4285f4 0%, #1a73e8 100%); padding: 40px 30px; text-align: center;\">" +
                "                            <h1 style=\"margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;\">🔐 Login Verification</h1>" +
                "                            <p style=\"margin: 10px 0 0 0; color: #e3f2fd; font-size: 14px;\">CashTank Finance</p>" +
                "                        </td>" +
                "                    </tr>" +
                "                    " +
                "                    <!-- Content -->" +
                "                    <tr>" +
                "                        <td style=\"padding: 40px 30px;\">" +
                "                            <p style=\"margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;\">" +
                "                                Hello <strong>" + userName + "</strong>," +
                "                            </p>" +
                "                            " +
                "                            <p style=\"margin: 0 0 30px 0; color: #555555; font-size: 15px; line-height: 1.6;\">" +
                "                                You have requested to log in to your CashTank Finance account. Please use the verification code below to complete your login:" +
                "                            </p>" +
                "                            " +
                "                            <!-- OTP Code Box -->" +
                "                            <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\">" +
                "                                <tr>" +
                "                                    <td align=\"center\" style=\"padding: 20px 0;\">" +
                "                                        <div style=\"background: linear-gradient(135deg, #f5f7fa 0%, #e3f2fd 100%); border: 3px solid #4285f4; border-radius: 16px; padding: 30px; display: inline-block;\">" +
                "                                            <div style=\"font-size: 42px; font-weight: 700; color: #1a73e8; letter-spacing: 8px; font-family: 'Courier New', monospace;\">" +
                otpCode +
                "                                            </div>" +
                "                                        </div>" +
                "                                    </td>" +
                "                                </tr>" +
                "                            </table>" +
                "                            " +
                "                            <!-- Expiry Notice -->" +
                "                            <div style=\"background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px 20px; margin: 30px 0; border-radius: 8px;\">" +
                "                                <p style=\"margin: 0; color: #856404; font-size: 14px; line-height: 1.5;\">" +
                "                                    ⏱️ <strong>Important:</strong> This code will expire in <strong>5 minutes</strong> for security purposes." +
                "                                </p>" +
                "                            </div>" +
                "                            " +
                "                            <!-- Security Notice -->" +
                "                            <div style=\"background-color: #f8d7da; border-left: 4px solid #dc3545; padding: 15px 20px; margin: 20px 0; border-radius: 8px;\">" +
                "                                <p style=\"margin: 0; color: #721c24; font-size: 14px; line-height: 1.5;\">" +
                "                                    🔒 <strong>Security Alert:</strong> If you didn't request this code, please ignore this email and ensure your account is secure. Do not share this code with anyone." +
                "                                </p>" +
                "                            </div>" +
                "                            " +
                "                            <p style=\"margin: 20px 0 0 0; color: #666666; font-size: 14px; line-height: 1.6;\">" +
                "                                Need help? Contact our support team." +
                "                            </p>" +
                "                        </td>" +
                "                    </tr>" +
                "                    " +
                "                    <!-- Footer -->" +
                "                    <tr>" +
                "                        <td style=\"background-color: #f5f7fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;\">" +
                "                            <p style=\"margin: 0 0 10px 0; color: #888888; font-size: 13px;\">" +
                "                                Login attempt: " + currentTime +
                "                            </p>" +
                "                            <p style=\"margin: 0; color: #888888; font-size: 12px;\">" +
                "                                © 2024 CashTank Finance. All rights reserved." +
                "                            </p>" +
                "                        </td>" +
                "                    </tr>" +
                "                </table>" +
                "            </td>" +
                "        </tr>" +
                "    </table>" +
                "</body>" +
                "</html>";
    }
    
    /**
     * Send password reset OTP email
     */
    public void sendPasswordResetOtp(String toEmail, String otpCode, String userName) throws MessagingException {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail, fromName);
            helper.setTo(toEmail);
            helper.setSubject("Password Reset Verification Code - CashTank Finance");
            
            String htmlContent = buildPasswordResetEmailHtml(otpCode, userName);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
        } catch (java.io.UnsupportedEncodingException e) {
            throw new MessagingException("Error encoding email", e);
        }
    }
    
    /**
     * Build password reset email template
     */
    private String buildPasswordResetEmailHtml(String otpCode, String userName) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<body style=\"font-family: Arial, sans-serif; background-color: #f5f7fa; padding: 20px;\">" +
                "    <div style=\"max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);\">" +
                "        <h2 style=\"color: #dc3545; margin-bottom: 20px;\">🔑 Password Reset Request</h2>" +
                "        <p>Hello " + userName + ",</p>" +
                "        <p>You have requested to reset your password. Use the code below:</p>" +
                "        <div style=\"background: #f8d7da; border: 3px solid #dc3545; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0;\">" +
                "            <div style=\"font-size: 36px; font-weight: bold; color: #dc3545; letter-spacing: 6px;\">" + otpCode + "</div>" +
                "        </div>" +
                "        <p style=\"color: #721c24; background: #f8d7da; padding: 15px; border-radius: 8px;\">⚠️ This code expires in 5 minutes.</p>" +
                "        <p style=\"color: #666; font-size: 14px; margin-top: 30px;\">If you didn't request this, please contact support immediately.</p>" +
                "    </div>" +
                "</body>" +
                "</html>";
    }
}
