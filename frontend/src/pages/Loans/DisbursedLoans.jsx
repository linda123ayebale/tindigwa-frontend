import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Eye, Edit, Trash2, Plus, DollarSign, BarChart3 } from 'lucide-react';
import LoanService from '../../services/LoanService';
import '../../styles/actions.css';
import './DisbursedLoans.css';
import AppLayout from '../../components/Layout/AppLayout';

const DisbursedLoans = () => {
  const navigate = useNavigate();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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

  // Fetch disbursed loans from API
  const fetchLoans = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔄 Fetching disbursed loans from backend...');
      // Fetch approved loans - these are the disbursed/active loans
      const response = await LoanService.getApproved();
      console.log('✅ Fetched', response.length, 'disbursed loans from backend');
      
      // Transform backend data to match component expectations
      const transformedLoans = response.map(loan => ({
        id: loan.loanNumber || loan.id,
        clientId: loan.clientId,
        clientName: loan.clientName || 'Unknown Client',
        branch: loan.lendingBranch || 'N/A',
        amount: loan.principalAmount || 0,
        duration: calculateDurationInDays(loan.loanDuration, loan.durationUnit),
        frequency: loan.repaymentFrequency || 'N/A',
        interestRate: loan.interestRate || 0,
        startDate: loan.releaseDate || loan.disbursedAt || loan.createdAt,
        officer: loan.loanOfficerName || 'N/A',
        amountPaid: 0, // TODO: Calculate from payments
        totalAmount: loan.totalPayable || 0,
        workflowStatus: loan.workflowStatus
      }));
      
      setLoans(transformedLoans);
    } catch (error) {
      console.error('❌ Error fetching loans:', error);
      setError(error.message);
      setLoans([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to convert loan duration to days
  const calculateDurationInDays = (duration, unit) => {
    if (!duration || !unit) return 0;
    
    const durationNum = parseInt(duration);
    switch (unit.toUpperCase()) {
      case 'DAYS':
        return durationNum;
      case 'WEEKS':
        return durationNum * 7;
      case 'MONTHS':
        return durationNum * 30;
      case 'YEARS':
        return durationNum * 365;
      default:
        return durationNum;
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  // Filter loans based on search term and status
  const filteredLoans = loans.filter(loan => {
    const matchesSearch = 
      loan.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.clientId?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.id?.toString().toLowerCase().includes(searchTerm.toLowerCase());
    
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
    <AppLayout>
      <div className="disbursed-loans-layout">
        <main className="disbursed-loans-main">
        <div className="disbursed-loans-header">
          <div className="header-content">
            <div>
              <h1>Disbursed Loans</h1>
              <p className="subtitle">Monitor and manage all disbursed loans</p>
            </div>
            <button 
              className="new-loan-button"
              onClick={() => navigate('/loans/add')}
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
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div>Loading disbursed loans...</div>
              </div>
            ) : error ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#dc3545' }}>
                <div>Error: {error}</div>
                <button 
                  onClick={fetchLoans}
                  style={{ marginTop: '10px', padding: '8px 16px', cursor: 'pointer' }}
                >
                  Retry
                </button>
              </div>
            ) : filteredLoans.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div>No disbursed loans found</div>
                {searchTerm && <div style={{ marginTop: '10px' }}>Try adjusting your search criteria</div>}
              </div>
            ) : (
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
                      <td className="actions-cell">
                        <div className="actions-group">
                          {/* View Details - Always visible */}
                          <button 
                            className="action-btn view" 
                            title="View Details"
                            onClick={() => navigate(`/loans/details/${loan.id}`)}
                          >
                            <Eye size={16} />
                          </button>
                          
                          {/* View Payment Tracking - Always visible */}
                          <button 
                            className="action-btn tracking" 
                            title="View Payment Tracking"
                            onClick={() => navigate(`/loans/tracking/${loan.id}`)}
                          >
                            <BarChart3 size={16} />
                          </button>
                          
                          {/* Edit & Delete - Only when loanStatus === 'OPEN' */}
                          {loan.loanStatus?.toUpperCase() === 'OPEN' && (
                            <>
                              <button 
                                className="action-btn edit" 
                                title="Edit Loan"
                                onClick={() => navigate(`/loans/edit/${loan.id}`)}
                              >
                                <Edit size={16} />
                              </button>
                              <button 
                                className="action-btn delete" 
                                title="Delete Loan"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                          
                          {/* Add Payment - Only for disbursed loans with balance */}
                          {loan.workflowStatus?.toUpperCase() === 'DISBURSED' && loan.amountPaid < loan.totalAmount && (
                            <button 
                              className="action-btn payment" 
                              title="Add Payment"
                            >
                              <DollarSign size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            )}
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
    </AppLayout>
  );
};

export default DisbursedLoans;
