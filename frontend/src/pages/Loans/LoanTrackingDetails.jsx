import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, DollarSign, Calendar, AlertCircle } from 'lucide-react';
import Sidebar from '../../components/Layout/Sidebar';
import { toast } from 'react-hot-toast';
import LoanService from '../../services/loanService';
import './LoanTrackingDetails.css';

const LoanTrackingDetails = () => {
  const { loanId } = useParams();  // Match route param name
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrackingData();
  }, [loanId]);

  const fetchTrackingData = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching tracking data for loan ID:', loanId);
      const response = await LoanService.getComprehensiveTracking(loanId);
      console.log('📦 Full API response:', response);
      console.log('📊 Response data:', response.data);
      
      if (!response || !response.data) {
        console.error('❌ No data in response');
        toast.error('No tracking data received from server');
        return;
      }
      
      setData(response.data);
      console.log('✅ Data set successfully:', response.data);
    } catch (error) {
      console.error('❌ Error fetching tracking data:', error);
      console.error('Error details:', error.response?.data || error.message);
      toast.error(`Failed to load: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return 'UGX 0';
    return `UGX ${Number(amount).toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const getStatusBadge = (status) => {
    const badges = {
      'PAID': <span className="status-badge paid">✓ Paid</span>,
      'PENDING': <span className="status-badge pending">⏳ Pending</span>,
      'OVERDUE': <span className="status-badge overdue">⚠ Overdue</span>,
      'PARTIAL': <span className="status-badge partial">◐ Partial</span>,
    };
    return badges[status] || <span className="status-badge">-</span>;
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading payment tracking...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main">
          <div className="empty-state">
            <AlertCircle size={48} />
            <p>No tracking data available for this loan</p>
            <button onClick={() => navigate('/loans/tracking')} className="btn-primary">
              Back to Loan Tracking
            </button>
          </div>
        </main>
      </div>
    );
  }

  const { loan, tracking, paymentHistory, balance, metrics, status } = data;
  const completionPercentage = metrics?.completionPercentage || 0;

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        {/* Header */}
        <div className="tracking-header">
          <button onClick={() => navigate('/loans/tracking')} className="back-btn">
            <ArrowLeft size={20} />
            Back to Tracking
          </button>
          <div className="header-info">
            <h1>Payment Tracking</h1>
            <p className="loan-identifier">
              {loan?.loanNumber || 'N/A'} • Client ID: {loan?.clientId || 'N/A'}
            </p>
          </div>
        </div>

        <div className="tracking-content">
          {/* Overview Cards */}
          <div className="overview-cards">
            <div className="overview-card total">
              <div className="card-icon">
                <DollarSign size={24} />
              </div>
              <div className="card-content">
                <span className="card-label">Total Payable</span>
                <span className="card-value">{formatCurrency(loan?.totalPayable || 0)}</span>
              </div>
            </div>

            <div className="overview-card paid">
              <div className="card-icon">
                <TrendingUp size={24} />
              </div>
              <div className="card-content">
                <span className="card-label">Amount Paid</span>
                <span className="card-value">{formatCurrency(tracking?.cumulativePayment || 0)}</span>
              </div>
            </div>

            <div className="overview-card balance">
              <div className="card-icon">
                <DollarSign size={24} />
              </div>
              <div className="card-content">
                <span className="card-label">Balance Due</span>
                <span className="card-value">{formatCurrency(tracking?.outstandingBalance || 0)}</span>
              </div>
            </div>

            <div className="overview-card progress">
              <div className="card-icon">
                <TrendingUp size={24} />
              </div>
              <div className="card-content">
                <span className="card-label">Progress</span>
                <span className="card-value">{completionPercentage.toFixed(1)}%</span>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${Math.min(completionPercentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Breakdown */}
          <div className="breakdown-section">
            <h2>Payment Breakdown</h2>
            <div className="breakdown-grid">
              <div className="breakdown-column">
                <h3>Financial Details</h3>
                <div className="breakdown-item">
                  <span className="item-label">Principal Amount</span>
                  <span className="item-value">{formatCurrency(loan?.principalAmount || 0)}</span>
                </div>
                <div className="breakdown-item">
                  <span className="item-label">Interest Amount</span>
                  <span className="item-value">{formatCurrency(tracking?.interestAccrued || 0)}</span>
                </div>
                <div className="breakdown-item">
                  <span className="item-label">Processing Fee</span>
                  <span className="item-value">{formatCurrency(loan?.processingFee || 0)}</span>
                </div>
                <div className="breakdown-item">
                  <span className="item-label">Penalties</span>
                  <span className="item-value">{formatCurrency(tracking?.cumulativePenalty || 0)}</span>
                </div>
              </div>

              <div className="breakdown-column">
                <h3>Payment Timeline</h3>
                <div className="breakdown-item">
                  <span className="item-label">Installments</span>
                  <span className="item-value">
                    {tracking?.installmentsPaid || 0} / {tracking?.totalInstallments || 0}
                  </span>
                </div>
                <div className="breakdown-item">
                  <span className="item-label">Last Payment</span>
                  <span className="item-value">{formatDate(tracking?.lastPaymentDate)}</span>
                </div>
                <div className="breakdown-item">
                  <span className="item-label">Next Due Date</span>
                  <span className="item-value">{formatDate(tracking?.nextPaymentDueDate)}</span>
                </div>
                <div className="breakdown-item">
                  <span className="item-label">Days Overdue</span>
                  <span className={`item-value ${status?.daysOverdue > 0 ? 'overdue' : ''}`}>
                    {status?.daysOverdue || 0} days
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment History */}
          <div className="payment-history-section">
            <h2>Payment History</h2>
            {!paymentHistory || paymentHistory.length === 0 ? (
              <div className="empty-state-inline">
                <Calendar size={32} />
                <p>No payments recorded yet</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="payment-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Amount Paid</th>
                      <th>Payment Method</th>
                      <th>Reference</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentHistory.map((payment, index) => (
                      <tr key={payment.id || index}>
                        <td>{formatDate(payment.paymentDate)}</td>
                        <td className="amount">{formatCurrency(payment.amountPaid)}</td>
                        <td>{payment.paymentMethod || '-'}</td>
                        <td>{payment.referenceNumber || '-'}</td>
                        <td>{payment.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoanTrackingDetails;
