# Tindigwa API Testing - Postman Collections

This directory contains comprehensive Postman collections for testing the three core modules of the Tindigwa Loan Management System.

## Overview

The Tindigwa system follows this workflow:
1. **Loan Product** → Define loan terms (interest rates, fees, durations)
2. **Loan** → Create loan application based on a product
3. **Payments** → Record payments against the loan in installments

These three modules are the **heart of the system** and must work correctly for the application to function.

## Collections

### 01 - Loan Products API
**File**: `01_Loan_Products_API.postman_collection.json`

Creates and manages loan products that define the terms and conditions for loans.

**Endpoints**: 10 requests
- Create loan products (Personal Loan, Business Loan, etc.)
- Retrieve products by ID, code, name
- Search and filter products
- Update and deactivate products

**Test Sequence**:
1. Create Personal Loan Product
2. Create Business Loan Product
3. Get all products
4. Search and filter by criteria
5. Update product settings
6. Deactivate product

---

### 02 - Loans API
**File**: `02_Loans_API.postman_collection.json`

Manages the loan lifecycle from application through disbursement.

**Endpoints**: 25 requests organized in 5 categories:
1. **Loan Creation** - Create loan applications
2. **Loan Retrieval** - Get loans by various filters
3. **Loan Workflow** - Approve, disburse, reject loans
4. **Loan Installment Schedule** - Generate and view payment schedules
5. **Loan Update & Delete** - Modify or remove loans

**Workflow States**:
- `PENDING_APPROVAL` → Initial state after creation
- `APPROVED` → Loan approved by manager
- `DISBURSED` → Money released to client (auto-generates installment schedule)
- `COMPLETED` → All payments made
- `REJECTED` → Loan rejected

**Test Sequence**:
1. Create loan application (PENDING_APPROVAL)
2. Approve loan (APPROVED)
3. Disburse loan (DISBURSED)
4. Generate installment schedule
5. View loan details and schedule

---

### 03 - Payments API
**File**: `03_Payments_API.postman_collection.json`

Records payments against loans, tracks installments, generates receipts, and provides analytics.

**Endpoints**: 40 requests organized in 7 categories:
1. **Payment Recording** - Record and process payments
2. **Payment Retrieval** - Get payments by various filters
3. **Financial Summary** - Loan balances and summaries
4. **Payment Analytics** - Trends, forecasts, portfolio health
5. **Payment Receipts** - Generate and retrieve receipts
6. **Payment Update & Actions** - Edit, cancel, reverse payments
7. **Payment Validation** - Validate amounts and dates

**Test Sequence**:
1. Record payment against disbursed loan
2. View payment details and receipt
3. Check loan balance updates
4. View payment analytics
5. Generate payment receipt

---

## Getting Started

### Prerequisites
- **Postman** (Desktop app or web version)
- **Backend server** running on `http://localhost:8081`
- **Database** properly configured with initial data

### Import Collections

1. Open Postman
2. Click **Import** button
3. Select all three JSON files:
   - `01_Loan_Products_API.postman_collection.json`
   - `02_Loans_API.postman_collection.json`
   - `03_Payments_API.postman_collection.json`
4. Click **Import**

### Configure Variables

Each collection has pre-configured variables:

#### 01 - Loan Products
```
baseUrl: http://localhost:8081
productId: (auto-populated after creating product)
productCode: (auto-populated after creating product)
```

#### 02 - Loans
```
baseUrl: http://localhost:8081
loanId: (auto-populated after creating loan)
clientId: 1 (update if needed)
productId: 1 (update after creating loan product)
loanOfficerId: 1 (update if needed)
```

#### 03 - Payments
```
baseUrl: http://localhost:8081
loanId: 1 (update after creating loan)
paymentId: (auto-populated after recording payment)
clientId: 1 (update if needed)
```

**To Update Variables**:
1. Click on collection name
2. Go to **Variables** tab
3. Update values in **CURRENT VALUE** column
4. Click **Save**

---

## Complete Testing Workflow

Follow this sequence to test the entire system end-to-end:

### Step 1: Create Loan Product
**Collection**: 01 - Loan Products API

1. Run **"1. Create Loan Product"**
   - Creates a Personal Loan product
   - Auto-saves `productId` and `productCode` to variables
   - Status: 201 Created

2. Verify by running **"3. Get All Loan Products"**
   - Should return the newly created product

3. Update collection variable in **02 - Loans**:
   - Go to Loans collection → Variables
   - Set `productId` to the ID from step 1

### Step 2: Create Loan
**Collection**: 02 - Loans API

4. Run **"1. Create Loan Application"**
   - Creates loan based on product from Step 1
   - Auto-saves `loanId` to variables
   - Status: PENDING_APPROVAL

5. Run **"11. Approve Loan"**
   - Changes status to APPROVED
   - Sets approval date

6. Run **"12. Disburse Loan"**
   - Changes status to DISBURSED
   - Auto-generates installment schedule
   - Triggers loan tracking creation

7. Verify by running **"4. Get Complete Loan Details"**
   - Should show full loan data with workflow history

8. Run **"18. Get Loan Payment Schedule"**
   - View generated installment schedule
   - Should show all expected installments

9. Update collection variable in **03 - Payments**:
   - Go to Payments collection → Variables
   - Set `loanId` to the ID from step 4

### Step 3: Record Payments
**Collection**: 03 - Payments API

10. Run **"1. Record Payment (Simple)"**
    - Records a payment against the loan
    - Auto-saves `paymentId` to variables
    - Auto-generates payment number (PAY-YYYYMMDD-LOANID-SEQNO)

