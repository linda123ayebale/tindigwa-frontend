import React, { useState } from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import './ApprovalPendingBanner.css';

/**
 * ApprovalPendingBanner Component
 * Displays a banner for pending approval loans with action buttons
 * 
 * @param {Boolean} showActions - Whether to show approve/reject buttons (based on permissions)
 * @param {Function} onApprove - Callback function when approve button is clicked
 * @param {Function} onReject - Callback function when reject button is clicked
 * @param {Object} loan - Loan object (optional, for additional context)
 */
const ApprovalPendingBanner = ({ 
  showActions = false, 
  onApprove, 
  onReject,
  loan = null 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApprove = async () => {
    if (onApprove && !isProcessing) {
      setIsProcessing(true);
      try {
        await onApprove();
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleReject = async () => {
    if (onReject && !isProcessing) {
      setIsProcessing(true);
      try {
        await onReject();
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="approval-banner">
      <h3>
        <Clock size={20} />
        Pending Approval
      </h3>
      <p>
        This loan application is awaiting approval from an authorized officer.
      </p>

      {showActions && (
        <div className="actions">
          <button
            onClick={handleApprove}
            disabled={isProcessing}
            className="approve-btn"
          >
            <CheckCircle size={18} />
            {isProcessing ? 'Processing...' : 'Approve Loan'}
          </button>

          <button
            onClick={handleReject}
            disabled={isProcessing}
            className="reject-btn"
          >
            <XCircle size={18} />
            {isProcessing ? 'Processing...' : 'Reject Loan'}
          </button>
        </div>
      )}

      {!showActions && (
        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.875rem', color: '#6b5227' }}>
          You do not have permission to approve or reject this loan. Contact your manager if you believe this is an error.
        </p>
      )}

      {loan && loan.createdAt && (
        <div className="banner-info">
          <div className="info-item">
            <span className="info-label">Submitted</span>
            <span className="info-value">
              {new Date(loan.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalPendingBanner;
