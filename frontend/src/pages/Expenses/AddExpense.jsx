import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import api from '../../services/api';
import categoryStore from '../../services/categoryStore';
import NotificationModal from '../../components/NotificationModal';
import { useNotification } from '../../hooks/useNotification';
import Sidebar from '../../components/Layout/Sidebar';
import './AddExpense.css';

const AddExpense = () => {
  const navigate = useNavigate();
  const { notification, showSuccess, showError, hideNotification } = useNotification();
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    expenseName: '',
    amount: '',
    expenseDate: new Date().toISOString().split('T')[0],
    description: '',
    categoryId: ''
  });

  useEffect(() => {
    const unsub = categoryStore.subscribe((cats) => {
      setCategories(Array.isArray(cats) ? cats : []);
    });
    categoryStore.refresh();
    return () => unsub();
  }, []);

  const validate = () => {
    const e = {};
    if (!formData.expenseName?.trim()) e.expenseName = 'Expense name is required';
    if (!formData.amount || isNaN(formData.amount) || parseFloat(formData.amount) <= 0) e.amount = 'Valid positive amount is required';
    if (!formData.expenseDate) e.expenseDate = 'Expense date is required';
    if (!formData.description?.trim()) e.description = 'Description is required';
    if (!formData.categoryId) e.categoryId = 'Please select a category';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        categoryId: parseInt(formData.categoryId),
        expenseName: formData.expenseName.trim(),
        description: formData.description.trim(),
        amount: parseFloat(formData.amount),
        expenseDate: formData.expenseDate
      };
      await api.post('/expenses', payload);
      showSuccess('Expense recorded successfully');
      navigate('/expenses');
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to create expense';
      if (error.response?.data?.errors) {
        const serverErrors = error.response.data.errors;
        setErrors(prev => ({ ...prev, ...serverErrors }));
      }
      showError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <div className="page-header-centered">
          <button className="back-to-list-btn" onClick={() => navigate('/expenses')}>
            <ArrowLeft size={18} />
            <span>Back to Expenses</span>
          </button>
          <div className="header-title-centered">
            <h1>Record Expense</h1>
            <p className="subtitle">Track operational costs and expenses</p>
          </div>
        </div>

        <div className="add-expense-container">
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group span-2">
                <label>Expense Name *</label>
                <input
                  type="text"
                  value={formData.expenseName}
                  onChange={e => setFormData({ ...formData, expenseName: e.target.value })}
                  className={errors.expenseName ? 'error' : ''}
                  placeholder="Enter expense name"
                />
                {errors.expenseName && <span className="error-message">{errors.expenseName}</span>}
              </div>

              <div className="form-group">
                <label>Amount (UGX) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={e => setFormData({ ...formData, amount: e.target.value })}
                  className={errors.amount ? 'error' : ''}
                  placeholder="Enter amount"
                />
                {errors.amount && <span className="error-message">{errors.amount}</span>}
              </div>

              <div className="form-group">
                <label>Expense Date *</label>
                <input
                  type="date"
                  value={formData.expenseDate}
                  onChange={e => setFormData({ ...formData, expenseDate: e.target.value })}
                  className={errors.expenseDate ? 'error' : ''}
                />
                {errors.expenseDate && <span className="error-message">{errors.expenseDate}</span>}
              </div>

              <div className="form-group span-2">
                <label>Description *</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className={errors.description ? 'error' : ''}
                  placeholder="Enter detailed expense description"
                />
                {errors.description && <span className="error-message">{errors.description}</span>}
              </div>

              <div className="form-group span-2">
                <label>Category *</label>
                <select
                  value={formData.categoryId}
                  onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                  className={errors.categoryId ? 'error' : ''}
                >
                  <option value="">Select expense category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.categoryName}{cat.description ? ` - ${cat.description}` : ''}
                    </option>
                  ))}
                </select>
                {errors.categoryId && <span className="error-message">{errors.categoryId}</span>}
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => navigate('/expenses')}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={submitting}>
                <Save size={16} /> {submitting ? 'Saving...' : 'Save Expense'}
              </button>
            </div>
          </form>
        </div>
      </main>

      {notification && (
        <NotificationModal
          type={notification.type}
          message={notification.message}
          onClose={hideNotification}
        />
      )}
    </div>
  );
};

export default AddExpense;
