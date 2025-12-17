# User Attribution Implementation - Complete Guide

## ✅ **What Was Implemented**

The backend now automatically extracts the **currently logged-in user's full name** from the JWT token and populates all expense user attribution fields.

---

## 🎯 **Fields Now Populated Automatically**

| Field | When Set | Example Value |
|-------|----------|---------------|
| **requestedBy** | When expense is **created** | "John Doe" |
| **createdBy** | When expense is **created** | "John Doe" |
| **approvedBy** | When expense is **approved** | "Jane Smith" |
| **approvedBy** | When expense is **rejected** | "Mike Johnson" |
| **paidBy** | When expense is **marked as paid** | "Sarah Williams" |

---

## 📁 **Files Created/Modified**

### **1. New Service Created** ✨

**`UserAttributionService.java`**
- **Location:** `/backend/src/main/java/org/example/Services/UserAttributionService.java`
- **Purpose:** Extract user information from JWT token

**Methods:**
```java
// Get full name of logged-in user
String getCurrentUserFullName()  // Returns: "John Doe"

// Get user ID of logged-in user
Long getCurrentUserId()          // Returns: 123

// Get username of logged-in user
String getCurrentUsername()       // Returns: "john.doe"

// Check if user is authenticated
boolean isUserAuthenticated()     // Returns: true/false
```

### **2. Modified Files** 🔧

#### **`OperationalExpenses.java`**
- Removed hardcoded `requestedBy = createdBy` logic from `@PrePersist`
- Now relies on service layer to set `requestedBy` from JWT token

#### **`OperationalExpensesService.java`**
- **Injected** `UserAttributionService`
- **createExpense()** - Sets `requestedBy` and `createdBy` from JWT token
- **approveExpense()** - Sets `approvedBy` from JWT token
- **rejectExpense()** - Sets `approvedBy` from JWT token (rejectedBy)
- **markExpenseAsPaid()** - Sets `paidBy` from JWT token

---

## 🔍 **How It Works**

### **1. Create Expense**
```
User clicks "Create Expense" → 
Frontend sends JWT token in Authorization header →
Backend extracts JWT token →
SecurityContextHolder gets authenticated user →
UserAttributionService looks up User entity →
Gets firstName + lastName from Person entity →
Sets requestedBy = "John Doe" →
Saves expense
```

### **2. Approve Expense**
```
User clicks "Approve" →
Frontend sends JWT token →
Backend gets logged-in user →
UserAttributionService gets full name →
Sets approvedBy = "Jane Smith" →
Saves expense
```

### **3. Reject Expense**
```
User clicks "Reject" →
Frontend sends JWT token →
Backend gets logged-in user →
UserAttributionService gets full name →
Sets approvedBy = "Mike Johnson" (same field) →
Saves expense
```

### **4. Mark as Paid**
```
User clicks "Mark as Paid" →
Frontend sends JWT token →
Backend gets logged-in user →
UserAttributionService gets full name →
Sets paidBy = "Sarah Williams" →
Saves expense
```

---

## 🏗️ **Technical Flow**

### **JWT Token → User Extraction**

```java
// 1. Get Authentication from SecurityContext
Authentication auth = SecurityContextHolder.getContext().getAuthentication();

// 2. Extract username from JWT token
String username = auth.getName();

// 3. Look up User entity in database
User user = userRepository.findByUsername(username).orElse(null);

// 4. Get full name from User's Person entity
String fullName = user.getFullName(); // Uses Person.firstName + Person.lastName

// 5. Return full name
return fullName; // "John Doe"
```

### **Person Entity Structure**
```java
User {
  id: 123,
  username: "john.doe",
  email: "john.doe@example.com",
  person: Person {
    firstName: "John",
    givenName: "",
    lastName: "Doe"
  }
}

// User.getFullName() returns: "John Doe"
```

---

## 🧪 **Testing**

### **1. Create Expense Test**

**Steps:**
1. Login as User A (e.g., "John Doe")
2. Create an expense
3. Check database: `requested_by` should be "John Doe"

**SQL Query:**
```sql
SELECT id, expense_name, requested_by, created_by 
FROM operational_expenses 
ORDER BY created_at DESC 
LIMIT 1;
```

**Expected Result:**
```
id  | expense_name      | requested_by | created_by
1   | Office Supplies   | John Doe     | John Doe
```

### **2. Approve Expense Test**

**Steps:**
1. Login as User B (e.g., "Jane Smith")
2. Approve a pending expense
3. Check database: `approved_by` should be "Jane Smith"

**SQL Query:**
```sql
SELECT id, expense_name, requested_by, approved_by, approval_status 
FROM operational_expenses 
WHERE approval_status = 'APPROVED' 
ORDER BY approved_at DESC 
LIMIT 1;
```

**Expected Result:**
```
id  | expense_name      | requested_by | approved_by  | approval_status
1   | Office Supplies   | John Doe     | Jane Smith   | APPROVED
```

### **3. Reject Expense Test**

**Steps:**
1. Login as User C (e.g., "Mike Johnson")
2. Reject a pending expense
3. Check database: `approved_by` should be "Mike Johnson"

**SQL Query:**
```sql
SELECT id, expense_name, requested_by, approved_by, approval_status 
FROM operational_expenses 
WHERE approval_status = 'REJECTED' 
ORDER BY approved_at DESC 
LIMIT 1;
```

