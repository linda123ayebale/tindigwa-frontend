import React from 'react';
import { Percent } from 'lucide-react';

const InterestConfigurationStep = ({ formData, updateFormData, errors }) => {
  return (
    <div className="step-container">
      <div className="step-header">
        <h2>
          <Percent size={24} />
          Interest Configuration
        </h2>
        <p>Configure how interest is calculated for this loan product</p>
      </div>

      <div className="step-form">
        <div className="form-section">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                Interest Method <span className="required">*</span>
              </label>
              <select
                className="form-input form-select"
                value={formData.interestMethod || 'reducing'}
                onChange={(e) => updateFormData({ interestMethod: e.target.value })}
              >
                <option value="reducing">Reducing Balance</option>
                <option value="reducing_equal_installments">Reducing - Equal Installments</option>
                <option value="flat">Flat</option>
              </select>
              <span className="input-helper">Choose how interest is calculated over the loan period</span>
            </div>

            <div className="form-group">
              <label className="form-label">
                Interest Rate (%) <span className="required">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                className={`form-input ${errors.defaultInterestRate ? 'error' : ''}`}
                value={formData.defaultInterestRate || ''}
                onChange={(e) => updateFormData({ defaultInterestRate: e.target.value })}
                placeholder="Enter interest rate"
              />
              {errors.defaultInterestRate && (
                <span className="error-message">{errors.defaultInterestRate}</span>
              )}
              <span className="input-helper">The default interest rate for this product</span>
            </div>

            <div className="form-group">
              <label className="form-label">
                Rate Per <span className="required">*</span>
              </label>
              <select
                className="form-input form-select"
                value={formData.ratePer || 'month'}
                onChange={(e) => updateFormData({ ratePer: e.target.value })}
              >
                <option value="day">Per Day</option>
                <option value="week">Per Week</option>
                <option value="month">Per Month</option>
                <option value="year">Per Year</option>
              </select>
              <span className="input-helper">The time period for interest calculation</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterestConfigurationStep;
