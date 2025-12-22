import React, { useState } from 'react';
import { X, DollarSign, Calendar, CreditCard, FileText } from 'lucide-react';
import './QuickPaymentModal.css';

const QuickPaymentModal = ({ installment, loanId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    amount: installment?.outstandingAmount || installment?.scheduledAmount || 0,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Cash',
    transactionReference: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/payments/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          loanId: loanId,
          amount: parseFloat(formData.amount),
          paymentDate: formData.paymentDate,
          paymentMethod: formData.paymentMethod,
          referenceNumber: formData.transactionReference,
          notes: formData.notes,
          createdBy: 1 // Should come from auth context
        })
      });

      if (!response.ok) {
        throw new Error('Payment processing failed');
      }

      const result = await response.json();
      
      if (result.success) {
        onSuccess && onSuccess();
        onClose();
      } else {
        setError(result.message || 'Payment failed');
      }
    } catch (err) {
      setError(err.message || 'Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `UGX ${Number(amount || 0).toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="quick-payment-modal-overlay" onClick={onClose}>
      <div className="quick-payment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Make Payment</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {installment && (
          <div className="installment-info">
            <div className="info-row">
              <span className="label">Installment #{installment.installmentNumber}</span>
              <span className="value">Due: {formatDate(installment.dueDate)}</span>
            </div>
            <div className="info-row">
              <span className="label">Scheduled Amount</span>
              <span className="value">{formatCurrency(installment.scheduledAmount)}</span>
            </div>
            {installment.paidAmount > 0 && (
              <div className="info-row">
                <span className="label">Already Paid</span>
                <span className="value paid">{formatCurrency(installment.paidAmount)}</span>
              </div>
            )}
            <div className="info-row highlight">
              <span className="label">Outstanding</span>
              <span className="value">{formatCurrency(installment.outstandingAmount || installment.scheduledAmount)}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="payment-form">
          <div className="form-group">
            <label>
              <DollarSign size={18} />
              Payment Amount *
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              step="0.01"
              min="0"
              required
            />
            <small className="hint">
              Max: {formatCurrency(installment?.outstandingAmount || installment?.scheduledAmount || 0)}
            </small>
          </div>

          <div className="form-group">
            <label>
              <Calendar size={18} />
              Payment Date *
            </label>
            <input
              type="date"
              name="paymentDate"
              value={formData.paymentDate}
              onChange={handleChange}
              max={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="form-group">
            <label>
              <CreditCard size={18} />
              Payment Method *
            </label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              required
            >
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Mobile Money">Mobile Money</option>
              <option value="Cheque">Cheque</option>
              <option value="Card">Card</option>
            </select>
          </div>

          <div className="form-group">
            <label>
              <FileText size={18} />
              Transaction Reference
            </label>
            <input
              type="text"
              name="transactionReference"
              value={formData.transactionReference}
              onChange={handleChange}
              placeholder="e.g., TXN123456"
            />
          </div>

          <div className="form-group">
            <label>
              <FileText size={18} />
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              placeholder="Additional notes (optional)"
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Processing...' : `Pay ${formatCurrency(formData.amount)}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuickPaymentModal;
