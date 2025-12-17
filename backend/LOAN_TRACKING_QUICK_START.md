# Loan Tracking System - Quick Start Guide

## ✅ What's Been Implemented

### Database
- ✅ `loan_tracking` table created (60 fields)
- ✅ Database trigger `after_loan_insert_tracking` created
- ✅ All indexes and foreign keys set up

### Java Components
- ✅ `LoanTracking` entity
- ✅ `LoanTrackingRepository` repository
- ✅ `LoanTrackingService` service
- ✅ `LoanCreatedEvent` event class
- ✅ `PaymentMadeEvent` event class
- ✅ `LoanTrackingEventListener` listener
- ✅ Updated `LoanDetailsService` to publish events
- ✅ Updated `LoanPaymentsService` to publish events

---

## 🚀 How to Use

### No Changes Needed to Your Current Code!

The tracking system works **automatically** in the background. Just use your existing APIs:

#### Create a Loan (as usual)
```java
POST /api/loans
{
  "clientId": 1,
  "productId": 1,
  "principalAmount": 500000,
  "loanDuration": 6,
  "repaymentFrequency": "monthly"
}
```

**What happens behind the scenes:**
1. Loan saved to `loan_details`
2. Trigger creates `loan_tracking` record
3. Event published → Listener initializes metrics

#### Record a Payment (as usual)
```java
POST /api/loan-payments
{
  "loanId": 1,
  "paymentDate": "2024-10-22",
  "amountPaid": 100000,
  "paymentMethod": "Cash"
}
```

**What happens behind the scenes:**
1. Payment saved to `loan_payments`
2. Event published → Listener updates tracking
3. All metrics recalculated automatically

---

## 📊 Accessing Tracking Data

### In Your Services

Inject the `LoanTrackingService`:

```java
@Autowired
private LoanTrackingService loanTrackingService;

// Get tracking for a loan
Optional<LoanTracking> tracking = loanTrackingService.getTrackingByLoanId(loanId);

// Get late loans
List<LoanTracking> lateLoans = loanTrackingService.getLateLoans();

// Get high-risk loans
List<LoanTracking> highRisk = loanTrackingService.getHighRiskLoans(50.0);

// Get portfolio metrics
Double totalOutstanding = loanTrackingService.getTotalOutstandingBalance();
Double portfolioAtRisk = loanTrackingService.getPortfolioAtRisk(30);
```

### In Your Database Queries

```sql
-- Get tracking for a specific loan
SELECT * FROM loan_tracking WHERE loan_id = 1;

-- Get all late loans
SELECT * FROM loan_tracking WHERE is_late = TRUE;

-- Get loans by risk score
SELECT * FROM loan_tracking 
WHERE default_risk_score > 50 
ORDER BY default_risk_score DESC;

-- Get portfolio summary
SELECT 
    COUNT(*) as total_loans,
    SUM(outstanding_balance) as total_outstanding,
    AVG(completion_percentage) as avg_completion,
    AVG(payment_behavior_score) as avg_behavior_score
FROM loan_tracking 
WHERE loan_status = 'ACTIVE';
```

---

## 🎯 Key Metrics Available

### For Each Loan
- **Outstanding Balance** - Total remaining to be paid
- **Completion Percentage** - How much has been paid (0-100%)
- **Days Late** - How many days past due
- **Payment Behavior Score** - 0-100 (100 = perfect)
- **Default Risk Score** - 0-100 (0 = no risk)
- **Payment Status** - ON_TIME, LATE, GRACE_PERIOD, DEFAULTED
- **Payment Pattern** - CONSISTENT, IRREGULAR, DETERIORATING

### Portfolio-Wide
- **Total Outstanding Balance**
- **Portfolio at Risk (PAR)** - Balance of loans late by X days
- **Average Completion Percentage**
- **Average Behavior Score**

---

## 🔄 Testing the System

### 1. Create a Test Loan
```bash
curl -X POST http://localhost:8081/api/loans \
-H "Content-Type: application/json" \
-d '{
  "clientId": 1,
  "productId": 1,
  "principalAmount": 100000,
  "loanDuration": 6,
  "repaymentFrequency": "monthly"
}'
```

