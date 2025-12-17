import React, { useState, useEffect } from 'react';
import { X, Save, Receipt, DollarSign, Calendar, User, FileText, Tag } from 'lucide-react';
import api from '../../../services/api';
import categoryStore from '../../../services/categoryStore';

const AddExpenseModal = ({ isOpen, onClose, onSave, showToast }) => {
  const [expenseData, setExpenseData] = useState({
    category: '',
    subcategory: '',
    description: '',
    amount: '',
    expenseDate: '',
    paymentMethod: '',
    vendor: '',
    referenceNumber: '',
    notes: '',
    status: 'pending',
    isRecurring: false,
    recurringFrequency: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  // Payment methods
  const paymentMethods = [
    'Cash',
    'Bank Transfer',
    'Mobile Money',
    'Check',
    'Credit Card',
    'Debit Card'
  ];

  // Expense statuses
  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'paid', label: 'Paid' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  // Recurring frequencies
  const recurringFrequencies = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' }
  ];

  // Initialize form when modal opens and subscribe to categoryStore
  useEffect(() => {
    if (isOpen) {
      const today = new Date().toISOString().split('T')[0];
      setExpenseData({
        category: '',
        subcategory: '',
        description: '',
        amount: '',
        expenseDate: today,
        paymentMethod: '',
        vendor: '',
        referenceNumber: '',
        notes: '',
        status: 'pending',
        isRecurring: false,
        recurringFrequency: ''
      });
      setErrors({});
    }
  }, [isOpen]);

  useEffect(() => {
    const defaultCats = [
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

    const unsub = categoryStore.subscribe((cats) => setCategories(Array.isArray(cats) && cats.length > 0 ? cats : defaultCats));
    categoryStore.refresh();
    return () => unsub();
  }, []);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setExpenseData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!expenseData.category) {
      newErrors.category = 'Category is required';
    }

    if (!expenseData.description || expenseData.description.trim().length === 0) {
      newErrors.description = 'Description is required';
    }

    if (!expenseData.amount || parseFloat(expenseData.amount) <= 0) {
      newErrors.amount = 'Valid amount is required';
    }

    if (!expenseData.expenseDate) {
      newErrors.expenseDate = 'Expense date is required';
    }

    // Check if expense date is not in the future
    const expenseDate = new Date(expenseData.expenseDate);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    if (expenseDate > today) {
      newErrors.expenseDate = 'Expense date cannot be in the future';
    }

    if (expenseData.isRecurring && !expenseData.recurringFrequency) {
      newErrors.recurringFrequency = 'Recurring frequency is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const expensePayload = {
        ...expenseData,
        amount: parseFloat(expenseData.amount)
      };

      const response = await api.post('/expenses', expensePayload);
      
      if (response) {
        showToast('Expense added successfully!', 'success');
        onSave(response);
        // Close modal after a brief delay to show success message
        setTimeout(() => {
          onClose();
        }, 800);
      }
    } catch (error) {
      console.error('Error adding expense:', error);
      showToast('Failed to add expense. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Receipt size={24} />
            <h2>Add New Expense</h2>
          </div>
          <button 
            className="modal-close-btn"
            onClick={handleClose}
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Category and Description Row */}
            <div className="form-row">
              <div className="form-group">
                <label>
                  <Tag size={16} />
                  Category *
                </label>
                <select
                  name="category"
                  value={expenseData.category}
                  onChange={handleInputChange}
                  className={errors.category ? 'error' : ''}
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                {errors.category && <span className="error-text">{errors.category}</span>}
              </div>

              <div className="form-group">
                <label>
                  <FileText size={16} />
                  Description *
                </label>
                <input
                  type="text"
                  name="description"
                  value={expenseData.description}
                  onChange={handleInputChange}
                  placeholder="Brief description of the expense"
                  className={errors.description ? 'error' : ''}
                />
                {errors.description && <span className="error-text">{errors.description}</span>}
              </div>
            </div>

            {/* Amount and Date Row */}
            <div className="form-row">
              <div className="form-group">
                <label>
                  <DollarSign size={16} />
                  Amount (UGX) *
                </label>
                <input
                  type="number"
                  name="amount"
                  value={expenseData.amount}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className={errors.amount ? 'error' : ''}
                />
                {errors.amount && <span className="error-text">{errors.amount}</span>}
              </div>

              <div className="form-group">
                <label>
                  <Calendar size={16} />
                  Expense Date *
                </label>
                <input
                  type="date"
                  name="expenseDate"
                  value={expenseData.expenseDate}
                  onChange={handleInputChange}
                  className={errors.expenseDate ? 'error' : ''}
                />
                {errors.expenseDate && <span className="error-text">{errors.expenseDate}</span>}
              </div>
            </div>

            {/* Payment Method and Vendor Row */}
            <div className="form-row">
              <div className="form-group">
                <label>Payment Method</label>
                <select
                  name="paymentMethod"
                  value={expenseData.paymentMethod}
                  onChange={handleInputChange}
                >
                  <option value="">Select Payment Method</option>
                  {paymentMethods.map(method => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>
                  <User size={16} />
                  Vendor/Supplier
                </label>
                <input
                  type="text"
                  name="vendor"
                  value={expenseData.vendor}
                  onChange={handleInputChange}
                  placeholder="Vendor or supplier name"
                />
              </div>
            </div>

            {/* Reference and Status Row */}
            <div className="form-row">
              <div className="form-group">
                <label>Reference Number</label>
                <input
                  type="text"
                  name="referenceNumber"
                  value={expenseData.referenceNumber}
                  onChange={handleInputChange}
                  placeholder="Invoice/Receipt number"
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={expenseData.status}
                  onChange={handleInputChange}
                >
                  {statusOptions.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Recurring Expense Section */}
            <div className="form-group">
              <div className="checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="isRecurring"
                    checked={expenseData.isRecurring}
                    onChange={handleInputChange}
                  />
                  <span>This is a recurring expense</span>
                </label>
              </div>
            </div>

            {expenseData.isRecurring && (
              <div className="form-group">
                <label>Recurring Frequency *</label>
                <select
                  name="recurringFrequency"
                  value={expenseData.recurringFrequency}
                  onChange={handleInputChange}
                  className={errors.recurringFrequency ? 'error' : ''}
                >
                  <option value="">Select Frequency</option>
                  {recurringFrequencies.map(freq => (
                    <option key={freq.value} value={freq.value}>{freq.label}</option>
                  ))}
                </select>
                {errors.recurringFrequency && <span className="error-text">{errors.recurringFrequency}</span>}
              </div>
            )}

            {/* Notes */}
            <div className="form-group">
              <label>Notes</label>
              <textarea
                name="notes"
                value={expenseData.notes}
                onChange={handleInputChange}
                placeholder="Additional notes or details..."
                rows={3}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              <Save size={16} />
              {loading ? 'Saving...' : 'Save Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpenseModal;