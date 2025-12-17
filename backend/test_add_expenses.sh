#!/bin/bash

# Test script to add sample expenses to the database
BASE_URL="http://localhost:8080/api/expenses"

echo "Adding sample expenses to database..."
echo ""

# Expense 1: Office Supplies
echo "1. Adding Office Supplies expense..."
curl -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Operational",
    "description": "Office supplies for Q4 2025",
    "amount": 250000,
    "expenseDate": "2025-10-20",
    "paymentMethod": "Bank Transfer",
    "vendor": "Stationary Plus Ltd",
    "status": "paid",
    "createdBy": "John Doe"
  }'
echo -e "\n"

# Expense 2: Salary Payment
echo "2. Adding Salary expense..."
curl -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Salaries",
    "description": "October 2025 staff salaries",
    "amount": 5000000,
    "expenseDate": "2025-10-22",
    "paymentMethod": "Bank Transfer",
    "vendor": "Payroll Department",
    "status": "paid",
    "createdBy": "HR Manager"
  }'
echo -e "\n"

# Expense 3: Marketing Campaign
echo "3. Adding Marketing expense..."
curl -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Marketing",
    "description": "Social media advertising campaign",
    "amount": 750000,
    "expenseDate": "2025-10-21",
    "paymentMethod": "Card",
    "vendor": "Facebook Ads",
    "status": "paid",
    "createdBy": "Marketing Team"
  }'
echo -e "\n"

# Expense 4: Utilities
echo "4. Adding Utilities expense..."
curl -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Utilities",
    "description": "Electricity bill for October 2025",
    "amount": 450000,
    "expenseDate": "2025-10-19",
    "paymentMethod": "Mobile Money",
    "vendor": "Umeme Ltd",
    "status": "paid",
    "createdBy": "Admin Staff"
  }'
echo -e "\n"

# Expense 5: Technology
echo "5. Adding Technology expense..."
curl -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Technology",
    "description": "Cloud hosting services - monthly subscription",
    "amount": 350000,
    "expenseDate": "2025-10-23",
    "paymentMethod": "Card",
    "vendor": "AWS",
    "status": "pending",
    "createdBy": "IT Department"
  }'
echo -e "\n"

echo "Done! All sample expenses have been added."
echo ""
echo "Fetching all expenses to verify..."
curl -X GET "$BASE_URL" | json_pp
