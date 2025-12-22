import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users,
  LogOut,
  RefreshCw,
  TrendingUp,
  PiggyBank,
  Banknote,
  Activity,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import './Dashboard.css';
import Sidebar from '../../components/Layout/Sidebar';
import  LogoutButton  from '../../components/LogOut';

// Import services
import DashboardService from '../../services/dashboardService';
import AuthService from '../../services/authService';
import { getUserInfoFromToken, getFirstNameFromToken } from '../../utils/jwtUtils';
import websocketService from '../../services/websocketService';

// Import chart components
import {
  LoansReleasedChart,
  LoanCollectionsChart,
  PastMaturityLoansChart,
  GenderDistributionChart,
  AverageLoanTenureCard
} from '../../components/Charts/DashboardCharts';

const Dashboard = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    // Main KPI data
    registeredBorrowers: 0,
    totalSavings: 0,
    totalLoansReleased: 0,
    totalCollections: 0,
    
    // Loan status data
    activeLoans: 0,
    overdueLoans: 0,
    defaultedLoans: 0,
    completedLoans: 0,
    totalLoans: 0,
    
    // Additional metrics
    averageLoanTenureDays: 0,
    maleBorrowers: 0,
    femaleBorrowers: 0,
    malePercentage: 50,
    femalePercentage: 50,
    
    // Chart data
    monthlyLoansReleased: [],
    monthlyCollections: [],
    monthlyPastMaturityLoans: [],
    
    // System state
    loading: true,
    error: null,
    lastUpdated: null
  });

  // Fetch complete dashboard data
  const fetchDashboardData = async () => {
    try {
      setDashboardData(prev => ({ ...prev, loading: true, error: null }));
      
      // Fetch complete dashboard statistics
      const dashboardStats = await DashboardService.getDashboardStatistics();
      
      setDashboardData({
        // Main KPIs
        registeredBorrowers: dashboardStats.registeredBorrowers || 0,
        totalSavings: dashboardStats.totalSavings || 0,
        totalLoansReleased: dashboardStats.totalLoansReleased || 0,
        totalCollections: dashboardStats.totalCollections || 0,
        
        // Loan status
        activeLoans: dashboardStats.activeLoans || 0,
        overdueLoans: dashboardStats.overdueLoans || 0,
        defaultedLoans: dashboardStats.defaultedLoans || 0,
        completedLoans: dashboardStats.completedLoans || 0,
        totalLoans: dashboardStats.totalLoans || 0,
        
        // Additional metrics
        averageLoanTenureDays: dashboardStats.averageLoanTenureDays || 0,
        maleBorrowers: dashboardStats.maleBorrowers || 0,
        femaleBorrowers: dashboardStats.femaleBorrowers || 0,
        malePercentage: dashboardStats.malePercentage || 50,
        femalePercentage: dashboardStats.femalePercentage || 50,
        
        // Chart data
        monthlyLoansReleased: dashboardStats.monthlyLoansReleased || [],
        monthlyCollections: dashboardStats.monthlyCollections || [],
        monthlyPastMaturityLoans: dashboardStats.monthlyPastMaturityLoans || [],
        
        // System state
        loading: false,
        error: null,
        lastUpdated: dashboardStats.dataLoadedAt || new Date().toISOString()
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setDashboardData(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to fetch dashboard data'
      }));
    }
  };

  // Get current user data from JWT token (no API call needed)
  const getCurrentUserFromToken = () => {
    try {
      const userInfo = getUserInfoFromToken();
      if (userInfo) {
        // Extract first name from token
        const firstName = getFirstNameFromToken();
        
        // Set user info with first name
        setUser({
          ...userInfo,
          firstName: firstName,
          displayName: firstName // Use first name for display
        });
      } else {
        console.warn('Unable to extract user info from token');
      }
    } catch (error) {
      console.error('Error extracting user info from token:', error);
    }
  };

  useEffect(() => {
    // Redirect to login if not authenticated
    const token = localStorage.getItem('tindigwa_token');
    if (!token) {
      // Clear auth state and redirect
      if (setIsAuthenticated) {
        setIsAuthenticated(false);
      }
      navigate('/login', { replace: true });
    } else {
      getCurrentUserFromToken();
      fetchDashboardData();
    }
  }, [navigate, setIsAuthenticated]);

  // Auto-refresh dashboard data every 60 seconds
  useEffect(() => {
    const token = localStorage.getItem('tindigwa_token');
    if (!token) return;

    // Set up polling interval (60 seconds)
    const pollInterval = setInterval(() => {
      if (!document.hidden) {
        // Only fetch if tab is visible
        console.log('Auto-refreshing dashboard data...');
        fetchDashboardData();
      }
    }, 60000); // 60 seconds

    // Handle visibility change - refresh when tab becomes active
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Tab became active, refreshing dashboard...');
        fetchDashboardData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      clearInterval(pollInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // WebSocket for real-time updates
  useEffect(() => {
    const token = localStorage.getItem('tindigwa_token');
    if (!token) return;

    // Connect to WebSocket
    websocketService.connect(
      () => {
        console.log('WebSocket connected successfully');
        
        // Subscribe to dashboard updates
        websocketService.subscribeToDashboardUpdates((message) => {
          if (message.type === 'DASHBOARD_UPDATE' && message.data) {
            console.log('Real-time dashboard update received');
            // Update dashboard with WebSocket data
            setDashboardData({
              ...message.data,
              loading: false,
              error: null
            });
          }
        });

        // Subscribe to dashboard events
        websocketService.subscribeToDashboardEvents((message) => {
          if (message.type === 'CACHE_INVALIDATED') {
            console.log('Cache invalidated, refreshing...');
            fetchDashboardData();
          }
        });
      },
      (error) => {
        console.error('WebSocket connection error:', error);
      }
    );

    // Cleanup
    return () => {
      websocketService.unsubscribeAll();
      websocketService.disconnect();
    };
  }, []);

  const handleLogout = () => {
    // Disconnect WebSocket before logout
    websocketService.unsubscribeAll();
    websocketService.disconnect();
    
    // Use AuthService to properly clear all authentication data
    AuthService.logout();
    
    // Update authentication state
    if (setIsAuthenticated) {
      setIsAuthenticated(false);
    }
    
    // Navigate to login with replace to prevent back button
    // navigate('login', { replace: true });
    // <Navigate to="/login" replace />
      window.location.href = '/login';

  };

  // Define KPI Cards (Top Row)
  const kpiCards = [
    {
      title: 'Registered Clients',
      value: dashboardData.loading ? 'Loading...' : dashboardData.registeredBorrowers.toLocaleString(),
      icon: Users,
      color: '#4285f4',
      bgColor: '#e8f4fd'
    },
    {
      title: 'Total Savings',
      value: dashboardData.loading ? 'Loading...' : DashboardService.formatCurrency(dashboardData.totalSavings),
      icon: PiggyBank,
      color: '#FFD700',
      bgColor: '#fff9e6'
    },
    {
      title: 'Total Loans Released',
      value: dashboardData.loading ? 'Loading...' : DashboardService.formatCurrency(dashboardData.totalLoansReleased),
      icon: TrendingUp,
      color: '#34a853',
      bgColor: '#e8f5e8'
    },
    {
      title: 'Total Collections',
      value: dashboardData.loading ? 'Loading...' : DashboardService.formatCurrency(dashboardData.totalCollections),
      icon: Banknote,
      color: '#ea4335',
      bgColor: '#fce8e6'
    }
  ];

  // Define Loan Status Cards (Second Row)
  const loanStatusCards = [
    {
      title: 'Active Loans',
      value: dashboardData.loading ? 'Loading...' : dashboardData.activeLoans.toLocaleString(),
      icon: Activity,
      color: '#34a853',
      bgColor: '#e8f5e8',
      description: 'Loans within duration period'
    },
    {
      title: 'Fully Paid Loans',
      value: dashboardData.loading ? 'Loading...' : dashboardData.completedLoans.toLocaleString(),
      icon: CheckCircle,
      color: '#4285f4',
      bgColor: '#e8f4fd',
      description: 'Successfully completed loans'
    },
    {
      title: 'Overdue Loans',
      value: dashboardData.loading ? 'Loading...' : dashboardData.overdueLoans.toLocaleString(),
      icon: Clock,
      color: '#FFD700',
      bgColor: '#fff9e6',
      description: 'Past due but within 6 months'
    },
    {
      title: 'Default Loans',
      value: dashboardData.loading ? 'Loading...' : dashboardData.defaultedLoans.toLocaleString(),
      icon: XCircle,
      color: '#ea4335',
      bgColor: '#fce8e6',
      description: 'Beyond 6 months past due'
    }
  ];

  // Auto-refresh functionality
  const handleRefresh = () => {
    fetchDashboardData();
  };

  // Format last updated time
  const formatLastUpdated = (dateString) => {
    if (!dateString) return '';
    return DashboardService.formatDate(dateString);
  };


  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-header">
          <div className="header-content">
            <div>
              <h1>Dashboard</h1>
              <p className="welcome-text">Welcome back, {user?.firstName || user?.displayName || 'User'}</p>
            </div>

            {/* <LogoutButton

  setIsAuthenticated={setIsAuthenticated}
/> */}
        
             <button className="logout-button" onClick={handleLogout}>
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>

        <div className="dashboard-content">
          {/* Header with refresh and last updated */}
          <div className="dashboard-stats-header">
            <div className="stats-info">
              <h2>Dashboard Statistics</h2>
              {dashboardData.lastUpdated && (
                <p className="last-updated">Last updated: {formatLastUpdated(dashboardData.lastUpdated)}</p>
              )}
            </div>
            <button 
              className="refresh-button" 
              onClick={handleRefresh} 
              disabled={dashboardData.loading}
            >
              <RefreshCw size={16} className={dashboardData.loading ? 'spinning' : ''} />
              Refresh
            </button>
          </div>

          {/* Error State */}
          {dashboardData.error && (
            <div className="error-message">
              <AlertTriangle size={16} />
              {dashboardData.error}
            </div>
          )}

          {/* Top KPI Cards */}
          <div className="kpi-cards">
            {kpiCards.map((card, index) => {
              const IconComponent = card.icon;
              return (
                <div key={index} className="kpi-card">
                  <div className="kpi-content">
                    <div className="kpi-info">
                      <h3>{card.title}</h3>
                      <div className="kpi-value">{card.value}</div>
                    </div>
                    <div className="kpi-icon" style={{ backgroundColor: card.bgColor, color: card.color }}>
                      <IconComponent size={24} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Loan Status Cards */}
          <div className="loan-status-cards">
            {loanStatusCards.map((card, index) => {
              const IconComponent = card.icon;
              return (
                <div key={index} className="status-card">
                  <div className="status-content">
                    <div className="status-info">
                      <h3>{card.title}</h3>
                      <div className="status-value">{card.value}</div>
                      <p className="status-description">{card.description}</p>
                    </div>
                    <div className="status-icon" style={{ backgroundColor: card.bgColor, color: card.color }}>
                      <IconComponent size={20} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Charts Section */}
          <div className="charts-grid">
            <LoansReleasedChart data={dashboardData.monthlyLoansReleased} />
            <LoanCollectionsChart data={dashboardData.monthlyCollections} />
            <PastMaturityLoansChart data={dashboardData.monthlyPastMaturityLoans} />
            <GenderDistributionChart 
              maleCount={dashboardData.maleBorrowers}
              femaleCount={dashboardData.femaleBorrowers}
              malePercentage={dashboardData.malePercentage}
              femalePercentage={dashboardData.femalePercentage}
            />
          </div>

          {/* Average Loan Tenure Card */}
          <div className="tenure-section">
            <AverageLoanTenureCard averageDays={dashboardData.averageLoanTenureDays} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
