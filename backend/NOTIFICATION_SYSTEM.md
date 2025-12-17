# Notification System - Complete Guide

## 🔔 Overview

Your loan tracking system now has a **comprehensive notification system** that automatically sends alerts via **Email** and **SMS** for:
- Late payments
- Payment due reminders
- Default warnings  
- Loan maturity notices
- Weekly management reports

---

## ✅ What's Implemented

### 1. Notification Service
**File:** `NotificationService.java`

**Capabilities:**
- ✅ Late payment notifications
- ✅ Payment due reminders
- ✅ Default warnings
- ✅ Maturity reminders
- ✅ Batch notifications
- ✅ Weekly reports

### 2. Email Service
**File:** `EmailServiceImpl.java`

**Features:**
- Plain text emails
- HTML emails
- Emails with attachments
- Template ready for Spring Mail

### 3. SMS Service
**File:** `SmsServiceImpl.java`

**Supported Providers:**
- Africa's Talking (Recommended for Uganda)
- Twilio
- Custom gateway support
- Phone number validation & formatting
- Bulk SMS capability

### 4. Automated Triggers
**Integrated with Scheduler:**
- Daily at 1:00 AM - Send late payment alerts
- Daily at 8:00 AM - Send payment due reminders
- Daily at 10:00 AM - Send maturity reminders
- Weekly Monday 9:00 AM - Send management reports

---

## 🚀 Quick Start (Currently Logging Only)

### Current State
Right now, the system **logs all notifications** to console instead of actually sending them. This allows you to:
- ✅ Test the notification flow
- ✅ See what messages would be sent
- ✅ Verify timing and triggers
- ✅ Debug before going live

### Example Log Output
```
📧 [EMAIL LOG]
To: client1@example.com
Subject: Late Payment Alert
Body: Dear Customer,

Your loan payment for Loan #LN-TEST-001 is overdue by 5 days.
Outstanding Balance: USh 500,000.00
Please make payment immediately to avoid penalties.

Thank you.
---

📱 [SMS LOG]
To: +256700123456
Message: Your loan #LN-TEST-001 is 5 days overdue. Outstanding: USh 500,000. Pay now to avoid penalties.
---
```

---

## 📧 Email Setup (Option 1: Gmail)

### Step 1: Add Spring Mail Dependency

Add to `pom.xml`:
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-mail</artifactId>
</dependency>
```

### Step 2: Configure Gmail

Add to `application.properties`:
```properties
# Email Configuration (Gmail)
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
app.email.from=noreply@tindigwa.com
```

### Step 3: Get Gmail App Password

1. Go to Google Account settings
2. Enable 2-Factor Authentication
3. Generate App Password
4. Use that password in `spring.mail.password`

### Step 4: Uncomment Code

In `EmailServiceImpl.java`, uncomment the actual email sending code and remove the logging code.

---

## 📱 SMS Setup (Option 1: Africa's Talking)

### Why Africa's Talking?
- ✅ Best for Uganda/East Africa
- ✅ Competitive rates
- ✅ Reliable delivery
- ✅ Good API documentation
- ✅ Test credits available

### Step 1: Sign Up

1. Visit https://africastalking.com
2. Create account
3. Get API Key and Username
4. Get test credits

### Step 2: Configure

Add to `application.properties`:
```properties
# SMS Configuration (Africa's Talking)
sms.provider=africas-talking
africas.talking.username=your-username
africas.talking.apikey=your-api-key
africas.talking.from=TINDIGWA
```

### Step 3: Uncomment Code

In `SmsServiceImpl.java`, uncomment the Africa's Talking implementation.

---

## 📱 SMS Setup (Option 2: Twilio)

### Step 1: Sign Up

1. Visit https://twilio.com
2. Create account
3. Get Account SID and Auth Token
4. Get a Twilio phone number

### Step 2: Configure

Add to `application.properties`:
```properties
# SMS Configuration (Twilio)
sms.provider=twilio
twilio.account.sid=your-account-sid
twilio.auth.token=your-auth-token
twilio.phone.number=+1234567890
```

### Step 3: Uncomment Code

In `SmsServiceImpl.java`, uncomment the Twilio implementation.

---

## 🎯 Notification Types & Messages

### 1. Late Payment Alert

**Trigger:** Daily at 1:00 AM for all late loans

**Message:**
```
Dear Customer,

Your loan payment for Loan #LN-12345 is overdue by 5 days.
Outstanding Balance: USh 500,000.00
Please make payment immediately to avoid penalties.

Thank you.
```

**Sent via:** Email + SMS

---

### 2. Payment Due Reminder

**Trigger:** Daily at 8:00 AM for payments due today

**Message:**
```
Dear Customer,

Reminder: Payment for Loan #LN-12345 is due on 2025-10-22.
Amount Due: USh 100,000.00
Please ensure timely payment.

Thank you.
```

**Sent via:** Email + SMS

---

### 3. Default Warning

**Trigger:** Daily at 1:00 AM for defaulted loans

**Message:**
```
URGENT NOTICE

Dear Customer,

Your loan #LN-12345 is 90 days overdue and at risk of default.
Outstanding Balance: USh 500,000.00
Contact us immediately to arrange payment.

This is a final warning.
```

**Sent via:** Email + SMS

---

### 4. Maturity Reminder

**Trigger:** Daily at 10:00 AM for loans maturing in 7 days

**Message:**
```
Dear Customer,

