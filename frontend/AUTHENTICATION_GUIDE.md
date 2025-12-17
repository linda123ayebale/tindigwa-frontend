# Authentication & User Information Guide

## 📚 Overview
This guide explains how user authentication and information is handled in the Tindigwa Loan Management System.

---

## 🔐 Authentication Flow

### 1. **Login Process**
When a user logs in via `/auth/login`, the backend should return:

```json
{
  "token": "JWT_TOKEN_HERE",
  "user": {
    "id": 123,
    "username": "john.doe",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "role": "manager",
    "branch": "Kampala",
    "phoneNumber": "+256700000000",
    "profilePicture": "https://example.com/avatar.jpg",
    "permissions": ["view_expenses", "approve_expenses", "manage_loans"],
    "status": "active"
  }
}
```

### 2. **Frontend Storage**
The frontend stores this information in `localStorage`:

- **`authToken`**: JWT token for API authentication
- **`tindigwa_token`**: Backup token key (backward compatibility)
- **`currentUser`**: Full user object (JSON string)
- **`username`**: Username for quick access

---

## 👤 User Information Fields

### **Essential Fields** (Required)

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `userId` | Number | Unique user ID from database | `123` |
| `username` | String | User's login username | `"john.doe"` |
| `firstName` | String | User's first name | `"John"` |
| `lastName` | String | User's last name | `"Doe"` |
| `email` | String | User's email address | `"john.doe@example.com"` |
| `role` | String | User's role in the system | `"admin"`, `"manager"`, `"staff"`, `"user"` |

### **Optional Fields** (Recommended)

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `branch` | String | User's branch/location | `"Kampala"`, `"Entebbe"`, `"Jinja"` |
| `phoneNumber` | String | User's contact number | `"+256700000000"` |
| `profilePicture` | String | Avatar URL | `"https://example.com/avatar.jpg"` |
| `permissions` | Array | User permissions | `["view_expenses", "approve_expenses"]` |
| `status` | String | Account status | `"active"`, `"suspended"`, `"inactive"` |
| `loginTime` | String | ISO timestamp of login | `"2025-11-05T08:30:00.000Z"` |

---

## 🔧 Using AuthService

### **Import AuthService**
```javascript
import AuthService from '../services/authService';
```

### **Available Methods**

#### **Get Current User Object**
```javascript
const user = AuthService.getCurrentUser();
console.log(user);
// Output: { userId: 123, username: "john.doe", firstName: "John", ... }
```

#### **Get User's Full Name**
```javascript
const fullName = AuthService.getUserFullName();
console.log(fullName);
// Output: "John Doe"
```

#### **Get User's First Name**
```javascript
const firstName = AuthService.getUserFirstName();
console.log(firstName);
// Output: "John"
```

#### **Get Username**
```javascript
const username = AuthService.getUsername();
console.log(username);
// Output: "john.doe"
```

#### **Get User's Role**
```javascript
const role = AuthService.getUserRole();
console.log(role);
// Output: "manager"
```

#### **Get User's Branch**
```javascript
const branch = AuthService.getUserBranch();
console.log(branch);
// Output: "Kampala"
```

#### **Check Permissions**
```javascript
const canApprove = AuthService.hasPermission('approve_expenses');
console.log(canApprove);
// Output: true or false
```

#### **Check Role**
```javascript
const isAdmin = AuthService.hasRole('admin');
console.log(isAdmin);
// Output: true or false
```

---

## 💡 Usage Examples

### **Example 1: Display User Name in Navbar**
```javascript
import AuthService from '../services/authService';

const Navbar = () => {
  const userFullName = AuthService.getUserFullName();
  const userRole = AuthService.getUserRole();
  
  return (
    <div className="navbar">
      <span>Welcome, {userFullName}</span>
      <span className="badge">{userRole}</span>
    </div>
  );
};
```

### **Example 2: Set "Requested By" in Expense Creation**
```javascript
import AuthService from '../services/authService';

const createExpense = async (expenseData) => {
  const currentUser = AuthService.getUserFullName();
  
  const payload = {
    ...expenseData,
    requestedBy: currentUser,
    requestedByUserId: AuthService.getCurrentUser()?.userId
  };
  
  await api.post('/expenses', payload);
};
```

### **Example 3: Role-Based Rendering**
```javascript
import AuthService from '../services/authService';

const ExpenseActions = ({ expense }) => {
  const userRole = AuthService.getUserRole();
  
  return (
    <div>
      <button>View</button>
      
      {/* Only managers and admins can approve */}
      {(userRole === 'manager' || userRole === 'admin') && (
        <button>Approve</button>
      )}
      
      {/* Only admins can delete */}
      {userRole === 'admin' && (
        <button>Delete</button>
      )}
    </div>
  );
};
```

