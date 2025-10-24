import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Layout Components
// import Layout from './components/Layout/Layout';

// Authentication Pages
import Setup from './pages/Auth/Setup.jsx';
import Login from './pages/Auth/Login';
import ForgotPassword from './pages/Auth/ForgotPassword';

// Dashboard
import Dashboard from './pages/Dashboard/Dashboard';

// Clients
import Clients from './pages/Clients/Clients';
import AddClient from './pages/Clients/AddClient';
import ClientDetails from './pages/Clients/ClientDetails';
import EditClient from './pages/Clients/EditClient';

// Staff/Users
import ViewStaff from './pages/Users/ViewStaff';
import StaffDetails from './pages/Users/StaffDetails';
import EditStaff from './pages/Users/EditStaff';
import AddStaff from './pages/Users/AddStaff';

// Loans
import LoanRegistration from './pages/Loans/LoanRegistration';
import DisbursedLoans from './pages/Loans/DisbursedLoans';
import Loans from './pages/Loans/Loans';
import LoanDetails from './pages/Loans/LoanDetails';
import LoanProducts from './pages/Loans/LoanProducts';
import AddLoan from './pages/Loans/AddLoan';
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
import LoanTrackingDetail from './pages/Loans/LoanTrackingDetail';

// Payments
import Payments from './pages/Payments/Payments';
import AllPayments from './pages/Payments/subpages/AllPayments';
import RecordPayment from './pages/Payments/subpages/RecordPayment';
import LatePayments from './pages/Payments/subpages/LatePayments';
import UpcomingDue from './pages/Payments/subpages/UpcomingDue';
import PaymentHistory from './pages/Payments/subpages/PaymentHistory';
import PaymentAnalytics from './pages/Payments/subpages/PaymentAnalytics';

// Expenses
import RecordExpense from './pages/Expenses/subpages/RecordExpense';
import AllExpenses from './pages/Expenses/subpages/AllExpenses';
import ExpenseDetails from './pages/Expenses/subpages/ExpenseDetails';
import EditExpense from './pages/Expenses/subpages/EditExpense';

// Finances
import FinancialDashboard from './pages/Finances/FinancialDashboard';

// Components
import ConnectionStatus from './components/ConnectionStatus';
import LoadingSpinner from './components/LoadingSpinner';

// Hooks
import useSetupStatus from './hooks/useSetupStatus';