Your loan #LN-12345 will mature on 2025-10-30.
Final Balance: USh 50,000.00
Please ensure full payment by maturity date.

Thank you.
```

**Sent via:** Email + SMS

---

### 5. Weekly Management Report

**Trigger:** Monday at 9:00 AM

**Sent to:** Management email addresses

**Contains:**
- Total outstanding balance
- Portfolio at Risk (PAR) metrics
- Late loans count
- Defaulted loans count
- High-risk loans

---

## ⚙️ Customization

### Change Notification Times

Edit `LoanTrackingScheduler.java`:

```java
// Change from 1:00 AM to 6:00 AM
@Scheduled(cron = "0 0 6 * * *")  // Hour changed from 1 to 6
public void checkLateLoansDailyAt6AM() {
    // ...
}
```

### Customize Messages

Edit `NotificationService.java`:

```java
private String buildLatePaymentMessage(LoanTracking tracking) {
    return String.format(
        "Hello! Loan #%s is %d days late. Pay USh %,.2f now.",
        tracking.getLoanNumber(),
        tracking.getDaysLate(),
        tracking.getOutstandingBalance()
    );
}
```

### Disable Specific Notifications

Comment out in `LoanTrackingScheduler.java`:

```java
// Disable default warnings
// for (LoanTracking defaulted : defaultedLoans) {
//     notificationService.sendDefaultWarning(defaulted);
// }
```

---

## 🧪 Testing

### Test Notification Flow

1. **View Logs:**
```bash
tail -f backend.log | grep "EMAIL\|SMS"
```

2. **Manually Trigger:**

Create a test endpoint in `LoanTrackingController.java`:
```java
@PostMapping("/test-notification/{loanId}")
public ResponseEntity<String> testNotification(@PathVariable Long loanId) {
    LoanTracking tracking = trackingService.getTrackingByLoanId(loanId).orElse(null);
    if (tracking != null) {
        notificationService.sendLatePaymentNotification(tracking);
        return ResponseEntity.ok("Notification sent");
    }
    return ResponseEntity.notFound().build();
}
```

Then call:
```bash
curl -X POST http://localhost:8081/api/loan-tracking/test-notification/1
```

---

## 📊 Notification Statistics

### Track Sent Notifications

Create a `notification_log` table:
```sql
CREATE TABLE notification_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    notification_type VARCHAR(50),
    loan_id BIGINT,
    recipient VARCHAR(255),
    channel VARCHAR(20),
    status VARCHAR(20),
    sent_at DATETIME,
    error_message TEXT
);
```

### Log in NotificationService

```java
private void logNotification(String type, Long loanId, String recipient) {
    // Save to database
    NotificationLog log = new NotificationLog();
    log.setNotificationType(type);
    log.setLoanId(loanId);
    log.setRecipient(recipient);
    log.setSentAt(LocalDateTime.now());
    log.setStatus("SENT");
    notificationLogRepository.save(log);
}
```

---

## 🔒 Best Practices

### 1. Rate Limiting
```java
// Add delay between SMS to avoid rate limits
Thread.sleep(100); // 100ms delay
```

### 2. Error Handling
```java
try {
    sendSMS(phone, message);
} catch (Exception e) {
    // Log error
    // Retry later
    // Send via alternate channel
}
```

### 3. Opt-Out Management
```java
// Check if client has opted out
if (client.hasOptedOutOfSMS()) {
    sendEmail only();
}
```

### 4. Cost Control
```java
// Only send SMS for critical alerts
if (daysLate > 30) {
    sendEmail() && sendSMS();
} else {
    sendEmailOnly();
}
```

---

## 💰 Cost Estimates

### SMS Costs (Africa's Talking - Uganda)
- **Local SMS:** ~UGX 30-50 per message
- **1000 late loan alerts/month:** ~UGX 40,000
- **Test credits:** Free (limited)

### Email Costs
- **Gmail:** Free (500 emails/day limit)
- **SendGrid:** Free tier (100 emails/day)
- **AWS SES:** $0.10 per 1000 emails

---

## 🎯 Next Steps

### Phase 1: Testing (Current)
- [x] Notification service created
- [x] Email templates ready
- [x] SMS templates ready
- [x] Integrated with scheduler
- [ ] Test with real email
- [ ] Test with real SMS

### Phase 2: Production
- [ ] Add Spring Mail dependency
- [ ] Configure email provider
- [ ] Configure SMS provider
- [ ] Uncomment implementation code
- [ ] Test in production

### Phase 3: Enhancement
- [ ] HTML email templates
- [ ] WhatsApp notifications
- [ ] Push notifications
- [ ] Notification preferences per client
- [ ] Delivery status tracking

---

## 📝 Summary

Your notification system is **fully implemented** and ready to go live! Currently:

✅ **Working:**
- Automated triggers (5 scheduled jobs)
- Message generation
- Multi-channel support (Email + SMS)
- Logging for testing

🔧 **To Enable:**
1. Add email/SMS provider credentials
2. Uncomment implementation code
3. Test and deploy

**Status:** 🟡 **Ready for Configuration**

Once configured, notifications will be sent automatically with zero manual intervention!

---

**Documentation Version:** 1.0.0  
**Last Updated:** October 22, 2025  
**Status:** Production Templates Ready ✅
