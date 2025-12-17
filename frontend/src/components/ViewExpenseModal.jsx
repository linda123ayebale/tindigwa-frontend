import React from 'react';
import { X } from 'lucide-react';
import AuthService from '../services/authService';
import './ViewExpenseModal.css';

const ViewExpenseModal = ({ isOpen, expense, onClose }) => {
  if (!isOpen || !expense) return null;

  const formatCurrency = (amount) => {
    return `UGX ${Number(amount || 0).toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'PENDING':
        return 'status-pending';
      case 'APPROVED':
        return 'status-completed';
      case 'REJECTED':
        return 'status-cancelled';
      case 'PAID':
        return 'status-paid';
      default:
        return 'status-default';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-view" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Expense Details</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="detail-grid">
            {/* Basic Information */}
            <div className="detail-section">
              <h3>Basic Information</h3>
              <div className="detail-item">
                <label>Expense Name</label>
                <span>{expense.expenseName || expense.description || '-'}</span>
              </div>
              <div className="detail-item">
                <label>Category</label>
                <span>{expense.categoryName || expense.category?.categoryName || '-'}</span>
              </div>
              <div className="detail-item">
                <label>Amount</label>
                <span className="amount-highlight">{formatCurrency(expense.amount)}</span>
              </div>
              <div className="detail-item">
                <label>Description</label>
                <span>{expense.description || '-'}</span>
              </div>
            </div>

            {/* Request Information */}
            <div className="detail-section">
              <h3>Request Information</h3>
              <div className="detail-item">
                <label>Requested By</label>
                <span>
                  {expense.requestedByUserId
                    ? AuthService.getUserFullNameById(expense.requestedByUserId)
                    : '-'}
                </span>
              </div>
              <div className="detail-item">
                <label>Requested Date</label>
                <span>{formatDate(expense.createdAt || expense.expenseDate)}</span>
              </div>
            </div>

            {/* Approval Information */}
            <div className="detail-section">
              <h3>Approval Status</h3>
              <div className="detail-item">
                <label>Approval Status</label>
                <span className={`status-badge ${getStatusBadgeClass(expense.approvalStatus)}`}>
                  {expense.approvalStatus || 'PENDING'}
                </span>
              </div>
              {expense.approvalStatus === 'APPROVED' && (
                <>
                  <div className="detail-item">
                    <label>Approved By</label>
                    <span>
                      {expense.approvedByUserId
                        ? AuthService.getUserFullNameById(expense.approvedByUserId)
                        : '-'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Approved Date</label>
                    <span>{formatDate(expense.approvedAt)}</span>
                  </div>
                </>
              )}
              {expense.approvalStatus === 'REJECTED' && (
                <>
                  <div className="detail-item">
                    <label>Rejected By</label>
                    <span>
                      {expense.approvedByUserId
                        ? AuthService.getUserFullNameById(expense.approvedByUserId)
                        : '-'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Rejected Date</label>
                    <span>{formatDate(expense.approvedAt)}</span>
                  </div>
                  <div className="detail-item detail-full">
                    <label>Rejection Comment</label>
                    <span className="rejection-text">{expense.approvalComment || 'No comment provided'}</span>
                  </div>
                </>
              )}
              {expense.approvalComment && expense.approvalStatus === 'APPROVED' && (
                <div className="detail-item detail-full">
                  <label>Approval Comment</label>
                  <span>{expense.approvalComment}</span>
                </div>
              )}
            </div>

            {/* Payment Information */}
            {expense.approvalStatus === 'APPROVED' && (
              <div className="detail-section">
                <h3>Payment Status</h3>
                <div className="detail-item">
                  <label>Payment Status</label>
                  <span className={`status-badge ${getStatusBadgeClass(expense.paymentStatus === 'PAID' ? 'PAID' : 'PENDING')}`}>
                    {expense.paymentStatus || 'UNPAID'}
                  </span>
                </div>
                {expense.paymentStatus === 'PAID' && (
                  <>
                    <div className="detail-item">
                      <label>Paid By</label>
                      <span>
                        {expense.paidByUserId
                          ? AuthService.getUserFullNameById(expense.paidByUserId)
                          : '-'}
                      </span>
                    </div>
                    <div className="detail-item">
                      <label>Payment Date</label>
                      <span>{formatDate(expense.paidAt)}</span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-close" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewExpenseModal;
