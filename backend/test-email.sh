#!/bin/bash

# Test Email Configuration Script
# This script tests the SMTP email functionality

BACKEND_URL="http://localhost:8081/api"
TEST_EMAIL="lindakellen9@gmail.com"

echo "=========================================="
echo "TINDIGWA EMAIL CONFIGURATION TEST"
echo "=========================================="
echo ""

# Check if backend is running
echo "1. Checking if backend is running..."
if curl -s -f "${BACKEND_URL}/auth/setup-status" > /dev/null 2>&1; then
    echo "✅ Backend is running on ${BACKEND_URL}"
else
    echo "❌ Backend is NOT running!"
    echo "   Please start the backend first in IntelliJ"
    echo "   Expected URL: ${BACKEND_URL}"
    exit 1
fi

echo ""
echo "2. Checking setup status..."
SETUP_STATUS=$(curl -s "${BACKEND_URL}/auth/setup-status")
echo "   Response: ${SETUP_STATUS}"

# Check if setup is completed
SETUP_COMPLETED=$(echo "$SETUP_STATUS" | grep -o '"setupCompleted":[^,}]*' | cut -d':' -f2)
echo ""

if [ "$SETUP_COMPLETED" = "false" ]; then
    echo "3. System needs setup - Creating test user with 2FA enabled..."
    echo "   This will trigger an OTP email to: ${TEST_EMAIL}"
    
    # Create setup user with 2FA enabled
    SETUP_RESPONSE=$(curl -s -X POST "${BACKEND_URL}/auth/setup" \
        -H "Content-Type: application/json" \
        -d "{
            \"name\": \"Test Admin\",
            \"email\": \"${TEST_EMAIL}\",
            \"password\": \"Test123456\",
            \"confirmPassword\": \"Test123456\",
            \"branch\": \"Main Branch\",
            \"twoFactorEnabled\": true
        }")
    
    echo "   Response: ${SETUP_RESPONSE}"
    
    # Check if setup was successful
    if echo "$SETUP_RESPONSE" | grep -q "token"; then
        echo "✅ Setup successful!"
        echo ""
        echo "⚠️  However, setup doesn't send OTP email."
        echo "    You need to login to test email functionality."
    else
        echo "❌ Setup failed!"
        echo "   Response: ${SETUP_RESPONSE}"
        exit 1
    fi
fi

echo ""
echo "4. Testing email by attempting login (this will send OTP)..."
echo "   Email will be sent to: ${TEST_EMAIL}"
echo ""

# Attempt login - this should trigger OTP email if user has 2FA enabled
LOGIN_RESPONSE=$(curl -s -X POST "${BACKEND_URL}/auth/login" \
    -H "Content-Type: application/json" \
    -d "{
        \"email\": \"${TEST_EMAIL}\",
        \"password\": \"Test123456\"
    }")

echo "   Response: ${LOGIN_RESPONSE}"
echo ""

# Check if OTP was required (meaning email was sent)
if echo "$LOGIN_RESPONSE" | grep -q "requiresOtp"; then
    echo "✅ EMAIL TEST SUCCESSFUL!"
    echo ""
    echo "=========================================="
    echo "An OTP email has been sent to:"
    echo "   ${TEST_EMAIL}"
    echo ""
    echo "Please check your inbox for:"
    echo "   - Sender: Tindigwa Loan Management"
    echo "   - Subject: Your Login Verification Code"
    echo "   - Content: 6-digit OTP code"
    echo "=========================================="
    echo ""
    echo "To complete login, use this endpoint:"
    echo "POST ${BACKEND_URL}/auth/verify-otp"
    echo "Body: {\"userId\": <user_id>, \"otpCode\": \"<code_from_email>\"}"
    
elif echo "$LOGIN_RESPONSE" | grep -q "token"; then
    echo "⚠️  LOGIN SUCCESSFUL WITHOUT OTP"
    echo ""
    echo "This means 2FA is not enabled for this user."
    echo "Email functionality cannot be tested this way."
    echo ""
    echo "To test email, you need a user with 2FA enabled."
    
elif echo "$LOGIN_RESPONSE" | grep -q "error"; then
    ERROR_MSG=$(echo "$LOGIN_RESPONSE" | grep -o '"error":"[^"]*"' | cut -d'"' -f4)
    echo "❌ LOGIN FAILED: ${ERROR_MSG}"
    echo ""
    echo "Possible reasons:"
    echo "1. User doesn't exist (need to create via setup first)"
    echo "2. Wrong password"
    echo "3. Backend configuration issue"
else
    echo "❌ UNEXPECTED RESPONSE"
    echo "   Response: ${LOGIN_RESPONSE}"
fi

echo ""
echo "=========================================="
echo "TEST COMPLETE"
echo "=========================================="
