# Tindigwa Loan Management System - Frontend

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Core Modules](#core-modules)
- [Features](#features)
- [Configuration](#configuration)
- [Development Guide](#development-guide)
- [API Integration](#api-integration)
- [Security](#security)
- [Troubleshooting](#troubleshooting)

---

## 📖 Project Overview

**Tindigwa** is a comprehensive loan management system designed for microfinance institutions in Uganda. The frontend is built with React and provides a complete interface for managing loans, clients, expenses, payments, and financial analytics.

### Key Capabilities

- **Client Management**: Complete client onboarding, profile management, and KYC tracking
- **Loan Processing**: Full loan lifecycle from application to disbursement, tracking, and repayment
- **Expense Tracking**: Multi-level approval workflow for operational expenses
- **Payment Management**: Record, track, and analyze loan repayments
- **Financial Analytics**: Real-time dashboards with comprehensive financial insights
- **User Management**: Role-based access control with multi-branch support
- **Real-time Updates**: WebSocket integration for live notifications

---

## 🛠 Technology Stack

### Core Technologies

| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 18.2.0 | UI Framework |
| **React Router** | 6.3.0 | Client-side routing |
| **Axios** | 1.11.0 | HTTP client |
| **Chart.js** | 4.5.0 | Data visualization |
| **React Hot Toast** | 2.6.0 | Toast notifications |
| **date-fns** | 2.29.3 | Date manipulation |
| **Lucide React** | 0.263.1 | Icon library |

### Real-time Communication

- **@stomp/stompjs** (7.2.1): WebSocket protocol for real-time updates
- **sockjs-client** (1.6.1): WebSocket fallback support

### Testing

- **@testing-library/react** (13.3.0)
- **@testing-library/jest-dom** (5.16.4)
- **@testing-library/user-event** (13.5.0)

---

## 🏗 System Architecture

### Application Flow

```
┌─────────────────────────────────────────────────────────┐
│                     App.js (Entry Point)                 │
│  - Authentication Management                             │
│  - Route Protection                                      │
│  - Session Timeout Handling                              │
│  - Setup Status Verification                             │
└───────────────────┬─────────────────────────────────────┘
                    │
    ┌───────────────┴────────────────┐
    │                                │
┌───▼────────┐                  ┌───▼──────┐
│  Protected │                  │   Public │
│   Routes   │                  │  Routes  │
└───┬────────┘                  └───┬──────┘
    │                                │
    ├─ Dashboard                     ├─ Login
    ├─ Clients                       ├─ Setup
    ├─ Loans                         └─ Forgot Password
    ├─ Payments
    ├─ Expenses
    ├─ Finances
    └─ Users/Staff

            │
    ┌───────┴────────┐
    │                │
┌───▼─────┐    ┌────▼─────┐
│Services │    │Components│
│(API)    │    │(UI)      │
└─────────┘    └──────────┘
```

### Authentication Flow

1. User logs in via `/auth/login`
2. Backend returns JWT token + user object
3. Token stored in `localStorage` (keys: `authToken`, `tindigwa_token`)
4. User info stored (key: `currentUser`)
5. All subsequent API calls include `Authorization: Bearer <token>` header
6. Session timeout after 30 minutes of inactivity
7. Automatic logout on token expiration (403 responses)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v14.0.0 or higher
- **npm**: v6.0.0 or higher
- **Backend API**: Running on `http://localhost:8081` (default)

### Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

The application will open at `http://localhost:3000`

### Environment Variables

Create a `.env` file in the frontend directory:

```env
REACT_APP_API_BASE_URL=http://localhost:8081/api
REACT_APP_API_TIMEOUT=10000
```

### Available Scripts

```bash
npm start          # Start development server (localhost:3000)
npm run build      # Create production build
npm test           # Run tests
npm run eject      # Eject from Create React App (one-way operation)
```

---

## 📁 Project Structure

```
frontend/
├── public/                          # Static assets
│   └── index.html                  # HTML template
│
├── src/
│   ├── components/                  # Reusable UI components
│   │   ├── Charts/                 # Chart components (Chart.js wrappers)
│   │   ├── ClientSteps/            # Multi-step client registration
│   │   ├── ConfirmDeleteModal/     # Delete confirmation dialogs
│   │   ├── Layout/                 # Layout wrapper components
│   │   ├── Loans/                  # Loan-specific components
│   │   ├── LoanSteps/              # Multi-step loan creation
│   │   ├── NotificationModal/      # Notification display
│   │   ├── Stepper/                # Step wizard component
│   │   ├── BulkImportModal.jsx     # Bulk data import
│   │   ├── ConnectionStatus.jsx    # Backend connection indicator
│   │   ├── ExpandableMenuItem.jsx  # Collapsible menu items
│   │   ├── LoadingSpinner.js       # Loading indicator
│   │   ├── LoanApprovalWorkflow.jsx# Loan approval UI
│   │   ├── ReceiptUploadModal.jsx  # File upload for receipts
│   │   ├── Toast.js                # Toast notification wrapper
│   │   └── ViewExpenseModal.jsx    # Expense details modal
│   │
│   ├── hooks/                       # Custom React hooks
│   │   ├── useExpenseWebSocket.js  # Real-time expense updates
│   │   ├── useNotification.js      # Notification management
│   │   ├── useSessionTimeout.js    # Auto-logout on inactivity
│   │   └── useSetupStatus.js       # System setup verification
│   │
│   ├── pages/                       # Page components (routes)
│   │   ├── Auth/                   # Authentication pages
│   │   │   ├── Login.jsx
│   │   │   ├── Setup.jsx           # Initial system setup
│   │   │   └── ForgotPassword.jsx
│   │   │
│   │   ├── Clients/                # Client management
│   │   │   ├── Clients.jsx         # Client list
│   │   │   ├── AddClient.jsx       # New client registration
│   │   │   ├── ClientDetails.jsx   # Client profile
│   │   │   └── EditClient.jsx      # Update client info
│   │   │
│   │   ├── Dashboard/              # Main dashboard
│   │   │   └── Dashboard.jsx       # Overview with KPIs
│   │   │
│   │   ├── Expenses/               # Expense management
│   │   │   ├── AllExpenses.jsx     # All expenses list
│   │   │   ├── AddExpense.jsx      # Create expense
│   │   │   ├── EditExpense.jsx     # Update expense
│   │   │   ├── ExpenseDetails.jsx  # Expense details view
│   │   │   ├── ExpenseCategories.jsx # Category management
│   │   │   ├── PendingApprovals.jsx # Expenses awaiting approval
│   │   │   ├── RejectedExpenses.jsx # Rejected expense list
│   │   │   └── ExpensesToPay.jsx   # Approved unpaid expenses
│   │   │
│   │   ├── Finances/               # Financial analytics
│   │   │   └── FinancialDashboard.jsx # Financial reports
│   │   │
│   │   ├── Loans/                  # Loan management
│   │   │   ├── Loans.jsx           # Main loans list
│   │   │   ├── AddLoan.jsx         # Create new loan
│   │   │   ├── LoanDetails.jsx     # Loan information
│   │   │   ├── LoanRegistration.jsx # Full loan application
│   │   │   ├── DisbursedLoans.jsx  # Disbursed loans
│   │   │   ├── LoanProducts.jsx    # Loan product catalog
│   │   │   ├── LoanCalculator.jsx  # Interest/payment calculator
│   │   │   ├── Approvals.jsx       # Loan approvals workflow
│   │   │   ├── Guarantors.jsx      # Guarantor management
│   │   │   ├── LoanComments.jsx    # Loan notes/comments
│   │   │   ├── LoanTrackingDetail.jsx # Detailed tracking
│   │   │   ├── DueLoans.jsx        # Loans due soon
│   │   │   ├── MissedRepayments.jsx # Overdue payments
│   │   │   ├── ArrearsLoans.jsx    # Loans in arrears
│   │   │   ├── NoRepayments.jsx    # No payment received
│   │   │   ├── PastMaturity.jsx    # Matured loans
│   │   │   ├── PrincipalOutstanding.jsx # Outstanding balances
│   │   │   ├── LateLoansOneMonth.jsx  # 1+ month overdue
│   │   │   └── LateLoansThreeMonths.jsx # 3+ months overdue
│   │   │
│   │   ├── Payments/               # Payment management
│   │   │   ├── Payments.jsx        # Payment router/wrapper
│   │   │   └── subpages/
│   │   │       ├── AllPayments.jsx     # All payments
│   │   │       ├── RecordPayment.jsx   # Record new payment
│   │   │       ├── LatePayments.jsx    # Overdue payments
│   │   │       ├── UpcomingDue.jsx     # Upcoming due dates
│   │   │       ├── PaymentHistory.jsx  # Payment history
│   │   │       └── PaymentAnalytics.jsx # Payment analytics
│   │   │
│   │   └── Users/                  # User/staff management
│   │       ├── ViewStaff.jsx       # Staff list
│   │       ├── AddStaff.jsx        # Add new user
│   │       ├── StaffDetails.jsx    # User profile
│   │       └── EditStaff.jsx       # Update user info
│   │
│   ├── services/                    # API service layer
│   │   ├── api.js                  # Base API service
│   │   ├── authService.js          # Authentication
│   │   ├── branchService.js        # Branch operations
│   │   ├── categoryStore.js        # Category state management
│   │   ├── clientService.js        # Client API
│   │   ├── dashboardService.js     # Dashboard data
│   │   ├── expenseService.js       # Expense API
│   │   ├── ExpensesService.js      # Additional expense utilities
│   │   ├── financialAnalyticsService.js # Financial reports
│   │   ├── loanService.js          # Loan API
│   │   ├── loanOfficerService.js   # Loan officer management
│   │   ├── paymentService.js       # Payment API
│   │   ├── paymentStore.js         # Payment state
│   │   ├── paymentEvents.js        # Payment event handling
│   │   ├── penaltyService.js       # Penalty calculations
│   │   ├── productService.js       # Loan product management
│   │   ├── rolesService.js         # User roles/permissions
│   │   ├── scheduleService.js      # Repayment schedules
│   │   ├── staffService.js         # Staff management
│   │   └── websocketService.js     # WebSocket connections
│   │
│   ├── styles/                      # Global styles
│   │
│   ├── utils/                       # Utility functions
│   │   ├── jwtUtils.js             # JWT token helpers
│   │   └── tokenUtils.js           # Token validation
│   │
│   ├── App.js                       # Main application component
│   ├── App.css                      # Global app styles
│   ├── index.js                     # React entry point
│   └── index.css                    # Base CSS
│
├── build/                           # Production build output
├── node_modules/                    # Dependencies
│
├── package.json                     # Project metadata & dependencies
├── package-lock.json                # Dependency lock file
│
├── AUTHENTICATION_GUIDE.md          # Auth implementation guide
├── BACKEND_EXPENSE_API_SPEC.md      # Backend API specification
│
├── add_expenses_to_sidebars.sh      # Script to add expense routes
├── update_loan_products.sh          # Script to update loan products
└── test-api.html                    # API testing HTML file
```

---

## 🧩 Core Modules

### 1. Authentication Module (`src/pages/Auth/`, `src/services/authService.js`)

**Purpose**: Handles user authentication, authorization, and session management.

**Key Features**:
- JWT-based authentication
- Token storage and validation
- Auto-refresh user info from token
- Session timeout (30 minutes inactivity)
- Role-based access control (RBAC)
- Permission checking

**Key Methods** (authService.js):
```javascript
login(username, password)           // Authenticate user
logout()                            // Clear session
isAuthenticated()                   // Check auth status
getCurrentUser()                    // Get user object
getUserFullName()                   // Get formatted name
getUserRole()                       // Get user role
hasPermission(permission)           // Check permission
hasRole(role)                       // Check role
refreshUserInfoFromToken()          // Update user data from JWT
```

**User Roles**:
1. **Super Admin**: Full system access
2. **Admin**: Branch management, user management
3. **Manager**: Approve expenses, view reports, manage staff
4. **Staff**: Create expenses, process loans, basic reporting
5. **User**: View-only access

**See Also**: `AUTHENTICATION_GUIDE.md` for detailed implementation

---

### 2. Client Management Module (`src/pages/Clients/`, `src/services/clientService.js`)

**Purpose**: Complete client lifecycle management from onboarding to profile maintenance.

**Key Features**:
- Multi-step client registration
- KYC information collection
- Guarantor management
- Client profile viewing and editing
- Search and filter capabilities
- Bulk import support

**Client Data Structure**:
```javascript
{
  // Basic Information
  firstName: string
  middleName: string
  lastName: string
  age: number
  nationalId: string (unique)
  phoneNumber: string
  email: string
  
  // Address
  village: string
  parish: string
  district: string
  
  // Employment
  employmentStatus: string
  occupation: string
  monthlyIncome: string
  
  // Guarantor
  guarantorFirstName: string
  guarantorLastName: string
  guarantorPhone: string
  guarantorRelationship: string
  
  // System
  branch: string
  agreementSigned: boolean
}
```

**Key Components**:
- `Clients.jsx`: Client list with search/filter
- `AddClient.jsx`: Multi-step registration form
- `ClientDetails.jsx`: Complete client profile view
- `EditClient.jsx`: Update client information

---

### 3. Loan Management Module (`src/pages/Loans/`, `src/services/loanService.js`)

**Purpose**: Comprehensive loan lifecycle management from application to closure.

**Key Features**:
- Loan application and registration
- Loan product management
- Interest calculation (flat/reducing balance)
- Flexible repayment schedules
- Loan approval workflow
- Disbursement tracking
- Repayment tracking
- Guarantor management
- Loan comments/notes
- Overdue loan tracking

**Loan Lifecycle States**:
1. **Application**: Initial loan request
2. **Under Review**: Being evaluated
3. **Approved**: Ready for disbursement
4. **Disbursed**: Funds released
5. **Active**: Repayments in progress
6. **Overdue**: Missed payments
7. **Completed**: Fully repaid
8. **Written Off**: Uncollectible

**Loan Data Structure**:
```javascript
{
  // Client & Product
  clientId: number
  productId: number
  
  // Identification
  loanNumber: string (auto-generated)
  loanTitle: string
  description: string
  
  // Amounts
  principalAmount: number
  releaseDate: date
  disbursedBy: string
  
  // Interest Configuration
  interestMethod: 'flat' | 'reducing_balance'
  interestType: 'percentage' | 'fixed'
  interestRate: number
  ratePer: 'day' | 'week' | 'month' | 'year'
  
  // Duration
  loanDuration: number
  durationUnit: 'days' | 'weeks' | 'months' | 'years'
  loanDurationDays: number
  
  // Repayment
  repaymentFrequency: 'daily' | 'weekly' | 'monthly'
  numberOfRepayments: number
  gracePeriodDays: number
  firstRepaymentDate: date
  
  // Fees & Charges
  processingFee: number
  insuranceFee: number
  otherFees: number
  
  // Status
  status: string
  approvalStatus: string
}
```

**Specialized Loan Views**:
- `DueLoans.jsx`: Loans with payments due soon
- `MissedRepayments.jsx`: Loans with missed payments
- `ArrearsLoans.jsx`: Loans in arrears
- `LateLoansOneMonth.jsx`: 1+ month overdue
- `LateLoansThreeMonths.jsx`: 3+ months overdue
- `PastMaturity.jsx`: Loans past maturity date
- `NoRepayments.jsx`: Loans with no payments received
- `PrincipalOutstanding.jsx`: Outstanding principal balances

**Key Components**:
- `LoanRegistration.jsx`: Full loan application form
- `LoanCalculator.jsx`: Calculate interest & payments
- `Approvals.jsx`: Multi-level approval workflow
- `Guarantors.jsx`: Manage loan guarantors
- `LoanComments.jsx`: Add notes to loans
- `LoanTrackingDetail.jsx`: Detailed loan tracking

---

### 4. Payment Management Module (`src/pages/Payments/`, `src/services/paymentService.js`)

**Purpose**: Record, track, and analyze all loan repayments.

**Key Features**:
- Record payments (cash, bank, mobile money)
- Payment allocation (principal, interest, penalties)
- Payment history tracking
- Late payment identification
- Upcoming due date tracking
- Payment analytics and reporting
- Bulk payment import

**Payment Data Structure**:
```javascript
{
  loanId: number
  paymentDate: date
  amount: number
  paymentMethod: 'cash' | 'bank_transfer' | 'mobile_money'
  transactionReference: string
  principalPaid: number
  interestPaid: number
  penaltyPaid: number
  notes: string
  recordedBy: string
}
```

**Key Components**:
- `AllPayments.jsx`: Complete payment history
- `RecordPayment.jsx`: Record new payment
- `LatePayments.jsx`: Overdue payments list
- `UpcomingDue.jsx`: Upcoming payment schedule
- `PaymentHistory.jsx`: Client payment history
- `PaymentAnalytics.jsx`: Payment trends and analytics

---

### 5. Expense Management Module (`src/pages/Expenses/`, `src/services/expenseService.js`)

**Purpose**: Manage operational expenses with multi-level approval workflow.

**Key Features**:
- Create and categorize expenses
- Multi-level approval workflow (Pending → Approved → Paid)
- Expense rejection with comments
- Receipt upload support
- Real-time updates via WebSocket
- User attribution (requested by, approved by, paid by)
- Expense tracking and reporting

**Expense Workflow**:
```
1. PENDING ────────→ 2. APPROVED ────────→ 3. PAID
    │                     │
    │                     │
    └─────→ REJECTED ←────┘
```

**Expense Data Structure**:
```javascript
{
  expenseName: string
  description: string
  amount: number
  categoryName: string
  expenseDate: date
  
  // User Attribution
  requestedBy: string        // Full name of creator
  createdByUserId: number
  approvedBy: string         // Full name of approver
  approvedByUserId: number
  approvedAt: date
  approvalComment: string
  paidBy: string            // Full name of payer
  paidByUserId: number
  paidAt: date
  
  // Status
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED'
  paymentStatus: 'UNPAID' | 'PAID'
  
  // Additional
  receiptUrl: string
  branch: string
}
```

**Expense Categories**:
- Office Supplies
- Rent
- Utilities
- Marketing
- Salaries
- Transportation
- Professional Services
- Technology
- Training
- Miscellaneous

**Key Components**:
- `AllExpenses.jsx`: All expenses with filters
- `AddExpense.jsx`: Create new expense
- `EditExpense.jsx`: Update expense details
- `ExpenseDetails.jsx`: View expense details
- `ExpenseCategories.jsx`: Manage categories
- `PendingApprovals.jsx`: Expenses awaiting approval
- `RejectedExpenses.jsx`: Rejected expense list
- `ExpensesToPay.jsx`: Approved unpaid expenses

**Real-time Updates**:
Uses `useExpenseWebSocket` hook for live notifications when expenses are created, approved, rejected, or paid.

**See Also**: `BACKEND_EXPENSE_API_SPEC.md` for API specification

---

### 6. Dashboard Module (`src/pages/Dashboard/`, `src/services/dashboardService.js`)

**Purpose**: Real-time overview of key business metrics and KPIs.

**Key Metrics**:
- Total active loans
- Total outstanding amount
- Total collected today
- Overdue loans count
- Client count
- Disbursed loans (today/month)
- Loan portfolio health
- Collection rate
- Default rate

**Chart Types**:
- Loan disbursement trends
- Collection trends
- Portfolio composition
- Loan status breakdown
- Branch performance comparison

**Key Features**:
- Auto-refresh data
- Date range filtering
- Export reports
- Branch-wise filtering (for branch managers)

---

### 7. Financial Analytics Module (`src/pages/Finances/`, `src/services/financialAnalyticsService.js`)

**Purpose**: Comprehensive financial reporting and analysis.

**Report Types**:
- Income statement
- Balance sheet
- Cash flow statement
- Loan portfolio analysis
- Expense analysis
- Profitability analysis
- Branch performance comparison

**Key Features**:
- Custom date ranges
- Export to Excel/PDF
- Chart visualizations
- Trend analysis
- Comparative reports

---

### 8. User/Staff Management Module (`src/pages/Users/`, `src/services/staffService.js`)

**Purpose**: Manage system users and staff members.

**Key Features**:
- User registration
- Role assignment
- Permission management
- Branch assignment
- User profile management
- User activity tracking
- Deactivate/activate users

**User Data Structure**:
```javascript
{
  username: string (unique)
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  role: 'super_admin' | 'admin' | 'manager' | 'staff' | 'user'
  branch: string
  permissions: string[]
  status: 'active' | 'inactive' | 'suspended'
  profilePicture: string (URL)
}
```

---

## 🌟 Features

### Cross-cutting Features

#### 1. **Real-time Updates**
- WebSocket integration for live notifications
- Auto-refresh data on relevant changes
- Toast notifications for important events

#### 2. **Session Management**
- 30-minute inactivity timeout
- Automatic logout on token expiration
- Session persistence across tabs

#### 3. **Responsive Design**
- Mobile-friendly interface
- Adaptive layouts
- Touch-friendly controls

#### 4. **Search & Filtering**
- Global search across entities
- Advanced filtering options
- Sort by multiple columns

#### 5. **Data Export**
- Export to Excel
- Export to PDF
- Print-friendly views

#### 6. **Bulk Operations**
- Bulk import clients
- Bulk import loans
- Bulk payment entry

#### 7. **Validation**
- Client-side form validation
- Real-time validation feedback
- Server-side validation error handling

#### 8. **Error Handling**
- User-friendly error messages
- Retry mechanisms
- Offline mode detection

---

## ⚙️ Configuration

### API Configuration (`src/services/api.js`)

```javascript
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081/api';
const DEBUG_MODE = true; // Enable/disable API logging
```

### Authentication Configuration

- **Token Keys**: `authToken`, `tindigwa_token`
- **User Data Key**: `currentUser`
- **Session Timeout**: 30 minutes (configurable in `App.js`)

### WebSocket Configuration

```javascript
// In websocketService.js
const SOCKET_URL = 'http://localhost:8081/ws';
const RECONNECT_DELAY = 5000; // 5 seconds
```

---

## 💻 Development Guide

### Code Style

- **React**: Functional components with hooks
- **Styling**: CSS modules + global CSS
- **State Management**: React hooks (useState, useEffect, custom hooks)
- **API Calls**: Centralized in service layer
- **Error Handling**: Try-catch with user-friendly messages

### Creating a New Module

1. **Create page component** in `src/pages/ModuleName/`
2. **Create service** in `src/services/moduleService.js`
3. **Add routes** in `src/App.js`
4. **Update navigation** in Layout component
5. **Add tests** (optional)

### Custom Hooks

Custom hooks are located in `src/hooks/`:

- `useSetupStatus`: Check system setup status
- `useSessionTimeout`: Handle inactivity timeout
- `useExpenseWebSocket`: Real-time expense updates
- `useNotification`: Notification management

### Example: Creating a Custom Hook

```javascript
import { useState, useEffect } from 'react';
import ApiService from '../services/api';

const useDataFetcher = (endpoint) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await ApiService.get(endpoint);
        setData(result);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint]);

  return { data, loading, error };
};

export default useDataFetcher;
```

---

## 🔌 API Integration

### Base API Service (`src/services/api.js`)

The `ApiService` class provides a centralized HTTP client with:
- Automatic authentication header injection
- Token expiration handling
- Request/response logging (debug mode)
- Error handling and formatting

### API Methods

```javascript
// GET request
const data = await ApiService.get('/endpoint');

// POST request
const response = await ApiService.post('/endpoint', { key: 'value' });

// PUT request
const updated = await ApiService.put('/endpoint/1', { key: 'newValue' });

// DELETE request
await ApiService.delete('/endpoint/1');
```

### API Endpoints

| Module | Base Path | Description |
|--------|-----------|-------------|
| Auth | `/auth` | Authentication endpoints |
| Clients | `/clients` | Client management |
| Loans | `/loans` | Loan operations |
| Payments | `/payments` | Payment recording |
| Expenses | `/expenses` | Expense management |
| Dashboard | `/dashboard` | Dashboard statistics |
| Users | `/users` | User management |
| Branches | `/branches` | Branch operations |
| Products | `/loan-products` | Loan product catalog |

### Error Handling

```javascript
try {
  const data = await ApiService.get('/endpoint');
  // Success handling
} catch (error) {
  // Error handling
  if (error.message.includes('session has expired')) {
    // Handle token expiration
  } else if (error.message.includes('Cannot connect')) {
    // Handle connection error
  } else {
    // Handle other errors
  }
}
```

---

## 🔒 Security

### Authentication

- **JWT Tokens**: All API requests authenticated with Bearer tokens
- **Token Storage**: Stored in `localStorage` (consider `httpOnly` cookies for production)
- **Token Expiration**: Automatic logout on expiration
- **Session Timeout**: 30 minutes of inactivity

### Authorization

- **Role-Based Access Control (RBAC)**: Different permissions per role
- **Permission Checking**: `authService.hasPermission(permission)`
- **Route Protection**: Private routes redirect to login if not authenticated

### Best Practices

1. **Never store passwords**: Only tokens and user info
2. **Token rotation**: Implement token refresh mechanism
3. **HTTPS only**: Always use HTTPS in production
4. **XSS Protection**: Sanitize user input
5. **CSRF Protection**: Implement CSRF tokens
6. **Content Security Policy**: Configure CSP headers

### Security Checklist

- [ ] Use HTTPS in production
- [ ] Implement token refresh
- [ ] Add CSRF protection
- [ ] Sanitize user input
- [ ] Configure CSP headers
- [ ] Enable secure cookies
- [ ] Implement rate limiting
- [ ] Add audit logging
- [ ] Regular security audits

---

## 🐛 Troubleshooting

### Common Issues

#### 1. **Cannot Connect to Backend**

**Error**: `Cannot connect to backend server. Please ensure the backend is running on http://localhost:8081`

**Solutions**:
- Verify backend is running: `curl http://localhost:8081/api/auth/setup-status`
- Check `REACT_APP_API_BASE_URL` in `.env`
- Check for CORS issues in browser console
- Verify firewall settings

#### 2. **Token Expired / 403 Forbidden**

**Error**: `Your session has expired. Please log in again.`

**Solutions**:
- Log out and log in again
- Clear localStorage: `localStorage.clear()`
- Check token expiration time in JWT decoder
- Ensure backend clock is synchronized

#### 3. **WebSocket Connection Failed**

**Error**: WebSocket connection errors in console

**Solutions**:
- Verify WebSocket endpoint is accessible
- Check for proxy/firewall blocking WebSocket
- Fallback to polling if WebSocket unavailable

#### 4. **User Info Missing / Undefined**

**Error**: `Cannot read property 'firstName' of null`

**Solutions**:
- Ensure backend returns complete user object on login
- Call `authService.refreshUserInfoFromToken()`
- Check `currentUser` in localStorage
- Verify JWT token contains required claims

#### 5. **Expenses Not Showing User Names**

**Error**: Expense shows "System" or "-" instead of user names

**Solutions**:
- Verify backend implements user attribution (see `BACKEND_EXPENSE_API_SPEC.md`)
- Check API response includes `requestedBy`, `approvedBy`, `paidBy` fields
- Ensure user info is properly stored during expense operations

### Debug Mode

Enable debug logging in `src/services/api.js`:

```javascript
const DEBUG_MODE = true; // Set to true for detailed logs
```

This will log:
- All API requests (method, URL, headers, body)
- All API responses (status, data)
- Errors with full stack traces

### Browser Console Commands

```javascript
// Check authentication status
console.log('Token:', localStorage.getItem('authToken'));
console.log('User:', JSON.parse(localStorage.getItem('currentUser')));

// Check token expiration
import { isTokenExpired } from './utils/tokenUtils';
console.log('Token expired:', isTokenExpired(localStorage.getItem('authToken')));

// Force logout
localStorage.clear();
window.location.href = '/login';
```

### Network Inspection

1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Filter by **XHR** to see API calls
4. Check request headers for `Authorization: Bearer <token>`
5. Check response status codes and bodies

---

## 📚 Additional Documentation

- **Authentication Guide**: `AUTHENTICATION_GUIDE.md` - Detailed authentication implementation
- **Backend API Spec**: `BACKEND_EXPENSE_API_SPEC.md` - Expense API specification
- **Scripts**:
  - `add_expenses_to_sidebars.sh` - Add expense routes to sidebar
  - `update_loan_products.sh` - Update loan product configurations

---

## 🤝 Contributing

### Development Workflow

1. Create feature branch: `git checkout -b feature/feature-name`
2. Make changes and test thoroughly
3. Commit with descriptive messages: `git commit -m "Add feature description"`
4. Push to remote: `git push origin feature/feature-name`
5. Create pull request for review

### Code Review Checklist

- [ ] Code follows project conventions
- [ ] All tests pass
- [ ] No console errors or warnings
- [ ] Responsive design works on mobile
- [ ] Accessibility standards met
- [ ] Documentation updated
- [ ] No sensitive data in code

---

## 📞 Support

For questions, issues, or feature requests:

1. Check this documentation
2. Check `AUTHENTICATION_GUIDE.md` for auth issues
3. Check browser console for errors
4. Review backend logs
5. Contact development team

---

## 📝 License

[Specify License Here]

---

## 🎯 Roadmap

### Upcoming Features

- [ ] Dark mode support
- [ ] Multi-language support (English, Luganda, Swahili)
- [ ] Mobile app (React Native)
- [ ] Offline mode with sync
- [ ] Advanced analytics with AI insights
- [ ] SMS notifications
- [ ] Email notifications
- [ ] Document management system
- [ ] Audit trail viewer
- [ ] Two-factor authentication (2FA)

---

**Last Updated**: November 6, 2025  
**Version**: 0.1.0  
**Maintained By**: Tindigwa Development Team
