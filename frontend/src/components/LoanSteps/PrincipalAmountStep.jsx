import React from 'react';
import '../ClientSteps/StepStyles.css';

const PrincipalAmountStep = ({ formData, updateFormData, errors = {}, selectedProduct }) => {

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });
  };

  const handlePrincipalChange = (e) => {
    const value = e.target.value;
    updateFormData({ principal: value });
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
        <h2>Principal Amount</h2>
        <p>Set the loan amount being requested</p>
      </div>

      <div className="step-form">
        {/* Principal Section */}
        <div className="form-section">
          <h3 className="section-title">Loan Amount</h3>
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
              <label htmlFor="applicationDate" className="form-label">
                Application Date <span className="required">*</span>
              </label>
              <input
                type="date"
                id="applicationDate"
                name="applicationDate"
                value={formData.applicationDate || ''}
                onChange={handleChange}
                className={`form-input ${errors.applicationDate ? 'error' : ''}`}
                required
              />
              <div className="input-helper">
                Date when the loan application was submitted
              </div>
              {errors.applicationDate && <span className="error-message">{errors.applicationDate}</span>}
            </div>
          </div>
        </div>

        {/* Product Constraints removed as per user request */}

        {/* Summary Section */}
        {formData.principal && (
          <div className="calculation-summary">
            <h3>Amount Summary</h3>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="summary-label">Principal Amount:</span>
                <span className="summary-value">{formatCurrency(formData.principal)}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Application Date:</span>
                <span className="summary-value">
                  {formData.applicationDate ? new Date(formData.applicationDate).toLocaleDateString() : 'Not set'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrincipalAmountStep;
