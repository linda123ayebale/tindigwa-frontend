import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, RotateCcw, Archive as ArchiveIcon } from 'lucide-react';
import LoanService from '../../services/loanService';
import useLoanWebSocket from '../../hooks/useLoanWebSocket';
import { toast } from 'react-hot-toast';
import Sidebar from '../../components/Layout/Sidebar';
import StatusBadge from '../../components/StatusBadge';
import '../../styles/table-common.css';
import './ArchivedLoans.css';

const ArchivedLoans = () => {
  const navigate = useNavigate();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [processingLoanId, setProcessingLoanId] = useState(null);
  const itemsPerPage = 5;

  const fetchArchivedLoans = async () => {
    try {
      setLoading(true);
      console.log('📂 Fetching archived loans...');
      
      const response = await LoanService.getArchivedLoans();
      const archivedData = response?.data || [];
      
      // Ensure it's an array
      if (!Array.isArray(archivedData)) {
        console.error('❌ Expected array, got:', typeof archivedData);
        setLoans([]);
        toast.error('Invalid data format received');
        return;
      }
      
      console.log('✅ Archived Loans - Received:', archivedData.length, 'loans');
      if (archivedData.length > 0) {
        console.log('📊 Sample archived loan:', archivedData[0]);
      }
      
      setLoans(archivedData);
      
      if (archivedData.length === 0) {
        console.log('ℹ️ No archived loans found');
      }
    } catch (error) {
      console.error('❌ Error fetching archived loans:', error);
      toast.error('Failed to load archived loans');
      setLoans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchivedLoans();
  }, []);

  // WebSocket integration for real-time updates
  useLoanWebSocket((message) => {
    if (message.action === 'loan.archived' || message.action === 'loan.unarchived') {
      fetchArchivedLoans();
    }
  });

  // Unarchive loan handler
  const handleUnarchiveLoan = async (loanId) => {
    const loanToUnarchive = loans.find(loan => loan.id === loanId);
    
    if (!loanToUnarchive) {
      toast.error('Loan not found!');
      return;
    }
    
    if (!window.confirm(`Unarchive loan ${loanToUnarchive.loanNumber}? It will be restored to the active loans list.`)) {
      return;
    }
    
    try {
      setProcessingLoanId(loanId);
      await LoanService.unarchiveLoan(loanId);
      
      toast.success(`Loan ${loanToUnarchive.loanNumber} unarchived successfully`);
      
      // Remove from archived loans list
      setLoans(prevLoans => prevLoans.filter(loan => loan.id !== loanId));
      
      console.log(`🔄 Loan ${loanId} unarchived:`, {
        unarchivedAt: new Date().toISOString(),
        loanNumber: loanToUnarchive.loanNumber,
        clientName: loanToUnarchive.clientName
      });
    } catch (error) {
      console.error('Error unarchiving loan:', error);
      toast.error('Failed to unarchive loan');
    } finally {
      setProcessingLoanId(null);
    }
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

  const formatDate = (dateString) => {
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
            <h1>Archived Loans</h1>
            <p className="page-description">View and manage archived loans</p>
          </div>
        </div>

        <div className="clients-content">
          {/* Search Bar */}
          <div className="clients-controls">
            <div className="search-box">
              <Search className="search-icon" size={20} />
              <input
                type="text"
                placeholder="Search by client, loan number or product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Loans Table */}
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p className="loading-text">Loading archived loans...</p>
            </div>
          ) : filteredLoans.length === 0 ? (
            <div className="empty-state-archived">
              <ArchiveIcon size={48} />
              <p>No archived loans</p>
              <span className="empty-state-description">Archived loans will appear here</span>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Loan Number</th>
                    <th>Client</th>
                    <th>Product</th>
                    <th>Amount</th>
                    <th>Workflow Status</th>
                    <th>Loan Status</th>
                    <th>Archived Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentLoans.map((loan) => {
                    return (
                      <tr key={loan.id}>
                        <td className="loan-number">{loan.loanNumber}</td>
                        <td>{loan.clientName || 'Unknown Client'}</td>
                        <td>{loan.loanProductName || '-'}</td>
                        <td className="amount">{formatCurrency(loan.principalAmount || 0)}</td>
                        <td>
                          <StatusBadge status={loan.workflowStatus || 'completed'} size="sm" />
                        </td>
                        <td>
                          <StatusBadge status={loan.loanStatus || 'completed'} size="sm" />
                        </td>
                        <td>{formatDate(loan.archivedAt || loan.updatedAt)}</td>
                        <td>
                          <div className="action-buttons">
                            {/* View Details */}
                            <button
                              onClick={() => navigate(`/loans/details/${loan.id}`)}
                              className="action-btn view"
                              title="View Details"
                              disabled={processingLoanId === loan.id}
                            >
                              <Eye size={16} />
                            </button>
                            
                            {/* Unarchive - Restore to active loans */}
                            <button
                              onClick={() => handleUnarchiveLoan(loan.id)}
                              className="action-btn unarchive"
                              title="Unarchive Loan"
                              disabled={processingLoanId === loan.id}
                            >
                              <RotateCcw size={16} />
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

export default ArchivedLoans;
