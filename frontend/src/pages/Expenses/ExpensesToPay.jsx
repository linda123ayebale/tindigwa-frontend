import React, { useState, useEffect } from 'react';
import { Search, DollarSign, Check, Eye } from 'lucide-react';
import ExpensesService from '../../services/ExpensesService';
import AuthService from '../../services/authService';
import useExpenseWebSocket from '../../hooks/useExpenseWebSocket';
import ViewExpenseModal from '../../components/ViewExpenseModal';
import { toast } from 'react-hot-toast';
import Sidebar from '../../components/Layout/Sidebar';
import './ExpensesToPay.css';

const ExpensesToPay = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingExpense, setViewingExpense] = useState(null);
  const itemsPerPage = 5;

  const fetchUnpaidExpenses = async () => {
    try {
      setLoading(true);
      const response = await ExpensesService.getApprovedUnpaidExpenses();
      setExpenses(response.data);
    } catch (error) {
      console.error('Error fetching unpaid expenses:', error);
      toast.error('Failed to load expenses to pay');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnpaidExpenses();
  }, []);

  // WebSocket integration for real-time updates
  useExpenseWebSocket((data) => {
    if (data.action === 'PAID' || data.action === 'APPROVED') {
      fetchUnpaidExpenses();
    }
  });

  const handleMarkAsPaid = (expense) => {
    setSelectedExpense(expense);
    setShowModal(true);
  };

  const handleViewExpense = (expense) => {
    setViewingExpense(expense);
    setShowViewModal(true);
  };

  const confirmMarkAsPaid = async () => {
    if (!selectedExpense) return;

    setProcessing(true);
    try {
      const currentUser = AuthService.getUserFullName();
      await ExpensesService.markExpenseAsPaid(selectedExpense.id, {
        paidBy: currentUser
      });
      toast.success('Expense marked as paid successfully');
      setShowModal(false);
      setSelectedExpense(null);
      fetchUnpaidExpenses();
    } catch (error) {
      console.error('Error marking expense as paid:', error);
      toast.error('Failed to mark expense as paid');
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

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <div className="page-header">
          <div className="header-content">
            <h1>Expenses to Pay</h1>
            <p className="page-description">Approved expenses awaiting payment</p>
          </div>
        </div>

        <div className="clients-content">
          {/* Summary Card */}
          <div className="summary-card">
            <div className="summary-card-content">
              <div>
                <p className="summary-text-label">Total Amount to Pay</p>
                <p className="summary-amount">{formatCurrency(totalAmount)}</p>
                <p className="summary-count">{filteredExpenses.length} expense(s) pending payment</p>
              </div>
              <DollarSign className="summary-icon" size={64} />
            </div>
          </div>

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
              <p className="loading-text">Loading expenses...</p>
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="empty-state-pending">
              <Check size={48} />
              <p>No expenses awaiting payment</p>
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
                    const isPaid = expense.paymentStatus === 'PAID';
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
                          <span className={`status-badge ${isPaid ? 'status-paid' : 'status-completed'}`}>
                            {isPaid ? 'PAID' : 'APPROVED'}
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
                            {!isPaid && (
                              <button
                                onClick={() => handleMarkAsPaid(expense)}
                                className="action-btn payment"
                                title="Mark as Paid"
                              >
                                <DollarSign size={16} />
                              </button>
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

      {/* Confirmation Modal */}
      {showModal && (
        <div className="payment-modal-overlay">
          <div className="payment-modal-content">
            <div className="payment-modal-header">
              <h3>Confirm Payment</h3>
            </div>
            
            <div className="payment-modal-body">
              <div className="payment-info">
                <p>
                  <strong>Reference:</strong> {selectedExpense?.expenseReference}
                </p>
                <p>
                  <strong>Vendor:</strong> {selectedExpense?.vendor}
                </p>
                <p>
                  <strong>Amount:</strong> <span className="payment-amount-highlight">{formatCurrency(selectedExpense?.amount)}</span>
                </p>
                <p>
                  <strong>Description:</strong> {selectedExpense?.description}
                </p>
              </div>

              <div className="payment-warning">
                <p>
                  ⚠️ Are you sure you want to mark this expense as paid? This action confirms the payment has been processed.
                </p>
              </div>
            </div>

            <div className="payment-modal-actions">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedExpense(null);
                }}
                className="btn-cancel"
                disabled={processing}
              >
                Cancel
              </button>
              <button
                onClick={confirmMarkAsPaid}
                disabled={processing}
                className="btn-confirm-payment"
              >
                {processing ? 'Processing...' : 'Confirm Payment'}
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

export default ExpensesToPay;
