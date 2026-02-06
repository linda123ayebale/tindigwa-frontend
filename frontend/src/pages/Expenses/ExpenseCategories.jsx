import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Power,
  PowerOff,
  Tag
} from 'lucide-react';
import api from '../../services/api';
import categoryStore from '../../services/categoryStore';
import NotificationModal from '../../components/NotificationModal';
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal';
import { useNotification } from '../../hooks/useNotification';
import Sidebar from '../../components/Layout/Sidebar';
import '../../styles/table-common.css';
import './ExpenseCategories.css';

const ExpenseCategories = () => {
  const [categories, setCategories] = useState([]);
  const [categoryExpenseCounts, setCategoryExpenseCounts] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    categoryName: '',
    description: '',
    colorCode: '#3498db'
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const { notification, showSuccess, showError, hideNotification } = useNotification();

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('🔄 Fetching expense categories from API...');
      
      // Fetch all categories (including inactive)
      const response = await api.get('/expense-categories/all');
      console.log('✅ Categories fetched:', response);
      
      setCategories(Array.isArray(response) ? response : []);
      
      // Fetch all expenses to count per category
      try {
        const expensesResponse = await api.get('/expenses');
        const expenses = Array.isArray(expensesResponse) ? expensesResponse : [];
        const counts = {};
        expenses.forEach(expense => {
          const catId = expense.category?.id;
          if (catId) {
            counts[catId] = (counts[catId] || 0) + 1;
          }
        });
        setCategoryExpenseCounts(counts);
      } catch (err) {
        console.error('Error fetching expenses for counts:', err);
        setCategoryExpenseCounts({});
      }
      
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      setError(error.message);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDeleteCategory = (category) => {
    console.log('🗑️ Delete button clicked for category:', category);
    setCategoryToDelete(category);
    setDeleteError(null); // Clear any previous error
    setShowDeleteModal(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;
    
    try {
      setIsDeleting(true);
      console.log('🗑️ Deleting category ID:', categoryToDelete.id);
      
      await api.delete(`/expense-categories/${categoryToDelete.id}`);
      
      // Remove category from local state
      setCategories(prevCategories => 
        prevCategories.filter(c => c.id !== categoryToDelete.id)
      );
      
      // Refresh category store
      await categoryStore.refresh();
      
      showSuccess(`${categoryToDelete.categoryName} has been deleted successfully.`);
      setShowDeleteModal(false);
      setCategoryToDelete(null);
      
    } catch (error) {
      console.error('❌ Error deleting category:', error);
      const errorMessage = error.response?.data?.message || error.message;
      
      // Show error in the modal instead of closing it
      if (error.response?.status === 409) {
        setDeleteError(errorMessage || `Cannot delete "${categoryToDelete.categoryName}" because it has associated expenses. Consider deactivating it instead.`);
      } else {
        setDeleteError(`Failed to delete: ${errorMessage}`);
      }
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setCategoryToDelete(null);
    setIsDeleting(false);
    setDeleteError(null);
  };

  const handleToggleActive = async (category) => {
    try {
      console.log(`🔄 Toggling active status for category: ${category.categoryName}`);
      
      if (category.isActive) {
        await api.put(`/expense-categories/${category.id}/deactivate`, null);
        showSuccess(`${category.categoryName} has been deactivated.`);
      } else {
        await api.put(`/expense-categories/${category.id}/activate`, null);
        showSuccess(`${category.categoryName} has been activated.`);
      }
      
      // Refresh data
      await fetchCategories();
      await categoryStore.refresh();
      
    } catch (error) {
      console.error('❌ Error toggling category status:', error);
      showError(`Failed to update ${category.categoryName}: ${error.message}`);
    }
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setFormData({
      categoryName: '',
      description: ''
    });
    setFormErrors({});
    setShowEditModal(true);
  };

  const handleEditCategory = (category) => {
    console.log('🔧 Edit button clicked for category:', category);
    setEditingCategory(category);
    setFormData({
      categoryName: category.categoryName,
      description: category.description || ''
    });
    setFormErrors({});
    setShowEditModal(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.categoryName || formData.categoryName.trim() === '') {
      errors.categoryName = 'Category name is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitCategory = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const payload = {
        categoryName: formData.categoryName.trim(),
        description: formData.description.trim() || undefined
      };

      if (editingCategory) {
        await api.put(`/expense-categories/${editingCategory.id}`, payload);
        showSuccess(`${formData.categoryName} has been updated successfully.`);
      } else {
        await api.post('/expense-categories', payload);
        showSuccess(`${formData.categoryName} has been created successfully.`);
      }

      // Refresh data
      await fetchCategories();
      await categoryStore.refresh();
      
      setShowEditModal(false);
      setEditingCategory(null);
      setFormData({ categoryName: '', description: '', colorCode: '#3498db' });
      
    } catch (error) {
      console.error('❌ Error saving category:', error);
      const errorMessage = error.response?.data?.message || error.message;
      showError(`Failed to ${editingCategory ? 'update' : 'create'} category: ${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && category.isActive) ||
                         (filterStatus === 'inactive' && !category.isActive);
    
    return matchesSearch && matchesFilter;
  });

  // Pagination logic
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCategories = filteredCategories.slice(startIndex, endIndex);

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
  }, [searchTerm, filterStatus]);

  return (
    <div className="dashboard-layout">
    
      <Sidebar />

      <main className="dashboard-main">
        <div className="page-header-centered">
          <button 
            className="back-to-list-btn"
            onClick={handleAddCategory}
          >
            <Plus size={16} />
            <span>Add Category</span>
          </button>
          <div className="header-title-centered">
            <h1>Expense Categories</h1>
            <p className="subtitle">Manage expense categories</p>
          </div>
        </div>

        <div className="clients-content">
          {/* Filters and Search */}
          <div className="clients-controls">
            <div className="search-box">
              <Search size={20} className="search-icon" />
              <input
                type="text"
                placeholder="Search categories by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="filter-controls">
              <div className="filter-group">
                <Filter size={16} />
                <select 
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Categories Table */}
          <div className="clients-table-container">
            {isLoading ? (
              <div className="empty-state">
                <div style={{ fontSize: '48px' }}>⏳</div>
                <h3>Loading categories...</h3>
                <p>Fetching data from backend...</p>
              </div>
            ) : error ? (
              <div className="empty-state">
                <div style={{ fontSize: '48px', color: '#dc3545' }}>❌</div>
                <h3>Error loading categories</h3>
                <p>{error}</p>
                <button 
                  className="add-client-btn primary"
                  onClick={fetchCategories}
                >
                  🔄 Retry
                </button>
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="empty-state">
                <Tag size={48} />
                <h3>No categories found</h3>
                <p>
                  {searchTerm || filterStatus !== 'all' 
                    ? 'Try adjusting your search or filter criteria.'
                    : categories.length === 0 
                      ? 'No categories in the database. Add your first category to get started.'
                      : 'Get started by adding your first category.'
                  }
                </p>
                {!searchTerm && filterStatus === 'all' && (
                  <button 
                    className="add-client-btn primary"
                    onClick={handleAddCategory}
                  >
                    <Plus size={16} />
                    Add Your First Category
                  </button>
                )}
              </div>
            ) : (
              <>
                <table className="clients-table">
                  <thead>
                    <tr>
                      <th>Category Name</th>
                      <th>Description</th>
                      <th>Date Added</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentCategories.map((category) => {
                      const expenseCount = categoryExpenseCounts[category.id] || 0;
                      const canDelete = expenseCount === 0;
                      
                      return (
                      <tr key={category.id}>
                        <td>
                          <div 
                            className="client-name" 
                            style={{ color: category.isActive ? 'inherit' : '#dc2626', fontWeight: category.isActive ? 'normal' : '600' }}
                          >
                            {category.categoryName}
                          </div>
                        </td>
                        <td>
                          {category.description || <span className="no-data">-</span>}
                        </td>
                        <td>
                          {category.createdAt 
                            ? new Date(category.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })
                            : <span className="no-data">-</span>
                          }
                        </td>
                        <td>
                          <span className={`status-badge ${category.isActive ? 'status-completed' : 'status-cancelled'}`}>
                            {category.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="action-btn edit"
                              onClick={() => handleEditCategory(category)}
                              title="Edit Category"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              className={`action-btn ${category.isActive ? 'payment' : 'view'}`}
                              onClick={() => handleToggleActive(category)}
                              title={category.isActive ? 'Deactivate' : 'Activate'}
                            >
                              {category.isActive ? <PowerOff size={16} /> : <Power size={16} />}
                            </button>
                            {canDelete && (
                              <button
                                className="action-btn delete"
                                onClick={() => handleDeleteCategory(category)}
                                title="Delete Category"
                              >
                                <Trash2 size={16} />
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
                      Showing {startIndex + 1}-{Math.min(endIndex, filteredCategories.length)} of {filteredCategories.length}
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && categoryToDelete && (
        <ConfirmDeleteModal
          isOpen={showDeleteModal}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          isDeleting={isDeleting}
          itemName={categoryToDelete.categoryName}
          itemType="category"
          errorMessage={deleteError}
        />
      )}

      {/* Add/Edit Category Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => !submitting && setShowEditModal(false)}>
          <div className="modal-content-form" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
            </div>
            <form onSubmit={handleSubmitCategory}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Category Name *</label>
                  <input
                    type="text"
                    value={formData.categoryName}
                    onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                    className={formErrors.categoryName ? 'error' : ''}
                    placeholder="Enter category name"
                    disabled={submitting}
                  />
                  {formErrors.categoryName && (
                    <span className="error-message">{formErrors.categoryName}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    placeholder="Enter category description (optional)"
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowEditModal(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submitting}
                >
                  {submitting 
                    ? (editingCategory ? 'Updating...' : 'Creating...') 
                    : (editingCategory ? 'Update Category' : 'Create Category')
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseCategories;
