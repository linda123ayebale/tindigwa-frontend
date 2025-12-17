package org.example.Services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

/**
 * SMS Service Implementation
 * 
 * Supports multiple SMS gateways:
 * - Twilio
 * - Africa's Talking
 * - Nexmo/Vonage
 * - Custom Gateway
 * 
 * SETUP INSTRUCTIONS:
 * 
 * Option 1: Africa's Talking (Recommended for Uganda)
 * ====================================================
 * 1. Sign up at https://africastalking.com
 * 2. Get API Key and Username
 * 3. Add to application.properties:
 *    africas.talking.username=your-username
 *    africas.talking.apikey=your-api-key
 *    africas.talking.from=TINDIGWA
 * 
 * Option 2: Twilio
 * ================
 * 1. Sign up at https://twilio.com
 * 2. Get Account SID and Auth Token
 * 3. Add to application.properties:
 *    twilio.account.sid=your-sid
 *    twilio.auth.token=your-token
 *    twilio.phone.number=+1234567890
 */
@Service
public class SmsServiceImpl {
    
    @Value("${sms.provider:africas-talking}")
    private String smsProvider;
    
    // Africa's Talking Configuration
    @Value("${africas.talking.username:}")
    private String atUsername;
    
    @Value("${africas.talking.apikey:}")
    private String atApiKey;
    
    @Value("${africas.talking.from:TINDIGWA}")
    private String atFrom;
    
    // Twilio Configuration
    @Value("${twilio.account.sid:}")
    private String twilioAccountSid;
    
    @Value("${twilio.auth.token:}")
    private String twilioAuthToken;
    
    @Value("${twilio.phone.number:}")
    private String twilioPhoneNumber;
    
    private final RestTemplate restTemplate = new RestTemplate();
    
    /**
     * Send SMS using configured provider
     */
    public void sendSms(String phoneNumber, String message) {
        try {
            if ("africas-talking".equalsIgnoreCase(smsProvider)) {
                sendViaAfricasTalking(phoneNumber, message);
            } else if ("twilio".equalsIgnoreCase(smsProvider)) {
                sendViaTwilio(phoneNumber, message);
            } else {
                // Default: Log only
                logSms(phoneNumber, message);
            }
        } catch (Exception e) {
            System.err.println("❌ Failed to send SMS: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    /**
     * Send SMS via Africa's Talking
     * TEMPLATE: Uncomment and configure when ready
     */
    private void sendViaAfricasTalking(String phoneNumber, String message) {
        // TEMPLATE CODE:
        /*
        String url = "https://api.africastalking.com/version1/messaging";
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        headers.set("apiKey", atApiKey);
        headers.set("Accept", "application/json");
        
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("username", atUsername);
        params.add("to", phoneNumber);
        params.add("message", message);
        params.add("from", atFrom);
        
        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);
        
        ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
        
        if (response.getStatusCode().is2xxSuccessful()) {
            System.out.println("✅ SMS sent via Africa's Talking to: " + phoneNumber);
        } else {
            System.err.println("❌ SMS failed: " + response.getBody());
        }
        */
        
        // Current: Log only
        System.out.println("📱 [AFRICA'S TALKING SMS LOG]");
        System.out.println("To: " + phoneNumber);
        System.out.println("From: " + atFrom);
        System.out.println("Message: " + message);
        System.out.println("---");
    }
    
    /**
     * Send SMS via Twilio
     * TEMPLATE: Uncomment and configure when ready
     */
    private void sendViaTwilio(String phoneNumber, String message) {
        // TEMPLATE CODE:
        /*
        String url = "https://api.twilio.com/2010-04-01/Accounts/" + twilioAccountSid + "/Messages.json";
        
        String auth = twilioAccountSid + ":" + twilioAuthToken;
        String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes());
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        headers.set("Authorization", "Basic " + encodedAuth);
        
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("To", phoneNumber);
        params.add("From", twilioPhoneNumber);
        params.add("Body", message);
        
        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);
        
        ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
        
        if (response.getStatusCode().is2xxSuccessful()) {
            System.out.println("✅ SMS sent via Twilio to: " + phoneNumber);
        } else {
            System.err.println("❌ SMS failed: " + response.getBody());
        }
        */
        
        // Current: Log only
        System.out.println("📱 [TWILIO SMS LOG]");
        System.out.println("To: " + phoneNumber);
        System.out.println("From: " + twilioPhoneNumber);
        System.out.println("Message: " + message);
        System.out.println("---");
    }
    
    /**
     * Log SMS (default when no provider configured)
     */
    private void logSms(String phoneNumber, String message) {
        System.out.println("📱 [SMS LOG - No Provider Configured]");
        System.out.println("To: " + phoneNumber);
        System.out.println("Message: " + message);
        System.out.println("Provider: " + smsProvider);
        System.out.println("---");
    }
    
    /**
     * Send bulk SMS
     */
    public void sendBulkSms(java.util.List<String> phoneNumbers, String message) {
        System.out.println("📱 Sending bulk SMS to " + phoneNumbers.size() + " recipients...");
        
        for (String phoneNumber : phoneNumbers) {
            try {
                sendSms(phoneNumber, message);
                // Add delay to avoid rate limiting
                Thread.sleep(100);
            } catch (Exception e) {
                System.err.println("Failed to send SMS to " + phoneNumber + ": " + e.getMessage());
            }
        }
        
        System.out.println("✅ Bulk SMS sending completed");
    }
    
    /**
     * Validate phone number format
     */
    public boolean isValidPhoneNumber(String phoneNumber) {
        // Uganda phone number format: +256XXXXXXXXX or 07XXXXXXXX or 03XXXXXXXX
        return phoneNumber != null && 
               (phoneNumber.matches("\\+256[0-9]{9}") || 
                phoneNumber.matches("0[7|3][0-9]{8}"));
    }
    
    /**
     * Format phone number to international format
     */
    public String formatPhoneNumber(String phoneNumber) {
        if (phoneNumber == null) return null;
        
        // Remove spaces and dashes
        phoneNumber = phoneNumber.replaceAll("[\\s-]", "");
        
        // Convert Uganda local format to international
        if (phoneNumber.startsWith("0") && phoneNumber.length() == 10) {
            return "+256" + phoneNumber.substring(1);
        }
        
        // Add + if missing
        if (phoneNumber.startsWith("256") && !phoneNumber.startsWith("+")) {
            return "+" + phoneNumber;
        }
        
        return phoneNumber;
    }
}
