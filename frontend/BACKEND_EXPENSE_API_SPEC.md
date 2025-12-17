# Backend API Specification - Expense User Attribution

## 📋 Overview
This document specifies how user names should be included in expense API responses for proper attribution in the frontend.

---

## 🎯 User Name Attribution Requirements

The frontend now displays **actual user names** (not just the logged-in user) for:
1. **Requested By** - Who created the expense
2. **Approved By** - Who approved the expense  
3. **Rejected By** - Who rejected the expense
4. **Paid By** - Who marked the expense as paid

---

## 📤 API Response Format

### **GET /api/expenses** (All Expenses)

**Response should include:**
```json
[
  {
    "id": 1,
    "expenseName": "Office Supplies",
    "description": "Pens, paper, staplers",
    "amount": 50000,
    "categoryName": "Office Supplies",
    "expenseDate": "2025-11-01T00:00:00Z",
    "createdAt": "2025-11-01T10:30:00Z",
    
    // USER ATTRIBUTION FIELDS (REQUIRED)
    "requestedBy": "John Doe",          // Full name of user who created expense
    "createdBy": "John Doe",            // Fallback field (same as requestedBy)
    "createdByUserId": 123,             // Optional: User ID for reference
    
    // APPROVAL FIELDS
    "approvalStatus": "APPROVED",       // PENDING, APPROVED, REJECTED
    "approvedBy": "Jane Smith",         // Full name of approver (only if approved/rejected)
    "approvedByUserId": 456,            // Optional: Approver's user ID
    "approvedAt": "2025-11-02T14:20:00Z", // Only if approved/rejected
    "approvalComment": "Approved for Q4 budget", // Optional comment
    
    // PAYMENT FIELDS  
    "paymentStatus": "PAID",            // UNPAID, PAID
    "paidBy": "Mike Johnson",           // Full name of payer (only if paid)
    "paidByUserId": 789,                // Optional: Payer's user ID
    "paidAt": "2025-11-03T16:45:00Z"    // Only if paid
  }
]
```

---

## 🔍 Detailed Field Specifications

### **1. requestedBy** (Required)
- **Type:** String
- **Description:** Full name of the user who created/requested the expense
- **Format:** "FirstName LastName" (e.g., "John Doe")
- **Source:** Get from JWT token when expense is created
- **Fallback:** If not available, use `createdBy` field

**Example Implementation (Spring Boot):**
```java
@PrePersist
public void onCreate() {
    // Get user info from JWT token/SecurityContext
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    User currentUser = userRepository.findByUsername(auth.getName());
    
    this.requestedBy = currentUser.getFirstName() + " " + currentUser.getLastName();
    this.createdBy = this.requestedBy; // Fallback
    this.createdByUserId = currentUser.getId();
    this.createdAt = LocalDateTime.now();
}
```

---

### **2. approvedBy** (Conditional - Only if APPROVED or REJECTED)
- **Type:** String (nullable)
- **Description:** Full name of the user who approved or rejected the expense
- **Format:** "FirstName LastName"
- **Source:** Get from JWT token when approve/reject action is performed
- **Null when:** Status is PENDING

**Example Implementation:**
```java
public void approveExpense(Long expenseId, String approverUsername) {
    OperationalExpense expense = expenseRepository.findById(expenseId)
        .orElseThrow(() -> new RuntimeException("Expense not found"));
    
    User approver = userRepository.findByUsername(approverUsername);
    
    expense.setApprovalStatus("APPROVED");
    expense.setApprovedBy(approver.getFirstName() + " " + approver.getLastName());
    expense.setApprovedByUserId(approver.getId());
    expense.setApprovedAt(LocalDateTime.now());
    
    expenseRepository.save(expense);
}
```

---

### **3. paidBy** (Conditional - Only if PAID)
- **Type:** String (nullable)
- **Description:** Full name of the user who marked the expense as paid
- **Format:** "FirstName LastName"
- **Source:** Get from JWT token when payment action is performed
- **Null when:** Status is UNPAID

**Example Implementation:**
```java
public void markAsPaid(Long expenseId, String payerUsername) {
    OperationalExpense expense = expenseRepository.findById(expenseId)
        .orElseThrow(() -> new RuntimeException("Expense not found"));
    
    User payer = userRepository.findByUsername(payerUsername);
    
    expense.setPaymentStatus("PAID");
    expense.setPaidBy(payer.getFirstName() + " " + payer.getLastName());
    expense.setPaidByUserId(payer.getId());
    expense.setPaidAt(LocalDateTime.now());
    
    expenseRepository.save(expense);
}
```

---

## 📊 Database Schema Updates

### **operational_expenses Table**

Add these columns if not already present:

```sql
ALTER TABLE operational_expenses 
ADD COLUMN requested_by VARCHAR(255),
ADD COLUMN created_by_user_id BIGINT,
ADD COLUMN approved_by_user_id BIGINT,
ADD COLUMN paid_by_user_id BIGINT;

-- Update existing data to populate requested_by from created_by
UPDATE operational_expenses 
SET requested_by = created_by 
WHERE requested_by IS NULL;
```

### **users Table**

Ensure these columns exist:

```sql
ALTER TABLE users
ADD COLUMN first_name VARCHAR(100),
ADD COLUMN last_name VARCHAR(100);

-- If you only have a single 'name' field, split it
UPDATE users 
SET 
  first_name = SUBSTRING_INDEX(name, ' ', 1),
  last_name = SUBSTRING_INDEX(name, ' ', -1)
WHERE first_name IS NULL;
```

---

## 🔄 Getting User Info from JWT Token

