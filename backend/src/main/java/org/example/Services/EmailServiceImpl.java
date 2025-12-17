package org.example.Services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Email Service Implementation
 * 
 * To enable actual email sending:
 * 1. Add Spring Mail dependency to pom.xml:
 *    <dependency>
 *        <groupId>org.springframework.boot</groupId>
 *        <artifactId>spring-boot-starter-mail</artifactId>
 *    </dependency>
 *
 * 2. Add email configuration to application.properties:
 *    spring.mail.host=smtp.gmail.com
 *    spring.mail.port=587
 *    spring.mail.username=your-email@gmail.com
 *    spring.mail.password=your-app-password
 *    spring.mail.properties.mail.smtp.auth=true
 *    spring.mail.properties.mail.smtp.starttls.enable=true
 *
 * 3. Uncomment the @Autowired JavaMailSender below
 */
@Service
public class EmailServiceImpl {
    
    // Uncomment when Spring Mail is added:
    // @Autowired
    // private JavaMailSender mailSender;
    
    @Value("${app.email.from:noreply@tindigwa.com}")
    private String fromEmail;
    
    /**
     * Send email using Spring Mail (Template for implementation)
     */
    public void sendEmail(String to, String subject, String body) {
        try {
            // TEMPLATE: Uncomment when Spring Mail is added
            /*
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, false); // false = plain text, true = HTML
            
            mailSender.send(message);
            System.out.println("✅ Email sent successfully to: " + to);
            */
            
            // Current: Log only (remove when actual email is implemented)
            System.out.println("📧 [EMAIL LOG]");
            System.out.println("From: " + fromEmail);
            System.out.println("To: " + to);
            System.out.println("Subject: " + subject);
            System.out.println("Body: " + body);
            System.out.println("---");
            
        } catch (Exception e) {
            System.err.println("❌ Failed to send email: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    /**
     * Send HTML email (Template for implementation)
     */
    public void sendHtmlEmail(String to, String subject, String htmlBody) {
        try {
            // TEMPLATE: Uncomment when Spring Mail is added
            /*
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true); // true = HTML
            
            mailSender.send(message);
            System.out.println("✅ HTML email sent successfully to: " + to);
            */
            
            // Current: Log only
            System.out.println("📧 [HTML EMAIL LOG]");
            System.out.println("To: " + to);
            System.out.println("Subject: " + subject);
            System.out.println("---");
            
        } catch (Exception e) {
            System.err.println("❌ Failed to send HTML email: " + e.getMessage());
        }
    }
    
    /**
     * Send email with attachment (Template for implementation)
     */
    public void sendEmailWithAttachment(String to, String subject, String body, String attachmentPath) {
        try {
            // TEMPLATE: Uncomment when Spring Mail is added
            /*
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body);
            
            FileSystemResource file = new FileSystemResource(new File(attachmentPath));
            helper.addAttachment(file.getFilename(), file);
            
            mailSender.send(message);
            System.out.println("✅ Email with attachment sent to: " + to);
            */
            
            // Current: Log only
            System.out.println("📧 [EMAIL WITH ATTACHMENT LOG]");
            System.out.println("To: " + to);
            System.out.println("Attachment: " + attachmentPath);
            System.out.println("---");
            
        } catch (Exception e) {
            System.err.println("❌ Failed to send email with attachment: " + e.getMessage());
        }
    }
}
