#!/bin/bash

echo "===== Payment Enhancement API Tests ====="
echo

# Wait for backend to be ready
sleep 10

# 1) Record a payment
echo "Test 1: Record Payment"
PAYMENT_RESPONSE=$(curl -s -X POST http://localhost:8081/api/payments/record \
  -H "Content-Type: application/json" \
  -d '{"loanId":18,"amountPaid":50000,"paymentDate":"2025-11-15","paymentMethod":"CASH","referenceNumber":"RCPT-101"}')
echo "$PAYMENT_RESPONSE" | jq .
PAYMENT_ID=$(echo "$PAYMENT_RESPONSE" | jq -r '.id // empty')
echo "Payment ID: $PAYMENT_ID"
echo "---"
echo

if [ -z "$PAYMENT_ID" ] || [ "$PAYMENT_ID" = "null" ]; then
  echo "ERROR: Failed to create payment. Stopping tests."
  exit 1
fi

# 2) Get payment receipt
echo "Test 2: Get Payment Receipt"
curl -s "http://localhost:8081/api/payments/$PAYMENT_ID/receipt" | jq .
echo "---"
echo

# 3) Edit payment
echo "Test 3: Edit Payment"
curl -s -X PUT "http://localhost:8081/api/payments/$PAYMENT_ID/edit" \
  -H "Content-Type: application/json" \
  -d '{"amountPaid":55000,"notes":"Amount corrected"}' | jq .
echo "---"
echo

# 4) Reverse payment
echo "Test 4: Reverse Payment"
curl -s -X POST "http://localhost:8081/api/payments/$PAYMENT_ID/reverse" \
  -H "Content-Type: application/json" \
  -d '{"reversedBy":"managerUser","reason":"double entry"}' | jq .
echo "---"
echo

# 5) Try to edit reversed payment (should fail)
echo "Test 5: Try to Edit Reversed Payment (should fail)"
curl -s -X PUT "http://localhost:8081/api/payments/$PAYMENT_ID/edit" \
  -H "Content-Type: application/json" \
  -d '{"amountPaid":60000}' | jq .
echo "---"
echo

# 6) Get all payments
echo "Test 6: Get All Payments (first 3)"
curl -s "http://localhost:8081/api/payments" | jq '.[0:3]'
echo "---"

echo
echo "===== Tests Complete ====="
