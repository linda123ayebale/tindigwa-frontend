import React, { useState, useEffect } from 'react';
import { Filter, Plus, Receipt, Search, Upload, Download, FileText, Trash2, Edit, Eye } from 'lucide-react';
import api from '../../../services/api';
import categoryStore from '../../../services/categoryStore';
import AddExpenseModal from './AddExpenseModal';
import ReceiptUploadModal from '../../../components/ReceiptUploadModal';
import BulkImportModal from '../../../components/BulkImportModal';

const ExpensesTab = ({ showToast }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [selectedExpenseForReceipt, setSelectedExpenseForReceipt] = useState(null);
  const [selectedExpenses, setSelectedExpenses] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Predefined expense categories
  const defaultCategories = [
    'Operational',
    'Salaries',
    'Marketing',
    'Technology',
    'Legal & Compliance',
    'Travel',
    'Utilities',
    'Office Supplies',
    'Other'
  ];

  // Fetch all expenses
  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const response = await api.get('/expenses');
      if (Array.isArray(response)) {
        setExpenses(response);
        console.log('Fetched expenses:', response.length);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
      showToast('Failed to fetch expenses', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Subscribe to central category store so dropdown updates immediately
  useEffect(() => {
    const unsub = categoryStore.subscribe((cats) => setCategories(Array.isArray(cats) && cats.length > 0 ? cats : defaultCategories));
    categoryStore.refresh();
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load data on component mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    fetchExpenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle new expense save
  const handleExpenseSave = (newExpense) => {
    setExpenses(prev => [newExpense, ...prev]);
    setCurrentPage(1); // Go to first page to see the new expense
  };

  // Handle receipt upload
  const handleReceiptUpload = (expenseId) => {
    setSelectedExpenseForReceipt(expenseId);
    setShowReceiptModal(true);
  };

  const handleReceiptUploadSuccess = (filename) => {
    // Refresh expenses to show updated receipt status
    fetchExpenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    showToast('Receipt uploaded successfully', 'success');
  };

  // Handle bulk import
  const handleBulkImportSuccess = (results) => {
    fetchExpenses();
    showToast(`Import complete: ${results.successfulImports} expenses imported`, 'success');
  };

  // Handle expense export
  const handleExportExpenses = async () => {
    try {
      const params = new URLSearchParams();
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      
  const response = await fetch(`${api.baseURL}/expenses/export?${params.toString()}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'expenses_export.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        showToast('Expenses exported successfully', 'success');
      }
    } catch (error) {
      showToast('Failed to export expenses', 'error');
    }
  };

  // Handle view receipt
  const handleViewReceipt = (expenseId) => {
  window.open(`${api.baseURL}/expenses/${expenseId}/receipt`, '_blank');
  };

  // Handle bulk selection
  const handleSelectExpense = (expenseId) => {
    setSelectedExpenses(prev => {
      const isSelected = prev.includes(expenseId);
      if (isSelected) {
        const newSelected = prev.filter(id => id !== expenseId);
        setShowBulkActions(newSelected.length > 0);
        return newSelected;
      } else {
        const newSelected = [...prev, expenseId];
        setShowBulkActions(true);
        return newSelected;
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedExpenses.length === currentExpenses.length) {
      setSelectedExpenses([]);
      setShowBulkActions(false);
    } else {
      const allIds = currentExpenses.map(expense => expense.id);
      setSelectedExpenses(allIds);
      setShowBulkActions(true);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedExpenses.length} expenses?`)) {
      return;
    }

    try {
      const response = await api.delete('/expenses/bulk', {
        data: selectedExpenses
      });
      
      if (response && response.deletedCount) {
        showToast(`Deleted ${response.deletedCount} expenses`, 'success');
        fetchExpenses();
        setSelectedExpenses([]);
        setShowBulkActions(false);
      }
    } catch (error) {
      showToast('Failed to delete expenses', 'error');
    }
  };

  // Filter expenses
  const filteredExpenses = expenses.filter(expense => {
    const matchesStatus = statusFilter === 'all' || expense.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;
    const matchesSearch = !searchTerm || 
      expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.vendor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.expenseReference?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesCategory && matchesSearch;
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

  // Calculate totals
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
  const todayExpenses = filteredExpenses.filter(expense => {
    const expenseDate = new Date(expense.expenseDate);
    const today = new Date();
    return expenseDate.toDateString() === today.toDateString();
  });
  const todayTotal = todayExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);

  return (
    <div className="expenses-tab">
      {/* Controls Section */}
      <div className="clients-controls">
        <div className="filter-controls">
          {/* Search */}
          <div className="search-group">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Category Filter */}
          <div className="filter-group">
            <Filter size={16} />
            <select 
              value={categoryFilter} 
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="filter-group">
            <select 
              value={statusFilter} 
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        
        <div className="results-info">
          <p>Showing {filteredExpenses.length} expenses</p>
        </div>

        <div className="header-actions">
          {showBulkActions && (
            <div className="bulk-actions">
              <span className="bulk-count">{selectedExpenses.length} selected</span>
              <button 
                className="btn btn-danger btn-sm"
                onClick={handleBulkDelete}
                title="Delete selected expenses"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
          
          <button 
            className="btn btn-outline"
            onClick={handleExportExpenses}
            title="Export expenses"
          >
            <Download size={16} />
            Export
          </button>
          
          <button 
            className="btn btn-outline"
            onClick={() => setShowBulkImportModal(true)}
            title="Import expenses from CSV"
          >
            <Upload size={16} />
            Import
          </button>
          
          <button 
            className="add-client-btn"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={16} />
            Add Expense
          </button>
        </div>
      </div>

      {/* Expenses Content */}
      <div className="clients-table-container">
        {loading ? (
          <div className="empty-state">
            <div className="loading">Loading expenses...</div>
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="empty-state">
            <Receipt size={48} />
            <h3>No expenses found</h3>
            <p>No expenses match your current filter criteria.</p>
            <button 
              className="add-client-btn"
              onClick={() => setShowAddModal(true)}
              style={{ marginTop: '16px' }}
            >
              <Plus size={16} />
              Add First Expense
            </button>
          </div>
        ) : (
          <>
            {/* Summary Stats */}
            <div className="payments-summary">
              <div className="summary-stats">
                <div className="stat-item">
                  <span className="stat-label">Total Expenses</span>
                  <span className="stat-value">{filteredExpenses.length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Total Amount</span>
                  <span className="stat-value">UGX {totalExpenses.toLocaleString()}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Today</span>
                  <span className="stat-value">
                    {todayExpenses.length} expenses (UGX {todayTotal.toLocaleString()})
                  </span>
                </div>
              </div>
            </div>
            
            {/* Expenses Table */}
            <div className="clients-table">
              <div className="table-row header-row">
                <div className="table-cell checkbox-cell">
                  <input
                    type="checkbox"
                    checked={selectedExpenses.length === currentExpenses.length && currentExpenses.length > 0}
                    onChange={handleSelectAll}
                  />
                </div>
                <div className="table-cell">Date</div>
                <div className="table-cell">Reference</div>
                <div className="table-cell">Category</div>
                <div className="table-cell">Description</div>
                <div className="table-cell">Vendor</div>
                <div className="table-cell">Amount</div>
                <div className="table-cell">Method</div>
                <div className="table-cell">Status</div>
                <div className="table-cell">Actions</div>
              </div>
              
              {currentExpenses.map((expense, index) => (
                <div key={expense.id || `expense-${index}`} className="table-row">
                  <div className="table-cell checkbox-cell">
                    <input
                      type="checkbox"
                      checked={selectedExpenses.includes(expense.id)}
                      onChange={() => handleSelectExpense(expense.id)}
                    />
                  </div>
                  
                  <div className="table-cell">
                    <div className="payment-date">
                      {new Date(expense.expenseDate).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="table-cell">
                    <div className="expense-reference">{expense.expenseReference || `EXP-${expense.id}`}</div>
                  </div>
                  
                  <div className="table-cell">
                    <div className="expense-category">{expense.category}</div>
                  </div>
                  
                  <div className="table-cell">
                    <div className="expense-description">{expense.description}</div>
                  </div>
                  
                  <div className="table-cell">
                    <div className="expense-vendor">{expense.vendor || 'N/A'}</div>
                  </div>
                  
                  <div className="table-cell">
                    <div className="amount-paid">UGX {expense.amount?.toLocaleString()}</div>
                  </div>
                  
                  <div className="table-cell">
                    <div className="payment-method">{expense.paymentMethod || 'N/A'}</div>
                  </div>
                  
                  <div className="table-cell">
                    <span className={`status status-${(expense.status || 'pending').toLowerCase()}`}>
                      {expense.status || 'Pending'}
                    </span>
                  </div>
                  
                  <div className="table-cell actions-cell">
                    <div className="action-buttons">
                      {expense.receiptUrl ? (
                        <button
                          className="action-btn view"
                          onClick={() => handleViewReceipt(expense.id)}
                          title="View Receipt"
                        >
                          <Eye size={14} />
                        </button>
                      ) : (
                        <button
                          className="action-btn upload"
                          onClick={() => handleReceiptUpload(expense.id)}
                          title="Upload Receipt"
                        >
                          <Upload size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination-container">
                <div className="pagination-info">
                  <p>Showing {startIndex + 1}-{Math.min(endIndex, filteredExpenses.length)} of {filteredExpenses.length} expenses</p>
                </div>
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
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleExpenseSave}
        showToast={showToast}
      />
      
      {/* Receipt Upload Modal */}
      <ReceiptUploadModal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        expenseId={selectedExpenseForReceipt}
        onUploadSuccess={handleReceiptUploadSuccess}
      />
      
      {/* Bulk Import Modal */}
      <BulkImportModal
        isOpen={showBulkImportModal}
        onClose={() => setShowBulkImportModal(false)}
        onImportSuccess={handleBulkImportSuccess}
      />
    </div>
  );
};

export default ExpensesTab;