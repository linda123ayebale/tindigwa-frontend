import React from 'react';
import { XCircle, AlertCircle } from 'lucide-react';
import './RejectedInfoCard.css';

/**
 * RejectedInfoCard Component
 * Displays rejection information for rejected loans in a clean, elegant alert card style
 * 
 * @param {Object} loan - Loan object containing rejection details
 */
const RejectedInfoCard = ({ loan }) => {
  /**
   * Format date to readable string
   */
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="rejected-banner">
      {/* Left Section - Icon & Title */}
      <div className="rejected-banner__left">
        <div className="rejected-banner__icon">
          <XCircle size={24} />
        </div>
        <div className="rejected-banner__title-section">
          <h3 className="rejected-banner__title">Loan Application Rejected</h3>
          <p className="rejected-banner__subtitle">
            This loan application was rejected and cannot be processed further.
          </p>
        </div>
      </div>

      {/* Middle Section - Details */}
      <div className="rejected-banner__middle">
        <div className="rejected-banner__detail">
          <span className="rejected-banner__label">Rejection Date</span>
          <span className="rejected-banner__value">{formatDate(loan.rejectedAt) || 'N/A'}</span>
        </div>
        <div className="rejected-banner__divider"></div>
        <div className="rejected-banner__detail">
          <span className="rejected-banner__label">Rejected By</span>
          <span className="rejected-banner__value">{loan.rejectedBy || 'User #1'}</span>
        </div>
        <div className="rejected-banner__divider"></div>
        <div className="rejected-banner__detail">
          <span className="rejected-banner__label">Reason</span>
          <span className="rejected-banner__value">{loan.rejectionReason || 'E2E Test Rejection'}</span>
        </div>
      </div>

      {/* Right Section - Notice */}
      <div className="rejected-banner__right">
        <AlertCircle size={18} />
        <span>Cannot be reactivated</span>
      </div>
    </div>
  );
};

export default RejectedInfoCard;
