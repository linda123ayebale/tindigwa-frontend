import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CreditCard, 
  DollarSign, 
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  Send,
  DollarSign as PaymentIcon,
  AlertCircle,
  Clock,
  CheckCircle,
  BarChart3,
  Archive
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import AddPaymentModal from './AddPaymentModal';
import StatusBadge from '../../components/StatusBadge';
import LoanService from '../../services/loanService';
import useLoanWebSocket from '../../hooks/useLoanWebSocket';
// Permission checks disabled - will be handled in roles module
// import { canPerform, canModifyLoan, canApproveLoan, canDisburseLoan, getAllowedActions } from '../../utils/permissions';
import Sidebar from '../../components/Layout/Sidebar';
import '../../styles/table-common.css';
import '../../styles/actions.css';
import './AllLoans.css';
import './LoansTable.css';

const AllLoans = () => {
  const navigate = useNavigate();
  const [loans, setLoans] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Edit modal removed - now navigates to Edit page
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentLoan, setPaymentLoan] = useState(null);
  const [activeTab, setActiveTab] = useState('loans'); // 'loans' or 'approvals'
  const [currentUserRole] = useState('ADMIN'); // Should come from auth context
  const [currentUserId] = useState(1); // Should come from auth context
  const [currentPage, setCurrentPage] = useState(1);
  const [processingLoanId, setProcessingLoanId] = useState(null);
  const [showActionMenu, setShowActionMenu] = useState(null);

  // WebSocket integration for realtime updates
  useLoanWebSocket((message) => {
    console.log('Loan WebSocket event:', message);
    loadLoans(); // Reload loans on any loan event
  });

  // Calculate loan status based on start date, duration, and grace period

  // Load loans from API
  useEffect(() => {
    loadLoans();
  }, []);

  const loadLoans = async () => {
    try {
      const response = await LoanService.getApprovedLoans();
      const loansData = response.data || [];
      console.log('✅ All Loans - Loaded', loansData.length, 'approved loans');
      
      if (loansData.length > 0) {
        console.log('📊 Sample DTO fields:', {
          id: loansData[0].id,
          loanNumber: loansData[0].loanNumber,
          clientName: loansData[0].clientName,
          loanProductName: loansData[0].loanProductName,
          principalAmount: loansData[0].principalAmount,
          workflowStatus: loansData[0].workflowStatus,
          loanStatus: loansData[0].loanStatus,
          createdAt: loansData[0].createdAt,
          releaseDate: loansData[0].releaseDate
        });
      }
      
      setLoans(loansData);
    } catch (error) {
      console.error('Error loading loans:', error);
      setLoans([]);
    }
  };

  // Approve loan
  const handleApproveLoan = async (loanId) => {
    // Permission check disabled - will be handled in roles module
    // if (!canApproveLoan(loans.find(l => l.id === loanId)?.loanStatus, currentUserRole)) {
    //   toast.error('You do not have permission to approve this loan');
    //   return;
    // }
    
    try {
      setProcessingLoanId(loanId);
      const response = await fetch(`http://localhost:8081/api/loans/${loanId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvedById: currentUserId })
      });
      
      if (response.ok) {
        toast.success('Loan approved successfully');
        await loadLoans();
      } else {
        const error = await response.text();
        toast.error(`Failed to approve loan: ${error}`);
      }
    } catch (error) {
      console.error('Error approving loan:', error);
      toast.error('Error approving loan');
    } finally {
      setProcessingLoanId(null);
    }
  };

  // Reject loan
  const handleRejectLoan = async (loanId) => {
    const reason = prompt('Please enter rejection reason:');
    if (!reason) return;
    
    try {
      setProcessingLoanId(loanId);
      const response = await fetch(`http://localhost:8081/api/loans/${loanId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rejectedById: currentUserId, rejectionReason: reason })
      });
      
      if (response.ok) {
        toast.success('Loan rejected');
        await loadLoans();
      } else {
        const error = await response.text();
        toast.error(`Failed to reject loan: ${error}`);
      }
    } catch (error) {
      console.error('Error rejecting loan:', error);
      toast.error('Error rejecting loan');
    } finally {
      setProcessingLoanId(null);
    }
  };

  // Disburse loan
  const handleDisburseLoan = async (loanId) => {
    // Permission check disabled - will be handled in roles module
    // if (!canDisburseLoan(loans.find(l => l.id === loanId)?.loanStatus, currentUserRole)) {
    //   toast.error('You do not have permission to disburse this loan');
    //   return;
    // }
    
    if (!window.confirm('Disburse this loan? This action will mark the loan as DISBURSED.')) return;
    
    try {
      setProcessingLoanId(loanId);
      const response = await fetch(`http://localhost:8081/api/loans/${loanId}/disburse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disbursedById: currentUserId })
      });
      
      if (response.ok) {
        toast.success('Loan disbursed successfully');
        await loadLoans();
      } else {
        const error = await response.text();
        toast.error(`Failed to disburse loan: ${error}`);
      }
    } catch (error) {
      console.error('Error disbursing loan:', error);
      toast.error('Error disbursing loan');
    } finally {
      setProcessingLoanId(null);
    }
  };


  const handleDeleteLoan = async (loanId) => {
    const loanToDelete = loans.find(loan => loan.id === loanId);
    
    if (!loanToDelete) {
      toast.error('Loan not found!');
      return;
    }
    
    // Only REJECTED loans can be deleted
    if (loanToDelete.workflowStatus?.toUpperCase() !== 'REJECTED') {
      toast.error('Only rejected loans can be deleted');
      return;
    }
    
    if (!window.confirm(`Are you sure you want to permanently delete loan ${loanToDelete.loanNumber}? This action cannot be undone.`)) {
      return;
    }
    
    try {
      setProcessingLoanId(loanId);
      await LoanService.deleteLoan(loanId);
      
      toast.success(`Loan ${loanToDelete.loanNumber} deleted successfully`);
      
      // Remove from local state
      setLoans(prevLoans => prevLoans.filter(loan => loan.id !== loanId));
      
      console.log(`🗑️ Loan ${loanId} deleted:`, {
        deletedAt: new Date().toISOString(),
        loanNumber: loanToDelete.loanNumber,
        clientName: loanToDelete.clientName
      });
    } catch (error) {
      console.error('Error deleting loan:', error);
      toast.error('Failed to delete loan');
    } finally {
      setProcessingLoanId(null);
    }
  };
  
  const handleArchiveLoan = async (loanId) => {
    const loanToArchive = loans.find(loan => loan.id === loanId);
    
    if (!loanToArchive) {
      toast.error('Loan not found!');
      return;
    }
    
    // Only COMPLETED loans can be archived
    if (loanToArchive.loanStatus?.toUpperCase() !== 'COMPLETED') {
      toast.error('Only completed loans can be archived');
      return;
    }
    
    if (!window.confirm(`Archive loan ${loanToArchive.loanNumber}? It will be moved to the archived loans list.`)) {
      return;
    }
    
    try {
      setProcessingLoanId(loanId);
      await LoanService.archiveLoan(loanId);
      
      toast.success(`Loan ${loanToArchive.loanNumber} archived successfully`);
      
      // Remove from active loans list
      setLoans(prevLoans => prevLoans.filter(loan => loan.id !== loanId));
      
      console.log(`📦 Loan ${loanId} archived:`, {
        archivedAt: new Date().toISOString(),
        loanNumber: loanToArchive.loanNumber,
        clientName: loanToArchive.clientName
      });
    } catch (error) {
      console.error('Error archiving loan:', error);
      toast.error('Failed to archive loan');
    } finally {
      setProcessingLoanId(null);
    }
  };


  const handleViewLoan = (loan) => {
    navigate(`/loans/details/${loan.id}`);
  };

  const handleEditLoan = (loan) => {
    navigate(`/loans/edit/${loan.id}`);
  };

  const handleAddPayment = (loan) => {
    setPaymentLoan(loan);
    setIsPaymentModalOpen(true);
    setShowActionMenu(null);
  };

  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setPaymentLoan(null);
  };

  const handleSavePayment = async (updatedLoan, paymentRecord) => {
    try {
      let paymentResponse = null;
      let createdPayment = null;
      
      // Try to create payment via API first
      try {
        paymentResponse = await fetch('http://localhost:8081/api/payments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            loanId: updatedLoan.id,
            amount: paymentRecord.amount,
            paymentDate: paymentRecord.paymentDate,
            paymentMethod: paymentRecord.paymentMethod,
            referenceNumber: paymentRecord.referenceNumber,
            notes: paymentRecord.notes
          }),
        });

        if (paymentResponse.ok) {
          createdPayment = await paymentResponse.json();
          console.log('Payment created via API:', createdPayment);
        } else {
          console.log('API payment creation failed, will use local storage');
        }
      } catch (apiError) {
        console.log('Payment API not available, using local storage:', apiError.message);
      }
      
      // Note: Payment is already stored in AddPaymentModal, so we don't need to store it again
      // This avoids duplicate payments in the system
      
      // Try to update loan via API
      try {
        const loanResponse = await fetch(`http://localhost:8081/api/loans/${updatedLoan.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedLoan),
        });

        if (loanResponse.ok) {
          const savedLoan = await loanResponse.json();
          console.log('Loan updated via API:', savedLoan);
          
          // Update local state after successful API call
          setLoans(prevLoans => 
            prevLoans.map(loan => 
              loan.id === savedLoan.id ? savedLoan : loan
            )
          );
        } else {
          console.log('Loan API update failed, updating local state only');
          // Update local state even if API fails
          setLoans(prevLoans => 
            prevLoans.map(loan => 
              loan.id === updatedLoan.id ? updatedLoan : loan
            )
          );
        }
      } catch (apiError) {
        console.log('Loan API not available, updating local state:', apiError.message);
        // Update local state when API is not available
        setLoans(prevLoans => 
          prevLoans.map(loan => 
            loan.id === updatedLoan.id ? updatedLoan : loan
          )
        );
      }
      
      console.log('Payment processed successfully (API + Local)');
      
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error; // Re-throw to let modal handle the error
    }
  };




  // Close action menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowActionMenu(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Filter loans based on search term and status
  const filteredLoans = loans.filter(loan => {
    const matchesSearch = 
      loan.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.loanNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.clientName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    
    return matchesSearch && loan.statusBadgeClass === statusFilter;
  });

  // Pagination logic
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredLoans.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLoans = filteredLoans.slice(startIndex, endIndex);

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

  // Reset to page 1 when search or filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const formatCurrency = (amount) => {
    return `USh ${amount.toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="page-header">
          <div className="header-content">
            <h1>All Loans</h1>
          </div>
          <button 
            className="add-loan-btn"
            onClick={() => navigate('/loans/add')}
          >
            <Plus size={16} />
            Register New Loan
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button 
            className={`tab-button ${activeTab === 'loans' ? 'active' : ''}`}
            onClick={() => setActiveTab('loans')}
          >
            <CreditCard size={16} />
            All Loans
            <span className="tab-count">{loans.length}</span>
          </button>
          {currentUserRole === 'CASHIER' && (
            <button 
              className={`tab-button ${activeTab === 'approvals' ? 'active' : ''}`}
              onClick={() => setActiveTab('approvals')}
            >
              <Clock size={16} />
              Pending Approvals
            </button>
          )}
        </div>

        {activeTab === 'loans' && (
          <div className="loans-content">
            {/* Stats Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">
                  <CreditCard size={24} />
                </div>
                <div className="stat-info">
                  <h3>{loans.length}</h3>
                  <p>Total Loans</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <CheckCircle size={24} />
                </div>
                <div className="stat-info">
                  <h3>{loans.filter(loan => loan.statusBadgeClass === 'active' || loan.status === 'Open').length}</h3>
                  <p>Active Loans</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <DollarSign size={24} />
                </div>
                <div className="stat-info">
                  <h3>{formatCurrency(loans.reduce((sum, loan) => sum + (loan.balance || 0), 0))}</h3>
                  <p>Outstanding</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <AlertCircle size={24} />
                </div>
                <div className="stat-info">
                  <h3>{loans.filter(loan => loan.statusBadgeClass === 'overdue' || loan.statusBadgeClass === 'defaulted').length}</h3>
                  <p>At Risk</p>
                </div>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="filters-section">
              <div className="search-box">
                <Search size={20} />
                <input
                  type="text"
                  placeholder="Search loans by client name, loan ID, or officer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="filter-group">
                <Filter size={20} />
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="overdue">Overdue</option>
                  <option value="defaulted">Defaulted</option>
                </select>
              </div>
            </div>

          {/* Loans Table */}
          <div className="table-container">
            {filteredLoans.length === 0 ? (
              <div className="empty-state">
                <CreditCard size={48} />
                <h3>No loans found</h3>
                <p>
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filter criteria.'
                    : 'Get started by registering your first loan.'
                  }
                </p>
                {!searchTerm && statusFilter === 'all' && (
                  <button 
                    className="add-button primary"
                    onClick={() => navigate('/loans/add')}
                  >
                    <Plus size={16} />
                    Register Your First Loan
                  </button>
                )}
              </div>
            ) : (
              <>
                <table className="loans-table">
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
                    {currentLoans.map((loan) => (
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
                              className="action-btn view"
                              title="View Details"
                              onClick={() => handleViewLoan(loan)}
                              disabled={processingLoanId === loan.id}
                            >
                              <Eye size={16} />
                            </button>
                            
                            {/* View Payment Tracking - Always visible */}
                            <button 
                              className="action-btn tracking"
                              title="View Payment Tracking"
                              onClick={() => navigate(`/loans/tracking/${loan.id}`)}
                              disabled={processingLoanId === loan.id}
                            >
                              <BarChart3 size={16} />
                            </button>
                            
                            {/* Edit - Only when loanStatus === 'OPEN' */}
                            {loan.loanStatus?.toUpperCase() === 'OPEN' && (
                              <button 
                                className="action-btn edit"
                                title="Edit Loan"
                                onClick={() => handleEditLoan(loan)}
                                disabled={processingLoanId === loan.id}
                              >
                                <Edit size={16} />
                              </button>
                            )}
                            
                            {/* Delete - Only for REJECTED loans */}
                            {loan.workflowStatus?.toUpperCase() === 'REJECTED' && (
                              <button 
                                className="action-btn delete"
                                title="Delete Loan"
                                onClick={() => handleDeleteLoan(loan.id)}
                                disabled={processingLoanId === loan.id}
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                            
                            {/* Archive - Only for COMPLETED loans */}
                            {loan.loanStatus?.toUpperCase() === 'COMPLETED' && (
                              <button 
                                className="action-btn archive"
                                title="Archive Loan"
                                onClick={() => handleArchiveLoan(loan.id)}
                                disabled={processingLoanId === loan.id}
                              >
                                <Archive size={16} />
                              </button>
                            )}
                            
                            {/* Approve & Reject - Only when workflowStatus === 'PENDING_APPROVAL' */}
                            {loan.workflowStatus?.toUpperCase() === 'PENDING_APPROVAL' && (
                              <>
                                <button 
                                  className="action-btn approve"
                                  title="Approve Loan"
                                  onClick={() => handleApproveLoan(loan.id)}
                                  disabled={processingLoanId === loan.id}
                                >
                                  <CheckCircle2 size={16} />
                                </button>
                                <button 
                                  className="action-btn reject"
                                  title="Reject Loan"
                                  onClick={() => handleRejectLoan(loan.id)}
                                  disabled={processingLoanId === loan.id}
                                >
                                  <XCircle size={16} />
                                </button>
                              </>
                            )}
                            
                            {/* Disburse - Only when workflowStatus === 'APPROVED' */}
                            {loan.workflowStatus?.toUpperCase() === 'APPROVED' && (
                              <button 
                                className="action-btn disburse"
                                title="Disburse Loan"
                                onClick={() => handleDisburseLoan(loan.id)}
                                disabled={processingLoanId === loan.id}
                              >
                                <Send size={16} />
                              </button>
                            )}
                            
                            {/* Add Payment - Only when workflowStatus === 'DISBURSED' and has balance */}
                            {loan.workflowStatus?.toUpperCase() === 'DISBURSED' && (loan.balance || 0) > 0 && (
                              <button 
                                className="action-btn payment"
                                title="Add Payment"
                                onClick={() => handleAddPayment(loan)}
                                disabled={processingLoanId === loan.id}
                              >
                                <PaymentIcon size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {/* Pagination */}
                {filteredLoans.length > 0 && (
                  <div className="pagination-container">
                    <div className="pagination-info">
                      <p>Showing {startIndex + 1}-{Math.min(endIndex, filteredLoans.length)} of {filteredLoans.length} loans</p>
                    </div>
                    {filteredLoans.length > itemsPerPage && (
                      <div className="pagination">
                        <button 
                          className="pagination-btn"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </button>
                        {renderPaginationButtons()}
                        <button 
                          className="pagination-btn"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          </div>
        )}

        {activeTab === 'approvals' && (
          <div className="approvals-content">
            <div className="page-section">
              <h2>Pending Approvals</h2>
              <p>Review and approve or reject loan applications</p>
              {loans.filter(l => l.workflowStatus === 'PENDING_APPROVAL').length === 0 ? (
                <div className="empty-state">
                  <Clock size={48} />
                  <h3>No pending approvals</h3>
                  <p>All loan applications have been processed.</p>
                </div>
              ) : (
                <table className="loans-table">
                  <thead>
                    <tr>
                      <th>Client</th>
                      <th>Loan Number</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loans.filter(l => l.workflowStatus === 'PENDING_APPROVAL').map((loan) => (
                      <tr key={loan.id}>
                        <td>{loan.name || 'Unknown Client'}</td>
                        <td className="loan-number">{loan.loanNumber}</td>
                        <td className="amount">{loan.principalFormatted}</td>
                        <td><StatusBadge status={loan.workflowStatus} size="sm" /></td>
                        <td>{loan.createdAt ? formatDate(loan.createdAt) : '-'}</td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="action-btn approve"
                              onClick={() => handleApproveLoan(loan.id)}
                              disabled={processingLoanId === loan.id}
                              title="Approve"
                            >
                              <CheckCircle2 size={16} />
                            </button>
                            <button 
                              className="action-btn reject"
                              onClick={() => handleRejectLoan(loan.id)}
                              disabled={processingLoanId === loan.id}
                              title="Reject"
                            >
                              <XCircle size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

      </main>

      {/* Add Payment Modal */}
      <AddPaymentModal
        loan={paymentLoan}
        isOpen={isPaymentModalOpen}
        onClose={handleClosePaymentModal}
        onSave={handleSavePayment}
      />
    </div>
  );
};

export default AllLoans;
