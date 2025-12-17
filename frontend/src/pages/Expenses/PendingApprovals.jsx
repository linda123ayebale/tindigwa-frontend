import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, Eye } from 'lucide-react';
import ExpensesService from '../../services/ExpensesService';
import AuthService from '../../services/authService';
import useExpenseWebSocket from '../../hooks/useExpenseWebSocket';
import ViewExpenseModal from '../../components/ViewExpenseModal';
import { toast } from 'react-hot-toast';
import Sidebar from '../../components/Layout/Sidebar';
import './PendingApprovals.css';

const PendingApprovals = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [comment, setComment] = useState('');
  const [processing, setProcessing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingExpense, setViewingExpense] = useState(null);
  const itemsPerPage = 5;

  const fetchPendingExpenses = async () => {
    try {
      setLoading(true);
      const response = await ExpensesService.getPendingExpenses();
      setExpenses(response.data);
    } catch (error) {
      console.error('Error fetching pending expenses:', error);
      toast.error('Failed to load pending expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingExpenses();
  }, []);

  // WebSocket integration for real-time updates
  useExpenseWebSocket((data) => {
    if (data.action === 'APPROVED' || data.action === 'REJECTED') {
      fetchPendingExpenses();
    }
  });

  const handleApprove = (expense) => {
    setSelectedExpense(expense);
    setModalAction('approve');
    setShowModal(true);
  };

  const handleReject = (expense) => {
    setSelectedExpense(expense);
    setModalAction('reject');
    setShowModal(true);
  };

  const handleViewExpense = (expense) => {
    setViewingExpense(expense);
    setShowViewModal(true);
  };

  const submitAction = async () => {
    if (!selectedExpense) return;

    setProcessing(true);
    try {
      const currentUser = AuthService.getUserFullName();
      
      if (modalAction === 'approve') {
        await ExpensesService.approveExpense(selectedExpense.id, {
          approvedBy: currentUser,
          approvalComment: comment
        });
        toast.success('Expense approved successfully');
      } else {
        if (!comment.trim()) {
          toast.error('Rejection comment is required');
          setProcessing(false);
          return;
        }
        await ExpensesService.rejectExpense(selectedExpense.id, {
          rejectedBy: currentUser,
          rejectionComment: comment
        });
        toast.success('Expense rejected successfully');
      }
      
      setShowModal(false);
      setComment('');
      setSelectedExpense(null);
      fetchPendingExpenses();
    } catch (error) {
      console.error('Error processing expense:', error);
      toast.error(`Failed to ${modalAction} expense`);
    } finally {
      setProcessing(false);
    }
  };

  const filteredExpenses = expenses.filter(expense =>
    expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.expenseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.categoryName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentExpenses = filteredExpenses.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisibleButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisibleButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);
    
    if (endPage - startPage + 1 < maxVisibleButtons) {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          className={`pagination-btn ${currentPage === i ? 'active' : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }
    
    return buttons;
  };

  // Reset to page 1 when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <div className="page-header">
          <div className="header-content">
            <h1>Pending Approvals</h1>
            <p className="page-description">Review and approve or reject expense requests</p>
          </div>
        </div>

        <div className="clients-content">
          {/* Search Bar */}
          <div className="clients-controls">
            <div className="search-box">
              <Search className="search-icon" size={20} />
              <input
                type="text"
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Expenses Table */}
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p className="loading-text">Loading pending expenses...</p>
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="empty-state-pending">
              <CheckCircle size={48} />
              <p>No pending approvals</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Expense</th>
                    <th>Amount</th>
                    <th>Requested By</th>
                    <th>Status</th>
                    <th style={{textAlign: 'right'}}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentExpenses.map((expense) => {
                    return (
                      <tr key={expense.id}>
                        <td style={{fontWeight: 500, color: '#374151'}}>
                          {expense.expenseName || expense.description || '-'}
                        </td>
                        <td className="amount-value">
                          {formatCurrency(expense.amount)}
                        </td>
                        <td>
                          {expense.requestedByUserId
                            ? AuthService.getUserFullNameById(expense.requestedByUserId)
                            : '-'}
                        </td>
                        <td>
                          <span className="status-badge status-pending">
                            PENDING
                          </span>
                        </td>
                        <td>
                          <div className="approval-actions" style={{justifyContent: 'flex-end'}}>
                            <button
                              onClick={() => handleViewExpense(expense)}
                              className="action-btn view"
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => handleApprove(expense)}
                              className="action-btn approve"
                              title="Approve"
                            >
                              <CheckCircle size={16} />
                            </button>
                            <button
                              onClick={() => handleReject(expense)}
                              className="action-btn reject"
                              title="Reject"
                            >
                              <XCircle size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination-container">
                  <div className="pagination-info">
                    Showing {startIndex + 1}-{Math.min(endIndex, filteredExpenses.length)} of {filteredExpenses.length}
                  </div>
                  <div className="pagination">
                    <button
                      className="pagination-btn"
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                    >
                      Previous
                    </button>
                    {renderPaginationButtons()}
                    <button
                      className="pagination-btn"
                      disabled={currentPage === totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Approval/Rejection Modal */}
      {showModal && (
        <div className="approval-modal-overlay">
          <div className="approval-modal-content">
            <div className="approval-modal-header">
              <h3>
                {modalAction === 'approve' ? 'Approve Expense' : 'Reject Expense'}
              </h3>
            </div>
            
            <div className="approval-modal-body">
              <div className="expense-info">
                <p>
                  <strong>Reference:</strong> {selectedExpense?.expenseReference}
                </p>
                <p>
                  <strong>Amount:</strong> {formatCurrency(selectedExpense?.amount)}
                </p>
                <p>
                  <strong>Description:</strong> {selectedExpense?.description}
                </p>
              </div>

              <div className="form-group">
                <label>
                  {modalAction === 'approve' ? 'Approval Comment (Optional)' : 'Rejection Reason (Required)'}
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows="3"
                  placeholder={modalAction === 'approve' ? 'Add a comment...' : 'Why is this being rejected?'}
                />
              </div>
            </div>

            <div className="approval-modal-actions">
              <button
                onClick={() => {
                  setShowModal(false);
                  setComment('');
                  setSelectedExpense(null);
                }}
                className="btn-cancel"
                disabled={processing}
              >
                Cancel
              </button>
              <button
                onClick={submitAction}
                disabled={processing}
                className={modalAction === 'approve' ? 'btn-approve' : 'btn-reject'}
              >
                {processing ? 'Processing...' : modalAction === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Expense Modal */}
      <ViewExpenseModal
        isOpen={showViewModal}
        expense={viewingExpense}
        onClose={() => setShowViewModal(false)}
      />
    </div>
  );
};

export default PendingApprovals;
