# Loan System Setup and Testing Guide

## 🎯 Overview

Your backend now supports the complete AddLoan frontend flow with:

- ✅ **LoanProduct entity** for managing different loan products
- ✅ **Enhanced LoanDetails entity** with all 25+ frontend fields
- ✅ **Guarantor endpoint** to fetch guarantor info from existing clients
- ✅ **Product-based calculations** with flexible interest rates and fees
- ✅ **Complete API endpoints** for loan management

---

## 🗄️ Database Schema Changes Needed

### 1. Create `loan_products` table:
```sql
CREATE TABLE loan_products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    product_code VARCHAR(50) UNIQUE,
    description TEXT,
    default_interest_rate DOUBLE,
    interest_method VARCHAR(50),
    interest_type VARCHAR(50),
    rate_per VARCHAR(50),
    min_duration INT,
    max_duration INT,
    duration_unit VARCHAR(50),
    min_amount DOUBLE,
    max_amount DOUBLE,
    allowed_repayment_frequencies VARCHAR(255),
    default_repayment_frequency VARCHAR(50),
    processing_fee_type VARCHAR(50),
    processing_fee_value DOUBLE,
    late_fee DOUBLE,
    default_fee DOUBLE,
    default_grace_period_days INT,
    active BOOLEAN DEFAULT TRUE,
    requires_guarantor BOOLEAN DEFAULT FALSE,
    requires_collateral BOOLEAN DEFAULT FALSE,
    created_at DATETIME,
    updated_at DATETIME,
    created_by VARCHAR(255)
);
```

### 2. Update `loan_details` table:
```sql
ALTER TABLE loan_details 
ADD COLUMN product_id BIGINT,
ADD COLUMN loan_number VARCHAR(255) UNIQUE,
ADD COLUMN loan_title VARCHAR(255),
ADD COLUMN description TEXT,
ADD COLUMN principal_amount DOUBLE,
ADD COLUMN release_date DATE,
ADD COLUMN disbursed_by VARCHAR(100),
ADD COLUMN cash_bank_account VARCHAR(255),
ADD COLUMN interest_method VARCHAR(50),
ADD COLUMN interest_type VARCHAR(50),
ADD COLUMN fixed_interest_amount DOUBLE,
ADD COLUMN rate_per VARCHAR(50),
ADD COLUMN loan_duration INT,
ADD COLUMN duration_unit VARCHAR(50),
ADD COLUMN number_of_repayments INT,
ADD COLUMN grace_period_days INT,
ADD COLUMN first_repayment_date DATE,
ADD COLUMN first_repayment_amount DOUBLE,
ADD COLUMN processing_fee DOUBLE,
ADD COLUMN late_fee DOUBLE,
ADD COLUMN default_fee DOUBLE,
ADD COLUMN loan_status VARCHAR(50),
ADD COLUMN created_at DATETIME,
ADD COLUMN updated_at DATETIME,
ADD COLUMN created_by VARCHAR(255),
ADD FOREIGN KEY (product_id) REFERENCES loan_products(id);

-- Rename existing columns
ALTER TABLE loan_details 
CHANGE COLUMN amount_disbursed principal_amount DOUBLE,
CHANGE COLUMN loan_processing_fee processing_fee DOUBLE;
```

---

## 🔧 API Endpoints Available

### **Loan Products**
- `GET /api/loan-products` - Get all active loan products
- `GET /api/loan-products/{id}` - Get specific product
- `POST /api/loan-products` - Create new product
- `PUT /api/loan-products/{id}` - Update product
- `DELETE /api/loan-products/{id}` - Deactivate product

### **Loans**
- `POST /api/loans` - Create loan (enhanced with all fields)
- `GET /api/loans/{id}` - Get loan details
- `PUT /api/loans/{id}` - Update loan
- `GET /api/loans/branch/{branch}` - Get loans by branch

### **Client Guarantors**
- `GET /api/clients/{clientId}/guarantor` - Get guarantor info for client

---

## 📝 Sample Test Data