**Expected Result:**
```
id  | expense_name         | requested_by | approved_by    | approval_status
2   | Unnecessary Expense  | John Doe     | Mike Johnson   | REJECTED
```

### **4. Mark as Paid Test**

**Steps:**
1. Login as User D (e.g., "Sarah Williams")
2. Mark an approved expense as paid
3. Check database: `paid_by` should be "Sarah Williams"

**SQL Query:**
```sql
SELECT id, expense_name, requested_by, approved_by, paid_by, payment_status 
FROM operational_expenses 
WHERE payment_status = 'PAID' 
ORDER BY paid_at DESC 
LIMIT 1;
```

**Expected Result:**
```
id  | expense_name      | requested_by | approved_by  | paid_by          | payment_status
1   | Office Supplies   | John Doe     | Jane Smith   | Sarah Williams   | PAID
```

---

## 🚨 **Troubleshooting**

### **Issue 1: Shows "System" instead of user name**

**Possible Causes:**
1. JWT token not being sent in request
2. JWT token expired or invalid
3. User not found in database
4. Person entity not linked to User

**Solutions:**
- Check that JWT token is in `Authorization: Bearer <token>` header
- Verify token is valid and not expired
- Ensure User exists in database with correct username
- Verify Person entity is linked to User (`person_id` not null)

### **Issue 2: Shows username instead of full name**

**Possible Causes:**
1. Person entity missing `firstName` or `lastName`
2. Person entity not linked to User

**Solutions:**
- Check database: `SELECT u.username, p.first_name, p.last_name FROM users u LEFT JOIN person p ON u.person_id = p.id;`
- Populate missing names in Person table
- Link User to Person if `person_id` is null

### **Issue 3: Shows "Unknown" as name**

**Cause:** Person entity linked but firstName and lastName are null/empty

**Solution:**
```sql
-- Update Person records with missing names
UPDATE person 
SET first_name = 'Default', 
    last_name = 'User' 
WHERE (first_name IS NULL OR first_name = '') 
   AND (last_name IS NULL OR last_name = '');
```

---

## 📊 **Database Schema**

### **operational_expenses Table**

```sql
CREATE TABLE operational_expenses (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  expense_name VARCHAR(255) NOT NULL,
  description VARCHAR(1000) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  
  -- User Attribution Fields
  requested_by VARCHAR(255),      -- Full name: "John Doe"
  created_by VARCHAR(255),         -- Full name: "John Doe"
  approved_by VARCHAR(255),        -- Full name: "Jane Smith" (approver or rejector)
  paid_by VARCHAR(255),            -- Full name: "Sarah Williams"
  
  -- Timestamps
  created_at DATETIME,
  approved_at DATETIME,
  paid_at DATETIME,
  
  -- Status Fields
  approval_status VARCHAR(50),     -- PENDING, APPROVED, REJECTED
  payment_status VARCHAR(50),      -- UNPAID, PAID
  
  -- Other fields...
);
```

### **users Table**

```sql
CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  person_id BIGINT,                -- Links to person table
  role VARCHAR(50),
  branch VARCHAR(100),
  created_at DATETIME,
  
  FOREIGN KEY (person_id) REFERENCES person(id)
);
```

### **person Table**

```sql
CREATE TABLE person (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  first_name VARCHAR(100),         -- "John"
  given_name VARCHAR(100),         -- Middle name (optional)
  last_name VARCHAR(100),          -- "Doe"
  national_id VARCHAR(50),
  phone_number VARCHAR(20),
  email VARCHAR(255),
  date_of_birth DATE,
  gender VARCHAR(10),
  -- Other fields...
);
```

---

## ✅ **Verification Checklist**

- [ ] **UserAttributionService.java** created in `/Services/` directory
- [ ] **OperationalExpensesService.java** updated with `@Autowired UserAttributionService`
- [ ] **createExpense()** method sets `requestedBy` from JWT token
- [ ] **approveExpense()** method sets `approvedBy` from JWT token
- [ ] **rejectExpense()** method sets `approvedBy` from JWT token
- [ ] **markExpenseAsPaid()** method sets `paidBy` from JWT token
- [ ] **OperationalExpenses.java** `@PrePersist` no longer hardcodes `requestedBy`
- [ ] Backend compiles without errors
- [ ] Test: Create expense shows correct user name
- [ ] Test: Approve expense shows correct approver name
- [ ] Test: Reject expense shows correct rejector name
- [ ] Test: Mark as paid shows correct payer name
- [ ] Frontend displays full names (not "system")

---

## 🎉 **Benefits**

1. ✅ **Automatic Attribution** - No manual user input needed
2. ✅ **Security** - User info extracted from JWT token (cannot be faked)
3. ✅ **Full Names** - Shows "John Doe" instead of "john.doe"
4. ✅ **Audit Trail** - Complete tracking of who did what
5. ✅ **Centralized Logic** - One service handles all user extraction
6. ✅ **Consistent** - Same logic for all expense operations
7. ✅ **Maintainable** - Easy to update if User structure changes

---

## 📞 **Support**

If you have questions:
1. Check this document: `USER_ATTRIBUTION_IMPLEMENTATION.md`
2. Check the API spec: `BACKEND_EXPENSE_API_SPEC.md`
3. Review the service code: `UserAttributionService.java`
4. Test with SQL queries above

---

**Last Updated:** November 5, 2025  
**Version:** 1.0.0  
**Status:** ✅ Complete and Ready for Testing
