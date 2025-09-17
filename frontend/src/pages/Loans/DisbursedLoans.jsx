import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Filter, Eye, Edit, Trash2, Plus } from 'lucide-react';
import './DisbursedLoans.css';

const DisbursedLoans = () => {
  const navigate = useNavigate();
  const [loans, setLoans] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Calculate loan status based on start date, duration, and grace period
  const calculateLoanStatus = (startDate, durationDays, amountPaid = 0, totalAmount = 1000) => {
    const today = new Date();
    const loanStartDate = new Date(startDate);
    const daysSinceStart = Math.floor((today - loanStartDate) / (1000 * 60 * 60 * 24));
    
    const gracePeriodDays = 14;
    const defaultPeriodMonths = 6;
    const defaultPeriodDays = defaultPeriodMonths * 30;
    
    // If loan is fully paid
    if (amountPaid >= totalAmount) {
      return { status: 'completed', color: '#28a745', bgColor: '#d4edda' };
    }
    
    // If within loan duration
    if (daysSinceStart <= durationDays) {
      return { status: 'in progress', color: '#007bff', bgColor: '#d1ecf1' };
    }
    
    // If beyond loan duration but within grace period
    if (daysSinceStart <= (durationDays + gracePeriodDays)) {
      return { status: 'overdue', color: '#ffc107', bgColor: '#fff3cd' };
    }
    
    // If beyond grace period but less than 6 months
    if (daysSinceStart <= (durationDays + defaultPeriodDays)) {
      return { status: 'overdue', color: '#fd7e14', bgColor: '#fee2d5' };
    }
    
    // If beyond 6 months
    return { status: 'defaulted', color: '#dc3545', bgColor: '#f8d7da' };
  };

  // Sample data - in a real app, this would come from an API
  useEffect(() => {
    const sampleLoans = [
      {
        id: 'LN001',
        clientId: 'CL001',
        clientName: 'John Doe',
        branch: 'Main Branch - Kampala',
        amount: 500000,
        duration: 90,
        frequency: 'Weekly',
        interestRate: 15.5,
        startDate: '2024-06-01',
        officer: 'Sarah Johnson',
        amountPaid: 520000,
        totalAmount: 520000
      },
      {
        id: 'LN002',
        clientId: 'CL002',
        clientName: 'Mary Smith',
        branch: 'Entebbe Branch',
        amount: 300000,
        duration: 60,
        frequency: 'Monthly',
        interestRate: 12.0,
        startDate: '2024-07-15',
        officer: 'James Wilson',
        amountPaid: 150000,
        totalAmount: 336000
      },
      {
        id: 'LN003',
        clientId: 'CL003',
        clientName: 'Peter Mukasa',
        branch: 'Jinja Branch',
        amount: 750000,
        duration: 120,
        frequency: 'Bi-weekly',
        interestRate: 18.0,
        startDate: '2024-02-01',
        officer: 'Grace Nakato',
        amountPaid: 200000,
        totalAmount: 885000
      },
      {
        id: 'LN004',
        clientId: 'CL004',
        clientName: 'Alice Nambi',
        branch: 'Mbarara Branch',
        amount: 200000,
        duration: 45,
        frequency: 'Weekly',
        interestRate: 20.0,
        startDate: '2023-12-01',
        officer: 'Robert Kasozi',
        amountPaid: 50000,
        totalAmount: 240000
      },
      {
        id: 'LN005',
        clientId: 'CL005',
        clientName: 'David Okello',
        branch: 'Gulu Branch',
        amount: 400000,
        duration: 75,
        frequency: 'Monthly',
        interestRate: 16.0,
        startDate: '2024-08-01',
        officer: 'Christine Auma',
        amountPaid: 100000,
        totalAmount: 464000
      }
    ];
    setLoans(sampleLoans);
  }, []);

  // Filter loans based on search term and status
  const filteredLoans = loans.filter(loan => {
    const matchesSearch = 
      loan.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.clientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    
    const loanStatus = calculateLoanStatus(loan.startDate, loan.duration, loan.amountPaid, loan.totalAmount);
    return matchesSearch && loanStatus.status === statusFilter;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  return (
    <div className="disbursed-loans-layout">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2>TINDIGWA</h2>
        </div>
        
        <nav className="sidebar-nav">
          <button className="nav-item" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={20} />
            <span>Back to Dashboard</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="disbursed-loans-main">
        <div className="disbursed-loans-header">
          <div className="header-content">
            <div>
              <h1>Disbursed Loans</h1>
              <p className="subtitle">Monitor and manage all disbursed loans</p>
            </div>
            <button 
              className="new-loan-button"
              onClick={() => navigate('/loans/disbursement')}
            >
              <Plus size={16} />
              Register New Loan
            </button>
          </div>
        </div>

        <div className="disbursed-loans-content">
          {/* Filters and Search */}
          <div className="loans-controls">
            <div className="search-box">
              <Search size={20} className="search-icon" />
              <input
                type="text"
                placeholder="Search by client name, ID, or loan ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="filter-controls">
              <Filter size={20} className="filter-icon" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="status-filter"
              >
                <option value="all">All Status</option>
                <option value="in progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
                <option value="defaulted">Defaulted</option>
              </select>
            </div>
          </div>

          {/* Loans Table */}
          <div className="loans-table-container">
            <table className="loans-table">
              <thead>
                <tr>
                  <th>Loan ID</th>
                  <th>Client</th>
                  <th>Branch</th>
                  <th>Amount</th>
                  <th>Duration</th>
                  <th>Start Date</th>
                  <th>Officer</th>
                  <th>Progress</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLoans.map((loan) => {
                  const statusInfo = calculateLoanStatus(
                    loan.startDate, 
                    loan.duration, 
                    loan.amountPaid, 
                    loan.totalAmount
                  );
                  const paymentProgress = ((loan.amountPaid / loan.totalAmount) * 100).toFixed(1);

                  return (
                    <tr key={loan.id} className="loan-row">
                      <td className="loan-id">{loan.id}</td>
                      <td>
                        <div className="client-info">
                          <div className="client-name">{loan.clientName}</div>
                          <div className="client-id">{loan.clientId}</div>
                        </div>
                      </td>
                      <td>{loan.branch}</td>
                      <td>
                        <div className="amount-info">
                          <div className="amount">{formatCurrency(loan.amount)}</div>
                          <div className="total-amount">Total: {formatCurrency(loan.totalAmount)}</div>
                        </div>
                      </td>
                      <td>{loan.duration} days</td>
                      <td>{formatDate(loan.startDate)}</td>
                      <td>{loan.officer}</td>
                      <td>
                        <div className="progress-container">
                          <div className="progress-bar">
                            <div 
                              className="progress-fill" 
                              style={{ width: `${paymentProgress}%` }}
                            ></div>
                          </div>
                          <span className="progress-text">{paymentProgress}%</span>
                        </div>
                      </td>
                      <td>
                        <span 
                          className="status-badge"
                          style={{ 
                            color: statusInfo.color, 
                            backgroundColor: statusInfo.bgColor 
                          }}
                        >
                          {statusInfo.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="action-btn view-btn" title="View Details">
                            <Eye size={16} />
                          </button>
                          <button className="action-btn edit-btn" title="Edit Loan">
                            <Edit size={16} />
                          </button>
                          <button className="action-btn delete-btn" title="Delete Loan">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Summary Statistics */}
          <div className="loans-summary">
            <div className="summary-stats">
              <div className="stat-card">
                <h3>Total Loans</h3>
                <div className="stat-value">{loans.length}</div>
              </div>
              <div className="stat-card">
                <h3>Active Loans</h3>
                <div className="stat-value">
                  {loans.filter(loan => {
                    const status = calculateLoanStatus(loan.startDate, loan.duration, loan.amountPaid, loan.totalAmount);
                    return status.status === 'in progress';
                  }).length}
                </div>
              </div>
              <div className="stat-card">
                <h3>Overdue Loans</h3>
                <div className="stat-value">
                  {loans.filter(loan => {
                    const status = calculateLoanStatus(loan.startDate, loan.duration, loan.amountPaid, loan.totalAmount);
                    return status.status === 'overdue';
                  }).length}
                </div>
              </div>
              <div className="stat-card">
                <h3>Defaulted Loans</h3>
                <div className="stat-value">
                  {loans.filter(loan => {
                    const status = calculateLoanStatus(loan.startDate, loan.duration, loan.amountPaid, loan.totalAmount);
                    return status.status === 'defaulted';
                  }).length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DisbursedLoans;