### 1. Create Sample Loan Products
```bash
# Personal Loan Product
POST /api/loan-products
{
  "productName": "Personal Loan",
  "productCode": "PL001",
  "description": "Standard personal loan for individuals",
  "defaultInterestRate": 18.0,
  "interestMethod": "flat",
  "interestType": "percentage",
  "ratePer": "month",
  "minDuration": 1,
  "maxDuration": 12,
  "durationUnit": "months",
  "minAmount": 50000,
  "maxAmount": 2000000,
  "allowedRepaymentFrequencies": "weekly,monthly",
  "defaultRepaymentFrequency": "monthly",
  "processingFeeType": "fixed",
  "processingFeeValue": 15000,
  "lateFee": 5000,
  "defaultFee": 10000,
  "defaultGracePeriodDays": 7,
  "requiresGuarantor": true,
  "requiresCollateral": false,
  "active": true
}

# Business Loan Product  
POST /api/loan-products
{
  "productName": "Business Loan",
  "productCode": "BL001", 
  "description": "Loan for business expansion and working capital",
  "defaultInterestRate": 15.0,
  "interestMethod": "reducing",
  "interestType": "percentage", 
  "ratePer": "month",
  "minDuration": 3,
  "maxDuration": 24,
  "durationUnit": "months",
  "minAmount": 100000,
  "maxAmount": 10000000,
  "allowedRepaymentFrequencies": "monthly",
  "defaultRepaymentFrequency": "monthly",
  "processingFeeType": "percentage",
  "processingFeeValue": 2.5,
  "lateFee": 10000,
  "defaultFee": 25000,
  "defaultGracePeriodDays": 14,
  "requiresGuarantor": true,
  "requiresCollateral": true,
  "active": true
}

# Emergency Loan Product
POST /api/loan-products
{
  "productName": "Emergency Loan",
  "productCode": "EL001",
  "description": "Quick loan for emergencies",
  "defaultInterestRate": 25.0,
  "interestMethod": "flat",
  "interestType": "percentage",
  "ratePer": "month", 
  "minDuration": 7,
  "maxDuration": 90,
  "durationUnit": "days",
  "minAmount": 20000,
  "maxAmount": 500000,
  "allowedRepaymentFrequencies": "daily,weekly",
  "defaultRepaymentFrequency": "weekly",
  "processingFeeType": "fixed",
  "processingFeeValue": 5000,
  "lateFee": 2000,
  "defaultFee": 5000,
  "defaultGracePeriodDays": 3,
  "requiresGuarantor": false,
  "requiresCollateral": false,
  "active": true
}
```

### 2. Test Loan Creation
```bash
POST /api/loans
{
  "clientId": 1,
  "productId": 1,
  "principalAmount": 500000,
  "releaseDate": "2024-10-15",
  "loanDuration": 6,
  "durationUnit": "months",
  "repaymentFrequency": "monthly",
  "agreementSigned": true,
  "description": "Personal loan for home improvement"
}
```

### 3. Test Guarantor Retrieval
```bash
GET /api/clients/1/guarantor
```

---

## 🧪 Frontend Testing

### 1. **Product Selection Step**
- Frontend calls `GET /api/loan-products` to populate dropdown
- User selects product, frontend gets product details and constraints

### 2. **Amount & Duration Validation**
- Frontend validates against product min/max amounts and durations
- Shows appropriate error messages if outside constraints

### 3. **Interest Rate Display**
- Frontend can show product default interest rate
- User can override if needed

### 4. **Guarantor Information**
- After client selection, frontend calls `GET /api/clients/{clientId}/guarantor`
- Displays guarantor info in loan review step

### 5. **Loan Creation**
- Frontend sends all fields to `POST /api/loans`
- Backend validates, calculates all amounts, and saves

---

## 🔄 Data Flow Summary

1. **Frontend loads** → Gets loan products from `/api/loan-products`
2. **User selects product** → Frontend validates constraints
3. **User enters loan details** → Frontend validates against product rules
4. **User selects/enters client** → Frontend fetches guarantor info
5. **User submits loan** → Backend validates, calculates, and saves
6. **Success** → Loan created with all calculations complete

---

## ✅ Key Improvements Made

1. **Complete Field Support** - All 25+ frontend fields now supported
2. **Product-Based Logic** - Interest rates, fees, and constraints based on products
3. **Flexible Calculations** - Supports flat/reducing interest, percentage/fixed amounts
4. **Proper Validations** - Amount, duration, and frequency validations
5. **Clean Data Flow** - Client ID properly handled, guarantor fetched separately
6. **Auto-calculations** - Processing fees, total payable, payment dates all calculated
7. **Extensible Design** - Easy to add new product types and loan features

Your frontend AddLoan flow will now work seamlessly with the backend! 🎉