// Utils
import { isTokenExpired } from './utils/tokenUtils';
import { clearAuthData } from './services/api';

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

  // Check authentication status and token expiration
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('tindigwa_token') || localStorage.getItem('authToken');
      
      if (token) {
        // Check if token is expired
        if (isTokenExpired(token)) {
          console.log('Token expired on startup - clearing auth data');
          clearAuthData();
          setIsAuthenticated(false);
        } else {
          console.log('Valid token found - user is authenticated');
          setIsAuthenticated(true);
        }
      } else {
        console.log('No token found - user is not authenticated');
        setIsAuthenticated(false);
      }
      setAuthChecked(true);
    };
    
    checkAuth();
    
    // Listen for storage changes (e.g., login in another tab)
    const handleStorageChange = () => {
      checkAuth();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Show loading spinner while checking setup status or auth status
  if (isCheckingSetup || !authChecked) {
    return <LoadingSpinner message="Checking system setup..." />;
  }

  // Show error message if setup status check failed
  if (setupError) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        padding: '20px'
      }}>
        <h2>Connection Error</h2>
        <p>Unable to connect to the backend server.</p>
        <p>Error: {setupError}</p>
        <button 
          onClick={refetchSetupStatus}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <ConnectionStatus />
        <Routes>
          {/* Setup Route - only accessible if setup is not complete */}
          <Route 
            path="/setup" 
            element={
              isSetupCompleted ? 
                <Navigate to="/login" replace /> : 
                <Setup onSetupComplete={refetchSetupStatus} />
            } 
          />
          
          {/* Login Route - only accessible after setup is complete
          <Route 
            path="/login" 
            element={
              !isSetupComplete ? 
                <Navigate to="/setup" replace /> : 
                (isAuthenticated ? 
                  <Navigate to="/dashboard" replace /> : 
                  <Login setIsAuthenticated={setIsAuthenticated} />)
            } 
          /> */}

           {/* Login Route - accessible for testing */}
          <Route 
            path="/login" 
            element={
              isAuthenticated ? 
                <Navigate to="/dashboard" replace /> : 
                <Login setIsAuthenticated={setIsAuthenticated} />
            } 
          />


           {/* Forgot Password Route - accessible when setup is complete but not authenticated */}
          {/* <Route 
            path="/forgot-password" 
            element={
              !isSetupComplete ? 
                <Navigate to="/setup" replace /> : 
                (isAuthenticated ? 
                  <Navigate to="/dashboard" replace /> : 
                  <ForgotPassword />)
            } 
          /> */}

              {/* Forgot Password Route - accessible for testing */}
          <Route 
            path="/forgot-password" 
            element={
              isAuthenticated ? 
                <Navigate to="/dashboard" replace /> : 
                <ForgotPassword />
            } 
          />
          
          {/* Dashboard Route - accessible for testing */}
          <Route
            path="/dashboard"
            element={<Dashboard setIsAuthenticated={setIsAuthenticated} />}
          />
          
          {/* Clients Routes */}
          <Route
            path="/clients"
            element={<Clients />}
          />
          <Route
            path="/clients/add"
            element={<AddClient />}
          />
          <Route
            path="/clients/:id"
            element={<ClientDetails />}
          />
          <Route
            path="/clients/edit/:id"
            element={<EditClient />}
          />
          
          {/* Staff/Users Routes */}
          <Route
            path="/users/staff"
            element={<ViewStaff />}
          />
          <Route
            path="/users/staff/:id"
            element={<StaffDetails />}
          />
          <Route
            path="/users/staff/edit/:id"
            element={<EditStaff />}
          />
          <Route
            path="/users/add-staff"
            element={<AddStaff />}
          />
          
          {/* Loans Routes - accessible for testing */}
          <Route path="/loans" element={<Loans />} />
          <Route path="/loans/details/:id" element={<LoanDetails />} />
          <Route path="/loans/:loanId/tracking" element={<LoanTrackingDetail />} />

          {/* LoanDisk-style subpages */}
          <Route path="/loans/add" element={<AddLoan />} />
          <Route path="/loans/products" element={<LoanProducts />} />

          <Route path="/loans/due" element={<DueLoans />} />
          <Route path="/loans/missed" element={<MissedRepayments />} />
          <Route path="/loans/arrears" element={<ArrearsLoans />} />
          <Route path="/loans/no-repayments" element={<NoRepayments />} />
          <Route path="/loans/past-maturity" element={<PastMaturity />} />
          <Route path="/loans/principal-outstanding" element={<PrincipalOutstanding />} />
          <Route path="/loans/late-1m" element={<LateLoansOneMonth />} />
          <Route path="/loans/late-3m" element={<LateLoansThreeMonths />} />
          <Route path="/loans/calculator" element={<LoanCalculator />} />
          <Route path="/loans/guarantors" element={<Guarantors />} />
          <Route path="/loans/comments" element={<LoanComments />} />
          <Route path="/loans/approvals" element={<Approvals />} />

          {/* Existing */}
          <Route path="/loans/disbursement" element={<LoanRegistration />} />
          <Route path="/loans/disbursed" element={<DisbursedLoans />} />
          
          {/* Payments Routes - New Structure */}
          <Route path="/payments" element={<Navigate to="/payments/all" replace />} />
          <Route path="/payments/record" element={<RecordPayment />} />
          <Route path="/payments/all" element={<AllPayments />} />
          <Route path="/payments/late" element={<LatePayments />} />
          <Route path="/payments/upcoming" element={<UpcomingDue />} />
          <Route path="/payments/history" element={<PaymentHistory />} />
          <Route path="/payments/analytics" element={<PaymentAnalytics />} />
          {/* Legacy payments page (for backwards compatibility) */}
          <Route path="/payments/old" element={<Payments />} />
          
          {/* Expenses Routes */}
          <Route path="/expenses/record" element={<RecordExpense />} />
          <Route path="/expenses/all" element={<AllExpenses />} />
          <Route path="/expenses/:id" element={<ExpenseDetails />} />
          <Route path="/expenses/edit/:id" element={<EditExpense />} />
          
          {/* Finances Routes */}
          <Route
            path="/finances"
            element={<FinancialDashboard />}
          />
          
          {/* Default redirect - modified for testing */}
          <Route 
            path="/" 
            element={
              !isSetupCompleted ? 
                <Navigate to="/setup" replace /> : 
                <Navigate to="/dashboard" replace />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
