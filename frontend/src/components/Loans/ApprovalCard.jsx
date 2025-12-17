import React, { useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Calendar, User } from 'lucide-react';
import './ApprovalCard.css';

/**
 * ApprovalCard Component
 * 
 * Displays an interactive approval card for loans based on workflow status:
 * - PENDING_APPROVAL: Shows approve/reject buttons
 * - APPROVED: Shows green success card with approver info
 * - REJECTED: Shows red rejection card with reason and date
 * 
 * Features:
 * - Beautiful gradient backgrounds
 * - Smooth animations
 * - Disabled state during processing
 * - Real-time status updates via WebSocket
 * - Comprehensive loan information display
 */
const ApprovalCard = ({ 
  loan,
  workflowStatus, 
  onApprove, 
  onReject,
  approvedBy = null,
  approvedAt = null,
  rejectedBy = null,
  rejectedAt = null,
  rejectionReason = null
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

  const formatCurrency = (amount) => {
    if (!amount) return 'USh 0';
    return `USh ${Number(amount).toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'N/A';
    }
  };

  // PENDING APPROVAL STATE
  if (workflowStatus === 'PENDING_APPROVAL') {
    return (
      <div className="approval-card pending" data-testid="approval-card-pending">
        <div className="approval-card-header">
          <div className="approval-icon pending-icon">
            <AlertTriangle size={32} />
          </div>
          <div className="approval-title-section">
            <h2 className="approval-title">Pending Approval</h2>
            <p className="approval-subtitle">This loan application requires your review</p>
          </div>
        </div>

        <div className="approval-card-content">
          <div className="approval-info-grid">
            <div className="approval-info-item">
              <label>Loan Number</label>
              <span className="loan-number">{loan?.loanNumber || 'N/A'}</span>
            </div>
            <div className="approval-info-item">
              <label>Client Name</label>
              <span>{loan?.clientName || 'N/A'}</span>
            </div>
            <div className="approval-info-item">
              <label>Principal Amount</label>
              <span className="amount">{formatCurrency(loan?.principalAmount)}</span>
            </div>
            <div className="approval-info-item">
              <label>Submitted On</label>
              <span>{formatDate(loan?.createdAt)}</span>
            </div>
          </div>

          <div className="approval-actions">
            <button
              className="approval-btn approve-btn"
              onClick={handleApprove}
              disabled={isProcessing}
              data-testid="approve-button"
            >
              <CheckCircle size={20} />
              {isProcessing ? 'Processing...' : 'Approve Loan'}
            </button>
            <button
              className="approval-btn reject-btn"
              onClick={handleReject}
              disabled={isProcessing}
              data-testid="reject-button"
            >
              <XCircle size={20} />
              {isProcessing ? 'Processing...' : 'Reject Loan'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // APPROVED STATE
  if (workflowStatus === 'APPROVED') {
    return (
      <div className="approval-card approved" data-testid="approval-card-approved">
        <div className="approval-card-header">
          <div className="approval-icon approved-icon">
            <CheckCircle size={32} />
          </div>
          <div className="approval-title-section">
            <h2 className="approval-title">Loan Approved</h2>
            <p className="approval-subtitle">This loan has been approved and is ready for disbursement</p>
          </div>
        </div>

        <div className="approval-card-content">
          <div className="approval-info-grid">
            <div className="approval-info-item">
              <label>Loan Number</label>
              <span className="loan-number">{loan?.loanNumber || 'N/A'}</span>
            </div>
            <div className="approval-info-item">
              <label>Client Name</label>
              <span>{loan?.clientName || 'N/A'}</span>
            </div>
            <div className="approval-info-item">
              <label>Principal Amount</label>
              <span className="amount">{formatCurrency(loan?.principalAmount)}</span>
            </div>
            <div className="approval-info-item">
              <label>
                <User size={14} style={{ marginBottom: '-2px' }} /> Approved By
              </label>
              <span>{approvedBy || 'System'}</span>
            </div>
            <div className="approval-info-item">
              <label>
                <Calendar size={14} style={{ marginBottom: '-2px' }} /> Approved On
              </label>
              <span>{formatDate(approvedAt || loan?.approvedAt)}</span>
            </div>
          </div>

          <div className="approval-status-badge approved-badge">
            <CheckCircle size={16} />
            <span>Ready for Disbursement</span>
          </div>
        </div>
      </div>
    );
  }

  // REJECTED STATE
  if (workflowStatus === 'REJECTED') {
    return (
      <div className="approval-card rejected" data-testid="approval-card-rejected">
        <div className="approval-card-header">
          <div className="approval-icon rejected-icon">
            <XCircle size={32} />
          </div>
          <div className="approval-title-section">
            <h2 className="approval-title">Loan Rejected</h2>
            <p className="approval-subtitle">This loan application was not approved</p>
          </div>
        </div>

        <div className="approval-card-content">
          <div className="approval-info-grid">
            <div className="approval-info-item">
              <label>Loan Number</label>
              <span className="loan-number">{loan?.loanNumber || 'N/A'}</span>
            </div>
            <div className="approval-info-item">
              <label>Client Name</label>
              <span>{loan?.clientName || 'N/A'}</span>
            </div>
            <div className="approval-info-item">
              <label>Principal Amount</label>
              <span className="amount">{formatCurrency(loan?.principalAmount)}</span>
            </div>
            <div className="approval-info-item">
              <label>
                <User size={14} style={{ marginBottom: '-2px' }} /> Rejected By
              </label>
              <span>{rejectedBy || 'System'}</span>
            </div>
            <div className="approval-info-item">
              <label>
                <Calendar size={14} style={{ marginBottom: '-2px' }} /> Rejected On
              </label>
              <span>{formatDate(rejectedAt || loan?.rejectedAt)}</span>
            </div>
          </div>

          {(rejectionReason || loan?.rejectionReason) && (
            <div className="rejection-reason-container">
              <label className="rejection-reason-label">Rejection Reason</label>
              <div className="rejection-reason">
                {rejectionReason || loan?.rejectionReason || 'No reason provided'}
              </div>
            </div>
          )}

          <div className="approval-status-badge rejected-badge">
            <XCircle size={16} />
            <span>Application Rejected</span>
          </div>
        </div>
      </div>
    );
  }

  // Default: No approval card for other statuses
  return null;
};

export default ApprovalCard;