### 2. Check Tracking Was Created
```sql
SELECT * FROM loan_tracking WHERE loan_id = (SELECT MAX(id) FROM loan_details);
```

You should see:
- ✅ Outstanding balance = Total payable
- ✅ Cumulative payments = 0
- ✅ Status = ACTIVE
- ✅ Is late = FALSE

### 3. Make a Payment
```bash
curl -X POST http://localhost:8081/api/loan-payments \
-H "Content-Type: application/json" \
-d '{
  "loanId": 1,
  "paymentDate": "2024-10-22",
  "amountPaid": 20000,
  "paymentMethod": "Cash"
}'
```

### 4. Check Tracking Was Updated
```sql
SELECT 
    outstanding_balance,
    cumulative_payment,
    completion_percentage,
    installments_paid,
    payment_behavior_score
FROM loan_tracking 
WHERE loan_id = 1;
```

You should see:
- ✅ Cumulative payment increased
- ✅ Outstanding balance decreased
- ✅ Completion percentage updated
- ✅ Installments paid = 1
- ✅ Behavior score calculated

---

## 🛠️ Common Tasks

### Initialize Tracking for Existing Loans

If you have loans created before implementing the system:

```java
// Get all loans without tracking
List<LoanDetails> allLoans = loanDetailsRepository.findAll();
for (LoanDetails loan : allLoans) {
    if (!trackingRepository.existsByLoanId(loan.getId())) {
        loanTrackingService.initializeTracking(loan);
    }
}
```

### Recalculate All Metrics

If you need to refresh calculations:

```java
int updated = loanTrackingService.recalculateAllMetrics();
System.out.println("Updated " + updated + " loan tracking records");
```

### Generate Risk Report

```sql
SELECT 
    lt.loan_number,
    lt.client_id,
    lt.outstanding_balance,
    lt.days_late,
    lt.default_risk_score,
    lt.payment_behavior_score,
    lt.payment_pattern
FROM loan_tracking lt
WHERE lt.is_late = TRUE
ORDER BY lt.default_risk_score DESC
LIMIT 20;
```

---

## 📈 What Gets Tracked Automatically

### On Loan Creation
✅ Original principal, interest, fees  
✅ Total due amount  
✅ Payment schedule  
✅ Expected payment amounts  
✅ Due dates  

### On Each Payment
✅ Cumulative payment totals  
✅ Outstanding balances  
✅ Days late (if applicable)  
✅ Payment timeliness (early/on-time/late)  
✅ Payment completeness (partial/full/over)  
✅ Payment behavior score  
✅ Default risk score  
✅ Financial metrics  
✅ Payment pattern  
✅ Loan status  

---

## 🎓 Understanding the Scores

### Payment Behavior Score (Higher = Better)
- **90-100**: Excellent - Always pays on time
- **70-89**: Good - Mostly on time
- **50-69**: Fair - Some late payments
- **Below 50**: Poor - Frequent late/missed payments

### Default Risk Score (Lower = Better)
- **0-20**: Low risk - Reliable borrower
- **21-50**: Medium risk - Some concerns
- **51-75**: High risk - Significant concerns
- **Above 75**: Very high risk - Likely to default

---

## 📝 Files Created

```
backend/
├── src/main/java/org/example/
│   ├── Entities/
│   │   └── LoanTracking.java
│   ├── Repositories/
│   │   └── LoanTrackingRepository.java
│   ├── Services/
│   │   ├── LoanTrackingService.java
│   │   ├── LoanDetailsService.java (updated)
│   │   └── LoanPaymentsService.java (updated)
│   └── Events/
│       ├── LoanCreatedEvent.java
│       ├── PaymentMadeEvent.java
│       └── LoanTrackingEventListener.java
├── sql/
│   └── create_loan_tracking.sql
├── LOAN_TRACKING_SYSTEM.md (full documentation)
└── LOAN_TRACKING_QUICK_START.md (this file)
```

---

## ✨ That's It!

Your loan tracking system is **fully operational**. Just create loans and record payments as usual - everything else happens automatically in the background!

For detailed information, see `LOAN_TRACKING_SYSTEM.md`.
