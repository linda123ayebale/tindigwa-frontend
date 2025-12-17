import React, { useEffect } from 'react';
import '../ClientSteps/StepStyles.css';

const InterestTermsStep = ({ formData, updateFormData, errors = {}, selectedProduct }) => {

  const interestMethods = [
    { value: 'flat', label: 'Flat Rate' },
    { value: 'reducing_equal_installments', label: 'Reducing - Equal Installments' },
    { value: 'reducing_equal_principal', label: 'Reducing - Equal Principal' },
    { value: 'interest_only', label: 'Interest Only' },
    { value: 'compound', label: 'Compound' },
  ];

  const ratePeriods = [
    { value: 'day', label: 'Per Day' },
    { value: 'week', label: 'Per Week' },
    { value: 'month', label: 'Per Month' },
    { value: 'year', label: 'Per Year' }
  ];

  const durationUnits = [
    { value: 'days', label: 'Days' },
    { value: 'weeks', label: 'Weeks' },
    { value: 'months', label: 'Months' },
    { value: 'years', label: 'Years' }
  ];

  const repaymentCycles = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'bi-weekly', label: 'Bi-Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'semi-annually', label: 'Semi-Annually' },
    { value: 'annually', label: 'Annually' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });
  };

  const handleInterestTypeChange = (type) => {
    updateFormData({ 
      interestType: type,
      // Reset interest amount when switching types
      ...(type === 'percentage' && { fixedInterestAmount: '' }),
      ...(type === 'fixed' && { interestRate: '' })
    });
  };

  // Calculate number of repayments based on duration and frequency
  useEffect(() => {
    if (formData.loanDuration && formData.durationUnit && formData.repaymentFrequency) {
      const duration = parseInt(formData.loanDuration) || 0;
      let totalDays = 0;

      // Convert duration to days
      switch (formData.durationUnit) {
        case 'days':
          totalDays = duration;
          break;
        case 'weeks':
          totalDays = duration * 7;
          break;
        case 'months':
          totalDays = duration * 30;
          break;
        case 'years':
          totalDays = duration * 365;
          break;
        default:
          totalDays = duration;
      }

      // Calculate number of payments
      let paymentsPerPeriod = 0;
      switch (formData.repaymentFrequency) {
        case 'daily':
          paymentsPerPeriod = totalDays;
          break;
        case 'weekly':
          paymentsPerPeriod = Math.ceil(totalDays / 7);
          break;
        case 'bi-weekly':
          paymentsPerPeriod = Math.ceil(totalDays / 14);
          break;
        case 'monthly':
          paymentsPerPeriod = Math.ceil(totalDays / 30);
          break;
        case 'quarterly':
          paymentsPerPeriod = Math.ceil(totalDays / 90);
          break;
        case 'semi-annually':
          paymentsPerPeriod = Math.ceil(totalDays / 180);
          break;
        case 'annually':
          paymentsPerPeriod = Math.ceil(totalDays / 365);
          break;
        default:
          paymentsPerPeriod = 1;
      }

      updateFormData({ numberOfRepayments: paymentsPerPeriod });
    }
  }, [formData.loanDuration, formData.durationUnit, formData.repaymentFrequency, updateFormData]);

  return (
    <div className="step-container">
      <div className="step-header">
        <h2>Terms & Repayment</h2>
        <p>Configure loan duration and repayment schedule</p>
      </div>

      <div className="step-form">
        {/* Interest Section - Hidden, using product defaults */}
        <div className="form-section" style={{ display: 'none' }}>
          <h3 className="section-title">Interest</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="interestMethod" className="form-label">
                Interest Method <span className="required">*</span>
              </label>
              <select
                id="interestMethod"
                name="interestMethod"
                value={formData.interestMethod || 'flat'}
                onChange={handleChange}
                className={`form-input form-select ${errors.interestMethod ? 'error' : ''}`}
                required
              >
                {interestMethods.map(method => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
              {errors.interestMethod && <span className="error-message">{errors.interestMethod}</span>}
            </div>

            {/* Interest Type Radio Buttons */}
            <div className="form-group full-width">
              <label className="form-label">
                Interest Type <span className="required">*</span>
              </label>
              <div className="radio-group">
                <label className="radio-item">
                  <input
                    type="radio"
                    name="interestType"
                    value="percentage"
                    checked={(formData.interestType || 'percentage') === 'percentage'}
                    onChange={(e) => handleInterestTypeChange(e.target.value)}
                  />
                  <span className="radio-label">I want interest to be percentage % based</span>
                </label>
                <label className="radio-item">
                  <input
                    type="radio"
                    name="interestType"
                    value="fixed"
                    checked={formData.interestType === 'fixed'}
                    onChange={(e) => handleInterestTypeChange(e.target.value)}
                  />
                  <span className="radio-label">I want interest to be a fixed amount Per Cycle</span>
                </label>
              </div>
            </div>

            {/* Interest Rate or Fixed Amount */}
            {(formData.interestType || 'percentage') === 'percentage' ? (
              <div className="form-group">
                <label htmlFor="interestRate" className="form-label">
                  Loan Interest % <span className="required">*</span>
                </label>
                <div className="input-with-unit">
                  <input
                    type="number"
                    id="interestRate"
                    name="interestRate"
                    value={formData.interestRate || ''}
                    onChange={handleChange}
                    className={`form-input ${errors.interestRate ? 'error' : ''}`}
                    placeholder="Enter interest rate"
                    min="0"
                    step="0.01"
                    required
                  />
                  <span className="input-unit">%</span>
                </div>
                {errors.interestRate && <span className="error-message">{errors.interestRate}</span>}
              </div>
            ) : (
              <div className="form-group">
                <label htmlFor="fixedInterestAmount" className="form-label">
                  Fixed Interest Amount (USh) <span className="required">*</span>
                </label>
                <input
                  type="number"
                  id="fixedInterestAmount"
                  name="fixedInterestAmount"
                  value={formData.fixedInterestAmount || ''}
                  onChange={handleChange}
                  className={`form-input ${errors.fixedInterestAmount ? 'error' : ''}`}
                  placeholder="Enter fixed interest amount"
                  min="0"
                  step="100"
                  required
                />
                {errors.fixedInterestAmount && <span className="error-message">{errors.fixedInterestAmount}</span>}
              </div>
            )}

            {(formData.interestType || 'percentage') === 'percentage' && (
              <div className="form-group">
                <label htmlFor="ratePer" className="form-label">
                  Rate Basis <span className="required">*</span>
                </label>
                <select
                  id="ratePer"
                  name="ratePer"
                  value={formData.ratePer || 'month'}
                  onChange={handleChange}
                  className="form-input form-select"
                  required
                >
                  {ratePeriods.map(period => (
                    <option key={period.value} value={period.value}>
                      {period.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Duration Section */}
        <div className="form-section">
          <h3 className="section-title">Duration</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="loanDuration" className="form-label">
                Loan Duration <span className="required">*</span>
              </label>
              <div className="duration-input-group">
                <div className="duration-controls">
                  <button 
                    type="button"
                    className="duration-btn"
                    onClick={() => {
                      const minDuration = selectedProduct?.minDuration || 1;
                      updateFormData({ loanDuration: Math.max(minDuration, (parseInt(formData.loanDuration) || minDuration) - 1) });
                    }}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    id="loanDuration"
                    name="loanDuration"
                    value={formData.loanDuration || selectedProduct?.minDuration || '1'}
                    onChange={handleChange}
                    className={`form-input duration-input ${errors.loanDuration ? 'error' : ''}`}
                    min={selectedProduct?.minDuration || 1}
                    max={selectedProduct?.maxDuration || 999}
                    required
                  />
                  <button 
                    type="button"
                    className="duration-btn"
                    onClick={() => {
                      const maxDuration = selectedProduct?.maxDuration || 999;
                      updateFormData({ loanDuration: Math.min(maxDuration, (parseInt(formData.loanDuration) || 1) + 1) });
                    }}
                  >
                    +
                  </button>
                </div>
                <select
                  name="durationUnit"
                  value={formData.durationUnit || selectedProduct?.durationUnit || 'months'}
                  onChange={handleChange}
                  className="form-input form-select duration-unit"
                  required
                  disabled
                  style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }}
                >
                  {durationUnits.map(unit => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label}
                    </option>
                  ))}
                </select>
              </div>
              {selectedProduct && (
                <div className="input-helper" style={{ marginTop: '8px', color: '#666' }}>
                  Range: {selectedProduct.minDuration} - {selectedProduct.maxDuration} {selectedProduct.durationUnit}
                </div>
              )}
              {errors.loanDuration && <span className="error-message">{errors.loanDuration}</span>}
            </div>
          </div>
        </div>

        {/* Repayment Section */}
        <div className="form-section">
          <h3 className="section-title">Repayment</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="repaymentFrequency" className="form-label">
                Repayment Cycle <span className="required">*</span>
              </label>
              <select
                id="repaymentFrequency"
                name="repaymentFrequency"
                value={formData.repaymentFrequency || selectedProduct?.defaultRepaymentFrequency || 'monthly'}
                onChange={handleChange}
                className={`form-input form-select ${errors.repaymentFrequency ? 'error' : ''}`}
                required
                disabled
                style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed', textTransform: 'capitalize' }}
              >
                {repaymentCycles.map(cycle => (
                  <option key={cycle.value} value={cycle.value}>
                    {cycle.label}
                  </option>
                ))}
              </select>
              <div className="input-helper" style={{ marginTop: '8px', color: '#666' }}>
                Set by loan product
              </div>
              {errors.repaymentFrequency && <span className="error-message">{errors.repaymentFrequency}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="numberOfRepayments" className="form-label">
                Number of Repayments
              </label>
              <div className="input-with-controls">
                <button 
                  type="button"
                  className="control-btn"
                  onClick={() => updateFormData({ numberOfRepayments: Math.max(1, (parseInt(formData.numberOfRepayments) || 1) - 1) })}
                >
                  -
                </button>
                <input
                  type="number"
                  id="numberOfRepayments"
                  name="numberOfRepayments"
                  value={formData.numberOfRepayments || '1'}
                  onChange={handleChange}
                  className="form-input centered-input"
                  min="1"
                  readOnly
                />
                <button 
                  type="button"
                  className="control-btn"
                  onClick={() => updateFormData({ numberOfRepayments: (parseInt(formData.numberOfRepayments) || 1) + 1 })}
                >
                  +
                </button>
              </div>
              <div className="input-helper">
                Auto-calculated based on duration and frequency
              </div>
            </div>

            {/* First Repayment Date removed - will be set after loan approval */}
          </div>
        </div>

        {/* Advanced Settings - Commented Out */}
        {/*
        <div className="collapsible-section">
          <button 
            type="button"
            className="collapsible-header"
            onClick={() => setShowAdvanceSettings(!showAdvanceSettings)}
          >
            <span>Advanced Settings:</span>
            <span className="collapsible-action">
              {showAdvanceSettings ? 'Hide' : 'Show'}
              {showAdvanceSettings ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </span>
          </button>
          
          {showAdvanceSettings && (
            <div className="collapsible-content">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="gracePeriodDays" className="form-label">
                    Grace Period (Days)
                  </label>
                  <input
                    type="number"
                    id="gracePeriodDays"
                    name="gracePeriodDays"
                    value={formData.gracePeriodDays || '0'}
                    onChange={handleChange}
                    className="form-input"
                    min="0"
                    placeholder="Number of grace days"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="firstRepaymentDate" className="form-label">
                    First Repayment Date
                  </label>
                  <input
                    type="date"
                    id="firstRepaymentDate"
                    name="firstRepaymentDate"
                    value={formData.firstRepaymentDate || ''}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="firstRepaymentAmount" className="form-label">  
                    First Repayment Amount (USh)
                  </label>
                  <input
                    type="number"
                    id="firstRepaymentAmount"
                    name="firstRepaymentAmount"
                    value={formData.firstRepaymentAmount || ''}
                    onChange={handleChange}
                    className="form-input"
                    min="0"
                    step="100"
                    placeholder="Custom first payment amount"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        */}

        {/* Automated Payments - Commented Out */}
        {/*
        <div className="collapsible-section">
          <button 
            type="button"
            className="collapsible-header"
            onClick={() => setShowAutomatedPayments(!showAutomatedPayments)}
          >
            <span>Automated Payments:</span>
            <span className="collapsible-action">
              {showAutomatedPayments ? 'Hide' : 'Show'}
              {showAutomatedPayments ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </span>
          </button>
          
          {showAutomatedPayments && (
            <div className="collapsible-content">
              <div className="info-message">
                <p>Automated payment features will be available in a future update.</p>
                <p>This section will allow you to configure automatic payment collection from borrower accounts.</p>
              </div>
            </div>
          )}
        </div>
        */}

        {/* Terms Summary */}
        {formData.loanDuration && formData.principal && (
          <div className="terms-summary">
            <h3>Loan Terms Summary</h3>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="summary-label">Duration:</span>
                <span className="summary-value">
                  {formData.loanDuration} {formData.durationUnit}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Interest:</span>
                <span className="summary-value">
                  {formData.interestType === 'fixed' 
                    ? `USh ${parseFloat(formData.fixedInterestAmount || 0).toLocaleString()} per cycle`
                    : `${formData.interestRate}% per ${formData.ratePer}`
                  }
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Repayment Frequency:</span>
                <span className="summary-value">
                  {repaymentCycles.find(c => c.value === formData.repaymentFrequency)?.label || 'Monthly'}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Number of Payments:</span>
                <span className="summary-value">{formData.numberOfRepayments || 1}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterestTermsStep;