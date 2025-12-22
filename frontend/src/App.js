// --- CLEAN + UPDATED App.js WITH CORRECT TRACKING ROUTE ---

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './App.css';

// Authentication
import Setup from './pages/Auth/Setup.jsx';
import Login from './pages/Auth/Login';
import ForgotPassword from './pages/Auth/ForgotPassword';
import OtpVerification from './pages/Auth/OtpVerification';





// Dashboard
import Dashboard from './pages/Dashboard/Dashboard';

// Clients
import Clients from './pages/Clients/Clients';
import AddClient from './pages/Clients/AddClient';
import ClientDetails from './pages/Clients/ClientDetails';
import EditClient from './pages/Clients/EditClient';

// Users
import ViewStaff from './pages/Users/ViewStaff';
import StaffDetails from './pages/Users/StaffDetails';
import EditStaff from './pages/Users/EditStaff';
import AddStaff from './pages/Users/AddStaff';

// Loans
import AllLoans from './pages/Loans/AllLoans';
import AddLoan from './pages/Loans/AddLoan';
import EditLoan from './pages/Loans/EditLoan';
import LoanDetails from './pages/Loans/LoanDetails';

import LoanProducts from './pages/Loans/LoanProducts';
import AddLoanProduct from './pages/Loans/AddLoanProduct';
import EditLoanProduct from './pages/Loans/EditLoanProduct';
import ViewLoanProduct from './pages/Loans/ViewLoanProduct';

import LoanPendingApprovals from './pages/Loans/PendingApprovals';
import RejectedLoans from './pages/Loans/RejectedLoans';
import ArchivedLoans from './pages/Loans/ArchivedLoans';

// import LoanTracking from './pages/Loans/LoanTracking';
import LoanTrackingDetails from './pages/Loans/LoanTrackingDetails';   // NEW Payment Tracking Details Page

import DueLoans from './pages/Loans/DueLoans';
import MissedRepayments from './pages/Loans/MissedRepayments';
import ArrearsLoans from './pages/Loans/ArrearsLoans';
import NoRepayments from './pages/Loans/NoRepayments';
import PastMaturity from './pages/Loans/PastMaturity';
import PrincipalOutstanding from './pages/Loans/PrincipalOutstanding';
import LateLoansOneMonth from './pages/Loans/LateLoansOneMonth';
import LateLoansThreeMonths from './pages/Loans/LateLoansThreeMonths';
import LoanCalculator from './pages/Loans/LoanCalculator';
import Guarantors from './pages/Loans/Guarantors';
import LoanComments from './pages/Loans/LoanComments';
import Approvals from './pages/Loans/Approvals';

// Payments
import AllPayments from './pages/Payments/subpages/AllPayments';
import RecordPayment from './pages/Payments/subpages/RecordPayment';
import LatePayments from './pages/Payments/subpages/LatePayments';
import UpcomingDue from './pages/Payments/subpages/UpcomingDue';
import PaymentHistory from './pages/Payments/subpages/PaymentHistory';
import PaymentAnalytics from './pages/Payments/subpages/PaymentAnalytics';

// Expenses
import ExpenseCategories from './pages/Expenses/ExpenseCategories';
import AllExpenses from './pages/Expenses/AllExpenses';
import AddExpense from './pages/Expenses/AddExpense';
import EditExpense from './pages/Expenses/EditExpense';
import ExpenseDetails from './pages/Expenses/ExpenseDetails';
import PendingApprovals from './pages/Expenses/PendingApprovals';
import RejectedExpenses from './pages/Expenses/RejectedExpenses';
import ExpensesToPay from './pages/Expenses/ExpensesToPay';

// Finances & Branches
import FinancialDashboard from './pages/Finances/FinancialDashboard.jsx';
import Branches from './pages/Branches/AllBranches.jsx';

// Components
import ConnectionStatus from './components/ConnectionStatus';
import LoadingSpinner from './components/LoadingSpinner';

// Hooks & Utils
import useSetupStatus from './hooks/useSetupStatus';
import useSessionTimeout from './hooks/useSessionTimeout';
import { isTokenExpired } from './utils/tokenUtils';
import { clearAuthData } from './services/api';
import AuthService from './services/authService';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  const {
    isLoading: isCheckingSetup,
    isSetupCompleted,
    hasAdminUsers,
    error: setupError,
    refetchSetupStatus
  } = useSetupStatus();

  // Logout after inactivity
  const handleSessionTimeout = () => {
    localStorage.removeItem('tindigwa_token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    clearAuthData();
    setIsAuthenticated(false);
  };

  useSessionTimeout(handleSessionTimeout, 30 * 60 * 1000, isAuthenticated);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('tindigwa_token') || localStorage.getItem('authToken');

      if (token) {
        if (isTokenExpired(token)) {
          clearAuthData();
          setIsAuthenticated(false);
        } else {
          AuthService.refreshUserInfoFromToken();
          setIsAuthenticated(true);
        }
      } else {
        setIsAuthenticated(false);
      }

      setAuthChecked(true);
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  if (isCheckingSetup || !authChecked) {
    return <LoadingSpinner message="Checking system setup..." />;
  }

  if (setupError) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Error connecting to backend</h2>
        <p>{setupError}</p>
        <button onClick={refetchSetupStatus}>Retry</button>
      </div>
    );
  }

  return (
    <Router>
      <ConnectionStatus />
      <Toaster position="top-right" />

      <Routes>

        {/* Auth */}
        <Route path="/setup" element={!isSetupCompleted ? <Setup onSetupComplete={refetchSetupStatus} /> : <Navigate to="/login" replace />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login setIsAuthenticated={setIsAuthenticated} />} />
+        <Route path="/verify-otp" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <OtpVerification setIsAuthenticated={setIsAuthenticated} />} />
 
        <Route path="/forgot-password" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <ForgotPassword />} />

        {/* Dashboard */}
        <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />} />

        {/* Clients */}
        <Route path="/clients" element={isAuthenticated ? <Clients /> : <Navigate to="/login" replace />} />
        <Route path="/clients/add" element={isAuthenticated ? <AddClient /> : <Navigate to="/login" replace />} />
        <Route path="/clients/:id" element={isAuthenticated ? <ClientDetails /> : <Navigate to="/login" replace />} />
        <Route path="/clients/edit/:id" element={isAuthenticated ? <EditClient /> : <Navigate to="/login" replace />} />

        {/* Users */}
        <Route path="/users/staff" element={isAuthenticated ? <ViewStaff /> : <Navigate to="/login" replace />} />
        <Route path="/users/staff/:id" element={isAuthenticated ? <StaffDetails /> : <Navigate to="/login" replace />} />
        <Route path="/users/staff/edit/:id" element={isAuthenticated ? <EditStaff /> : <Navigate to="/login" replace />} />
        <Route path="/users/add-staff" element={isAuthenticated ? <AddStaff /> : <Navigate to="/login" replace />} />

        {/* Loans List */}
        <Route path="/loans" element={isAuthenticated ? <AllLoans /> : <Navigate to="/login" replace />} />
        <Route path="/loans/add" element={isAuthenticated ? <AddLoan /> : <Navigate to="/login" replace />} />
        <Route path="/loans/edit/:id" element={isAuthenticated ? <EditLoan /> : <Navigate to="/login" replace />} />
        <Route path="/loans/details/:id" element={isAuthenticated ? <LoanDetails /> : <Navigate to="/login" replace />} />


        {/* Loan Products */}
<Route path="/loans/products" element={isAuthenticated ? <LoanProducts /> : <Navigate to="/login" replace />} />
<Route path="/loans/products/add" element={isAuthenticated ? <AddLoanProduct /> : <Navigate to="/login" replace />} />
<Route path="/loans/products/edit/:id" element={isAuthenticated ? <EditLoanProduct /> : <Navigate to="/login" replace />} />
<Route path="/loans/products/view/:id" element={isAuthenticated ? <ViewLoanProduct /> : <Navigate to="/login" replace />} />

        {/* ✔ CORRECT PAYMENT TRACKING ROUTE */}
        <Route
          path="/loans/:loanId/tracking"
          element={isAuthenticated ? <LoanTrackingDetails /> : <Navigate to="/login" replace />}
        />

        {/* Remove WRONG tracking routes */}
        {/* ❌ <Route path="/loans/tracking/:id" element={<LoanTrackingDetails />} /> */}
        {/* ❌ <Route path="/loans/tracking" element={<LoanTracking />} /> */}

        {/* Loan Extras */}
        <Route path="/loans/pending" element={isAuthenticated ? <LoanPendingApprovals /> : <Navigate to="/login" replace />} />
        <Route path="/loans/rejected" element={isAuthenticated ? <RejectedLoans /> : <Navigate to="/login" replace />} />
        <Route path="/loans/archived" element={isAuthenticated ? <ArchivedLoans /> : <Navigate to="/login" replace />} />

        {/* Payments */}
        <Route path="/payments/all" element={isAuthenticated ? <AllPayments /> : <Navigate to="/login" replace />} />
        <Route path="/payments/record" element={isAuthenticated ? <RecordPayment /> : <Navigate to="/login" replace />} />
        <Route path="/payments/late" element={isAuthenticated ? <LatePayments /> : <Navigate to="/login" replace />} />
        <Route path="/payments/upcoming" element={isAuthenticated ? <UpcomingDue /> : <Navigate to="/login" replace />} />
        <Route path="/payments/history" element={isAuthenticated ? <PaymentHistory /> : <Navigate to="/login" replace />} />
        <Route path="/payments/analytics" element={isAuthenticated ? <PaymentAnalytics /> : <Navigate to="/login" replace />} />

        {/* Expenses */}
        <Route path="/expenses" element={isAuthenticated ? <AllExpenses /> : <Navigate to="/login" replace />} />
        <Route path="/expenses/add" element={isAuthenticated ? <AddExpense /> : <Navigate to="/login" replace />} />
        <Route path="/expenses/edit/:id" element={isAuthenticated ? <EditExpense /> : <Navigate to="/login" replace />} />
        <Route path="/expenses/:id" element={isAuthenticated ? <ExpenseDetails /> : <Navigate to="/login" replace />} />

        <Route path="/expenses/expense-categories" element={isAuthenticated ? <ExpenseCategories /> : <Navigate to="/login" replace />} />
        <Route path="/expenses/pending-approvals" element={isAuthenticated ? <PendingApprovals /> : <Navigate to="/login" replace />} />
        <Route path="/expenses/rejected" element={isAuthenticated ? <RejectedExpenses /> : <Navigate to="/login" replace />} />
        <Route path="/expenses/to-pay" element={isAuthenticated ? <ExpensesToPay /> : <Navigate to="/login" replace />} />



        {/* Finances & Branches */}
        <Route path="/finances" element={isAuthenticated ? <FinancialDashboard /> : <Navigate to="/login" replace />} />
        <Route path="/branches" element={isAuthenticated ? <Branches /> : <Navigate to="/login" replace />} />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

      </Routes>
    </Router>
  );
}

export default App;
