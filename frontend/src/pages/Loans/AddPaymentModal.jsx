import React, { useState, useEffect } from 'react';
import { X, Save, DollarSign, Receipt, AlertTriangle, CheckCircle } from 'lucide-react';
import './AddPaymentModal.css';
import { generateSchedule } from '../../services/scheduleService';
import api from '../../services/api';

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
  const [loanBalance, setLoanBalance] = useState(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [balanceError, setBalanceError] = useState(null);

  // Fetch loan details from loans API
  const fetchLoanBalance = async (loanId) => {
    if (!loanId) return;
    
    setIsLoadingBalance(true);
    setBalanceError(null);
    
    try {
      // Use the working loans API endpoint
      const loanData = await api.get(`/loans/${loanId}`);
      
      console.log('Fetched loan data:', loanData);
      
      if (!loanData) {
        throw new Error('No loan data received from API');
      }
      
      // Transform loan data to balance format for compatibility
      const transformedBalance = {
        totalLoanAmount: loanData.totalPayable || loanData.principalAmount || 0,
        principalAmount: loanData.principalAmount || 0,
        totalPaid: loanData.amountPaid || 0, // This might be 0 if not tracked yet
        outstandingBalance: (loanData.totalPayable || loanData.principalAmount || 0) - (loanData.amountPaid || 0),
        loanId: loanData.id,
        paymentCount: 0, // Will be 0 until we implement payment tracking
        startDate: loanData.releaseDate || loanData.paymentStartDate || loanData.createdAt
      };
      
      console.log('Transformed balance data:', transformedBalance);
      setLoanBalance(transformedBalance);
      
    } catch (error) {
      console.error('Error fetching loan details:', error);
      console.error('Loan ID:', loanId);
      console.error('API URL:', `/loans/${loanId}`);
      
      // Check if it's a network error or API not found
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Request setup error:', error.message);
      }
      
      // For now, silently fall back to computed data without showing error
      // TODO: Re-enable error display once backend API is fully implemented
      // setBalanceError(`Failed to load loan details: ${error.message}`);
      
      // Use fallback calculation without showing error
      setLoanBalance(null);
    } finally {
      setIsLoadingBalance(false);
    }
  };

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
      
      // Fetch real-time balance data
      fetchLoanBalance(loan.id);
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

  // Calculate loan financial details (with real-time balance data)
  const calculateLoanDetails = () => {
    if (!loan) return {};

    // Use real-time balance data if available, otherwise fallback to computed data
    let totalAmount, amountPaid, remainingBalance;
    
    if (loanBalance) {
      // Use real-time data from API
      totalAmount = loanBalance.totalLoanAmount || 0;
      amountPaid = loanBalance.totalPaid || 0;
      remainingBalance = loanBalance.outstandingBalance || 0;
    } else {
      // Fallback to computed data from loan object
      let schedule = Array.isArray(loan.schedule) && loan.schedule.length
        ? loan.schedule
        : [];

      if (!schedule.length) {
        try {
          const termDays = loan.loanDurationDays || loan.duration || 0;
          const startDate = loan.paymentStartDate || loan.startDate || new Date().toISOString().split('T')[0];
          const { schedule: gen } = generateSchedule({
            principal: Number(loan.principalAmount || loan.amount || 0),
            ratePct: Number(loan.interestRate || 0),
            frequency: loan.repaymentFrequency || loan.frequency || 'monthly',
            termDays: Number(termDays),
            startDate,
            method: loan.interestMethod || 'reducing_equal_installments',
            feesTotal: Number(loan.processingFee || loan.loanProcessingFee || 0)
          });
          schedule = gen;
        } catch (e) {
          schedule = [];
        }
      }

      // Try multiple property names for total amount
      totalAmount = loan.totalPayable || loan.totalAmount || loan.principalAmount || loan.amount || 0;
      
      // Add interest and fees to principal if totalPayable not available
      if (!loan.totalPayable && !loan.totalAmount && loan.principalAmount) {
        const principal = Number(loan.principalAmount || 0);
        const interestRate = Number(loan.interestRate || 0);
        const processingFee = Number(loan.processingFee || loan.loanProcessingFee || 0);
        const interestAmount = principal * (interestRate / 100);
        totalAmount = principal + interestAmount + processingFee;
      }
      
      amountPaid = Number(loan.amountPaid || 0);
      remainingBalance = Math.max(0, totalAmount - amountPaid);
    }

    const paymentAmount = parseFloat(paymentData.amount) || 0;
    const newBalance = Math.max(0, remainingBalance - paymentAmount);
    const isOverpayment = paymentAmount > remainingBalance;
    const willBeCompleted = paymentAmount >= remainingBalance;

    return {
      totalAmount,
      amountPaid,
      remainingBalance,
      paymentAmount,
      newBalance,
      overpaymentAmount: isOverpayment ? paymentAmount - remainingBalance : 0,
      isOverpayment,
      willBeCompleted,
      paymentProgress: totalAmount > 0 ? (((amountPaid + paymentAmount) / totalAmount) * 100) : 0
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
      
      // Create payment request for backend API
      const paymentRequest = {
        loanId: loan.id,
        amountPaid: paymentAmount, // Backend expects 'amountPaid' not 'amount'
        paymentDate: paymentData.paymentDate,
        paymentMethod: paymentData.paymentMethod,
        referenceNumber: paymentData.referenceNumber || null,
        notes: paymentData.notes || null,
        createdBy: 1 // TODO: Get from auth context
      };
      
      // Submit payment to backend API
      const paymentResponse = await api.post('/payments', paymentRequest);
      console.log('Payment submitted to database successfully:', paymentResponse);
      
      if (!paymentResponse || !paymentResponse.id) {
        throw new Error('Failed to save payment to database');
      }
      
      // Refresh loan data after payment
      await fetchLoanBalance(loan.id);
      
      // Create payment record for frontend state update
      const payment = {
        id: paymentResponse.id,
        loanId: loan.id,
        amountPaid: paymentAmount,
        amount: paymentAmount, // For compatibility
        paymentDate: paymentData.paymentDate,
        paymentMethod: paymentData.paymentMethod,
        referenceNumber: paymentData.referenceNumber,
        notes: paymentData.notes,
        createdAt: paymentResponse.createdAt || new Date().toISOString()
      };
      
      // Update loan object for frontend state
      const currentPaid = loan.amountPaid || 0;
      const updatedLoan = {
        ...loan,
        amountPaid: currentPaid + paymentAmount,
        outstandingBalance: Math.max(0, (loan.totalPayable || loan.principalAmount || 0) - (currentPaid + paymentAmount)),
        lastPaymentDate: paymentData.paymentDate,
        lastPaymentAmount: paymentAmount,
        payments: [...(loan.payments || []), payment],
        lastUpdated: new Date().toISOString()
      };
      
      await onSave(updatedLoan, payment);
      onClose();
    } catch (error) {
      console.error('Error processing payment:', error);
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
                {isLoadingBalance && <span className="loading-indicator">Loading...</span>}
              </h3>
              
              {balanceError && (
                <div className="balance-error">
                  <AlertTriangle size={14} />
                  {balanceError}
                </div>
              )}
              
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
                  <span className="summary-value">
                    {loanBalance?.startDate 
                      ? formatDate(loanBalance.startDate) 
                      : formatDate(loan.releaseDate || loan.paymentStartDate || loan.disbursementDate || loan.startDate || loan.createdAt)
                    }
                  </span>
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
