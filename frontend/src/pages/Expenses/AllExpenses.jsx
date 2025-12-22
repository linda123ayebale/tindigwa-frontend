import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus,
  Receipt,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import api from '../../services/api';
import AuthService from '../../services/authService';
import NotificationModal from '../../components/NotificationModal';
import ViewExpenseModal from '../../components/ViewExpenseModal';
import { useNotification } from '../../hooks/useNotification';
import Sidebar from '../../components/Layout/Sidebar';
import '../../styles/table-common.css';
import './AllExpenses.css';

const AllExpenses = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingExpense, setViewingExpense] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingExpense, setDeletingExpense] = useState(null);
  const { notification, showSuccess, showError, hideNotification } = useNotification();

  // Fetch expenses from API
  const fetchExpenses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('🔄 Fetching expenses from API...');
      
      const response = await api.get('/expense');
      console.log('✅ Expenses fetched:', response);
      
      setExpenses(Array.isArray(response) ? response : []);
      
    } catch (error) {
      console.error('❌ Error fetching expenses:', error);
      setError(error.message);
      setExpenses([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);


  const handleViewExpense = (expense) => {
    setViewingExpense(expense);
    setShowViewModal(true);
  };

  const handleEditExpense = (expense) => {
    navigate(`/expenses/edit/${expense.id}`);
  };

  const handleDeleteExpense = (expense) => {
    setDeletingExpense(expense);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingExpense) return;
    
    try {
      await api.delete(`/expense/${deletingExpense.id}`);
      showSuccess(`Expense "${deletingExpense.expenseName || deletingExpense.description}" deleted successfully`);
      setShowDeleteModal(false);
      setDeletingExpense(null);
      fetchExpenses(); // Refresh the list
    } catch (error) {
      console.error('Error deleting expense:', error);
      showError('Failed to delete expense. Please try again.');
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeletingExpense(null);
  };


  // Get category name from nested object or string
  const getCategoryName = (category) => {
    return category?.categoryName || category || 'N/A';
  };

  // Get unique categories for filter dropdown
  const uniqueCategories = [...new Set(
    expenses
      .map(e => getCategoryName(e.category))
      .filter(Boolean)
  )].sort();

  const filteredExpenses = expenses.filter(expense => {
    const categoryName = getCategoryName(expense.category);
    
    const matchesSearch = searchTerm === '' || 
      categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || 
      categoryName === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  // Pagination logic
  const itemsPerPage = 5;
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

  // Reset to page 1 when search or filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter]);

  const formatCurrency = (amount) => {
    return `UGX ${Number(amount || 0).toLocaleString()}`;
  };


  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <div className="page-header">
          <div className="header-content">
            <h1>All Expenses</h1>
          </div>
          <button 
            className="add-client-btn"
            onClick={() => navigate('/expenses/add')}
          >
            <Plus size={16} />
            Add New Expense
          </button>
        </div>

        <div className="clients-content">
          {/* Filters and Search */}
          <div className="clients-controls">
            <div className="search-box">
              <Search size={20} className="search-icon" />
              <input
                type="text"
                placeholder="Search by category or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="filter-controls">
              <div className="filter-group">
                <Filter size={16} />
                <select 
                  value={categoryFilter} 
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {uniqueCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Expenses Table */}
          <div className="clients-table-container">
            {isLoading ? (
              <div className="empty-state">
                <div style={{ fontSize: '48px' }}>⏳</div>
                <h3>Loading expenses...</h3>
                <p>Fetching data from backend...</p>
              </div>
            ) : error ? (
              <div className="empty-state">
                <div style={{ fontSize: '48px', color: '#dc3545' }}>❌</div>
                <h3>Error loading expenses</h3>
                <p>{error}</p>
                <button 
                  className="add-client-btn primary"
                  onClick={fetchExpenses}
                >
                  🔄 Retry
                </button>
              </div>
            ) : filteredExpenses.length === 0 ? (
              <div className="empty-state">
                <Receipt size={48} />
                <h3>No expenses found</h3>
                <p>
                  {searchTerm || categoryFilter !== 'all' 
                    ? 'Try adjusting your search or filter criteria.'
                    : expenses.length === 0 
                      ? 'No expenses in the database. Add your first expense to get started.'
                      : 'Get started by adding your first expense.'
                  }
                </p>
                {!searchTerm && categoryFilter === 'all' && (
                  <button 
                    className="add-client-btn primary"
                    onClick={() => navigate('/expenses/add')}
                  >
                    <Plus size={16} />
                    Add Your First Expense
                  </button>
                )}
              </div>
            ) : (
              <>
                <table className="clients-table">
                  <thead>
                    <tr>
                      <th>Expense</th>
                      <th>Category</th>
                      <th>Amount</th>
                      <th>Requested By</th>
                      <th>Status</th>
                      <th style={{textAlign: 'right'}}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentExpenses.map((expense) => {
                      const approvalStatus = expense.approvalStatus || 'PENDING';
                      const paymentStatus = expense.paymentStatus || 'UNPAID';
                      
                      // Determine overall status for display
                      let displayStatus = approvalStatus;
                      if (approvalStatus === 'APPROVED' && paymentStatus === 'PAID') {
                        displayStatus = 'PAID';
                      }
                      
                      // Status badge styling
                      const getStatusBadgeClass = (status) => {
                        switch(status) {
                          case 'PENDING':
                            return 'status-pending';
                          case 'APPROVED':
                            return 'status-completed';
                          case 'REJECTED':
                            return 'status-cancelled';
                          case 'PAID':
                            return 'status-badge status-paid';
                          default:
                            return 'status-default';
                        }
                      };
                      
                      return (
                        <tr key={expense.id}>
                          <td>
                            <div className="expense-description" style={{fontWeight: 500, color: '#374151'}}>
                              {expense.expenseName || expense.description || '-'}
                            </div>
                          </td>
                          <td>
                            <span className="category-badge">{expense.categoryName || getCategoryName(expense.category)}</span>
                          </td>
                          <td>
                            <span className="amount-value">
                              {formatCurrency(expense.amount)}
                            </span>
                          </td>
                          <td>
                            {expense.requestedByUserId 
                              ? AuthService.getUserFullNameById(expense.requestedByUserId)
                              : '-'}
                          </td>
                          <td>
                            <span className={`status-badge ${getStatusBadgeClass(displayStatus)}`}>
                              {displayStatus}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons" style={{justifyContent: 'flex-end'}}>
                              {/* View button - always available */}
                              <button
                                className="action-btn view"
                                onClick={() => handleViewExpense(expense)}
                                title="View Details"
                              >
                                <Eye size={16} />
                              </button>
                              
                              {/* Edit button - only for pending expenses */}
                              {approvalStatus === 'PENDING' && (
                                <button
                                  className="action-btn edit"
                                  onClick={() => handleEditExpense(expense)}
                                  title="Edit Expense"
                                >
                                  <Edit size={16} />
                                </button>
                              )}
                              
                              {/* Delete button - only for pending expenses */}
                              {approvalStatus === 'PENDING' && (
                                <button
                                  className="action-btn delete"
                                  onClick={() => handleDeleteExpense(expense)}
                                  title="Delete Expense"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                              
                              {/* Payment button - only for approved unpaid expenses */}
                              {approvalStatus === 'APPROVED' && paymentStatus === 'UNPAID' && (
                                <button
                                  className="action-btn payment"
                                  onClick={() => navigate(`/expenses/to-pay`)}
                                  title="Mark as Paid"
                                >
                                  <Receipt size={16} />
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
              </>
            )}
          </div>
        </div>
      </main>

      {/* Notification Modal */}
      {notification && (
        <NotificationModal
          type={notification.type}
          message={notification.message}
          onClose={hideNotification}
        />
      )}

      {/* View Expense Modal */}
      <ViewExpenseModal
        isOpen={showViewModal}
        expense={viewingExpense}
        onClose={() => setShowViewModal(false)}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingExpense && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Delete Expense</h3>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this expense?</p>
              <div className="expense-details">
                <strong>{deletingExpense.expenseName || deletingExpense.description}</strong>
                <br />
                <span>Amount: {formatCurrency(deletingExpense.amount)}</span>
              </div>
              <p className="warning-text">This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={cancelDelete}>
                Cancel
              </button>
              <button className="btn-danger" onClick={confirmDelete}>
                Delete Expense
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllExpenses;
