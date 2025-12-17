# Loan Tracking System - Complete Documentation

## 🎯 Overview

The Loan Tracking System is a comprehensive solution for **automatically tracking loan state, payment history, and financial metrics**. It uses a **hybrid architecture** combining database triggers and application-layer event listeners to provide real-time loan monitoring and analytics.

---

## 🏗️ Architecture

### Hybrid Approach

The system uses **two complementary mechanisms**:

1. **Database Trigger** (MySQL)
   - Automatically initializes tracking when a loan is created
   - Ensures data integrity at the database level
   - Fast and reliable for basic initialization

2. **Application Event Listeners** (Spring)
   - Handles complex business logic for payment processing
   - Calculates financial metrics and risk scores
   - Determines payment characteristics and patterns
   - More flexible and testable than pure SQL triggers

---

## 📊 What Gets Tracked

### 1. **Original Loan Amounts**
- Principal amount
- Total interest
- Processing fees
- Total amount due

### 2. **Cumulative Payment Tracking**
- Total amount paid
- Principal paid
- Interest paid
- Fees paid
- Penalties assessed and paid

### 3. **Outstanding Balances**
- Total outstanding balance
- Outstanding principal
- Outstanding interest
- Outstanding fees
- Outstanding penalties

### 4. **Payment Schedule & Status**
- Expected payment amount per installment
- Payment frequency (daily/weekly/monthly)
- Total installments
- Installments paid/remaining
- Next payment due date
- Last payment date and amount

### 5. **Late Payment Tracking**
- Is loan currently late?
- Days late
- Months overdue
- Late payment count
- Missed payment count
- Grace period days
- Fine trigger date

### 6. **Payment Characteristics**
- Payment status (ON_TIME, LATE, DEFAULTED, GRACE_PERIOD)
- Payment pattern (CONSISTENT, IRREGULAR, DETERIORATING)
- Payment behavior score (0-100)
- Has made partial payments?
- Has made overpayments?
- Early payment count
- On-time payment count

### 7. **Financial Metrics**
- Payment-to-principal ratio
- Interest coverage ratio
- Default risk score (0-100, higher = more risk)
- Profitability index
- Recovery rate
- Expected vs actual profit
- Variance analysis

### 8. **Loan Status**
- Overall status (ACTIVE, COMPLETED, DEFAULTED)
- Completion percentage
- Is current (not late)?
- Is defaulted?
- Default date

---

## 🔄 How It Works

### When a Loan is Created

```
1. User creates loan via API → LoanDetailsService.createLoan()
2. Loan saved to database → loan_details table
3. DATABASE TRIGGER fires → Initializes loan_tracking record with:
   - Original amounts
   - Outstanding balances (= original amounts)
   - Payment schedule info
   - Zero cumulative payments
4. APPLICATION EVENT published → LoanCreatedEvent
5. Event Listener executes → LoanTrackingEventListener.handleLoanCreated()
6. Service initializes tracking → LoanTrackingService.initializeTracking()
   - Calculates initial metrics
   - Sets up payment schedule
```

### When a Payment is Made

```
1. User records payment via API → LoanPaymentsService.createPayment()
2. Payment saved to database → loan_payments table
3. APPLICATION EVENT published → PaymentMadeEvent
4. Event Listener executes → LoanTrackingEventListener.handlePaymentMade()
5. Service processes payment → LoanTrackingService.processPayment()
   - Updates cumulative payments
   - Recalculates outstanding balances
   - Determines if payment is late/on-time/early
   - Checks for partial/overpayments
   - Updates next payment due date
   - Calculates days late (if applicable)
   - Updates payment behavior score
   - Recalculates default risk score
   - Updates all financial metrics
   - Determines payment pattern
   - Updates loan status
6. Tracking record saved with all updated metrics
```

---

## 💾 Database Schema

### loan_tracking Table

Created with **60 fields** tracking every aspect of loan state:

```sql
CREATE TABLE loan_tracking (
    -- IDs and references
    id BIGINT PRIMARY KEY,
    loan_id BIGINT UNIQUE,
    loan_number VARCHAR(255),
    client_id BIGINT,
    
    -- 14 fields for amounts (original, cumulative, outstanding)
    -- 8 fields for payment schedule
    -- 7 fields for late payment tracking
    -- 8 fields for payment characteristics
    -- 8 fields for financial metrics
    -- 4 fields for dates
    -- 5 fields for loan status
    -- 3 fields for system tracking
);
```

### Database Trigger

```sql
CREATE TRIGGER after_loan_insert_tracking
AFTER INSERT ON loan_details
FOR EACH ROW
BEGIN
    -- Automatically insert initial tracking record
    -- with all loan details and zero payments
END;
```

---

## 🎨 Components Created

### 1. **Entity** (`LoanTracking.java`)
- JPA entity mapping to `loan_tracking` table
- 60+ fields with appropriate data types
- Lifecycle hooks (@PrePersist, @PreUpdate)
- Helper methods for calculations:
  - `calculateCompletionPercentage()`
  - `calculateOutstandingBalances()`
  - `calculateFinancialMetrics()`
  - `calculateDefaultRiskScore()`
  - `calculatePaymentBehaviorScore()`

### 2. **Repository** (`LoanTrackingRepository.java`)
- Spring Data JPA repository
- Custom queries for analytics:
  - Find late loans
  - Find defaulted loans
  - Find high-risk loans
  - Get portfolio at risk
  - Get average metrics

### 3. **Service** (`LoanTrackingService.java`)
- Core business logic for tracking
- Methods:
  - `initializeTracking()` - Set up tracking for new loan
  - `processPayment()` - Update tracking after payment
  - `determinePaymentCharacteristics()` - Classify payment type
  - `determineLateStatus()` - Check if loan is late
  - `updateNextPaymentDueDate()` - Calculate next due date
  - `calculateFinancialMetrics()` - Compute all metrics
  - `recalculateMetrics()` - Refresh calculations