### **Extract User from SecurityContext (Spring Boot)**

```java
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public String getCurrentUserFullName() {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    
    if (auth != null && auth.isAuthenticated()) {
        String username = auth.getName();
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        return user.getFirstName() + " " + user.getLastName();
    }
    
    return "System";
}
```

### **Create Utility Service**

```java
@Service
public class UserAttributionService {
    
    @Autowired
    private UserRepository userRepository;
    
    public String getCurrentUserFullName() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            String username = auth.getName();
            return getUserFullName(username);
        }
        return "System";
    }
    
    public String getUserFullName(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found: " + username));
        
        String fullName = (user.getFirstName() + " " + user.getLastName()).trim();
        return fullName.isEmpty() ? username : fullName;
    }
    
    public Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            String username = auth.getName();
            User user = userRepository.findByUsername(username).orElse(null);
            return user != null ? user.getId() : null;
        }
        return null;
    }
}
```

---

## 🎯 Frontend Display Logic

The frontend displays user names with this fallback logic:

```javascript
// Requested By
expense.requestedBy || expense.createdBy || '-'

// Approved By  
expense.approvedBy || '-'

// Paid By
expense.paidBy || '-'
```

**This means:**
1. If `requestedBy` exists → show it
2. If not, try `createdBy` → show it
3. If neither exists → show '-'

---

## ✅ Testing Checklist

### **1. Create Expense**
- [ ] `requestedBy` field populated with creator's full name
- [ ] Format is "FirstName LastName" (e.g., "John Doe")
- [ ] `createdByUserId` matches the creator's user ID

### **2. Approve Expense**
- [ ] `approvedBy` field populated with approver's full name
- [ ] `approvedByUserId` matches the approver's user ID
- [ ] `approvedAt` timestamp set correctly

### **3. Reject Expense**
- [ ] `approvedBy` field populated with rejecter's full name
- [ ] `approvalComment` contains rejection reason
- [ ] `approvedAt` timestamp set correctly

### **4. Mark as Paid**
- [ ] `paidBy` field populated with payer's full name
- [ ] `paidByUserId` matches the payer's user ID
- [ ] `paidAt` timestamp set correctly

### **5. API Responses**
- [ ] GET /api/expenses returns all user attribution fields
- [ ] GET /api/expenses/pending shows `requestedBy` correctly
- [ ] GET /api/expenses/rejected shows `approvedBy` correctly
- [ ] GET /api/expenses/approved-unpaid shows both `requestedBy` and `approvedBy`

---

## 🔍 Example API Responses

### **Pending Expense**
```json
{
  "id": 1,
  "expenseName": "Office Supplies",
  "amount": 50000,
  "requestedBy": "John Doe",
  "createdBy": "John Doe",
  "createdByUserId": 123,
  "createdAt": "2025-11-01T10:30:00Z",
  "approvalStatus": "PENDING",
  "approvedBy": null,
  "approvedAt": null,
  "paymentStatus": "UNPAID",
  "paidBy": null,
  "paidAt": null
}
```

### **Approved Expense**
```json
{
  "id": 2,
  "expenseName": "Travel Allowance",
  "amount": 200000,
  "requestedBy": "John Doe",
  "createdByUserId": 123,
  "createdAt": "2025-11-01T10:30:00Z",
  "approvalStatus": "APPROVED",
  "approvedBy": "Jane Smith",
  "approvedByUserId": 456,
  "approvedAt": "2025-11-02T14:20:00Z",
  "approvalComment": "Approved for Q4 budget",
  "paymentStatus": "UNPAID",
  "paidBy": null,
  "paidAt": null
}
```

### **Rejected Expense**
```json
{
  "id": 3,
  "expenseName": "Unnecessary Equipment",
  "amount": 500000,
  "requestedBy": "Mike Johnson",
  "createdByUserId": 789,
  "createdAt": "2025-11-01T10:30:00Z",
  "approvalStatus": "REJECTED",
  "approvedBy": "Jane Smith",
  "approvedByUserId": 456,
  "approvedAt": "2025-11-02T15:00:00Z",
  "approvalComment": "Not in this quarter's budget",
  "paymentStatus": "UNPAID",
  "paidBy": null,
  "paidAt": null
}
```

### **Paid Expense**
```json
{
  "id": 4,
  "expenseName": "Monthly Rent",
  "amount": 1000000,
  "requestedBy": "Sarah Williams",
  "createdByUserId": 321,
  "createdAt": "2025-11-01T10:30:00Z",
  "approvalStatus": "APPROVED",
  "approvedBy": "Jane Smith",
  "approvedByUserId": 456,
  "approvedAt": "2025-11-02T14:20:00Z",
  "paymentStatus": "PAID",
  "paidBy": "Mike Johnson",
  "paidByUserId": 789,
  "paidAt": "2025-11-03T16:45:00Z"
}
```

---

## 🚨 Important Notes

1. **Always use full names** (FirstName + LastName), not usernames
2. **Get user info from JWT token** in the security context, not from request body
3. **Don't trust client-provided user info** - always get from authenticated session
4. **Handle null cases** - some expenses created before this feature won't have user names
5. **Use transactions** - ensure user attribution is saved atomically with the action

---

## 📞 Questions?

If you have questions about the user attribution implementation, check:
1. The frontend code in: `src/pages/Expenses/` (AllExpenses.jsx, PendingApprovals.jsx, etc.)
2. The authentication guide: `AUTHENTICATION_GUIDE.md`
3. This specification: `BACKEND_EXPENSE_API_SPEC.md`

---

**Last Updated:** November 5, 2025  
**Version:** 1.0.0
