import React, { useState, useEffect, useCallback } from 'react';
import { X, DollarSign, Calendar, CreditCard, FileText, AlertCircle, CheckCircle, User, Building } from 'lucide-react';
import PaymentService from '../services/PaymentService';
import './PaymentDetailsModal.css';

const PaymentDetailsModal = ({ paymentId, onClose }) => {
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPaymentDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching payment details for payment ID:', paymentId);
      const data = await PaymentService.getById(paymentId);
      
      console.log('Payment details fetched successfully:', data);
      setPaymentDetails(data);
    } catch (err) {
      console.error('Error fetching payment details:', err);
      setError(err.message || 'Failed to load payment details');
    } finally {
      setLoading(false);
    }
  }, [paymentId]);

  useEffect(() => {
    if (paymentId) {
      fetchPaymentDetails();
    }
  }, [paymentId, fetchPaymentDetails]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'UGX'
    }).format(amount || 0).replace('UGX', 'UGX ');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeClass = (status) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower === 'completed' || statusLower === 'processed') return 'status-completed';
    if (statusLower === 'pending') return 'status-pending';
    if (statusLower === 'cancelled' || statusLower === 'reversed') return 'status-cancelled';
    return 'status-default';
  };

  if (!paymentId) return null;

  return (
    <div className="payment-details-modal-overlay" onClick={onClose}>
      <div className="payment-details-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="payment-details-modal-header">
          <div className="header-info">
            <h2>Payment Details</h2>
            {paymentDetails && (
              <span className="payment-id">Payment #{paymentDetails.id}</span>
            )}
          </div>
          <button className="payment-details-close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="payment-details-modal-body">
          {loading && (
            <div className="payment-details-loading">
              <div className="payment-details-spinner"></div>
              <p>Loading payment details...</p>
            </div>
          )}

          {error && (
            <div className="payment-details-error">
              <AlertCircle size={48} />
              <p>{error}</p>
              <button onClick={fetchPaymentDetails}>Retry</button>
            </div>
          )}

          {!loading && !error && paymentDetails && (
            <div className="payment-details-content">
              {/* Status Badge */}
              <div className="payment-status-section">
                <span className={`payment-status-badge ${getStatusBadgeClass(paymentDetails.paymentStatus)}`}>
                  <CheckCircle size={18} />
                  {paymentDetails.paymentStatus || 'Unknown'}
                </span>
              </div>

              {/* Amount Display */}
              <div className="payment-amount-display">
                <DollarSign size={32} />
                <div className="amount-details">
                  <span className="amount-label">Amount Paid</span>
                  <span className="amount-value">{formatCurrency(paymentDetails.amountPaid)}</span>
                </div>
              </div>

              {/* Payment Information */}
              <div className="payment-details-section">
                <h3>Payment Information</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">
                      <Calendar size={16} />
                      Payment Date
                    </span>
                    <span className="detail-value">{formatDate(paymentDetails.paymentDate)}</span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">
                      <CreditCard size={16} />
                      Payment Method
                    </span>
                    <span className="detail-value">{paymentDetails.paymentMethod || 'N/A'}</span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">
                      <FileText size={16} />
                      Reference Number
                    </span>
                    <span className="detail-value">{paymentDetails.referenceNumber || 'N/A'}</span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">
                      <FileText size={16} />
                      Transaction Reference
                    </span>
                    <span className="detail-value">{paymentDetails.transactionReference || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Loan Information */}
              <div className="payment-details-section">
                <h3>Loan Information</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">
                      <Building size={16} />
                      Loan Number
                    </span>
                    <span className="detail-value">{paymentDetails.loanNumber || `LN-${paymentDetails.loanId}`}</span>
                  </div>

                  {paymentDetails.installmentNumber && (
                    <div className="detail-item">
                      <span className="detail-label">
                        <FileText size={16} />
                        Installment Number
                      </span>
                      <span className="detail-value">#{paymentDetails.installmentNumber}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Breakdown */}
              {(paymentDetails.principalPaid || paymentDetails.interestPaid || paymentDetails.feesPaid) && (
                <div className="payment-details-section">
                  <h3>Payment Breakdown</h3>
                  <div className="breakdown-list">
                    {paymentDetails.principalPaid > 0 && (
                      <div className="breakdown-item">
                        <span className="breakdown-label">Principal Payment</span>
                        <span className="breakdown-value">{formatCurrency(paymentDetails.principalPaid)}</span>
                      </div>
                    )}
                    {paymentDetails.interestPaid > 0 && (
                      <div className="breakdown-item">
                        <span className="breakdown-label">Interest Payment</span>
                        <span className="breakdown-value">{formatCurrency(paymentDetails.interestPaid)}</span>
                      </div>
                    )}
                    {paymentDetails.feesPaid > 0 && (
                      <div className="breakdown-item">
                        <span className="breakdown-label">Fees</span>
                        <span className="breakdown-value">{formatCurrency(paymentDetails.feesPaid)}</span>
                      </div>
                    )}
                    {paymentDetails.lateFee > 0 && (
                      <div className="breakdown-item late-fee">
                        <span className="breakdown-label">Late Payment Fee</span>
                        <span className="breakdown-value">{formatCurrency(paymentDetails.lateFee)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Additional Details */}
              <div className="payment-details-section">
                <h3>Additional Details</h3>
                <div className="details-grid">
                  {paymentDetails.recordedBy && (
                    <div className="detail-item">
                      <span className="detail-label">
                        <User size={16} />
                        Recorded By
                      </span>
                      <span className="detail-value">{paymentDetails.recordedBy}</span>
                    </div>
                  )}

                  <div className="detail-item">
                    <span className="detail-label">
                      <Calendar size={16} />
                      Created At
                    </span>
                    <span className="detail-value">{formatDateTime(paymentDetails.createdAt)}</span>
                  </div>

                  {paymentDetails.lastModified && (
                    <div className="detail-item">
                      <span className="detail-label">
                        <Calendar size={16} />
                        Last Modified
                      </span>
                      <span className="detail-value">{formatDateTime(paymentDetails.lastModified)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {paymentDetails.notes && (
                <div className="payment-details-section">
                  <h3>Notes</h3>
                  <div className="notes-content">
                    <p>{paymentDetails.notes}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentDetailsModal;
