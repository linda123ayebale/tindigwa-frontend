import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Receipt,
  Calendar,
  User,
  FileText,
  Trash2
} from 'lucide-react';
import api from '../../services/api';
import NotificationModal from '../../components/NotificationModal';
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal';
import { useNotification } from '../../hooks/useNotification';
import './ExpenseDetails.css';

const ExpenseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notification, showSuccess, showError, hideNotification } = useNotification();
  
  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchExpense = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.get(`/expenses/${id}`);
        console.log('✅ Expense details fetched:', response);
        setExpense(response);
        
      } catch (err) {
        console.error('❌ Error fetching expense:', err);
        setError('Failed to load expense details');
        showError('Failed to load expense details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchExpense();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleBack = () => {
    navigate('/expenses');
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/expenses/${id}`);
      showSuccess('Expense deleted successfully');
      navigate('/expenses');
    } catch (err) {
      console.error('❌ Error deleting expense:', err);
      showError('Failed to delete expense');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const formatCurrency = (amount) => {
    return `UGX ${Number(amount || 0).toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="client-details-loading">
        <div className="loading-spinner"></div>
        <p>Loading expense details...</p>
      </div>
    );
  }

  if (error || !expense) {
    return (
      <div className="client-details-error">
        <h2>{error || 'Expense not found'}</h2>
        <p>The expense you're looking for doesn't exist or has been removed.</p>
        <button onClick={handleBack} className="back-button">
          <ArrowLeft size={16} />
          Back to Expenses
        </button>
      </div>
    );
  }

  const getCategoryName = (category) => {
    return category?.categoryName || category || 'N/A';
  };

  return (
    <div className="client-details-layout">
      {/* Page Header */}
      <div className="page-header">
        <h1>Expense Details</h1>
        <div className="header-actions">
          <button onClick={handleBack} className="back-button">
            <ArrowLeft size={18} />
            <span>Back to Expenses</span>
          </button>
          <button onClick={() => setShowDeleteModal(true)} className="delete-button">
            <Trash2 size={16} />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="client-details-content">
        {/* Expense Information */}
        <div className="details-section">
          <div className="section-header">
            <Receipt size={20} />
            <h2>Expense Information</h2>
          </div>
          <div className="section-content">
            <div className="detail-grid">
              <div className="detail-item">
                <label>Expense ID</label>
                <span>#{expense.id}</span>
              </div>
              <div className="detail-item">
                <label>Amount</label>
                <span className="amount-highlight">{formatCurrency(expense.amount)}</span>
              </div>
              <div className="detail-item">
                <label>Expense Date</label>
                <span>
                  <Calendar size={14} style={{ display: 'inline', marginRight: '6px' }} />
                  {formatDate(expense.expenseDate)}
                </span>
              </div>
              <div className="detail-item">
                <label>Category</label>
                <span 
                  className="category-badge-details"
                  style={expense.category?.colorCode ? {
                    borderLeft: `4px solid ${expense.category.colorCode}`
                  } : {}}
                >
                  {getCategoryName(expense.category)}
                </span>
              </div>
              {expense.category?.description && (
                <div className="detail-item span-2">
                  <label>Category Description</label>
                  <span>{expense.category.description}</span>
                </div>
              )}
              <div className="detail-item span-2">
                <label>Expense Name / Description</label>
                <span>{expense.description}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        {expense.notes && (
          <div className="details-section">
            <div className="section-header">
              <FileText size={20} />
              <h2>Additional Notes</h2>
            </div>
            <div className="section-content">
              <div className="notes-content">
                {expense.notes}
              </div>
            </div>
          </div>
        )}

        {/* System Information */}
        <div className="details-section">
          <div className="section-header">
            <User size={20} />
            <h2>System Information</h2>
          </div>
          <div className="section-content">
            <div className="detail-grid">
              <div className="detail-item">
                <label>Created By</label>
                <span>{expense.createdBy || 'System'}</span>
              </div>
              <div className="detail-item">
                <label>Created At</label>
                <span>{formatDateTime(expense.createdAt)}</span>
              </div>
              {expense.updatedAt && (
                <div className="detail-item">
                  <label>Last Updated</label>
                  <span>{formatDateTime(expense.updatedAt)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Notification Modal */}
      {notification && (
        <NotificationModal
          type={notification.type}
          message={notification.message}
          onClose={hideNotification}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <ConfirmDeleteModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
          isDeleting={isDeleting}
          itemName={expense.description || `Expense #${expense.id}`}
          itemType="expense"
        />
      )}
    </div>
  );
};

export default ExpenseDetails;