11. Run **"28. Get Payment Receipt"**
    - Generates receipt with receipt number (RCP-YYYYMMDD-LOANID-PAYMENTID)
    - Shows payment details

12. Run **"16. Get Loan Balance"**
    - Shows updated loan balance after payment
    - Shows principal/interest breakdown

13. Run **"26. Get Dashboard Metrics"**
    - Shows overall payment analytics
    - Collection rates, trends, etc.

### Step 4: Verify Integration
**Collection**: 02 - Loans API

14. Run **"4. Get Complete Loan Details"** again
    - Should now show the payment in payments array
    - Updated tracking data
    - Updated balances

15. Run **"20. Get Schedule Summary"**
    - Should show payment reflected in schedule
    - Updated installment statuses

---

## Testing Best Practices

### 1. Run Tests in Sequence
The collections are designed to be run in order within each category. Requests often depend on previous requests setting collection variables.

### 2. Check Test Results
Each request includes automated tests:
- Status code validation
- Response structure validation
- Business logic validation

View test results in the **Test Results** tab after running a request.

### 3. Use Collection Runner
For comprehensive testing:
1. Click collection name
2. Click **Run** button
3. Select requests to run
4. Click **Run [Collection Name]**
5. View consolidated results

### 4. Monitor Variables
Keep the **Variables** tab open to see auto-populated IDs:
- `productId` after creating loan product
- `loanId` after creating loan
- `paymentId` after recording payment

### 5. Inspect Responses
Check the response bodies to understand data structures:
- Loan products include interest methods, fees, durations
- Loans include workflow status, dates, financial data
- Payments include allocations (principal, interest, fees)

---

## Common Issues & Solutions

### Issue: 404 Not Found
**Solution**: Ensure you've set the correct IDs in collection variables. The IDs should match entities that exist in your database.

### Issue: 409 Conflict (Workflow Error)
**Solution**: Check the loan's current workflow status. For example:
- Can't approve a loan that's already approved
- Can't disburse a loan that's not approved
- Can't record payment for a loan that's not disbursed

### Issue: Port Connection Refused
**Solution**: Verify backend is running on port 8081:
```bash
# Check if service is running
curl http://localhost:8081/api/loan-products
```

### Issue: Empty Response Arrays
**Solution**: Database might be empty. Run creation endpoints first:
1. Create loan products
2. Create loans
3. Record payments

### Issue: Test Scripts Failing
**Solution**: Check that:
- Response status is 200/201 as expected
- Response contains expected fields
- Variables are properly set

---

## API Endpoint Summary

### Loan Products (10 endpoints)
- `POST /api/loan-products/addLoanProduct` - Create product
- `GET /api/loan-products` - Get all products
- `GET /api/loan-products/{id}` - Get by ID
- `GET /api/loan-products/code/{code}` - Get by code
- `GET /api/loan-products/search` - Search by name
- `GET /api/loan-products/suitable-for-amount` - Filter by amount
- `GET /api/loan-products/requiring-guarantor` - Filter by guarantor
- `PUT /api/loan-products/{id}` - Update product
- `DELETE /api/loan-products/{id}` - Deactivate product

### Loans (25+ endpoints)
- `POST /api/loans` - Create loan
- `GET /api/loans` - Get approved loans
- `GET /api/loans/{id}` - Get by ID
- `GET /api/loans/{id}/complete` - Get complete details
- `GET /api/loans/pending-approval` - Get pending
- `GET /api/loans/rejected` - Get rejected
- `POST /api/loans/{id}/approve` - Approve loan
- `POST /api/loans/{id}/disburse` - Disburse loan
- `POST /api/loans/{id}/reject` - Reject loan
- `POST /api/installments/generate/{loanId}` - Generate schedule
- `GET /api/installments/loan/{loanId}/schedule` - Get schedule
- `GET /api/installments/loan/{loanId}/summary` - Schedule summary

### Payments (40+ endpoints)
- `POST /api/payments` - Record payment
- `POST /api/payments/process` - Process with calculations
- `GET /api/payments` - Get all payments
- `GET /api/payments/loan/{loanId}` - Get by loan
- `GET /api/payments/loan/{loanId}/summary` - Payment summary
- `GET /api/payments/loan/{loanId}/balance` - Loan balance
- `GET /api/payments/receipts/{paymentId}` - Get receipt
- `GET /api/payments/analytics/trends` - Payment trends
- `GET /api/payments/analytics/dashboard` - Dashboard metrics
- `POST /api/payments/{id}/reverse` - Reverse payment

---

## Next Steps

After verifying all backend endpoints work:

1. **Frontend Testing**: Verify that the frontend correctly consumes these APIs
2. **Integration Testing**: Test the complete user workflow in the UI
3. **Error Handling**: Test edge cases and error scenarios
4. **Performance Testing**: Test with larger datasets

---

## Support

For issues or questions:
- Check backend logs at `/backend/logs`
- Review database records to verify data integrity
- Ensure all services (database, backend) are running
- Verify network connectivity to `localhost:8081`

---

## Collection Statistics

| Collection | Requests | Categories | Auto-Tests |
|------------|----------|------------|------------|
| Loan Products | 10 | 1 | Yes |
| Loans | 25 | 5 | Yes |
| Payments | 40 | 7 | Yes |
| **Total** | **75** | **13** | **Yes** |

---

**Last Updated**: 2024-12-08
**API Version**: 1.0
**Base URL**: http://localhost:8081
