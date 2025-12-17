import React from 'react';
import '../ClientSteps/StepStyles.css';

const PrincipalDisbursementStep = ({ formData, updateFormData, errors = {} }) => {

  const disbursementMethods = [
    { value: 'Cash', label: 'Cash' },
    { value: 'Bank Transfer', label: 'Bank Transfer' },
    { value: 'Mobile Money', label: 'Mobile Money' },
    { value: 'Check', label: 'Check' }
  ];


  const handleChange = (e) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });
  };

  const handlePrincipalChange = (e) => {
    const value = e.target.value;
    updateFormData({ 
      principal: value,
      // Recalculate processing fee if it was based on percentage
      ...(formData.processingFeePercent && {
        processingFee: (parseFloat(value) || 0) * (parseFloat(formData.processingFeePercent) / 100)
      })
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(amount || 0).replace('UGX', 'USh');
  };

  return (
    <div className="step-container">
      <div className="step-header">
        <h2>Principal & Disbursement</h2>
        <p>Set the loan amount and disbursement details</p>
      </div>

      <div className="step-form">
        {/* Principal Section */}
        <div className="form-section">
          <h3 className="section-title">Principal</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="principal" className="form-label">
                Principal Amount (USh) <span className="required">*</span>
              </label>
              <input
                type="number"
                id="principal"
                name="principal"
                value={formData.principal || ''}
                onChange={handlePrincipalChange}
                className={`form-input ${errors.principal ? 'error' : ''}`}
                placeholder="Enter loan amount"
                min="1000"
                step="1000"
                required
              />
              {formData.principal && (
                <div className="input-helper">
                  {formatCurrency(formData.principal)}
                </div>
              )}
              {errors.principal && <span className="error-message">{errors.principal}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="releaseDate" className="form-label">
                Loan Release Date <span className="required">*</span>
              </label>
              <input
                type="date"
                id="releaseDate"
                name="releaseDate"
                value={formData.releaseDate || ''}
                onChange={handleChange}
                className={`form-input ${errors.releaseDate ? 'error' : ''}`}
                required
              />
              {errors.releaseDate && <span className="error-message">{errors.releaseDate}</span>}
            </div>
          </div>
        </div>

        {/* Disbursement Section */}
        <div className="form-section">
          <h3 className="section-title">Disbursement</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="disbursedBy" className="form-label">
                Disbursed By <span className="required">*</span>
              </label>
              <select
                id="disbursedBy"
                name="disbursedBy"
                value={formData.disbursedBy || 'Cash'}
                onChange={handleChange}
                className="form-input form-select"
                required
              >
                {disbursementMethods.map(method => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Accounting Section - Commented Out */}
        {/*
        <div className="form-section">
          <h3 className="section-title">Accounting: Select financial account for journal entry</h3>
          <div className="form-grid">
            <div className="form-group full-width">
              <label htmlFor="cashBankAccount" className="form-label">
                Cash/Bank <span className="required">*</span>
              </label>
              <div className="account-selection">
                <select
                  id="cashBankAccount"
                  name="cashBankAccount"
                  value={formData.cashBankAccount || 'cash_001'}
                  onChange={handleChange}
                  className="form-input form-select"
                  required
                >
                  {bankAccounts.map(account => (
                    <option key={account.id} value={account.id}>
                      {account.name} {account.balance !== 'N/A' && `(${account.balance})`}
                    </option>
                  ))}
                </select>
                
                <div className="account-actions">
                  <button 
                    type="button" 
                    className="action-link"
                    onClick={() => {}}
                  >
                    <Plus size={14} />
                    Add/Edit Bank Accounts
                  </button>
                  <span className="account-note">
                    To bulk reconcile past entries with bank accounts, please visit{' '}
                    <a href="#" className="text-link">Accounting</a> →{' '}
                    <a href="#" className="text-link">Reconcile Entries</a>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="account-info-card">
            {(() => {
              const selectedAccount = bankAccounts.find(acc => acc.id === formData.cashBankAccount);
              return selectedAccount ? (
                <div className="account-details">
                  <h4>{selectedAccount.name}</h4>
                  <div className="account-meta">
                    <span className="account-type">Type: {selectedAccount.type}</span>
                    {selectedAccount.balance !== 'N/A' && (
                      <span className="account-balance">Available: {selectedAccount.balance}</span>
                    )}
                  </div>
                  {selectedAccount.type === 'Bank' && formData.principal && (
                    <div className="transaction-preview">
                      <div className="preview-item">
                        <span>Principal Amount Source:</span>
                        <span>{selectedAccount.name}</span>
                      </div>
                      <div className="preview-note">
                        <small>This will only show in <strong>Accounting</strong> if the Loan Status is set to <strong>Open, Defaulted, or Fully Paid</strong> which means that the funds have been disbursed.</small>
                      </div>
                    </div>
                  )}
                </div>
              ) : null;
            })()}
          </div>
        </div>
        */}

        {/* Summary Section */}
        {formData.principal && (
          <div className="calculation-summary">
            <h3>Disbursement Summary</h3>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="summary-label">Principal Amount:</span>
                <span className="summary-value">{formatCurrency(formData.principal)}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Disbursement Method:</span>
                <span className="summary-value">{formData.disbursedBy || 'Cash'}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Release Date:</span>
                <span className="summary-value">
                  {formData.releaseDate ? new Date(formData.releaseDate).toLocaleDateString() : 'Not set'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrincipalDisbursementStep;