import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Layout Components
// import Layout from './components/Layout/Layout';

// Authentication Pages
import Setup from './pages/Auth/Setup';
import Login from './pages/Auth/Login';
import ForgotPassword from './pages/Auth/ForgotPassword';

// Dashboard
import Dashboard from './pages/Dashboard/Dashboard';

// Clients
import Clients from './pages/Clients/Clients';
import AddClient from './pages/Clients/AddClient';
import ClientDetails from './pages/Clients/ClientDetails';

// Loans
import LoanRegistration from './pages/Loans/LoanRegistration';
import DisbursedLoans from './pages/Loans/DisbursedLoans';
import Loans from './pages/Loans/Loans';
import LoanDetails from './pages/Loans/LoanDetails';

// Finances
import FinancialDashboard from './pages/Finances/FinancialDashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSetupComplete, setIsSetupComplete] = useState(false);

  // Check authentication and setup status
  useEffect(() => {
    const token = localStorage.getItem('tindigwa_token');
    const setupComplete = localStorage.getItem('tindigwa_setup_complete');
    
    setIsAuthenticated(!!token);
    setIsSetupComplete(!!setupComplete);
  }, []);

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Setup Route - only accessible if setup is not complete */}
          <Route 
            path="/setup" 
            element={
              isSetupComplete ? 
                <Navigate to="/login" replace /> : 
                <Setup />
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
          
          {/* Loans Routes */}
          <Route
            path="/loans"
            element={<Loans />}
          />
          <Route
            path="/loans/details/:id"
            element={<LoanDetails />}
          />
          <Route
            path="/loans/disbursement"
            element={<LoanRegistration />}
          />
          <Route
            path="/loans/disbursed"
            element={<DisbursedLoans />}
          />
          
          {/* Finances Routes */}
          <Route
            path="/finances"
            element={<FinancialDashboard />}
          />
          
          {/* Default redirect */}
          <Route 
            path="/" 
            element={
              !isSetupComplete ? 
                <Navigate to="/setup" replace /> : 
                (isAuthenticated ? 
                  <Navigate to="/dashboard" replace /> : 
                  <Navigate to="/login" replace />)
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
