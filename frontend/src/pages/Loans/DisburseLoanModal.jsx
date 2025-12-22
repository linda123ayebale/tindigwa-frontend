import React from 'react';
import { X, Send, AlertCircle } from 'lucide-react';
import './DisburseLoanModal.css';

const DisburseLoanModal = ({ loan, isOpen, onClose, onConfirm, isProcessing }) => {
  if (!isOpen || !loan) return null;

  const handleConfirm = () => {
    onConfirm(loan.id);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content disburse-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-icon warning">
            <AlertCircle size={32} />
          </div>
          <h2>Confirm Loan Disbursement</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="confirmation-message">
            <p className="main-message">
              Are you sure you want to disburse this loan?
            </p>
            <p className="sub-message">
              This action will mark the loan as <strong>DISBURSED</strong> and funds will be released to the client.
            </p>
          </div>

          <div className="loan-details-summary">
            <h3>Loan Details</h3>
            <div className="detail-row">
              <span className="label">Loan Number:</span>
              <span className="value">{loan.loanNumber}</span>
            </div>
            <div className="detail-row">
              <span className="label">Client Name:</span>
              <span className="value">{loan.clientName || loan.name || 'Unknown'}</span>
            </div>
            <div className="detail-row">
              <span className="label">Principal Amount:</span>
              <span className="value amount">
                {loan.principalFormatted || 
                 (loan.principalAmount ? `UGX ${loan.principalAmount.toLocaleString()}` : 'UGX 0')}
              </span>
            </div>
            <div className="detail-row">
              <span className="label">Total Payable:</span>
              <span className="value amount">
                {loan.totalPayableFormatted || 
                 (loan.totalPayable ? `UGX ${loan.totalPayable.toLocaleString()}` : 
                  loan.totalAmount ? `UGX ${loan.totalAmount.toLocaleString()}` : 'UGX 0')}
              </span>
            </div>
          </div>

          <div className="warning-notice">
            <AlertCircle size={16} />
            <span>This action cannot be undone once confirmed.</span>
          </div>
        </div>

        <div className="modal-footer">
          <button 
            className="btn btn-secondary" 
            onClick={onClose}
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button 
            className="btn btn-disburse" 
            onClick={handleConfirm}
            disabled={isProcessing}
          >
            <Send size={16} />
            {isProcessing ? 'Disbursing...' : 'Yes, Disburse Loan'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DisburseLoanModal;
