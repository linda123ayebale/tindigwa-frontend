import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, 
  Users, 
  CreditCard, 
  DollarSign, 
  FileText, 
  Settings,
  Plus,
  Send,
  UserPlus,
  Coins,
  CreditCard as PaymentIcon,
  BarChart3,
  LogOut
} from 'lucide-react';
import './Dashboard.css';

// Import services
import ClientService from '../../services/clientService';
import LoanService from '../../services/loanService';
import PaymentService from '../../services/paymentService';

const Dashboard = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    totalClients: 0,
    activeLoans: 0,
    outstandingBalance: 0,
    loading: true,
    error: null
  });

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setDashboardData(prev => ({ ...prev, loading: true, error: null }));
      
      // Fetch all required data in parallel
      const [clientsResponse, loansResponse, paymentsResponse] = await Promise.all([
        ClientService.getAllClients(),
        LoanService.getAllLoans(),
        PaymentService.getAllPayments()
      ]);

      const clients = clientsResponse || [];
      const loans = loansResponse || [];
      const payments = paymentsResponse || [];

      // Calculate active loans (loans that are not fully paid)
      const activeLoans = loans.filter(loan => {
        const totalPaid = payments
          .filter(payment => payment.loanId === loan.id)
          .reduce((sum, payment) => sum + payment.amount, 0);
        return totalPaid < loan.totalPayable;
      });

      // Calculate outstanding balance
      const outstandingBalance = loans.reduce((total, loan) => {
        const totalPaid = payments
          .filter(payment => payment.loanId === loan.id)
          .reduce((sum, payment) => sum + payment.amount, 0);
        return total + (loan.totalPayable - totalPaid);
      }, 0);

      setDashboardData({
        totalClients: clients.length,
        activeLoans: activeLoans.length,
        outstandingBalance: Math.max(0, outstandingBalance),
        loading: false,
        error: null
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

  useEffect(() => {
    const userData = localStorage.getItem('tindigwa_user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    // Fetch dashboard data on component mount
    fetchDashboardData();
  }, []);

  const handleLogout = () => {
    // Clear all session data
    localStorage.removeItem('tindigwa_token');
    localStorage.removeItem('tindigwa_user');
    localStorage.removeItem('tindigwa_setup_complete');
    
    // Update authentication state
    if (setIsAuthenticated) {
      setIsAuthenticated(false);
    }
    
    // Navigate to login
    navigate('/login');
  };

  // Format currency helper
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const summaryCards = [
    {
      title: 'Total Clients',
      value: dashboardData.loading ? 'Loading...' : dashboardData.totalClients.toString(),
      icon: Users,
      color: '#e8f4fd'
    },
    {
      title: 'Active Loans', 
      value: dashboardData.loading ? 'Loading...' : dashboardData.activeLoans.toString(),
      icon: CreditCard,
      color: '#e8f4fd'
    },
    {
      title: 'Outstanding Balance',
      value: dashboardData.loading ? 'Loading...' : formatCurrency(dashboardData.outstandingBalance),
      icon: DollarSign,
      color: '#e8f4fd'
    }
  ];

  const quickActions = [
    {
      title: 'Add New Client',
      action: () => navigate('/clients/add'),
      primary: true
    },
    {
      title: 'Disburse Loan',
      action: () => navigate('/loans/disbursement'),
      primary: false
    }
  ];

  const systemSetupItems = [
    {
      title: 'Manage Users',
      icon: UserPlus,
      action: () => navigate('/settings/staff')
    },
    {
      title: 'Loan Products',
      icon: Coins,
      action: () => navigate('/settings/loan-products')
    },
    {
      title: 'Payment Methods',
      icon: PaymentIcon,
      action: () => navigate('/settings/payment-methods')
    },
    {
      title: 'Reports Configuration',
      icon: BarChart3,
      action: () => navigate('/settings/reports')
    }
  ];

  const sidebarItems = [
    { title: 'Dashboard', icon: Home, path: '/dashboard', active: true },
    { title: 'Clients', icon: Users, path: '/clients' },
    { title: 'Loans', icon: CreditCard, path: '/loans' },
    { title: 'Payments', icon: DollarSign, path: '/payments' },
    { title: 'Finances', icon: BarChart3, path: '/finances' },
    { title: 'Reports', icon: FileText, path: '/reports' },
    { title: 'Settings', icon: Settings, path: '/settings' }
  ];

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2>TINDIGWA</h2>
        </div>
        
        <nav className="sidebar-nav">
          {sidebarItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <button
                key={index}
                className={`nav-item ${item.active ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
              >
                <IconComponent size={20} />
                <span>{item.title}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-header">
          <div className="header-content">
            <div>
              <h1>Dashboard</h1>
              <p className="welcome-text">Welcome back, {user?.name || 'Alex'}</p>
            </div>
            <button className="logout-button" onClick={handleLogout}>
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>

        <div className="dashboard-content">
          {/* Summary Cards */}
          <div className="summary-cards">
            {summaryCards.map((card, index) => {
              const IconComponent = card.icon;
              return (
                <div key={index} className="summary-card">
                  <div className="card-content">
                    <div className="card-info">
                      <h3>{card.title}</h3>
                      <div className="card-value">{card.value}</div>
                    </div>
                    <div className="card-icon" style={{ backgroundColor: card.color }}>
                      <IconComponent size={24} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="quick-actions-section">
            <h2>Quick Actions</h2>
            <div className="quick-actions">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  className={`action-button ${action.primary ? 'primary' : 'secondary'}`}
                  onClick={action.action}
                >
                  {action.primary && <Plus size={16} />}
                  {!action.primary && <Send size={16} />}
                  {action.title}
                </button>
              ))}
            </div>
          </div>

          {/* System Setup */}
          <div className="system-setup-section">
            <h2>System Setup</h2>
            <div className="setup-grid">
              {systemSetupItems.map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={index}
                    className="setup-card"
                    onClick={item.action}
                  >
                    <div className="setup-icon">
                      <IconComponent size={24} />
                    </div>
                    <span>{item.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
