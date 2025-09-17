import React, { useState, useEffect } from 'react';
import { X, Save, DollarSign, Calculator, Receipt, AlertTriangle, CheckCircle, Clock, CreditCard } from 'lucide-react';
import './AddPaymentModal.css';

const AddPaymentModal = ({ loan, isOpen, onClose, onSave }) => {
  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentDate: '',
    paymentMethod: '',
    referenceNumber: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOverpaymentWarning, setShowOverpaymentWarning] = useState(false);

  // Initialize form data when modal opens
  useEffect(() => {
    if (loan && isOpen) {
      const today = new Date().toISOString().split('T')[0];
      setPaymentData({
        amount: '',
        paymentDate: today,
        paymentMethod: '',
        referenceNumber: '',
        notes: ''
      });
      setErrors({});
      setShowOverpaymentWarning(false);
    }
  }, [loan, isOpen]);

  const paymentMethods = [
    'Cash',
    'Bank Transfer',
    'Mobile Money',
    'Check',
    'Credit Card',
    'Debit Card'
  ];

  // Calculate loan financial details
  const calculateLoanDetails = () => {
    if (!loan) return {};
    
    const totalAmount = loan.totalAmount || loan.amount;
    const amountPaid = loan.amountPaid || 0;
    const remainingBalance = totalAmount - amountPaid;
    const paymentAmount = parseFloat(paymentData.amount) || 0;
    const newBalance = remainingBalance - paymentAmount;
    const isOverpayment = paymentAmount > remainingBalance;
    const willBeCompleted = paymentAmount >= remainingBalance;
    
    return {
      totalAmount,
      amountPaid,
      remainingBalance,
      paymentAmount,
      newBalance: Math.max(0, newBalance),
      overpaymentAmount: isOverpayment ? paymentAmount - remainingBalance : 0,
      isOverpayment,
      willBeCompleted,
      paymentProgress: ((amountPaid + paymentAmount) / totalAmount) * 100
    };
  };

  const loanDetails = calculateLoanDetails();

  // Handle amount input changes
  const handleAmountChange = (value) => {
    setPaymentData(prev => ({ ...prev, amount: value }));
    
    // Clear amount error when user starts typing
    if (errors.amount) {
      setErrors(prev => ({ ...prev, amount: '' }));
    }

    // Check for overpayment
    const amount = parseFloat(value) || 0;
    const isOverpayment = amount > loanDetails.remainingBalance;
    setShowOverpaymentWarning(isOverpayment);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'amount') {
      handleAmountChange(value);
    } else {
      setPaymentData(prev => ({ ...prev, [name]: value }));
      
      // Clear error when user starts typing
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
    }
  };

  // Quick payment amount buttons
  const handleQuickAmount = (percentage) => {
    const amount = (loanDetails.remainingBalance * percentage / 100).toFixed(2);
    handleAmountChange(amount);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!paymentData.amount || parseFloat(paymentData.amount) <= 0) {
      newErrors.amount = 'Valid payment amount is required';
    }

    if (!paymentData.paymentDate) {
      newErrors.paymentDate = 'Payment date is required';
    }

    if (!paymentData.paymentMethod) {
      newErrors.paymentMethod = 'Payment method is required';
    }

    // Check if payment date is not in the future
    const paymentDate = new Date(paymentData.paymentDate);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    
    if (paymentDate > today) {
      newErrors.paymentDate = 'Payment date cannot be in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const paymentAmount = parseFloat(paymentData.amount);
      const newAmountPaid = loanDetails.amountPaid + paymentAmount;
      
      // Create payment record
      const payment = {
        id: `PAY${Date.now()}`,
        loanId: loan.id,
        amount: paymentAmount,
        paymentDate: paymentData.paymentDate,
        paymentMethod: paymentData.paymentMethod,
        referenceNumber: paymentData.referenceNumber,
        notes: paymentData.notes,
        createdAt: new Date().toISOString()
      };

      // Update loan with new payment
      const updatedLoan = {
        ...loan,
        amountPaid: newAmountPaid,
        lastPaymentDate: paymentData.paymentDate,
        lastPaymentAmount: paymentAmount,
        payments: [...(loan.payments || []), payment],
        lastUpdated: new Date().toISOString()
      };

      await onSave(updatedLoan, payment);
      onClose();
    } catch (error) {
      console.error('Error processing payment:', error);
      // You can add error handling here, like showing a toast notification
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setPaymentData({
        amount: '',
        paymentDate: '',
        paymentMethod: '',
        referenceNumber: '',
        notes: ''
      });
      setErrors({});
      setShowOverpaymentWarning(false);
      onClose();
    }
  };

  const formatCurrency = (amount) => {
    return `USh ${amount.toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!isOpen || !loan) return null;

  return (
    <div className="payment-modal-overlay" onClick={handleClose}>
      <div className="payment-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="payment-modal-header">
          <div className="payment-header-info">
            <h2>Add Payment</h2>
            <p className="loan-reference">
              {loan.id} - {loan.clientName}
            </p>
          </div>
          <button 
            className="payment-modal-close-btn" 
            onClick={handleClose}
            disabled={isSubmitting}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="payment-modal-body">
            {/* Loan Summary Section */}
            <div className="loan-summary-section">
              <h3>
                <Receipt size={16} />
                Loan Summary
              </h3>
              
              <div className="loan-summary-grid">
                <div className="summary-item">
                  <span className="summary-label">Total Loan Amount</span>
                  <span className="summary-value">{formatCurrency(loanDetails.totalAmount)}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Amount Paid</span>
                  <span className="summary-value">
                    {formatCurrency(loanDetails.amountPaid)}
                    {loanDetails.paymentAmount > 0 && (
                      <span className="payment-addition">
                        {' + '}
                        <span className="new-payment-amount">{formatCurrency(loanDetails.paymentAmount)}</span>
                        {' = '}
                        <span className="updated-amount-paid">{formatCurrency(loanDetails.amountPaid + loanDetails.paymentAmount)}</span>
                      </span>
                    )}
                  </span>
                </div>
                <div className="summary-item highlight">
                  <span className="summary-label">Remaining Balance</span>
                  <span className="summary-value outstanding">{formatCurrency(loanDetails.remainingBalance)}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Start Date</span>
                  <span className="summary-value">{formatDate(loan.startDate)}</span>
                </div>
              </div>
            </div>

            {/* Payment Form Section */}
            <div className="payment-form-section">
              <h3>
                <DollarSign size={16} />
                Payment Details
              </h3>
              
              <div className="payment-form-grid">
                <div className="payment-amount-group">
                  <label className="payment-label">Payment Amount *</label>
                  <div className="amount-input-container">
                    <input
                      type="number"
                      name="amount"
                      value={paymentData.amount}
                      onChange={handleInputChange}
                      className={`payment-input amount-input ${errors.amount ? 'error' : ''}`}
                      placeholder="Enter payment amount"
                      min="0"
                      step="0.01"
                      disabled={isSubmitting}
                    />
                    <div className="quick-amount-buttons">
                      <button 
                        type="button" 
                        className="quick-amount-btn"
                        onClick={() => handleQuickAmount(25)}
                        disabled={isSubmitting}
                      >
                        25%
                      </button>
                      <button 
                        type="button" 
                        className="quick-amount-btn"
                        onClick={() => handleQuickAmount(50)}
                        disabled={isSubmitting}
                      >
                        50%
                      </button>
                      <button 
                        type="button" 
                        className="quick-amount-btn"
                        onClick={() => handleQuickAmount(75)}
                        disabled={isSubmitting}
                      >
                        75%
                      </button>
                      <button 
                        type="button" 
                        className="quick-amount-btn full-payment"
                        onClick={() => handleQuickAmount(100)}
                        disabled={isSubmitting}
                      >
                        Full Payment
                      </button>
                    </div>
                  </div>
                  {errors.amount && <span className="error-text">{errors.amount}</span>}
                  
                  {/* Payment Calculation Display */}
                  {paymentData.amount && (
                    <div className="payment-calculation">
                      <div className="calculation-row">
                        <span>New Balance:</span>
                        <span className={`balance ${loanDetails.willBeCompleted ? 'completed' : ''}`}>
                          {formatCurrency(loanDetails.newBalance)}
                        </span>
                      </div>
                      {loanDetails.willBeCompleted && (
                        <div className="completion-notice">
                          <CheckCircle size={14} />
                          This payment will complete the loan
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="payment-group">
                  <label className="payment-label">Payment Date *</label>
                  <input
                    type="date"
                    name="paymentDate"
                    value={paymentData.paymentDate}
                    onChange={handleInputChange}
                    className={`payment-input ${errors.paymentDate ? 'error' : ''}`}
                    disabled={isSubmitting}
                  />
                  {errors.paymentDate && <span className="error-text">{errors.paymentDate}</span>}
                </div>

                <div className="payment-group">
                  <label className="payment-label">Payment Method *</label>
                  <select
                    name="paymentMethod"
                    value={paymentData.paymentMethod}
                    onChange={handleInputChange}
                    className={`payment-input ${errors.paymentMethod ? 'error' : ''}`}
                    disabled={isSubmitting}
                  >
                    <option value="">Select Payment Method</option>
                    {paymentMethods.map((method, index) => (
                      <option key={index} value={method}>{method}</option>
                    ))}
                  </select>
                  {errors.paymentMethod && <span className="error-text">{errors.paymentMethod}</span>}
                </div>

                <div className="payment-group">
                  <label className="payment-label">Reference Number</label>
                  <input
                    type="text"
                    name="referenceNumber"
                    value={paymentData.referenceNumber}
                    onChange={handleInputChange}
                    className="payment-input"
                    placeholder="Transaction/Receipt reference (optional)"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="payment-group full-width">
                  <label className="payment-label">Payment Notes</label>
                  <textarea
                    name="notes"
                    value={paymentData.notes}
                    onChange={handleInputChange}
                    className="payment-input payment-textarea"
                    placeholder="Additional notes about this payment (optional)"
                    rows="3"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            {/* Overpayment Warning */}
            {showOverpaymentWarning && (
              <div className="overpayment-warning">
                <AlertTriangle size={16} />
                <div>
                  <strong>Overpayment Warning</strong>
                  <p>
                    Payment amount exceeds remaining balance by {formatCurrency(loanDetails.overpaymentAmount)}.
                    This will result in a credit balance.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="payment-modal-footer">
            <button 
              type="button" 
              className="payment-btn-cancel" 
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="payment-btn-save"
              disabled={isSubmitting}
            >
              <Save size={16} />
              {isSubmitting ? 'Processing Payment...' : 'Process Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPaymentModal;
