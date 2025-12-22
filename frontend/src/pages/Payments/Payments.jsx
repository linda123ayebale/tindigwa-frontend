import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign,
  TrendingUp,
  Receipt
} from 'lucide-react';
import './Payments.css';
import Toast from '../../components/Toast';
import Sidebar from '../../components/Layout/Sidebar';
import PaymentsTab from './components/PaymentsTab';
import ExpensesTab from './components/ExpensesTab';
import SummaryTab from './components/SummaryTab';

const Payments = () => {
  const navigate = useNavigate();
  
  // State management
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [loans, setLoans] = useState([]);
  const [activeTab, setActiveTab] = useState('payments');

  // Load loans on component mount
  useEffect(() => {
    fetchLoans();
  }, []);

  // Fetch loans data
  const fetchLoans = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/loans/table-view`);
      if (response.ok) {
        const loansData = await response.json();
        setLoans(loansData);
        console.log('Fetched loans:', loansData.length);
        return loansData;
      }
      return [];
    } catch (error) {
      console.error('Error fetching loans:', error);
      return [];
    }
  };

  // Show toast notification
  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 4000);
  };

  // Tab configuration
  const tabs = [
    { id: 'payments', label: 'Loan Payments', icon: DollarSign },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'summary', label: 'Summary', icon: TrendingUp }
  ];



  const renderTabContent = () => {
    switch (activeTab) {
      case 'payments':
        return <PaymentsTab loans={loans} showToast={showToast} />;
      case 'expenses':
        return <ExpensesTab showToast={showToast} />;
      case 'summary':
        return <SummaryTab loans={loans} showToast={showToast} />;
      default:
        return <PaymentsTab loans={loans} showToast={showToast} />;
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="payments-container">
          <div className="page-header">
            <div className="header-content">
              <h1>Financial Management</h1>
              <p className="page-description">Manage payments, expenses, and financial overview</p>
            </div>
            <div className="header-actions">
              <button 
                className="add-client-btn"
                onClick={() => navigate('/loans')}
                style={{ marginRight: '10px' }}
              >
                ← Back to Loans
              </button>
            </div>
          </div>

          {toast.show && (
            <Toast 
              message={toast.message} 
              type={toast.type} 
              onClose={() => setToast({ show: false, message: '', type: '' })} 
            />
          )}

          {/* Tab Navigation */}
          <div className="tab-navigation">
            {tabs.map(tab => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <IconComponent size={18} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {renderTabContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Payments;