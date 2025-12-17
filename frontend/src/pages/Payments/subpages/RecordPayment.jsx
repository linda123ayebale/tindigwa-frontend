import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Save,
  X,
  Search
} from 'lucide-react';
import api from '../../../services/api';
import Sidebar from '../../../components/Layout/Sidebar';
import './RecordPayment.css';

const RecordPayment = () => {
  const navigate = useNavigate();
  const [loans, setLoans] = useState([]);
  const [filteredLoans, setFilteredLoans] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    loanId: '',
    amountPaid: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Cash',
    referenceNumber: '',
    notes: ''
  });
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  // Fetch active loans
  useEffect(() => {
    fetchActiveLoans();
  }, []);

  const fetchActiveLoans = async () => {
    try {
      const response = await api.get('/loans/table-view');
      const activeLoans = Array.isArray(response) 
        ? response.filter(loan => loan.loanStatus !== 'closed' && loan.loanStatus !== 'completed')
        : [];
      setLoans(activeLoans);
      setFilteredLoans(activeLoans);
    } catch (error) {
      console.error('Error fetching loans:', error);
      setLoans([]);
    }
  };

  // Search loans
  useEffect(() => {
    if (searchTerm === '') {
      setFilteredLoans(loans);
    } else {
      const filtered = loans.filter(loan => 
        loan.loanNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.id?.toString().includes(searchTerm)
      );
      setFilteredLoans(filtered);
    }
  }, [searchTerm, loans]);

  // Handle loan selection
  const handleLoanSelect = (loan) => {
    setSelectedLoan(loan);
    setFormData({
      ...formData,
      loanId: loan.id
    });
    setSearchTerm('');
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.loanId) {
      newErrors.loanId = 'Please select a loan';
    }

    if (!formData.amountPaid || parseFloat(formData.amountPaid) <= 0) {
      newErrors.amountPaid = 'Please enter a valid amount';
    }

    if (!formData.paymentDate) {
      newErrors.paymentDate = 'Please select a payment date';
    }

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Please select a payment method';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit payment
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSuccess(false);

    try {
      // Create payment using the correct field name
      const paymentData = {
        loanId: parseInt(formData.loanId),
        amountPaid: parseFloat(formData.amountPaid),
        paymentDate: formData.paymentDate,
        paymentMethod: formData.paymentMethod,
        referenceNumber: formData.referenceNumber || undefined,
        notes: formData.notes || undefined
      };

      await api.post('/payments', paymentData);

      setSuccess(true);
      
      // Reset form
      setTimeout(() => {
        setFormData({
          loanId: '',
          amountPaid: '',
          paymentDate: new Date().toISOString().split('T')[0],
          paymentMethod: 'Cash',
          referenceNumber: '',
          notes: ''
        });
        setSelectedLoan(null);
        setSuccess(false);
        
        // Navigate to all payments after 2 seconds
        setTimeout(() => {
          navigate('/payments/all');
        }, 1500);
      }, 1500);

    } catch (error) {
      console.error('Error creating payment:', error);
      setErrors({
        submit: error.response?.data?.error || 'Failed to record payment. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `UGX ${Number(amount || 0).toLocaleString()}`;
  };


  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="record-payment-page">
          {/* Page Header */}
          <div className="page-header">
            <div className="header-content">
              <h1>Record Payment</h1>
              <p className="page-description">Record a new loan repayment</p>
            </div>
            <button className="btn-secondary" onClick={() => navigate('/payments/all')}>
              <X size={16} />
              Cancel
            </button>
          </div>

          {/* Success Message */}
          {success && (
            <div className="alert alert-success">
              <div className="alert-icon">✓</div>
              <div className="alert-content">
                <strong>Payment Recorded Successfully!</strong>
                <p>Redirecting to payments list...</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errors.submit && (
            <div className="alert alert-error">
              <div className="alert-icon">!</div>
              <div className="alert-content">
                <strong>Error</strong>
                <p>{errors.submit}</p>
              </div>
            </div>
          )}

          {/* Payment Form */}
          <div className="form-container">
            <form onSubmit={handleSubmit}>
              {/* Loan Selection */}
              <div className="form-section">
                <h3>Select Loan</h3>
                
                {!selectedLoan ? (
                  <>
                    <div className="form-group">
                      <label>Select Loan *</label>
                      <select
                        name="loanId"
                        value={formData.loanId}
                        onChange={(e) => {
                          const loan = loans.find(l => l.id.toString() === e.target.value);
                          if (loan) {
                            handleLoanSelect(loan);
                          }
                        }}
                        className={errors.loanId ? 'error' : ''}
                      >
                        <option value="">-- Select a loan --</option>
                        {loans.map(loan => (
                          <option key={loan.id} value={loan.id}>
                            {loan.loanNumber || `LN-${loan.id}`} - {loan.clientName || 'Unknown Client'} - {formatCurrency(loan.totalPayable || loan.balance || 0)}
                          </option>
                        ))}
                      </select>
                      {errors.loanId && <span className="error-text">{errors.loanId}</span>}
                    </div>
                  </>
                ) : (
                  <div className="selected-loan">
                    <div className="loan-card">
                      <div className="loan-card-header">
                        <h4>{selectedLoan.loanNumber || `LN-${selectedLoan.id}`}</h4>
                        <button 
                          type="button"
                          className="btn-text"
                          onClick={() => {
                            setSelectedLoan(null);
                            setFormData({ ...formData, loanId: '' });
                          }}
                        >
                          Change
                        </button>
                      </div>
                      <div className="loan-card-body">
                        <div className="info-row">
                          <span className="label">Client:</span>
                          <span className="value">{selectedLoan.clientName || 'Unknown'}</span>
                        </div>
                        <div className="info-row">
                          <span className="label">Total Amount:</span>
                          <span className="value">{formatCurrency(selectedLoan.totalPayable || selectedLoan.balance)}</span>
                        </div>
                        <div className="info-row">
                          <span className="label">Status:</span>
                          <span className="value status">{selectedLoan.loanStatus || selectedLoan.status}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Details */}
              <div className="form-section">
                <h3>Payment Details</h3>

                <div className="form-row">
                  <div className="form-group">
                    <label>Amount Paid *</label>
                    <input
                      type="number"
                      name="amountPaid"
                      placeholder="0.00"
                      value={formData.amountPaid}
                      onChange={handleChange}
                      className={errors.amountPaid ? 'error' : ''}
                      step="0.01"
                      min="0"
                    />
                    {errors.amountPaid && <span className="error-text">{errors.amountPaid}</span>}
                  </div>

                  <div className="form-group">
                    <label>Payment Date *</label>
                    <input
                      type="date"
                      name="paymentDate"
                      value={formData.paymentDate}
                      onChange={handleChange}
                      className={errors.paymentDate ? 'error' : ''}
                      max={new Date().toISOString().split('T')[0]}
                    />
                    {errors.paymentDate && <span className="error-text">{errors.paymentDate}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Payment Method *</label>
                    <select
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleChange}
                      className={errors.paymentMethod ? 'error' : ''}
                    >
                      <option value="Cash">Cash</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Mobile Money">Mobile Money</option>
                      <option value="Cheque">Cheque</option>
                      <option value="Card">Card</option>
                    </select>
                    {errors.paymentMethod && <span className="error-text">{errors.paymentMethod}</span>}
                  </div>

                  <div className="form-group">
                    <label>Reference Number</label>
                    <input
                      type="text"
                      name="referenceNumber"
                      placeholder="Optional"
                      value={formData.referenceNumber}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Notes</label>
                  <textarea
                    name="notes"
                    placeholder="Add any additional notes (optional)"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="3"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => navigate('/payments/all')}
                >
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
                      Processing...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Record Payment
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

export default RecordPayment;
