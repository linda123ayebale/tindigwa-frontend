import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  Plus,
  AlertCircle,
  Clock,
  Search,
  Phone,
  Mail,
  Calendar
} from 'lucide-react';
import api from '../../../services/api';
import Sidebar from '../../../components/Layout/Sidebar';
import './LatePayments.css';

const LatePayments = () => {
  const navigate = useNavigate();
  const [latePayments, setLatePayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLatePayments();
  }, []);

  const fetchLatePayments = async () => {
    setLoading(true);
    try {
      // Fetch late loans from the loan tracking API
      const response = await api.get('/loan-tracking/late');
      const lateLoans = Array.isArray(response) ? response : [];
      
      // Fetch client details for each loan
      const loansWithDetails = await Promise.all(
        lateLoans.map(async (loan) => {
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

      setLatePayments(loansWithDetails);
    } catch (error) {
      console.error('Error fetching late payments:', error);
      setLatePayments([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = latePayments.filter(payment => 
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

  const getDaysOverdue = (loan) => {
    // Use daysLate from the API if available
    return loan.daysLate || 0;
  };

  const getOverdueClass = (days) => {
    if (days > 60) return 'critical';
    if (days > 30) return 'high';
    if (days > 14) return 'medium';
    return 'low';
  };

  const getTotalOverdueAmount = () => {
    return filteredPayments.reduce((sum, p) => sum + parseFloat(p.balance || 0), 0);
  };


  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="late-payments-page">
          {/* Page Header */}
          <div className="page-header">
            <div className="header-content">
              <div className="title-with-badge">
                <h1>Late Payments</h1>
                <span className="alert-badge">{filteredPayments.length}</span>
              </div>
              <p className="page-description">Monitor and manage overdue loan payments</p>
            </div>
            <button className="btn-primary" onClick={() => navigate('/payments/record')}>
              <Plus size={16} />
              Record Payment
            </button>
          </div>

          {/* Summary Cards */}
          <div className="summary-cards">
            <div className="summary-card danger">
              <div className="card-icon">
                <AlertCircle size={24} />
              </div>
              <div className="card-content">
                <p className="card-label">Overdue Loans</p>
                <h3 className="card-value">{filteredPayments.length}</h3>
              </div>
            </div>

            <div className="summary-card warning">
              <div className="card-icon">
                <DollarSign size={24} />
              </div>
              <div className="card-content">
                <p className="card-label">Total Overdue</p>
                <h3 className="card-value">{formatCurrency(getTotalOverdueAmount())}</h3>
              </div>
            </div>

            <div className="summary-card critical">
              <div className="card-icon">
                <Clock size={24} />
              </div>
              <div className="card-content">
                <p className="card-label">Critical (60+ days)</p>
                <h3 className="card-value">
                  {filteredPayments.filter(p => getDaysOverdue(p) > 60).length}
                </h3>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="search-bar">
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
          </div>

          {/* Late Payments Table */}
          <div className="table-container">
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading late payments...</p>
              </div>
            ) : filteredPayments.length === 0 ? (
              <div className="empty-state success">
                <AlertCircle size={48} className="empty-icon" />
                <h3>No Late Payments</h3>
                <p>Great! All loans are up to date with their payment schedules.</p>
              </div>
            ) : (
              <table className="late-payments-table">
                <thead>
                  <tr>
                    <th>Loan</th>
                    <th>Client</th>
                    <th>Due Date</th>
                    <th>Days Overdue</th>
                    <th>Outstanding Balance</th>
                    <th>Contact</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((payment) => {
                    const daysOverdue = getDaysOverdue(payment);
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
                          <span className={`overdue-badge ${getOverdueClass(daysOverdue)}`}>
                            {daysOverdue} days
                          </span>
                        </td>
                        <td className="amount-column">
                          <span className="amount">{formatCurrency(payment.balance)}</span>
                        </td>
                        <td>
                          <div className="contact-actions">
                            {payment.clientPhone && (
                              <button 
                                className="contact-btn phone"
                                onClick={() => window.open(`tel:${payment.clientPhone}`)}
                                title={`Call ${payment.clientPhone}`}
                              >
                                <Phone size={16} />
                              </button>
                            )}
                            {payment.clientEmail && (
                              <button 
                                className="contact-btn email"
                                onClick={() => window.open(`mailto:${payment.clientEmail}`)}
                                title={`Email ${payment.clientEmail}`}
                              >
                                <Mail size={16} />
                              </button>
                            )}
                          </div>
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
                <div className="severity-legend">
                  <span className="legend-title">Priority Levels:</span>
                  <span className="legend-item low">1-14 days</span>
                  <span className="legend-item medium">15-30 days</span>
                  <span className="legend-item high">31-60 days</span>
                  <span className="legend-item critical">60+ days</span>
                </div>
              </div>
              <div className="summary-section">
                <p><strong>Total Overdue:</strong> {formatCurrency(getTotalOverdueAmount())}</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default LatePayments;
