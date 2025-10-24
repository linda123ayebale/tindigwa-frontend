import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Save,
  X,
  Upload,
  Calendar as CalendarIcon,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import Sidebar from '../../../components/Layout/Sidebar';
import './RecordExpense.css';

const RecordExpense = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    category: '',
    subcategory: '',
    description: '',
    amount: '',
    expenseDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Cash',
    vendor: '',
    referenceNumber: '',
    receiptFile: null,
    status: 'pending',
    notes: '',
    createdBy: '',
    isRecurring: false,
    recurringFrequency: 'monthly'
  });

  const categories = [
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

  const paymentMethods = ['Cash', 'Bank Transfer', 'Mobile Money', 'Cheque', 'Card'];
  const recurringFrequencies = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'];

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'file') {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Create expense data
      const expenseData = {
        ...formData,
        amount: parseFloat(formData.amount)
      };

      // First, create the expense
      const response = await fetch('http://localhost:8081/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(expenseData)
      });

      if (!response.ok) {
        throw new Error('Failed to record expense');
      }

      const result = await response.json();

      // If there's a receipt file, upload it
      if (formData.receiptFile && result.id) {
        const formDataUpload = new FormData();
        formDataUpload.append('receipt', formData.receiptFile);

        await fetch(`http://localhost:8081/api/expenses/${result.id}/receipt`, {
          method: 'POST',
          body: formDataUpload
        });
      }

      setSuccess(true);
      
      // Reset form
      setFormData({
        category: '',
        subcategory: '',
        description: '',
        amount: '',
        expenseDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'Cash',
        vendor: '',
        referenceNumber: '',
        receiptFile: null,
        status: 'pending',
        notes: '',
        createdBy: '',
        isRecurring: false,
        recurringFrequency: 'monthly'
      });

      // Navigate to all expenses after 2 seconds
      setTimeout(() => {
        navigate('/expenses/all');
      }, 2000);

    } catch (err) {
      setError(err.message || 'Failed to record expense');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/expenses/all');
  };


  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <div className="record-expense-page">
          {/* Page Header */}
          <div className="page-header">
            <div className="header-content">
              <h1>Record Expense</h1>
              <p className="page-description">
                Add a new operational expense with receipt and details
              </p>
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <div className="alert alert-success">
              <CheckCircle size={20} />
              <span>Expense recorded successfully! Redirecting...</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="alert alert-error">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          {/* Expense Form */}
          <div className="form-container">
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                {/* Category */}
                <div className="form-group">
                  <label htmlFor="category">
                    Category <span className="required">*</span>
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Subcategory */}
                <div className="form-group">
                  <label htmlFor="subcategory">Subcategory</label>
                  <input
                    type="text"
                    id="subcategory"
                    name="subcategory"
                    value={formData.subcategory}
                    onChange={handleInputChange}
                    placeholder="Optional subcategory"
                  />
                </div>

                {/* Amount */}
                <div className="form-group">
                  <label htmlFor="amount">
                    Amount (UGX) <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>

                {/* Expense Date */}
                <div className="form-group">
                  <label htmlFor="expenseDate">
                    Expense Date <span className="required">*</span>
                  </label>
                  <input
                    type="date"
                    id="expenseDate"
                    name="expenseDate"
                    value={formData.expenseDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {/* Payment Method */}
                <div className="form-group">
                  <label htmlFor="paymentMethod">Payment Method</label>
                  <select
                    id="paymentMethod"
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleInputChange}
                  >
                    {paymentMethods.map(method => (
                      <option key={method} value={method}>{method}</option>
                    ))}
                  </select>
                </div>

                {/* Vendor */}
                <div className="form-group">
                  <label htmlFor="vendor">Vendor/Supplier</label>
                  <input
                    type="text"
                    id="vendor"
                    name="vendor"
                    value={formData.vendor}
                    onChange={handleInputChange}
                    placeholder="Vendor or supplier name"
                  />
                </div>

                {/* Reference Number */}
                <div className="form-group">
                  <label htmlFor="referenceNumber">Reference Number</label>
                  <input
                    type="text"
                    id="referenceNumber"
                    name="referenceNumber"
                    value={formData.referenceNumber}
                    onChange={handleInputChange}
                    placeholder="Invoice or reference number"
                  />
                </div>

                {/* Status */}
                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="paid">Paid</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                {/* Created By */}
                <div className="form-group">
                  <label htmlFor="createdBy">Created By</label>
                  <input
                    type="text"
                    id="createdBy"
                    name="createdBy"
                    value={formData.createdBy}
                    onChange={handleInputChange}
                    placeholder="Your name or username"
                  />
                </div>

                {/* Description */}
                <div className="form-group full-width">
                  <label htmlFor="description">
                    Description <span className="required">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe the expense"
                    rows="3"
                    required
                  />
                </div>

                {/* Notes */}
                <div className="form-group full-width">
                  <label htmlFor="notes">Additional Notes</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Any additional information"
                    rows="2"
                  />
                </div>

                {/* Receipt Upload */}
                <div className="form-group full-width">
                  <label htmlFor="receiptFile">
                    Receipt/Invoice Upload
                  </label>
                  <div className="file-upload">
                    <input
                      type="file"
                      id="receiptFile"
                      name="receiptFile"
                      onChange={handleInputChange}
                      accept="image/*,.pdf"
                    />
                    <label htmlFor="receiptFile" className="file-upload-label">
                      <Upload size={20} />
                      <span>
                        {formData.receiptFile 
                          ? formData.receiptFile.name 
                          : 'Choose file or drag here'}
                      </span>
                    </label>
                  </div>
                  <small>Supported: JPG, PNG, PDF (Max 5MB)</small>
                </div>

                {/* Recurring Expense */}
                <div className="form-group full-width">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="isRecurring"
                      checked={formData.isRecurring}
                      onChange={handleInputChange}
                    />
                    <span>This is a recurring expense</span>
                  </label>
                </div>

                {/* Recurring Frequency (shown only if recurring is checked) */}
                {formData.isRecurring && (
                  <div className="form-group">
                    <label htmlFor="recurringFrequency">Frequency</label>
                    <select
                      id="recurringFrequency"
                      name="recurringFrequency"
                      value={formData.recurringFrequency}
                      onChange={handleInputChange}
                    >
                      {recurringFrequencies.map(freq => (
                        <option key={freq} value={freq}>
                          {freq.charAt(0).toUpperCase() + freq.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  <X size={16} />
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="spinner-small"></div>
                      Recording...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Record Expense
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RecordExpense;
