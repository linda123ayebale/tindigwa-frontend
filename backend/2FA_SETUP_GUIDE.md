# Email OTP 2-Factor Authentication - Setup Guide

## Overview
The Tindigwa system now supports email-based OTP (One-Time Password) 2-factor authentication. Users with 2FA enabled will receive a 6-digit code via email after entering their credentials, which must be entered to complete login.

## Backend Setup Complete ✅

The following backend components have been implemented:

### Database
- **OtpCode entity**: Stores OTP codes with expiry, attempt tracking, and usage status
- **User entity**: Added `twoFactorEnabled` boolean field (default: false)

### Services
- **EmailService**: Sends professional HTML emails with OTP codes
- **OtpService**: Generates OTPs, validates codes, handles rate limiting and cooldown

### API Endpoints
- `POST /api/auth/login` - Modified to check 2FA and send OTP if enabled
- `POST /api/auth/verify-otp` - Validates OTP and returns JWT token
- `POST /api/auth/resend-otp` - Resends OTP with 60-second cooldown

### Security Features
- OTP codes expire after 5 minutes
- Maximum 3 attempts per OTP code
- 60-second cooldown between resend requests
- Automatic cleanup of expired OTPs (runs hourly)

## SMTP Configuration Required

### Step 1: Choose an Email Provider

You need to configure SMTP credentials in the `.env` file. Here are your options:

#### Option 1: Gmail (Recommended for Development)

1. **Enable 2-Step Verification** on your Google Account:
   - Go to https://myaccount.google.com/security
   - Enable "2-Step Verification"

2. **Generate App Password**:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it "Tindigwa OTP"
   - Copy the 16-character password

3. **Update `.env` file**:
   ```bash
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USERNAME=your-email@gmail.com
   SMTP_PASSWORD=your-16-char-app-password
   SMTP_FROM_EMAIL=your-email@gmail.com
   SMTP_FROM_NAME=Tindigwa Loan Management
   ```

#### Option 2: SendGrid (Recommended for Production)

1. **Sign up** at https://sendgrid.com (Free tier: 100 emails/day)
2. **Create API Key**: Settings → API Keys → Create API Key
3. **Update `.env` file**:
   ```bash
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USERNAME=apikey
   SMTP_PASSWORD=your-sendgrid-api-key
   SMTP_FROM_EMAIL=noreply@yourdomain.com
   SMTP_FROM_NAME=Tindigwa Loan Management
   ```

#### Option 3: Mailgun (Good for Startups)

1. **Sign up** at https://www.mailgun.com (Free tier: 5,000 emails/month)
2. **Get SMTP credentials** from your domain dashboard
3. **Update `.env` file**:
   ```bash
   SMTP_HOST=smtp.mailgun.org
   SMTP_PORT=587
   SMTP_USERNAME=postmaster@yourdomain.mailgun.org
   SMTP_PASSWORD=your-mailgun-smtp-password
   SMTP_FROM_EMAIL=noreply@yourdomain.com
   SMTP_FROM_NAME=Tindigwa Loan Management
   ```

### Step 2: Update Environment Variables

Edit `/home/blessing/Projects/Others/tindigwa-frontend/backend/.env`:

```bash
# Database credentials (existing)
DB_PASSWORD=Mylinda@0123
JWT_SECRET=LmhUQfBHhFPHc7yQqD+KWjd5i7ARmVRmb5/dYuIFbx5UrjlLK9CjN7cQ3SFZ75aaEPjo5s9URo/USTYRK7W41w==

# SMTP Configuration (ADD THESE)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-actual-email@gmail.com
SMTP_PASSWORD=your-actual-app-password
SMTP_FROM_EMAIL=noreply@tindigwa.com
SMTP_FROM_NAME=Tindigwa Loan Management
```

**⚠️ IMPORTANT**: Replace `your-actual-email@gmail.com` and `your-actual-app-password` with real values!

### Step 3: Test Email Sending

After configuring SMTP, you can test email delivery:

