import React from 'react';
import { Shield } from 'lucide-react';

const LimitsAndRequirementsStep = ({ formData, updateFormData, errors }) => {
  // Determine duration unit based on repayment frequency
  const getDurationUnit = () => {
    const frequency = formData.defaultRepaymentFrequency || 'monthly';
    if (frequency === 'daily') return 'Days';
    if (frequency === 'weekly' || frequency === 'bi-weekly') return 'Weeks';
    return 'Months';
  };

  const durationUnit = getDurationUnit();

  return (
    <div className="step-container">
      <div className="step-header">
        <h2>
          <Shield size={24} />
          Loan Limits & Requirements
        </h2>
        <p>Set borrowing limits and collateral requirements for this product</p>
      </div>

      <div className="step-form">
        {/* Loan Amount Limits - Commented out as per requirements
        <div className="form-section">
          <h3 className="section-title">Loan Amount Limits</h3>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Minimum Amount (UGX)</label>
              <input
                type="number"
                min="0"
                step="1000"
                className={`form-input ${errors.minAmount ? 'error' : ''}`}
                value={formData.minAmount || ''}
                onChange={(e) => updateFormData({ minAmount: e.target.value })}
                placeholder="Enter minimum loan amount"
              />
              {errors.minAmount && (
                <span className="error-message">{errors.minAmount}</span>
              )}
              <span className="input-helper">Smallest loan amount that can be disbursed</span>
            </div>

            <div className="form-group">
              <label className="form-label">Maximum Amount (UGX)</label>
              <input
                type="number"
                min="0"
                step="1000"
                className={`form-input ${errors.maxAmount ? 'error' : ''}`}
                value={formData.maxAmount || ''}
                onChange={(e) => updateFormData({ maxAmount: e.target.value })}
                placeholder="Enter maximum loan amount"
              />
              {errors.maxAmount && (
                <span className="error-message">{errors.maxAmount}</span>
              )}
              <span className="input-helper">Largest loan amount that can be disbursed</span>
            </div>
          </div>
        </div>
        */}

        <div className="form-section">
          <h3 className="section-title">Loan Duration Limits</h3>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Minimum Duration ({durationUnit})</label>
              <input
                type="number"
                min="1"
                step="1"
                className={`form-input ${errors.minDuration ? 'error' : ''}`}
                value={formData.minDuration || ''}
                onChange={(e) => updateFormData({ minDuration: e.target.value })}
                placeholder={`Enter minimum duration in ${durationUnit.toLowerCase()}`}
              />
              {errors.minDuration && (
                <span className="error-message">{errors.minDuration}</span>
              )}
              <span className="input-helper">Shortest loan period allowed</span>
            </div>

            <div className="form-group">
              <label className="form-label">Maximum Duration ({durationUnit})</label>
              <input
                type="number"
                min="1"
                step="1"
                className={`form-input ${errors.maxDuration ? 'error' : ''}`}
                value={formData.maxDuration || ''}
                onChange={(e) => updateFormData({ maxDuration: e.target.value })}
                placeholder={`Enter maximum duration in ${durationUnit.toLowerCase()}`}
              />
              {errors.maxDuration && (
                <span className="error-message">{errors.maxDuration}</span>
              )}
              <span className="input-helper">Longest loan period allowed</span>
            </div>

            <div className="form-group">
              <label className="form-label">Default Duration ({durationUnit})</label>
              <input
                type="number"
                min="1"
                step="1"
                className={`form-input ${errors.defaultDuration ? 'error' : ''}`}
                value={formData.defaultDuration || ''}
                onChange={(e) => updateFormData({ defaultDuration: e.target.value })}
                placeholder={`Enter default duration in ${durationUnit.toLowerCase()}`}
              />
              {errors.defaultDuration && (
                <span className="error-message">{errors.defaultDuration}</span>
              )}
              <span className="input-helper">Pre-selected duration for new loans</span>
            </div>
          </div>
        </div>

        {/* Security Requirements - Removed as per requirements
            All loan products automatically require a guarantor
            Collateral is not required
        <div className="form-section">
          <h3 className="section-title">Security Requirements</h3>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Guarantor Required</label>
              <div className="radio-group">
                <label className="radio-item">
                  <input
                    type="radio"
                    name="guarantorRequired"
                    checked={formData.requiresGuarantor === true}
                    onChange={() => updateFormData({ requiresGuarantor: true })}
                  />
                  <span className="radio-label">Yes</span>
                </label>
                <label className="radio-item">
                  <input
                    type="radio"
                    name="guarantorRequired"
                    checked={formData.requiresGuarantor === false}
                    onChange={() => updateFormData({ requiresGuarantor: false })}
                  />
                  <span className="radio-label">No</span>
                </label>
              </div>
              <span className="input-helper">Whether this product requires a guarantor</span>
            </div>

            <div className="form-group">
              <label className="form-label">Collateral Required</label>
              <div className="radio-group">
                <label className="radio-item">
                  <input
                    type="radio"
                    name="collateralRequired"
                    checked={formData.requiresCollateral === true}
                    onChange={() => updateFormData({ requiresCollateral: true })}
                  />
                  <span className="radio-label">Yes</span>
                </label>
                <label className="radio-item">
                  <input
                    type="radio"
                    name="collateralRequired"
                    checked={formData.requiresCollateral === false}
                    onChange={() => updateFormData({ requiresCollateral: false })}
                  />
                  <span className="radio-label">No</span>
                </label>
              </div>
              <span className="input-helper">Whether this product requires collateral</span>
            </div>
          </div>
        </div>
        */}

        {/* Summary Info Box */}
        <div className="info-section">
          <h3>Product Summary</h3>
          <div className="product-details-grid">
            <div className="detail-item">
              <span className="detail-label">Product Name:</span>
              <span className="detail-value">{formData.productName || 'Not set'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Interest Rate:</span>
              <span className="detail-value">{formData.defaultInterestRate ? `${formData.defaultInterestRate}% per ${formData.ratePer}` : 'Not set'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Repayment:</span>
              <span className="detail-value">{formData.defaultRepaymentFrequency || 'Not set'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Status:</span>
              <span className="detail-value">{formData.active ? 'ACTIVE' : 'INACTIVE'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LimitsAndRequirementsStep;
