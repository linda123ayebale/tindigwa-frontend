import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, CheckCircle, XCircle, Eye, Edit, Trash2, BarChart3 } from 'lucide-react';
import LoanService from '../../services/loanService';

import useLoanWebSocket from '../../hooks/useLoanWebSocket';
import { toast } from 'react-hot-toast';
import Sidebar from '../../components/Layout/Sidebar';
import StatusBadge from '../../components/StatusBadge';

import DeleteLoanModal from './DeleteLoanModal';
import '../../styles/actions.css';
// Permission checks disabled - will be handled in roles module
// import { canModifyLoan, canApproveLoan } from '../../utils/permissions';
import './PendingApprovals.css';

const PendingApprovals = () => {
  const navigate = useNavigate();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [comment, setComment] = useState('');
  const [processing, setProcessing] = useState(false);
  const [processingLoanId, setProcessingLoanId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [currentUserId] = useState(1); // Should come from auth context
  
  // Edit modal removed - now navigates to Edit page
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingLoan, setDeletingLoan] = useState(null);

  const fetchPendingLoans = async () => {
    try {
      setLoading(true);
      const response = await LoanService.getLoansPendingApproval();
      const loansData = response.data || [];
      
      console.log('✅ Pending Approvals - Received:', loansData.length, 'loans');
      if (loansData.length > 0) {
        console.log('📊 Sample loan data:', loansData[0]);
        console.log('🔍 DTO Fields present:', {
          loanNumber: loansData[0].loanNumber,
          clientName: loansData[0].clientName,
          loanProductName: loansData[0].loanProductName,
          principalAmount: loansData[0].principalAmount,
          workflowStatus: loansData[0].workflowStatus,
          releaseDate: loansData[0].releaseDate,
          createdAt: loansData[0].createdAt
        });
      }
      
      setLoans(loansData);
    } catch (error) {
      console.error('❌ Error fetching pending loans:', error);
      toast.error('Failed to load pending loans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingLoans();
  }, []);

  // WebSocket integration for real-time updates
  useLoanWebSocket((message) => {
    if (message.action === 'loan.approved' || message.action === 'loan.rejected') {
      fetchPendingLoans();
    }
  });

  const handleApprove = (loan) => {
    setSelectedLoan(loan);
    setModalAction('approve');
    setShowModal(true);
  };

  const handleReject = (loan) => {
    setSelectedLoan(loan);
    setModalAction('reject');
    setShowModal(true);
  };

  const submitAction = async () => {
    if (!selectedLoan) return;

    setProcessing(true);
    setProcessingLoanId(selectedLoan.id);
    try {
      if (modalAction === 'approve') {
        await LoanService.approveLoan(selectedLoan.id, currentUserId);
        toast.success('Loan approved successfully');
      } else if (modalAction === 'reject') {
        const reason = prompt('Please enter rejection reason:');
        if (!reason) {
          setProcessing(false);
          setProcessingLoanId(null);
          return;
        }
        await LoanService.rejectLoan(selectedLoan.id, currentUserId, reason);
        toast.success('Loan rejected successfully');
      }
      
      setShowModal(false);
      setComment('');
      setSelectedLoan(null);
      fetchPendingLoans();
    } catch (error) {
      console.error('Error processing loan:', error);
      toast.error(`Failed to ${modalAction} loan`);
    } finally {
      setProcessing(false);
      setProcessingLoanId(null);
    }
  };

  // Edit loan handler
  const handleEditLoan = (loan) => {
    navigate(`/loans/edit/${loan.id}`);
  };

  // Delete loan handler
  const handleDeleteLoan = (loan) => {
    setDeletingLoan(loan);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingLoan(null);
  };

  const handleConfirmDelete = async (loanId) => {
    try {
      await LoanService.deleteLoan(loanId);
      toast.success('Loan deleted successfully');
      await fetchPendingLoans();
    } catch (error) {
      console.error('Error deleting loan:', error);
      toast.error('Failed to delete loan');
      throw error;
    }
  };

  // View loan handler
  const handleViewLoan = (loan) => {
    navigate(`/loans/details/${loan.id}`);
  };

  const filteredLoans = (loans || []).filter(loan => {
    const search = searchTerm.toLowerCase();
    return (
      loan.loanNumber?.toLowerCase().includes(search) ||
      loan.clientName?.toLowerCase().includes(search) ||
      loan.loanProductName?.toLowerCase().includes(search)
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredLoans.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLoans = filteredLoans.slice(startIndex, endIndex);
  
  // Debug: Log rendering info
  React.useEffect(() => {
    if (currentLoans.length > 0) {
      console.log('📖 Rendering', currentLoans.length, 'loans on page', currentPage);
      console.log('📄 Table will display:', currentLoans.map(l => ({
        id: l.id,
        loanNumber: l.loanNumber,
        clientName: l.clientName,
        productName: l.loanProductName
      })));
    }
  }, [currentLoans, currentPage]);

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

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <div className="page-header">
          <div className="header-content">
            <h1>Pending Approvals</h1>
            <p className="page-description">Review and approve or reject loan applications</p>
          </div>
        </div>

        <div className="clients-content">
          {/* Search Bar */}
          <div className="clients-controls">
            <div className="search-box">
              <Search className="search-icon" size={20} />
              <input
                type="text"
                placeholder="Search by client, loan number or officer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Loans Table */}
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p className="loading-text">Loading pending loans...</p>
            </div>
          ) : filteredLoans.length === 0 ? (
            <div className="empty-state-pending">
              <CheckCircle size={48} />
              <p>No pending approvals</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Loan Number</th>
                    <th>Amount</th>
                    <th>Workflow Status</th>
                    <th>Loan Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentLoans.map((loan) => {
                    return (
                      <tr key={loan.id}>
                        <td>{loan.clientName || 'Unknown Client'}</td>
                        <td className="loan-number">{loan.loanNumber}</td>
                        <td className="amount">{formatCurrency(loan.principalAmount || 0)}</td>
                        <td>
                          <StatusBadge status={loan.workflowStatus || 'pending_approval'} size="sm" />
                        </td>
                        <td>
                          <StatusBadge status={loan.loanStatus || 'pending'} size="sm" />
                        </td>
                        <td className="actions-cell">
                          <div className="actions-group">
                            {/* View Details - Always visible */}
                            <button
                              onClick={() => handleViewLoan(loan)}
                              className="action-btn view"
                              title="View Details"
                              disabled={processingLoanId === loan.id}
                            >
                              <Eye size={16} />
                            </button>
                            
                            {/* View Payment Tracking - Always visible */}
                            <button
                              onClick={() => navigate(`/loans/tracking/${loan.id}`)}
                              className="action-btn tracking"
                              title="View Payment Tracking"
                              disabled={processingLoanId === loan.id}
                            >
                              <BarChart3 size={16} />
                            </button>
                            
                            {/* Edit & Delete - Only when loanStatus === 'OPEN' */}
                            {loan.loanStatus?.toUpperCase() === 'OPEN' && (
                              <>
                                <button
                                  onClick={() => handleEditLoan(loan)}
                                  className="action-btn edit"
                                  title="Edit Loan"
                                  disabled={processingLoanId === loan.id}
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeleteLoan(loan)}
                                  className="action-btn delete"
                                  title="Delete Loan"
                                  disabled={processingLoanId === loan.id}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </>
                            )}
                            
                            {/* Approve & Reject - Only when workflowStatus === 'PENDING_APPROVAL' */}
                            {loan.workflowStatus?.toUpperCase() === 'PENDING_APPROVAL' && (
                              <>
                                <button
                                  onClick={() => handleApprove(loan)}
                                  className="action-btn approve"
                                  title="Approve Loan"
                                  disabled={processingLoanId === loan.id}
                                >
                                  <CheckCircle size={16} />
                                </button>
                                <button
                                  onClick={() => handleReject(loan)}
                                  className="action-btn reject"
                                  title="Reject Loan"
                                  disabled={processingLoanId === loan.id}
                                >
                                  <XCircle size={16} />
                                </button>
                              </>
                            )}
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
                    Showing {startIndex + 1}-{Math.min(endIndex, filteredLoans.length)} of {filteredLoans.length}
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
                {modalAction === 'approve' ? 'Approve Loan' : 'Reject Loan'}
              </h3>
            </div>
            
            <div className="approval-modal-body">
              <div className="expense-info">
                <p>
                  <strong>Loan Number:</strong> {selectedLoan?.loanNumber}
                </p>
                <p>
                  <strong>Client:</strong> {selectedLoan?.clientName || '-'}
                </p>
                <p>
                  <strong>Amount:</strong> {formatCurrency(selectedLoan?.principalAmount || 0)}
                </p>
              </div>

              {modalAction === 'approve' && (
                <div className="form-group">
                  <label>Approval Comment (Optional)</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows="3"
                    placeholder="Add a comment..."
                  />
                </div>
              )}
            </div>

            <div className="approval-modal-actions">
              <button
                onClick={() => {
                  setShowModal(false);
                  setComment('');
                  setSelectedLoan(null);
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
      
      {/* Delete Loan Modal */}
      {isDeleteModalOpen && deletingLoan && (
        <DeleteLoanModal
          loan={deletingLoan}
          isOpen={isDeleteModalOpen}
          onClose={handleCloseDeleteModal}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
};

export default PendingApprovals;
