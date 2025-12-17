import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, XCircle, Eye, BarChart3, Trash2 } from 'lucide-react';
import LoanService from '../../services/loanService';

import useLoanWebSocket from '../../hooks/useLoanWebSocket';
import { toast } from 'react-hot-toast';
import Sidebar from '../../components/Layout/Sidebar';
import StatusBadge from '../../components/StatusBadge';
import '../../styles/actions.css';
import './RejectedLoans.css';

const RejectedLoans = () => {
  const navigate = useNavigate();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [processingLoanId, setProcessingLoanId] = useState(null);
  const itemsPerPage = 5;

  const fetchRejectedLoans = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching rejected loans...');
      
      const response = await LoanService.getRejectedLoans();
      const rejectedData = response?.data || [];
      
      // Ensure it's an array
      if (!Array.isArray(rejectedData)) {
        console.error('❌ Expected array, got:', typeof rejectedData);
        setLoans([]);
        toast.error('Invalid data format received');
        return;
      }
      
      console.log('✅ Rejected Loans - Received:', rejectedData.length, 'loans');
      if (rejectedData.length > 0) {
        console.log('📊 Sample rejected loan:', rejectedData[0]);
        console.log('🔍 DTO Fields present:', {
          loanNumber: rejectedData[0].loanNumber,
          clientName: rejectedData[0].clientName,
          loanProductName: rejectedData[0].loanProductName,
          principalAmount: rejectedData[0].principalAmount,
          workflowStatus: rejectedData[0].workflowStatus,
          rejectionReason: rejectedData[0].rejectionReason,
          releaseDate: rejectedData[0].releaseDate,
          createdAt: rejectedData[0].createdAt
        });
      }
      
      setLoans(rejectedData);
      
      if (rejectedData.length === 0) {
        console.log('ℹ️ No rejected loans found');
      }
    } catch (error) {
      console.error('❌ Error fetching rejected loans:', error);
      toast.error('Failed to load rejected loans');
      setLoans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRejectedLoans();
  }, []);

  // WebSocket integration for real-time updates
  useLoanWebSocket((message) => {
    if (message.action === 'loan.rejected' || message.action === 'loan.deleted') {
      fetchRejectedLoans();
    }
  });
  
  // Delete rejected loan
  const handleDeleteLoan = async (loanId) => {
    const loanToDelete = loans.find(loan => loan.id === loanId);
    
    if (!loanToDelete) {
      toast.error('Loan not found!');
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

  const filteredLoans = (loans || []).filter(loan => {
    const search = searchTerm.toLowerCase();
    return (
      loan.loanNumber?.toLowerCase().includes(search) ||
      loan.clientName?.toLowerCase().includes(search) ||
      loan.loanProductName?.toLowerCase().includes(search) ||
      loan.rejectionReason?.toLowerCase().includes(search)
    );
  });

  // Pagination
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
            <h1>Rejected Loans</h1>
            <p className="page-description">View loans that were rejected</p>
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
              <p className="loading-text">Loading rejected loans...</p>
            </div>
          ) : filteredLoans.length === 0 ? (
            <div className="empty-state-pending">
              <XCircle size={48} />
              <p>No rejected loans available</p>
              <span className="empty-state-description">Loans that are rejected will appear here</span>
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
                          <StatusBadge status={loan.workflowStatus || 'rejected'} size="sm" />
                        </td>
                        <td>
                          <StatusBadge status={loan.loanStatus || 'rejected'} size="sm" />
                        </td>
                        <td>
                          <div className="action-buttons">
                            {/* View Details - Always visible */}
                            <button
                              onClick={() => navigate(`/loans/details/${loan.id}`)}
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
                            
                            {/* Delete - For REJECTED loans */}
                            <button
                              onClick={() => handleDeleteLoan(loan.id)}
                              className="action-btn delete"
                              title="Delete Loan"
                              disabled={processingLoanId === loan.id}
                            >
                              <Trash2 size={16} />
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
    </div>
  );
};

export default RejectedLoans;
