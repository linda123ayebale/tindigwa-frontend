import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Save,
  X
} from 'lucide-react';
import api from '../../../services/api';
import Sidebar from '../../../components/Layout/Sidebar';
import './RecordPayment.css';

const RecordPayment = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientLoans, setClientLoans] = useState([]);
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
  const [showClientDropdown, setShowClientDropdown] = useState(false);

  // Fetch clients with active loans
  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await api.get('/clients');
      const clientsData = Array.isArray(response) ? response : [];
      setClients(clientsData);
      setFilteredClients(clientsData);
    } catch (error) {
      console.error('Error fetching clients:', error);
      setClients([]);
    }
  };


  // Search/filter clients
  useEffect(() => {
    if (clientSearchTerm === '') {
      setFilteredClients(clients);
      setShowClientDropdown(false);
    } else {
      const filtered = clients.filter(client => 
        client.fullName?.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
        client.email?.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
        client.phone?.includes(clientSearchTerm)
      );
      setFilteredClients(filtered);
      setShowClientDropdown(true);
    }
  }, [clientSearchTerm, clients]);

  // Handle client selection
  const handleClientSelect = async (client) => {
    setSelectedClient(client);
    setClientSearchTerm(client.fullName);
    setShowClientDropdown(false);
    
    // Fetch loans and auto-select
    try {
      const response = await api.get('/loans');
      const allLoans = Array.isArray(response) ? response : [];
      
      console.log('===============================================');
      console.log('DEBUGGING LOAN SELECTION FOR:', client.fullName);
      console.log('Client ID:', client.id);
      console.log('===============================================');
      
      // Find all loans for this client
      const clientLoansAll = allLoans.filter(loan => loan.clientId === client.id);
      console.log('STEP 1: Total loans found for this client:', clientLoansAll.length);
      
      if (clientLoansAll.length === 0) {
        console.log('❌ NO LOANS FOUND - Client has no loans in the system');
      } else {
        clientLoansAll.forEach((loan, index) => {
          console.log(`\nLOAN ${index + 1} DETAILS:`);
          console.log('  - Loan Number:', loan.loanNumber);
          console.log('  - Workflow Status:', loan.workflowStatus);
          console.log('  - Loan Status:', loan.loanStatus);
          console.log('  - Principal Amount:', loan.principalAmount);
        });
      }
      
      console.log('\n-----------------------------------------------');
      console.log('STEP 2: Filtering for ACTIVE loans...');
      console.log('Filter criteria:');
      console.log('  ✓ workflowStatus must be DISBURSED');
      console.log('  ✓ loanStatus must NOT be COMPLETED');
      console.log('  ✓ loanStatus must NOT be DEFAULTED');
      console.log('-----------------------------------------------\n');
      
      // Filter for active loans
      const activeClientLoans = allLoans.filter(loan => {
        if (loan.clientId !== client.id) return false;
        
        const isDisbursed = loan.workflowStatus === 'DISBURSED';
        const notCompleted = loan.loanStatus !== 'COMPLETED';
        const notDefaulted = loan.loanStatus !== 'DEFAULTED';
        const isActive = isDisbursed && notCompleted && notDefaulted;
        
        console.log(`Checking Loan ${loan.loanNumber}:`);
        console.log(`  - Is Disbursed? ${isDisbursed} (status: ${loan.workflowStatus})`);
        console.log(`  - Not Completed? ${notCompleted} (status: ${loan.loanStatus})`);
        console.log(`  - Not Defaulted? ${notDefaulted}`);
        console.log(`  - ✅ ACTIVE FOR PAYMENT? ${isActive}\n`);
        
        return isActive;
      });
      
      console.log('===============================================');
      console.log('FINAL RESULT: Active loans available:', activeClientLoans.length);
      if (activeClientLoans.length > 0) {
        console.log('✅ These loans are available for payment:', activeClientLoans.map(l => l.loanNumber));
      } else {
        console.log('❌ NO ACTIVE LOANS - Client cannot make payment');
      }
      console.log('===============================================\n');
      
      setClientLoans(activeClientLoans);
      
      // Auto-select loan if only one active loan exists
      if (activeClientLoans.length === 1) {
        const loan = activeClientLoans[0];
        setSelectedLoan(loan);
        setFormData({ ...formData, loanId: loan.id });
      } else {
        // Reset loan selection if multiple or no loans
        setSelectedLoan(null);
        setFormData({ ...formData, loanId: '' });
      }
    } catch (error) {
      console.error('Error fetching client loans:', error);
      setClientLoans([]);
      setSelectedLoan(null);
      setFormData({ ...formData, loanId: '' });
    }
  };

  // Handle loan selection
  const handleLoanSelect = (loan) => {
    setSelectedLoan(loan);
    setFormData({
      ...formData,
      loanId: loan.id
    });
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
              {/* Client Selection */}
              <div className="form-section">
                <h3>Select Client</h3>
                
                <div className="form-group">
                  <label>Search Client *</label>
                  <div className="search-container-full">
                    <div className="searchable-dropdown-full">
                      <input
                        type="text"
                        placeholder="Search by name, email, or phone..."
                        value={clientSearchTerm}
                        onChange={(e) => setClientSearchTerm(e.target.value)}
                        onFocus={() => setShowClientDropdown(true)}
                        className={errors.client ? 'error' : ''}
                        disabled={selectedClient !== null}
                      />
                      {showClientDropdown && !selectedClient && filteredClients.length > 0 && (
                        <div className="dropdown-list">
                          {filteredClients.map(client => (
                            <div
                              key={client.id}
                              className="dropdown-item"
                              onClick={() => handleClientSelect(client)}
                            >
                              <strong>{client.fullName}</strong>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {selectedClient && (
                      <button 
                        type="button"
                        className="btn-change"
                        onClick={() => {
                          setSelectedClient(null);
                          setClientSearchTerm('');
                          setClientLoans([]);
                          setSelectedLoan(null);
                          setFormData({ ...formData, loanId: '' });
                        }}
                      >
                        <X size={16} />
                        Change
                      </button>
                    )}
                  </div>
                  {errors.client && <span className="error-text">{errors.client}</span>}
                </div>
              </div>

              {/* Loan Selection (only show if client is selected) */}
              {selectedClient && (
                <div className="form-section">
                  <h3>Loan Details</h3>
                  
                  {clientLoans.length === 0 ? (
                    <div className="no-loans-message">
                      <p>No active loans found for this client.</p>
                    </div>
                  ) : clientLoans.length === 1 ? (
                    // Auto-selected single loan
                    <div className="loan-summary-card">
                      <div className="loan-summary-header">
                        <div className="loan-badge">
                          <span className="badge-label">Loan Number</span>
                          <span className="badge-value">{selectedLoan?.loanNumber || `LN-${selectedLoan?.id}`}</span>
                        </div>
                      </div>
                      <div className="loan-summary-body">
                        <div className="summary-item">
                          <span className="summary-label">Principal Amount</span>
                          <span className="summary-value">{formatCurrency(selectedLoan?.principalAmount || 0)}</span>
                        </div>
                        <div className="summary-item">
                          <span className="summary-label">Total Payable</span>
                          <span className="summary-value highlight">{formatCurrency(selectedLoan?.totalPayable || 0)}</span>
                        </div>
                        <div className="summary-item">
                          <span className="summary-label">Outstanding Balance</span>
                          <span className="summary-value outstanding">{formatCurrency(selectedLoan?.balance || selectedLoan?.totalPayable || 0)}</span>
                        </div>
                        <div className="summary-item">
                          <span className="summary-label">Due Date</span>
                          <span className="summary-value">{selectedLoan?.loanDueDate ? new Date(selectedLoan.loanDueDate).toLocaleDateString() : 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Multiple loans - show dropdown
                    <div className="form-group">
                      <label>Select Loan *</label>
                      <select
                        name="loanId"
                        value={formData.loanId}
                        onChange={(e) => {
                          const loan = clientLoans.find(l => l.id.toString() === e.target.value);
                          if (loan) {
                            handleLoanSelect(loan);
                          }
                        }}
                        className={errors.loanId ? 'error' : ''}
                      >
                        <option value="">-- Select a loan --</option>
                        {clientLoans.map(loan => (
                          <option key={loan.id} value={loan.id}>
                            {loan.loanNumber || `LN-${loan.id}`} - {formatCurrency(loan.totalPayable || loan.balance || 0)}
                          </option>
                        ))}
                      </select>
                      {errors.loanId && <span className="error-text">{errors.loanId}</span>}
                      
                      {selectedLoan && (
                        <div className="loan-summary-card" style={{marginTop: '1rem'}}>
                          <div className="loan-summary-header">
                            <div className="loan-badge">
                              <span className="badge-label">Loan Number</span>
                              <span className="badge-value">{selectedLoan.loanNumber || `LN-${selectedLoan.id}`}</span>
                            </div>
                          </div>
                          <div className="loan-summary-body">
                            <div className="summary-item">
                              <span className="summary-label">Principal Amount</span>
                              <span className="summary-value">{formatCurrency(selectedLoan.principalAmount || 0)}</span>
                            </div>
                            <div className="summary-item">
                              <span className="summary-label">Total Payable</span>
                              <span className="summary-value highlight">{formatCurrency(selectedLoan.totalPayable || 0)}</span>
                            </div>
                            <div className="summary-item">
                              <span className="summary-label">Outstanding Balance</span>
                              <span className="summary-value outstanding">{formatCurrency(selectedLoan.balance || selectedLoan.totalPayable || 0)}</span>
                            </div>
                            <div className="summary-item">
                              <span className="summary-label">Due Date</span>
                              <span className="summary-value">{selectedLoan.loanDueDate ? new Date(selectedLoan.loanDueDate).toLocaleDateString() : 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

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
