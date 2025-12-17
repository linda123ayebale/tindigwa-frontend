import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, CheckCircle, Clock, AlertCircle, CreditCard } from 'lucide-react';
import api from '../services/api';
import QuickPaymentModal from './QuickPaymentModal';
import './LoanPaymentSchedule.css';

const LoanPaymentSchedule = ({ loanId }) => {
  const [schedule, setSchedule] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedInstallment, setSelectedInstallment] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    if (loanId) {
      fetchSchedule();
      fetchSummary();
    }
  }, [loanId]);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/installments/loan/${loanId}/schedule`);
      setSchedule(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error('Error fetching schedule:', err);
      setError('Failed to load payment schedule');
      setSchedule([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await api.get(`/installments/loan/${loanId}/summary`);
      setSummary(response);
    } catch (err) {
      console.error('Error fetching summary:', err);
    }
  };

  const formatCurrency = (amount) => {
    return `UGX ${Number(amount || 0).toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleMakePayment = (installment) => {
    setSelectedInstallment(installment);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    setSelectedInstallment(null);
    // Refresh schedule
    fetchSchedule();
    fetchSummary();
  };

  const getStatusConfig = (status) => {
    const configs = {
      PAID: {
        label: 'Paid',
        className: 'status-paid',
        icon: CheckCircle,
        gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', // Green
      },
      PENDING: {
        label: 'Pending',
        className: 'status-pending',
        icon: Clock,
        gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', // Blue
      },
      OVERDUE: {
        label: 'Overdue',
        className: 'status-overdue',
        icon: AlertCircle,
        gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', // Red
      },
      GRACE_PERIOD: {
        label: 'Grace Period',
        className: 'status-grace',
        icon: Clock,
        gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', // Yellow/Orange
      },
      PARTIAL: {
        label: 'Partial',
        className: 'status-partial',
        icon: DollarSign,
        gradient: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)', // Orange
      }
    };
    return configs[status] || configs.PENDING;
  };

  const StatusBadge = ({ status, daysLate, inGracePeriod }) => {
    const config = getStatusConfig(status);
    const Icon = config.icon;

    return (
      <div className={`status-badge ${config.className}`} style={{ background: config.gradient }}>
        <Icon size={14} />
        <span>{config.label}</span>
        {daysLate > 0 && <span className="days-late">{daysLate}d late</span>}
        {inGracePeriod && <span className="grace-indicator">Grace</span>}
      </div>
    );
  };

  const ProgressBar = ({ paidAmount, scheduledAmount }) => {
    const percentage = ((paidAmount / scheduledAmount) * 100).toFixed(1);
    const isComplete = percentage >= 100;
    const isPartial = percentage > 0 && percentage < 100;

    const gradient = isComplete
      ? 'linear-gradient(90deg, #10b981 0%, #059669 100%)'
      : isPartial
      ? 'linear-gradient(90deg, #f59e0b 0%, #f97316 100%)'
      : 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)';

    return (
      <div className="progress-bar-container">
        <div 
          className="progress-bar-fill" 
          style={{ 
            width: `${Math.min(percentage, 100)}%`,
            background: gradient
          }}
        />
        <span className="progress-text">{percentage}%</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="schedule-loading">
        <div className="spinner"></div>
        <p>Loading payment schedule...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="schedule-error">
        <AlertCircle size={48} />
        <p>{error}</p>
      </div>
    );
  }

  if (schedule.length === 0) {
    return (
      <div className="schedule-empty">
        <Calendar size={48} />
        <h3>No Payment Schedule</h3>
        <p>The payment schedule hasn't been generated yet for this loan.</p>
      </div>
    );
  }

  return (
    <div className="loan-payment-schedule">
      {/* Summary Cards */}
      {summary && (
        <div className="schedule-summary">
          <div className="summary-card blue-gradient">
            <div className="card-icon">
              <Calendar size={24} />
            </div>
            <div className="card-content">
              <span className="card-label">Total Installments</span>
              <span className="card-value">{summary.totalInstallments}</span>
              <span className="card-detail">
                {summary.paidInstallments} paid · {summary.unpaidInstallments} remaining
              </span>
            </div>
          </div>

          <div className="summary-card green-gradient">
            <div className="card-icon">
              <CheckCircle size={24} />
            </div>
            <div className="card-content">
              <span className="card-label">Completion Rate</span>
              <span className="card-value">{summary.completionRate?.toFixed(1)}%</span>
              <span className="card-detail">
                {summary.onTimePayments} on-time · {summary.latePayments} late
              </span>
            </div>
          </div>

          <div className="summary-card yellow-gradient">
            <div className="card-icon">
              <DollarSign size={24} />
            </div>
            <div className="card-content">
              <span className="card-label">Total Paid</span>
              <span className="card-value">{formatCurrency(summary.totalPaid)}</span>
              <span className="card-detail">
                Outstanding: {formatCurrency(summary.totalOutstanding)}
              </span>
            </div>
          </div>

          {summary.overdueInstallments > 0 && (
            <div className="summary-card red-gradient">
              <div className="card-icon">
                <AlertCircle size={24} />
              </div>
              <div className="card-content">
                <span className="card-label">Overdue</span>
                <span className="card-value">{summary.overdueInstallments}</span>
                <span className="card-detail">
                  Penalties: {formatCurrency(summary.totalPenalties)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Schedule Table */}
      <div className="schedule-table-container">
        <table className="schedule-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Due Date</th>
              <th>Scheduled Amount</th>
              <th>Paid Amount</th>
              <th>Progress</th>
              <th>Status</th>
              <th>Principal</th>
              <th>Interest</th>
              <th>Fees</th>
              <th>Outstanding</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {schedule.map((installment) => (
              <tr key={installment.id} className={`installment-row ${installment.status?.toLowerCase()}`}>
                <td className="installment-number">
                  <div className="number-badge" style={{
                    background: getStatusConfig(installment.status).gradient
                  }}>
                    {installment.installmentNumber}
                  </div>
                </td>
                <td>
                  <div className="date-cell">
                    <Calendar size={14} />
                    <span>{formatDate(installment.dueDate)}</span>
                    {installment.paidDate && (
                      <span className="paid-date">Paid: {formatDate(installment.paidDate)}</span>
                    )}
                  </div>
                </td>
                <td className="amount">{formatCurrency(installment.scheduledAmount)}</td>
                <td className="amount paid-amount">
                  {formatCurrency(installment.paidAmount || 0)}
                </td>
                <td>
                  <ProgressBar 
                    paidAmount={installment.paidAmount || 0} 
                    scheduledAmount={installment.scheduledAmount} 
                  />
                </td>
                <td>
                  <StatusBadge 
                    status={installment.status} 
                    daysLate={installment.daysLate}
                    inGracePeriod={installment.inGracePeriod}
                  />
                </td>
                <td className="amount breakdown">{formatCurrency(installment.principalPortion)}</td>
                <td className="amount breakdown">{formatCurrency(installment.interestPortion)}</td>
                <td className="amount breakdown">{formatCurrency(installment.feesPortion)}</td>
                <td className="amount outstanding">
                  {formatCurrency(installment.outstandingAmount)}
                </td>
                <td className="action-cell">
                  {(installment.status === 'PENDING' || installment.status === 'OVERDUE' || 
                    installment.status === 'GRACE_PERIOD' || installment.status === 'PARTIAL') && (
                    <button 
                      className="pay-btn"
                      onClick={() => handleMakePayment(installment)}
                      title="Make Payment"
                    >
                      <CreditCard size={16} />
                      Pay
                    </button>
                  )}
                  {installment.status === 'PAID' && (
                    <span className="paid-check">✓ Paid</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="schedule-legend">
        <span className="legend-title">Status Legend:</span>
        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-badge" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}></span>
            <span>Paid</span>
          </div>
          <div className="legend-item">
            <span className="legend-badge" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}></span>
            <span>Pending</span>
          </div>
          <div className="legend-item">
            <span className="legend-badge" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}></span>
            <span>Grace Period</span>
          </div>
          <div className="legend-item">
            <span className="legend-badge" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}></span>
            <span>Overdue</span>
          </div>
          <div className="legend-item">
            <span className="legend-badge" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)' }}></span>
            <span>Partial</span>
          </div>
        </div>
      </div>

      {/* Quick Payment Modal */}
      {showPaymentModal && selectedInstallment && (
        <QuickPaymentModal
          installment={selectedInstallment}
          loanId={loanId}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedInstallment(null);
          }}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default LoanPaymentSchedule;
