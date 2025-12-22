#!/bin/bash

# SMTP Test Script
echo "Testing SMTP Configuration..."
echo ""

# Check if backend is running
curl -s http://localhost:8081/api/auth/setup-status > /dev/null
if [ $? -ne 0 ]; then
    echo "❌ Backend is not running!"
    exit 1
fi

echo "Testing with user: lindablessing638@gmail.com"
echo "Password: 123456"
echo ""

# Try login
RESPONSE=$(curl -s -v -X POST "http://localhost:8081/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "lindablessing638@gmail.com", "password": "123456"}' 2>&1)

# Extract HTTP status
STATUS=$(echo "$RESPONSE" | grep "< HTTP" | awk '{print $3}')

# Extract body
BODY=$(echo "$RESPONSE" | grep -v "^[<>*]" | grep -v "^{" | tail -1)

echo "HTTP Status: $STATUS"
echo "Response: $BODY"
echo ""

if echo "$RESPONSE" | grep -q "requiresOtp"; then
    echo "✅ OTP Email should have been sent!"
elif echo "$RESPONSE" | grep -q "error"; then
    ERROR=$(echo "$RESPONSE" | grep -o '"error":"[^"]*"' | cut -d'"' -f4)
    echo "❌ Error: $ERROR"
else
    echo "⚠️ Unexpected response"
fi
