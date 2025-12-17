# Dynamic Loan Product Configuration - Testing Guide

## Overview
This guide covers testing the newly implemented dynamic loan product configuration system with registration fee tiers and penalty rates.

## Database Changes Completed ✅
- Added `registration_fee_tiers` JSON column to loan_products table
- Added `penalty_rate` DOUBLE column to loan_products table
- Seeded 3 loan products: Salary Loan, Business Loan, School Fees Loan

## Backend Changes Completed ✅
1. **RegistrationFeeTiersConverter.java** - JPA converter for JSON serialization
2. **LoanProduct.java** - Added new fields and calculation methods
3. **LoanProductResponse.java** - Added new fields and helper methods
4. **LoanProductService.java** - Updated to handle new fields
5. **LoanProductController.java** - Mapper updated to include new fields

## Frontend Changes Completed ✅
1. **FeesAndPenaltiesStep.jsx** - Tier management UI with add/remove functionality
2. **AddLoanProduct.jsx** - Form state and validation for new fields
3. **EditLoanProduct.jsx** - Load and edit tiers and penalty rate
4. **LoanProducts.jsx** - Display penalty rate in table
5. **ViewLoanProduct.jsx** - Display tiers table and penalty rate

## Seeded Loan Products

### 1. Salary Loan (LP-SALARY-001)
- **Interest Rate**: 22% per month
- **Repayment**: Monthly
- **Max Duration**: 100 days
- **Processing Fee**: 4%
- **Penalty Rate**: 0.02% per day
- **Grace Period**: 14 days
- **Registration Tiers**: 
  - 100k-250k: 5,000 UGX
  - 260k-500k: 10,000 UGX
  - 510k-1m: 15,000 UGX

### 2. Business Loan (LP-BUSINESS-001)
- **Interest Rate**: 20% per month
- **Repayment**: Daily (also weekly, bi-weekly)
- **Max Duration**: 32 days
- **Processing Fee**: 4%
- **Penalty Rate**: 0.02% per day
- **Grace Period**: 14 days
- **Registration Tiers**: Same as above
- **Requires Guarantor**: Yes

### 3. School Fees Loan (LP-SCHOOL-001)
- **Interest Rate**: 25% per month
- **Repayment**: Flexible (daily/weekly/bi-weekly/monthly)
- **Max Duration**: 100 days
- **Processing Fee**: 4%
- **Penalty Rate**: 0.02% per day
- **Grace Period**: 14 days
- **Registration Tiers**: Same as above
- **Requires Guarantor**: Yes

## API Testing (Postman)

### 1. Get All Loan Products
```http
GET http://localhost:8080/api/loan-products
Authorization: Bearer <JWT_TOKEN>
```

**Expected Response** should include:
- `registrationFeeTiers` array with tier objects
- `penaltyRate` field (0.02)
- All 3 seeded products

### 2. Get Loan Product by ID
```http
GET http://localhost:8080/api/loan-products/{id}
Authorization: Bearer <JWT_TOKEN>
```

**Verify**:
- Registration fee tiers are properly deserialized
- Penalty rate is present

### 3. Create New Loan Product with Tiers
```http
POST http://localhost:8080/api/loan-products/addLoanProduct
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "productName": "Test Loan",
  "description": "Test loan with dynamic fees",
  "defaultInterestRate": 18.0,
  "interestMethod": "flat",
  "interestType": "percentage",
  "ratePer": "month",
  "minDuration": 30,
  "maxDuration": 90,
  "defaultDuration": 60,
  "durationUnit": "days",
  "minAmount": 50000,
  "maxAmount": 500000,
  "defaultRepaymentFrequency": "monthly",
  "allowedRepaymentFrequencies": "weekly,monthly",
  "processingFeeType": "percentage",
  "processingFeeValue": 3.5,
  "defaultGracePeriodDays": 7,
  "penaltyRate": 0.015,
  "registrationFeeTiers": [
    {"minAmount": 50000, "maxAmount": 150000, "fee": 3000},
    {"minAmount": 150001, "maxAmount": 300000, "fee": 6000},
    {"minAmount": 300001, "maxAmount": 500000, "fee": 9000}
  ],
  "requiresGuarantor": false,
  "requiresCollateral": false,
  "active": true
}
```

**Verify**:
- Product created successfully
- Registration tiers saved as JSON
- Penalty rate saved correctly