### 4. **Events**
- `LoanCreatedEvent.java` - Published when loan is created
- `PaymentMadeEvent.java` - Published when payment is made
- `LoanTrackingEventListener.java` - Listens and triggers tracking updates

### 5. **Service Updates**
- `LoanDetailsService` - Now publishes `LoanCreatedEvent`
- `LoanPaymentsService` - Now publishes `PaymentMadeEvent`

---

## 📈 Key Calculations

### Payment Behavior Score (0-100)
```
Start with 100
- Deduct based on late payment ratio (up to -30)
+ Bonus for on-time payments (up to +10)
+ Bonus for early payments (up to +5)
- Deduct for missed payments (-10 each)
```

### Default Risk Score (0-100)
```
Start with 0
+ Days late × 0.5 (max 30 points)
+ Missed payments × 10 (max 30 points)
+ Late payment ratio × 20 (max 20 points)
+ (100 - behavior score) × 0.2 (max 20 points)
```

### Payment Classification
- **Early**: Payment date < due date
- **On-time**: Payment date = due date OR within grace period
- **Late**: Payment date > due date + grace period
- **Partial**: Amount < 95% of expected
- **Overpayment**: Amount > 105% of expected

---

## 🔍 Usage Examples

### Get Tracking for a Loan
```java
Optional<LoanTracking> tracking = loanTrackingService.getTrackingByLoanId(loanId);
if (tracking.isPresent()) {
    System.out.println("Outstanding Balance: " + tracking.get().getOutstandingBalance());
    System.out.println("Days Late: " + tracking.get().getDaysLate());
    System.out.println("Default Risk: " + tracking.get().getDefaultRiskScore());
}
```

### Get All Late Loans
```java
List<LoanTracking> lateLoans = loanTrackingService.getLateLoans();
```

### Get High-Risk Loans (Risk Score > 50)
```java
List<LoanTracking> highRisk = loanTrackingService.getHighRiskLoans(50.0);
```

### Get Portfolio Metrics
```java
Double totalOutstanding = loanTrackingService.getTotalOutstandingBalance();
Double portfolioAtRisk = loanTrackingService.getPortfolioAtRisk(30); // 30+ days late
```

### Recalculate Metrics
```java
// Recalculate for specific loan
loanTrackingService.recalculateMetrics(loanId);

// Recalculate for all loans
int updated = loanTrackingService.recalculateAllMetrics();
```

---

## 🚀 Automatic Features

### What Happens Automatically

✅ **On Loan Creation:**
- Tracking record created
- Original amounts stored
- Outstanding balances initialized
- Payment schedule calculated
- Initial metrics computed

✅ **On Every Payment:**
- Cumulative payments updated
- Outstanding balances recalculated
- Payment type determined (early/late/on-time)
- Late status checked and updated
- Days late calculated
- Next payment due date updated
- Payment behavior score recalculated
- Default risk score updated
- All financial metrics refreshed
- Payment pattern analyzed
- Loan status updated if completed/defaulted

---

## 📊 Reporting Capabilities

The tracking system enables powerful reporting:

### Portfolio Health
- Total outstanding balance
- Portfolio at risk (PAR) at different day thresholds
- Average completion percentage
- Average payment behavior score

### Risk Management
- List of high-risk loans
- List of late loans by days late
- Defaulted loans summary
- Payment pattern analysis

### Performance Metrics
- Actual vs expected profit
- Interest coverage ratio
- Recovery rates
- Profitability index by loan

### Client Analysis
- Payment behavior scores per client
- Consistent vs irregular payers
- Early payment tendencies
- Partial payment patterns

---

## 🔧 Maintenance

### Rebuilding Tracking for Existing Loans

If you have existing loans without tracking records:

```java
// Option 1: Recalculate all
loanTrackingService.recalculateAllMetrics();

// Option 2: Initialize for specific loan
LoanDetails loan = loanDetailsRepository.findById(loanId).get();
loanTrackingService.initializeTracking(loan);
```

### Database Maintenance

```sql
-- Check tracking coverage
SELECT COUNT(*) as loans_with_tracking 
FROM loan_tracking;

SELECT COUNT(*) as total_loans 
FROM loan_details;

-- Find loans without tracking
SELECT ld.id, ld.loan_number 
FROM loan_details ld
LEFT JOIN loan_tracking lt ON ld.id = lt.loan_id
WHERE lt.id IS NULL;
```

---

## 🎯 Benefits

### 1. **Real-Time Tracking**
- Instant updates on loan status
- Immediate visibility into payment patterns
- Up-to-date financial metrics

### 2. **Automated Calculations**
- No manual calculation needed
- Consistent formulas across all loans
- Reduced human error

### 3. **Risk Management**
- Early warning system for defaults
- Quantified risk scores
- Portfolio-wide risk visibility

### 4. **Better Decision Making**
- Data-driven loan approvals
- Client creditworthiness scoring
- Portfolio optimization

### 5. **Audit Trail**
- Complete payment history
- Pattern analysis over time
- Compliance reporting

---

## 📝 Summary

Your loan tracking system is now **fully operational** with:

✅ Comprehensive `loan_tracking` table with 60 fields  
✅ Database trigger for automatic initialization  
✅ Spring event system for payment processing  
✅ Complete financial metrics calculation  
✅ Payment characteristic determination  
✅ Risk scoring algorithms  
✅ Late payment detection  
✅ Portfolio analytics capabilities  

**Everything happens automatically** - just create loans and record payments as usual, and the system tracks everything in the background!