1. **Enable 2FA for a test user**:
   ```sql
   UPDATE users SET two_factor_enabled = true WHERE email = 'test@example.com';
   ```

2. **Attempt to login** with that user
3. **Check email inbox** for OTP code
4. **Enter the 6-digit code** on the verification screen

## How 2FA Works

### User Experience Flow

1. **Login Screen**: User enters email + password
2. **If 2FA enabled**:
   - System validates credentials
   - Generates 6-digit OTP
   - Sends email with OTP code
   - Shows "Check your email" message
3. **OTP Verification Screen**: User enters 6-digit code
4. **System validates OTP**:
   - ✅ Valid → Login successful, redirect to dashboard
   - ❌ Invalid → Show error, allow retry (max 3 attempts)
5. **Timer shows expiry**: Code expires in 5 minutes

### Admin vs Regular Users

- **Optional by default**: Users can choose to enable 2FA in settings
- **Can be mandatory**: Enforce 2FA for ADMIN role by database constraint
- **Flexible**: Different security levels for different user types

## Enabling 2FA for Users

### Method 1: Direct Database Update (Temporary)

```sql
-- Enable 2FA for specific user
UPDATE users SET two_factor_enabled = true WHERE email = 'admin@tindigwa.com';

-- Enable 2FA for all admin users
UPDATE users SET two_factor_enabled = true WHERE role = 'ADMIN';

-- Disable 2FA
UPDATE users SET two_factor_enabled = false WHERE email = 'user@tindigwa.com';
```

### Method 2: User Settings (Frontend - Coming Next)

Users will be able to toggle 2FA on/off in their profile settings page.

## Troubleshooting

### Email Not Sending

1. **Check SMTP credentials**:
   ```bash
   # Print environment variables
   echo $SMTP_USERNAME
   echo $SMTP_HOST
   ```

2. **Check application logs** for email errors:
   ```bash
   tail -f backend/backend.log | grep -i "email\|smtp\|otp"
   ```

3. **Common Gmail issues**:
   - Make sure 2-Step Verification is enabled
   - Use App Password, not regular password
   - Check "Less secure app access" is OFF (you should use App Password)

4. **Test SMTP connection** manually:
   ```bash
   telnet smtp.gmail.com 587
   ```

### OTP Expired Too Quickly

- OTPs expire in 5 minutes by default
- Check system time is correct: `date`
- Adjust expiry in `OtpService.java` if needed (line 24: `OTP_EXPIRY_MINUTES`)

### Too Many Failed Attempts

- Maximum 3 attempts per OTP
- User must request a new code after 3 failed attempts
- 60-second cooldown between resend requests

### Email Goes to Spam

- **For Gmail**: The first email might go to spam, mark as "Not Spam"
- **For Production**: Configure SPF, DKIM, and DMARC records for your domain
- **Use professional provider**: SendGrid/Mailgun have better deliverability

## Security Best Practices

1. **Never commit `.env` file**: Already in `.gitignore`
2. **Rotate SMTP credentials** periodically
3. **Monitor OTP usage**: Check for unusual patterns
4. **Enable 2FA for admins**: Mandatory for high-privilege accounts
5. **Use production email service**: Switch from Gmail to SendGrid/Mailgun for production

## Next Steps

1. ✅ Backend implementation complete
2. ⏳ Frontend OTP verification page (in progress)
3. ⏳ Frontend 2FA settings toggle (in progress)
4. ⏳ Testing and validation (in progress)

## Production Deployment Checklist

- [ ] Switch to production SMTP provider (SendGrid/Mailgun)
- [ ] Configure custom domain for emails (e.g., noreply@tindigwa.com)
- [ ] Set up SPF/DKIM/DMARC records
- [ ] Enable 2FA for all admin users
- [ ] Test email delivery to multiple providers (Gmail, Outlook, Yahoo)
- [ ] Monitor email bounce rates
- [ ] Set up email delivery alerts

## Support

For issues or questions about 2FA setup, contact the development team.