### 4. Update Loan Product
```http
PUT http://localhost:8080/api/loan-products/{id}
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  ... (same structure as POST)
  "penaltyRate": 0.025,
  "registrationFeeTiers": [
    {"minAmount": 100000, "maxAmount": 300000, "fee": 5000}
  ]
}
```

**Verify**:
- Tiers updated correctly
- Penalty rate updated

## Calculation Testing

### Registration Fee Calculation
Test the `calculateRegistrationFee(double principal)` method:

**Test Cases**:
- Principal: 150,000 → Expected: 5,000 UGX
- Principal: 350,000 → Expected: 10,000 UGX
- Principal: 750,000 → Expected: 15,000 UGX
- Principal: 50,000 (below min) → Expected: 0 UGX
- Principal: 2,000,000 (above max) → Expected: 0 UGX

### Penalty Fee Calculation
Test the `calculatePenaltyFee(double reducingBalance, int daysOverdue)` method:

**Test Cases** (with 0.02% penalty rate):
- Balance: 100,000, Days: 10 → Expected: 200 UGX
- Balance: 500,000, Days: 20 → Expected: 2,000 UGX
- Balance: 100,000, Days: 0 → Expected: 0 UGX
- Balance: 0, Days: 10 → Expected: 0 UGX

**Formula**: `reducingBalance × (penaltyRate / 100) × daysOverdue`

Example: 100,000 × (0.02 / 100) × 10 = 100,000 × 0.0002 × 10 = 200

## Frontend Testing

### 1. View Loan Products List
**URL**: http://localhost:3000/loans/products

**Verify**:
- Table shows "Penalty Rate" column
- Penalty rate displays as "0.02% /day" for seeded products
- Processing fee shows as "4%"

### 2. View Loan Product Details
**URL**: http://localhost:3000/loans/products/view/{id}

**Verify**:
- "Registration Fee Tiers" section appears (if tiers exist)
- Tiers table shows min/max amounts and fees
- Example calculation shows correct fee for 150,000 UGX
- Penalty rate displays as "0.02% per day"

### 3. Add New Loan Product
**URL**: http://localhost:3000/loans/products/add

**Step 4 (Fees & Penalties)**:
1. Add registration fee tiers using "Add Tier" button
2. Fill in min amount, max amount, and fee
3. Remove tiers using trash icon
4. Enter penalty rate (e.g., 0.02)
5. Complete other steps and submit

**Verify**:
- Tier rows add/remove correctly
- Validation prevents min > max
- Form submits successfully
- Product appears in list with new data

### 4. Edit Loan Product
**URL**: http://localhost:3000/loans/products/edit/{id}

**Verify**:
- Existing tiers load correctly
- Existing penalty rate populates
- Can modify tiers and penalty rate
- Updates save successfully

## Manual Database Verification

```sql
-- Check structure
DESCRIBE loan_products;

-- View all seeded products
SELECT id, product_code, product_name, penalty_rate, 
       JSON_PRETTY(registration_fee_tiers) as tiers
FROM loan_products 
WHERE product_code LIKE 'LP-%';

-- Test registration fee query
SELECT product_name,
       JSON_EXTRACT(registration_fee_tiers, '$[0].fee') as tier1_fee,
       JSON_EXTRACT(registration_fee_tiers, '$[1].fee') as tier2_fee,
       JSON_EXTRACT(registration_fee_tiers, '$[2].fee') as tier3_fee
FROM loan_products 
WHERE product_code = 'LP-SALARY-001';
```

## Known Issues / Notes

1. **Backward Compatibility**: Existing loan products without tiers will have NULL values - this is expected and handled
2. **Tier Validation**: Frontend validates tier ranges, but backend should also validate on save
3. **Grace Period**: Uses existing `defaultGracePeriodDays` field for penalty grace period
4. **Processing Fee**: Already supported percentage type, just seeded with 4%

## Success Criteria

✅ Backend compiles without errors
✅ Database migration runs successfully
✅ Seed data creates 3 loan products
✅ API returns tiers as JSON array
✅ Frontend displays tiers in table format
✅ Can add/edit loan products with tiers
✅ Calculation methods work correctly
✅ Penalty rate displays throughout UI

## Next Steps (Optional Enhancements)

1. Add tier overlap validation in backend service
2. Add penalty calculation preview in loan creation
3. Auto-calculate registration fee when principal is entered
4. Add bulk tier import (CSV/Excel)
5. Add tier templates for quick setup
6. Show fee breakdown in loan details
