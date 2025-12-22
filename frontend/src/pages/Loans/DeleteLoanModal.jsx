import React, { useState } from 'react';
import { X, Trash2, AlertTriangle, User, Calendar, DollarSign, Clock, Building } from 'lucide-react';
import './DeleteLoanModal.css';

const DeleteLoanModal = ({ loan, isOpen, onClose, onConfirm }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !loan) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onConfirm(loan.id);
      onClose();
    } catch (error) {
      console.error('Error deleting loan:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatCurrency = (amount) => {
    return `USh ${amount.toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="delete-loan-overlay">
      <div className="delete-loan-modal">
        {/* Header */}
        <div className="delete-modal-header">
          <div className="header-content">
            <div className="warning-icon">
              <AlertTriangle size={24} />
            </div>
            <div className="header-text">
              <h2>Delete Loan</h2>
              <p>This action cannot be undone</p>
            </div>
          </div>
          <button 
            className="close-button"
            onClick={onClose}
            disabled={isDeleting}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="delete-modal-content">
          <div className="warning-message">
            <p>You are about to permanently delete the following loan:</p>
          </div>

          {/* Loan Information Card */}
          <div className="loan-info-card">
            <div className="loan-summary">
              <div className="loan-id">
                <span className="label">Loan ID:</span>
                <span className="value">{loan.id}</span>
              </div>
              <div className="loan-status">
                <span className="status-indicator"></span>
              </div>
            </div>

            <div className="loan-details-grid">
              {/* Client Information */}
              <div className="detail-item">
                <div className="detail-icon">
                  <User size={16} />
                </div>
                <div className="detail-content">
                  <span className="detail-label">Client</span>
                  <span className="detail-value">{loan.clientName}</span>
                </div>
              </div>

              {/* Loan Amount */}
              <div className="detail-item">
                <div className="detail-icon">
                  <DollarSign size={16} />
                </div>
                <div className="detail-content">
                  <span className="detail-label">Principal Amount</span>
                  <span className="detail-value amount">{formatCurrency(loan.amount)}</span>
                </div>
              </div>

              {/* Duration */}
              <div className="detail-item">
                <div className="detail-icon">
                  <Clock size={16} />
                </div>
                <div className="detail-content">
                  <span className="detail-label">Duration</span>
                  <span className="detail-value">{loan.duration} days</span>
                </div>
              </div>

              {/* Start Date */}
              <div className="detail-item">
                <div className="detail-icon">
                  <Calendar size={16} />
                </div>
                <div className="detail-content">
                  <span className="detail-label">Start Date</span>
                  <span className="detail-value">{formatDate(loan.startDate)}</span>
                </div>
              </div>

              {/* Branch */}
              <div className="detail-item">
                <div className="detail-icon">
                  <Building size={16} />
                </div>
                <div className="detail-content">
                  <span className="detail-label">Branch</span>
                  <span className="detail-value">{loan.branch}</span>
                </div>
              </div>

              {/* Officer */}
              <div className="detail-item">
                <div className="detail-icon">
                  <User size={16} />
                </div>
                <div className="detail-content">
                  <span className="detail-label">Loan Officer</span>
                  <span className="detail-value">{loan.officer}</span>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            {loan.amountPaid > 0 && (
              <div className="payment-info">
                <div className="payment-summary">
                  <div className="payment-item">
                    <span className="payment-label">Amount Paid:</span>
                    <span className="payment-value">{formatCurrency(loan.amountPaid)}</span>
                  </div>
                  <div className="payment-item">
                    <span className="payment-label">Outstanding:</span>
                    <span className="payment-value outstanding">
                      {formatCurrency(loan.totalAmount - loan.amountPaid)}
                    </span>
                  </div>
                </div>
                <div className="payment-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${(loan.amountPaid / loan.totalAmount) * 100}%` }}
                    ></div>
                  </div>
                  <span className="progress-text">
                    {((loan.amountPaid / loan.totalAmount) * 100).toFixed(1)}% paid
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Final Warning */}
          <div className="final-warning">
            <div className="warning-box">
              <AlertTriangle size={20} />
              <div className="warning-content">
                <strong>Warning:</strong> This will permanently delete the loan record and all associated data. 
                This action cannot be undone.
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="delete-modal-actions">
          <button 
            className="cancel-button"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button 
            className="delete-button"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 size={16} />
            {isDeleting ? 'Deleting...' : 'Delete Loan'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteLoanModal;
