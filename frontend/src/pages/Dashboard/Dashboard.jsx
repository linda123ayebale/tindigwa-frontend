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

const Dashboard = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('tindigwa_user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
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

  const summaryCards = [
    {
      title: 'Total Clients',
      value: '120',
      icon: Users,
      color: '#e8f4fd'
    },
    {
      title: 'Active Loans', 
      value: '85',
      icon: CreditCard,
      color: '#e8f4fd'
    },
    {
      title: 'Outstanding Balance',
      value: '$500,000',
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
