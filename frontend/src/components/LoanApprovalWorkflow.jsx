import React, { useState, useEffect } from 'react';
import { 
  Check, 
  X, 
  Clock, 
  User, 
  Calendar, 
  AlertCircle, 
  FileText,
  DollarSign,
  Eye 
} from 'lucide-react';
import loanService from '../services/loanService';
import NotificationModal from './NotificationModal';
import { useNotification } from '../hooks/useNotification';
import './LoanApprovalWorkflow.css';

const LoanApprovalWorkflow = ({ currentUserId = 1, userRole = 'CASHIER' }) => {
  const [pendingLoans, setPendingLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingLoanId, setProcessingLoanId] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');
  const { notification, showSuccess, showError, showInfo, hideNotification } = useNotification();

  useEffect(() => {
    if (userRole === 'CASHIER') {
      loadPendingLoans();
    }
  }, [userRole]);

  const loadPendingLoans = async () => {
    try {
      setLoading(true);
      const response = await loanService.getLoansPendingApproval();
      // Extract the data array from the response object
      const loans = response.data || [];
      console.log('📋 Loaded pending loans:', loans);
      setPendingLoans(loans);
      setError(null);
    } catch (error) {
      console.error('Error loading pending loans:', error);
      setError('Failed to load pending loans');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveClick = (loan) => {
    console.log('🔍 Selected loan for approval:', loan);
    console.log('🔍 Loan officer name:', loan.loanOfficerName);
    setSelectedLoan(loan);
    setApprovalNotes('');
    setShowApprovalModal(true);
  };

  const handleRejectClick = (loan) => {
    setSelectedLoan(loan);
    setRejectionReason('');
    setShowRejectionModal(true);
  };

  const handleApproveLoan = async () => {
    if (!selectedLoan) return;
    
    try {
      setProcessingLoanId(selectedLoan.id);
      await loanService.approveLoan(selectedLoan.id, currentUserId, approvalNotes);
      
      // Remove loan from pending list
      setPendingLoans(loans => loans.filter(loan => loan.id !== selectedLoan.id));
      
      setShowApprovalModal(false);
      setSelectedLoan(null);
      setApprovalNotes('');
      
      // Show success notification
      showSuccess(`Loan ${selectedLoan.loanNumber} has been approved successfully!`, {
        title: 'Loan Approved',
        autoClose: 3000,
        position: 'center'
      });
      
    } catch (error) {
      console.error('Error approving loan:', error);
      showError(error.message || 'An error occurred while approving the loan. Please try again.', {
        title: 'Approval Failed',
        position: 'center'
      });
    } finally {
      setProcessingLoanId(null);
    }
  };

  const handleRejectLoan = async () => {
    if (!selectedLoan || !rejectionReason.trim()) {
      showError('Please provide a reason for rejection', {
        title: 'Rejection Reason Required',
        position: 'center'
      });
      return;
    }
    
    try {
      setProcessingLoanId(selectedLoan.id);
      await loanService.rejectLoan(selectedLoan.id, currentUserId, rejectionReason);
      
      // Remove loan from pending list
      setPendingLoans(loans => loans.filter(loan => loan.id !== selectedLoan.id));
      
      setShowRejectionModal(false);
      setSelectedLoan(null);
      setRejectionReason('');
      
      // Show success notification
      showSuccess(`Loan ${selectedLoan.loanNumber} has been rejected.`, {
        title: 'Loan Rejected',
        autoClose: 3000,
        position: 'center'
      });
      
    } catch (error) {
      console.error('Error rejecting loan:', error);
      showError(error.message || 'An error occurred while rejecting the loan. Please try again.', {
        title: 'Rejection Failed',
        position: 'center'
      });
    } finally {
      setProcessingLoanId(null);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-UG', { 
      style: 'currency', 
      currency: 'UGX',
      minimumFractionDigits: 0 
    }).format(amount);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };

  if (userRole !== 'CASHIER') {
    return (
      <div className="workflow-access-denied">
        <AlertCircle className="access-denied-icon" />
        <h3>Access Denied</h3>
        <p>Only cashiers can access the loan approval workflow.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="workflow-loading">
        <Clock className="loading-icon" />
        <p>Loading pending loans...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="workflow-error">
        <AlertCircle className="error-icon" />
        <h3>Error Loading Loans</h3>
        <p>{error}</p>
        <button onClick={loadPendingLoans} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="loan-approval-workflow">
      <div className="workflow-header">
        <div className="workflow-title">
          <Clock size={24} />
          <h2>Pending Loan Approvals</h2>
        </div>
        <div className="workflow-stats">
          <span className="pending-count">{pendingLoans.length} loans awaiting approval</span>
        </div>
      </div>

      {pendingLoans.length === 0 ? (
        <div className="no-pending-loans">
          <Check size={48} className="no-loans-icon" />
          <h3>All Caught Up!</h3>
          <p>There are no loans pending approval at this time.</p>
        </div>
      ) : (
        <div className="pending-loans-list">
          {pendingLoans.map((loan) => (
            <div key={loan.id} className="loan-approval-card">
              <div className="loan-card-header">
                <div className="loan-info">
                  <div className="loan-number">
                    <FileText size={16} />
                    {loan.loanNumber}
                  </div>
                  <div className="loan-amount">
                    <DollarSign size={16} />
                    {formatCurrency(loan.principalAmount)}
                  </div>
                </div>
                <div className="workflow-status">
                  <span className="status-badge pending">Pending Approval</span>
                </div>
              </div>

              <div className="loan-card-body">
                <div className="client-info">
                  <div className="client-detail">
                    <User size={14} />
                    <span>Client ID: {loan.clientId}</span>
                  </div>
                  <div className="loan-dates">
                    <Calendar size={14} />
                    <span>Created: {formatDate(loan.createdAt)}</span>
                  </div>
                </div>

                <div className="loan-details-grid">
                  <div className="detail-item">
                    <label>Interest Rate</label>
                    <span>{loan.interestRate}% per {loan.ratePer}</span>
                  </div>
                  <div className="detail-item">
                    <label>Duration</label>
                    <span>{loan.loanDuration} {loan.durationUnit}</span>
                  </div>
                  <div className="detail-item">
                    <label>Repayment</label>
                    <span>{loan.repaymentFrequency}</span>
                  </div>
                  <div className="detail-item">
                    <label>Branch</label>
                    <span>{loan.lendingBranch}</span>
                  </div>
                </div>

                {loan.description && (
                  <div className="loan-description">
                    <label>Purpose</label>
                    <p>{loan.description}</p>
                  </div>
                )}
              </div>

              <div className="loan-card-actions">
                <button 
                  className="action-button view-button"
                  onClick={() => showInfo('Loan details view will be available soon.', {
                    title: 'Coming Soon',
                    position: 'center'
                  })}
                >
                  <Eye size={16} />
                  View Details
                </button>
                <button 
                  className="action-button reject-button"
                  onClick={() => handleRejectClick(loan)}
                  disabled={processingLoanId === loan.id}
                >
                  <X size={16} />
                  Reject
                </button>
                <button 
                  className="action-button approve-button"
                  onClick={() => handleApproveClick(loan)}
                  disabled={processingLoanId === loan.id}
                >
                  <Check size={16} />
                  Approve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && selectedLoan && (
        <div className="modal-overlay">
          <div className="approval-modal">
            <div className="modal-header">
              <h3>APPROVE Loan</h3>
              <button
                className="close-button"
                onClick={() => setShowApprovalModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="loan-summary">
                <p><strong>Loan Number:</strong> {selectedLoan.loanNumber}</p>
                <p><strong>Amount:</strong> {formatCurrency(selectedLoan.principalAmount)}</p>
                <p><strong>Client:</strong> {selectedLoan.clientName || `Client #${selectedLoan.clientId}`}</p>
                <p><strong>Loan Officer:</strong> {selectedLoan.loanOfficerName || 'N/A'}</p>
              </div>
              <div className="form-group">
                <label>Approval Notes (Optional)</label>
                <textarea
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  placeholder="Add any notes about this approval..."
                  rows={3}
                />
              </div>
            </div>
            <div className="modal-actions">
              <button 
                className="cancel-button"
                onClick={() => setShowApprovalModal(false)}
              >
                Cancel
              </button>
              <button 
                className="confirm-approve-button"
                onClick={handleApproveLoan}
                disabled={processingLoanId === selectedLoan.id}
              >
                {processingLoanId === selectedLoan.id ? 'Approving...' : 'Confirm Approval'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && selectedLoan && (
        <div className="modal-overlay">
          <div className="rejection-modal">
            <div className="modal-header">
              <h3>Reject Loan</h3>
              <button 
                className="close-button"
                onClick={() => setShowRejectionModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="loan-summary">
                <p><strong>Loan Number:</strong> {selectedLoan.loanNumber}</p>
                <p><strong>Amount:</strong> {formatCurrency(selectedLoan.principalAmount)}</p>
                <p><strong>Client:</strong> {selectedLoan.clientName || `Client #${selectedLoan.clientId}`}</p>
                <p><strong>Loan Officer:</strong> {selectedLoan.loanOfficerName || 'N/A'}</p>
              </div>
              <div className="form-group">
                <label>Reason for Rejection *</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please provide a detailed reason for rejecting this loan..."
                  rows={4}
                  required
                />
              </div>
            </div>
            <div className="modal-actions">
              <button 
                className="cancel-button"
                onClick={() => setShowRejectionModal(false)}
              >
                Cancel
              </button>
              <button 
                className="confirm-reject-button"
                onClick={handleRejectLoan}
                disabled={processingLoanId === selectedLoan.id || !rejectionReason.trim()}
              >
                {processingLoanId === selectedLoan.id ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Notification Modal */}
      <NotificationModal
        isOpen={notification.isOpen}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onClose={hideNotification}
        autoClose={notification.autoClose}
        position={notification.position}
      />
    </div>
  );
};

export default LoanApprovalWorkflow;
