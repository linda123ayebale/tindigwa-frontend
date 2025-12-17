import React, { useState, useEffect } from 'react';
import { Search, XCircle, Eye } from 'lucide-react';
import ExpensesService from '../../services/ExpensesService';
import AuthService from '../../services/authService';
import useExpenseWebSocket from '../../hooks/useExpenseWebSocket';
import ViewExpenseModal from '../../components/ViewExpenseModal';
import { toast } from 'react-hot-toast';
import Sidebar from '../../components/Layout/Sidebar';
import './RejectedExpenses.css';

const RejectedExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingExpense, setViewingExpense] = useState(null);
  const itemsPerPage = 5;

  const fetchRejectedExpenses = async () => {
    try {
      setLoading(true);
      const response = await ExpensesService.getRejectedExpenses();
      setExpenses(response.data);
    } catch (error) {
      console.error('Error fetching rejected expenses:', error);
      toast.error('Failed to load rejected expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRejectedExpenses();
  }, []);

  // WebSocket integration for real-time updates
  useExpenseWebSocket((data) => {
    if (data.action === 'REJECTED') {
      fetchRejectedExpenses();
    }
  });

  const handleViewExpense = (expense) => {
    setViewingExpense(expense);
    setShowViewModal(true);
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
            <h1>Rejected Expenses</h1>
            <p className="page-description">View expenses that were rejected with comments</p>
          </div>
        </div>

        <div className="clients-content">

          {/* Search Bar */}
          <div className="clients-controls">
            <div className="search-box">
              <Search className="search-icon" size={20} />
              <input
                type="text"
                placeholder="Search rejected expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Expenses Table */}
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p className="loading-text">Loading rejected expenses...</p>
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="empty-state-pending">
              <XCircle size={48} />
              <p>No rejected expenses</p>
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
                          <span className="status-badge status-cancelled">
                            REJECTED
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons" style={{justifyContent: 'flex-end'}}>
                            <button
                              onClick={() => handleViewExpense(expense)}
                              className="action-btn view"
                              title="View Details"
                            >
                              <Eye size={16} />
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

      {/* View Expense Modal */}
      <ViewExpenseModal
        isOpen={showViewModal}
        expense={viewingExpense}
        onClose={() => setShowViewModal(false)}
      />
    </div>
  );
};

export default RejectedExpenses;
