#!/bin/bash

# Update Personal Loan (ID: 1)
echo "Updating Personal Loan..."
curl -X PUT "http://localhost:8081/api/loan-products/1" \
  -H "Content-Type: application/json" \
  -d '{
    "productName": "Personal Loan",
    "productCode": "PL001",
    "description": "Standard personal loan for individuals",
    "defaultInterestRate": 13.0,
    "interestMethod": "flat",
    "interestType": "percentage", 
    "ratePer": "month",
    "minDuration": 1,
    "maxDuration": 12,
    "durationUnit": "months",
    "minAmount": 50000.0,
    "maxAmount": 2000000.0,
    "allowedRepaymentFrequencies": ["weekly", "monthly"],
    "defaultRepaymentFrequency": "monthly",
    "processingFeeType": "fixed",
    "processingFeeValue": 15000.0,
    "lateFee": 5000.0,
    "defaultFee": 10000.0,
    "defaultGracePeriodDays": 14,
    "requiresGuarantor": true,
    "requiresCollateral": false,
    "active": true
  }' > /dev/null

# Update Business Loan (ID: 2)
echo "Updating Business Loan..."
curl -X PUT "http://localhost:8081/api/loan-products/2" \
  -H "Content-Type: application/json" \
  -d '{
    "productName": "Business Loan",
    "productCode": "BL001",
    "description": "Loan for business expansion and working capital",
    "defaultInterestRate": 13.0,
    "interestMethod": "reducing",
    "interestType": "percentage",
    "ratePer": "month", 
    "minDuration": 3,
    "maxDuration": 24,
    "durationUnit": "months",
    "minAmount": 100000.0,
    "maxAmount": 10000000.0,
    "allowedRepaymentFrequencies": ["monthly"],
    "defaultRepaymentFrequency": "monthly",
    "processingFeeType": "percentage",
    "processingFeeValue": 2.5,
    "lateFee": 10000.0,
    "defaultFee": 25000.0,
    "defaultGracePeriodDays": 14,
    "requiresGuarantor": true,
    "requiresCollateral": false,
    "active": true
  }' > /dev/null

# Update Emergency Loan (ID: 3)
echo "Updating Emergency Loan..."
curl -X PUT "http://localhost:8081/api/loan-products/3" \
  -H "Content-Type: application/json" \
  -d '{
    "productName": "Emergency Loan",
    "productCode": "EL001",
    "description": "Quick loan for emergencies",
    "defaultInterestRate": 13.0,
    "interestMethod": "flat",
    "interestType": "percentage",
    "ratePer": "month",
    "minDuration": 7,
    "maxDuration": 90,
    "durationUnit": "days",
    "minAmount": 20000.0,
    "maxAmount": 500000.0,
    "allowedRepaymentFrequencies": ["daily", "weekly"],
    "defaultRepaymentFrequency": "weekly",
    "processingFeeType": "fixed",
    "processingFeeValue": 5000.0,
    "lateFee": 2000.0,
    "defaultFee": 5000.0,
    "defaultGracePeriodDays": 14,
    "requiresGuarantor": false,
    "requiresCollateral": false,
    "active": true
  }' > /dev/null

# Update Micro Loan (ID: 4)
echo "Updating Micro Loan..."
curl -X PUT "http://localhost:8081/api/loan-products/4" \
  -H "Content-Type: application/json" \
  -d '{
    "productName": "Micro Loan",
    "productCode": "ML001",
    "description": "Small loans for micro enterprises",
    "defaultInterestRate": 13.0,
    "interestMethod": "flat",
    "interestType": "percentage",
    "ratePer": "month",
    "minDuration": 1,
    "maxDuration": 6,
    "durationUnit": "months",
    "minAmount": 10000.0,
    "maxAmount": 100000.0,
    "allowedRepaymentFrequencies": ["weekly", "monthly"],
    "defaultRepaymentFrequency": "weekly", 
    "processingFeeType": "percentage",
    "processingFeeValue": 5.0,
    "lateFee": 3000.0,
    "defaultFee": 7000.0,
    "defaultGracePeriodDays": 14,
    "requiresGuarantor": true,
    "requiresCollateral": false,
    "active": true
  }' > /dev/null

echo "All loan products updated successfully!"

# Verify the updates
echo "Verifying updates..."
curl -s "http://localhost:8081/api/loan-products" | jq '.[] | {id, productName, defaultInterestRate, defaultGracePeriodDays}'