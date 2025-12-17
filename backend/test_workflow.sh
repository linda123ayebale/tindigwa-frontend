#!/bin/bash

echo "===== Backend Overhaul cURL Tests ====="
echo

# 1) Create Loan Product
echo "Test 1: Create Loan Product"
curl -s -X POST http://localhost:8081/api/loan-products \
 -H "Content-Type: application/json" \
 -d '{"productCode":"BUS25","productName":"Business Loan","interestMethod":"REDUCING","interestRate":12.5,"defaultFrequency":"MONTHLY","minAmount":500000,"maxAmount":20000000,"minTerm":3,"maxTerm":24}' | jq .
echo
echo "---"
echo

# 2) Create Loan (pending)
echo "Test 2: Create Loan (PENDING_APPROVAL status)"
LOAN_RESPONSE=$(curl -s -X POST http://localhost:8081/api/loans \
 -H "Content-Type: application/json" \
 -d '{"clientId":1,"productId":1,"principalAmount":2000000,"loanStatus":"PENDING_APPROVAL","numberOfRepayments":12,"repaymentFrequency":"MONTHLY","paymentStartDate":"2025-11-20","paymentEndDate":"2026-10-20","releaseDate":"2025-11-20"}')
echo "$LOAN_RESPONSE" | jq .
LOAN_ID=$(echo "$LOAN_RESPONSE" | jq -r '.id // empty')
echo
echo "Loan ID: $LOAN_ID"
echo "---"
echo

if [ -z "$LOAN_ID" ] || [ "$LOAN_ID" = "null" ]; then
  echo "ERROR: Failed to create loan. Stopping tests."
  exit 1
fi

# 3) Approve Loan
echo "Test 3: Approve Loan"
curl -s -X POST "http://localhost:8081/api/loans/$LOAN_ID/approve" \
 -H "Content-Type: application/json" \
 -d '{"approvedBy": "managerUser"}' | jq .
echo
echo "---"
echo

# 4) Disburse Loan
echo "Test 4: Disburse Loan"
curl -s -X POST "http://localhost:8081/api/loans/$LOAN_ID/disburse" \
 -H "Content-Type: application/json" \
 -d '{"disbursedBy": "cashierUser"}' | jq .
echo
echo "---"
echo

# 5) Record Payment
echo "Test 5: Record Payment"
PAYMENT_RESPONSE=$(curl -s -X POST http://localhost:8081/api/payments/record \
 -H "Content-Type: application/json" \
 -d "{\"loanId\":$LOAN_ID,\"amountPaid\":250000,\"paymentDate\":\"2025-12-01\",\"paymentMethod\":\"CASH\",\"referenceNumber\":\"RCPT-1001\"}")
echo "$PAYMENT_RESPONSE" | jq .
PAYMENT_ID=$(echo "$PAYMENT_RESPONSE" | jq -r '.id // empty')
echo
echo "Payment ID: $PAYMENT_ID"
echo "---"
echo

if [ -z "$PAYMENT_ID" ] || [ "$PAYMENT_ID" = "null" ]; then
  echo "ERROR: Failed to create payment. Stopping remaining tests."
  exit 1
fi

# 6) Reverse Payment
echo "Test 6: Reverse Payment"
curl -s -X POST "http://localhost:8081/api/payments/$PAYMENT_ID/reverse" \
 -H "Content-Type: application/json" \
 -d '{"reversedBy":"managerUser","reason":"duplicate"}' | jq .
echo
echo "---"
echo

# 7) Verify Tracking Snapshot
echo "Test 7: Verify Loan Tracking"
curl -s "http://localhost:8081/api/loans/$LOAN_ID/tracking" | jq .
echo
echo "---"

echo
echo "===== Tests Complete ====="