### **Example 4: Permission-Based Features**
```javascript
import AuthService from '../services/authService';

const Dashboard = () => {
  const canViewReports = AuthService.hasPermission('view_reports');
  const canManageUsers = AuthService.hasPermission('manage_users');
  
  return (
    <div>
      {canViewReports && (
        <Link to="/reports">Reports</Link>
      )}
      
      {canManageUsers && (
        <Link to="/users">Manage Users</Link>
      )}
    </div>
  );
};
```

---

## 🔄 Backend Integration

### **What the Backend Should Return**

#### **Login Endpoint: POST `/api/auth/login`**

**Request:**
```json
{
  "username": "john.doe",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 123,
    "username": "john.doe",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "role": "manager",
    "branch": "Kampala",
    "phoneNumber": "+256700000000",
    "profilePicture": null,
    "permissions": ["view_expenses", "approve_expenses", "create_expenses"],
    "status": "active"
  },
  "message": "Login successful"
}
```

### **JWT Token Payload**
The JWT token should include user information in its payload:

```json
{
  "userId": 123,
  "username": "john.doe",
  "email": "john.doe@example.com",
  "role": "manager",
  "branch": "Kampala",
  "iat": 1699123456,
  "exp": 1699209856
}
```

---

## 📊 Recommended Role Structure

### **Role Hierarchy**

1. **Super Admin**
   - Full system access
   - Manage all users
   - System configuration
   - All permissions

2. **Admin**
   - Branch management
   - User management (within branch)
   - Approve all transactions
   - Generate reports

3. **Manager**
   - Approve expenses
   - View reports
   - Manage staff assignments
   - Handle client accounts

4. **Staff**
   - Create expenses
   - View assigned clients
   - Process loans
   - Basic reporting

5. **User** (Default)
   - View only access
   - Limited functionality

---

## 🔒 Recommended Permissions

### **Expense Management**
- `view_expenses` - View expense list
- `create_expenses` - Create new expenses
- `approve_expenses` - Approve pending expenses
- `reject_expenses` - Reject expenses
- `pay_expenses` - Mark expenses as paid
- `delete_expenses` - Delete expenses

### **Client Management**
- `view_clients` - View client list
- `create_clients` - Add new clients
- `edit_clients` - Modify client details
- `delete_clients` - Remove clients

### **Loan Management**
- `view_loans` - View loan list
- `create_loans` - Create new loans
- `approve_loans` - Approve loan applications
- `disburse_loans` - Disburse approved loans
- `manage_repayments` - Handle loan repayments

### **User Management**
- `view_users` - View user list
- `create_users` - Add new users
- `edit_users` - Modify user details
- `delete_users` - Remove users
- `assign_roles` - Assign/change user roles

### **Reporting**
- `view_reports` - Access reports
- `export_reports` - Export reports
- `view_analytics` - Access analytics dashboard

### **System Settings**
- `manage_branches` - Manage branches
- `manage_categories` - Manage expense categories
- `system_settings` - System configuration

---

## 🚨 Security Best Practices

1. **Never store passwords in localStorage**
   - Only store JWT tokens and user info

2. **Token expiration**
   - Implement automatic logout on token expiry
   - Refresh tokens when needed

3. **Sensitive data**
   - Don't store sensitive financial data in localStorage
   - Fetch sensitive data on-demand via API

4. **Logout cleanup**
   - Always clear all localStorage on logout
   - Clear session data

5. **XSS Protection**
   - Sanitize user input
   - Use Content Security Policy (CSP)

---

## 📝 Migration Guide

### **For Existing Code Using `localStorage.getItem('username')`**

**Before:**
```javascript
const currentUser = localStorage.getItem('username') || 'System';
```

**After:**
```javascript
import AuthService from '../services/authService';

const currentUser = AuthService.getUserFullName();
// or
const username = AuthService.getUsername();
```

### **Benefits of Migration:**
1. ✅ Gets full name (e.g., "John Doe") instead of username
2. ✅ Centralized user data management
3. ✅ Easier to add role-based features later
4. ✅ Better error handling and fallbacks
5. ✅ Consistent across entire application

---

## 🧪 Testing User Authentication

### **Test User Data**
For development/testing, use this mock user structure:

```javascript
{
  userId: 1,
  username: "test.user",
  firstName: "Test",
  lastName: "User",
  email: "test@example.com",
  role: "manager",
  branch: "Test Branch",
  phoneNumber: "+256700000000",
  profilePicture: null,
  permissions: ["view_expenses", "create_expenses", "approve_expenses"],
  status: "active",
  loginTime: "2025-11-05T08:00:00.000Z"
}
```

---

## 📞 Support

For questions or issues with authentication:
1. Check the console for error messages
2. Verify the backend returns the correct user object structure
3. Ensure the token is properly stored in localStorage
4. Contact the backend team if user fields are missing

---

**Last Updated:** November 5, 2025  
**Version:** 1.0.0
