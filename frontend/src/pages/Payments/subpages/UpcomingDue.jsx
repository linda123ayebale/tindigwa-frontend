import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  Plus,
  Clock,
  Search,
  Bell,
  Calendar
} from 'lucide-react';
import api from '../../../services/api';
import Sidebar from '../../../components/Layout/Sidebar';
import './UpcomingDue.css';

const UpcomingDue = () => {
  const navigate = useNavigate();
  const [upcomingPayments, setUpcomingPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDays, setFilterDays] = useState(7); // Default to 7 days

  useEffect(() => {
    fetchUpcomingPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterDays]);

  const fetchUpcomingPayments = async () => {
    setLoading(true);
    try {
      // Calculate date range
      const today = new Date();
      const endDate = new Date();
      endDate.setDate(today.getDate() + filterDays);

      const startDateStr = today.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      // Fetch loans due in this range
      const response = await api.get(`/loan-tracking/due?startDate=${startDateStr}&endDate=${endDateStr}`);
      const dueLoans = Array.isArray(response) ? response : [];
      
      // Fetch loan details for each
      const loansWithDetails = await Promise.all(
        dueLoans.map(async (loan) => {
          try {
            const loanDetails = await api.get(`/loans/${loan.loanId}`);
            return {
              ...loan,
              loanNumber: loanDetails.loanNumber || `LN-${loan.loanId}`,
              clientName: loanDetails.clientName || 'Unknown Client',
              clientPhone: loanDetails.clientPhone,
              clientEmail: loanDetails.clientEmail,
              balance: loan.outstandingBalance
            };
          } catch (error) {
            console.error(`Error fetching details for loan ${loan.loanId}:`, error);
            return {
              ...loan,
              loanNumber: `LN-${loan.loanId}`,
              clientName: 'Unknown Client',
              balance: loan.outstandingBalance
            };
          }
        })
      );

      setUpcomingPayments(loansWithDetails);
    } catch (error) {
      console.error('Error fetching upcoming payments:', error);
      setUpcomingPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = upcomingPayments.filter(payment => 
    searchTerm === '' ||
    payment.loanNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.loanId?.toString().includes(searchTerm)
  );

  const formatCurrency = (amount) => {
    return `UGX ${Number(amount || 0).toLocaleString()}`;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getDaysUntilDue = (dueDate) => {
    if (!dueDate) return 0;
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 ? diffDays : 0;
  };

  const getUrgencyClass = (days) => {
    if (days <= 3) return 'urgent';
    if (days <= 7) return 'soon';
    if (days <= 14) return 'medium';
    return 'normal';
  };

  const getTotalDueAmount = () => {
    return filteredPayments.reduce((sum, p) => sum + parseFloat(p.expectedPaymentAmount || 0), 0);
  };


  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="upcoming-due-page">
          {/* Page Header */}
          <div className="page-header">
            <div className="header-content">
              <div className="title-with-icon">
                <h1>Upcoming Due Payments</h1>
                <Bell size={24} className="bell-icon" />
              </div>
              <p className="page-description">Monitor payments due in the coming days</p>
            </div>
            <button className="btn-primary" onClick={() => navigate('/payments/record')}>
              <Plus size={16} />
              Record Payment
            </button>
          </div>

          {/* Summary Cards */}
          <div className="summary-cards">
            <div className="summary-card blue">
              <div className="card-icon">
                <Clock size={24} />
              </div>
              <div className="card-content">
                <p className="card-label">Total Due Soon</p>
                <h3 className="card-value">{filteredPayments.length}</h3>
              </div>
            </div>

            <div className="summary-card green">
              <div className="card-icon">
                <DollarSign size={24} />
              </div>
              <div className="card-content">
                <p className="card-label">Expected Amount</p>
                <h3 className="card-value">{formatCurrency(getTotalDueAmount())}</h3>
              </div>
            </div>

            <div className="summary-card orange">
              <div className="card-icon">
                <Bell size={24} />
              </div>
              <div className="card-content">
                <p className="card-label">Due This Week</p>
                <h3 className="card-value">
                  {filteredPayments.filter(p => getDaysUntilDue(p.nextPaymentDueDate) <= 7).length}
                </h3>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="filter-bar">
            <div className="search-wrapper">
              <Search size={20} className="search-icon" />
              <input
                type="text"
                placeholder="Search by loan number or client name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="date-filter">
              <label>Show payments due in next:</label>
              <select 
                value={filterDays} 
                onChange={(e) => setFilterDays(Number(e.target.value))}
                className="filter-select"
              >
                <option value={7}>7 Days</option>
                <option value={14}>14 Days</option>
                <option value={30}>30 Days</option>
                <option value={60}>60 Days</option>
                <option value={90}>90 Days</option>
              </select>
            </div>
          </div>

          {/* Upcoming Payments Table */}
          <div className="table-container">
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading upcoming payments...</p>
              </div>
            ) : filteredPayments.length === 0 ? (
              <div className="empty-state">
                <Clock size={48} className="empty-icon" />
                <h3>No Upcoming Payments</h3>
                <p>No payments due in the selected time period</p>
              </div>
            ) : (
              <table className="upcoming-table">
                <thead>
                  <tr>
                    <th>Loan</th>
                    <th>Client</th>
                    <th>Due Date</th>
                    <th>Days Until Due</th>
                    <th>Expected Amount</th>
                    <th>Outstanding Balance</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((payment) => {
                    const daysUntil = getDaysUntilDue(payment.nextPaymentDueDate);
                    return (
                      <tr key={payment.loanId}>
                        <td>
                          <button 
                            className="loan-link"
                            onClick={() => navigate(`/loans/${payment.loanId}`)}
                          >
                            {payment.loanNumber || `LN-${payment.loanId}`}
                          </button>
                        </td>
                        <td>
                          <div className="client-info">
                            <span className="client-name">{payment.clientName || 'Unknown'}</span>
                          </div>
                        </td>
                        <td>
                          <div className="date-info">
                            <Calendar size={14} className="date-icon" />
                            {formatDate(payment.nextPaymentDueDate)}
                          </div>
                        </td>
                        <td>
                          <span className={`urgency-badge ${getUrgencyClass(daysUntil)}`}>
                            {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}
                          </span>
                        </td>
                        <td className="amount-column">
                          <span className="amount">{formatCurrency(payment.expectedPaymentAmount)}</span>
                        </td>
                        <td className="amount-column">
                          <span className="balance">{formatCurrency(payment.outstandingBalance)}</span>
                        </td>
                        <td>
                          <button
                            className="btn-action record"
                            onClick={() => navigate('/payments/record', { state: { loanId: payment.loanId } })}
                          >
                            <DollarSign size={16} />
                            Record Payment
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer Info */}
          {filteredPayments.length > 0 && (
            <div className="table-footer">
              <div className="info-section">
                <div className="urgency-legend">
                  <span className="legend-title">Urgency Levels:</span>
                  <span className="legend-item urgent">0-3 days</span>
                  <span className="legend-item soon">4-7 days</span>
                  <span className="legend-item medium">8-14 days</span>
                  <span className="legend-item normal">15+ days</span>
                </div>
              </div>
              <div className="summary-section">
                <p><strong>Expected Total:</strong> {formatCurrency(getTotalDueAmount())}</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UpcomingDue;
