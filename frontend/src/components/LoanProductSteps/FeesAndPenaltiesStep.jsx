import React, { useState } from 'react';
import { DollarSign, Plus, Trash2 } from 'lucide-react';

const FeesAndPenaltiesStep = ({ formData, updateFormData, errors }) => {
  // Initialize registration fee tiers if not present
  const [tiers, setTiers] = useState(
    formData.registrationFeeTiers || []
  );

  const addTier = () => {
    const newTiers = [...tiers, { minAmount: '', maxAmount: '', fee: '' }];
    setTiers(newTiers);
    updateFormData({ registrationFeeTiers: newTiers });
  };

  const removeTier = (index) => {
    const newTiers = tiers.filter((_, i) => i !== index);
    setTiers(newTiers);
    updateFormData({ registrationFeeTiers: newTiers });
  };

  const updateTier = (index, field, value) => {
    const newTiers = [...tiers];
    newTiers[index] = { ...newTiers[index], [field]: value };
    setTiers(newTiers);
    updateFormData({ registrationFeeTiers: newTiers });
  };

  return (
    <div className="step-container">
      <div className="step-header">
        <h2>
          <DollarSign size={24} />
          Fees & Penalties
        </h2>
        <p>Configure additional fees and penalties for this loan product</p>
      </div>

      <div className="step-form">
        <div className="form-section">
          <h3 className="section-title">Registration Fees (Tiered)</h3>
          <p className="section-description">Define registration fee tiers based on principal amount ranges</p>
          
          {tiers.map((tier, index) => (
            <div key={index} className="tier-row" style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'flex-start' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Min Amount (UGX)</label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  className="form-input"
                  value={tier.minAmount || ''}
                  onChange={(e) => updateTier(index, 'minAmount', e.target.value)}
                  placeholder="e.g., 100000"
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Max Amount (UGX)</label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  className="form-input"
                  value={tier.maxAmount || ''}
                  onChange={(e) => updateTier(index, 'maxAmount', e.target.value)}
                  placeholder="e.g., 250000"
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Fee (UGX)</label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  className="form-input"
                  value={tier.fee || ''}
                  onChange={(e) => updateTier(index, 'fee', e.target.value)}
                  placeholder="e.g., 5000"
                />
              </div>
              <button
                type="button"
                onClick={() => removeTier(index)}
                className="nav-button secondary"
                style={{ marginTop: '28px', padding: '8px 12px' }}
                title="Remove tier"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          
          <button
            type="button"
            onClick={addTier}
            className="nav-button secondary"
            style={{ marginTop: '10px' }}
          >
            <Plus size={16} />
            Add Tier
          </button>
          
          <span className="input-helper" style={{ display: 'block', marginTop: '10px' }}>
            Example: 100k-250k = 5000 UGX, 260k-500k = 10000 UGX
          </span>
        </div>

        <div className="form-section">
          <h3 className="section-title">Processing Fees</h3>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Processing Fee (%)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className={`form-input ${errors.processingFeeValue ? 'error' : ''}`}
                value={formData.processingFeeValue || ''}
                onChange={(e) => updateFormData({ processingFeeValue: e.target.value })}
                placeholder="Enter processing fee percentage"
              />
              {errors.processingFeeValue && (
                <span className="error-message">{errors.processingFeeValue}</span>
              )}
              <span className="input-helper">One-time fee charged when loan is disbursed</span>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">Penalties</h3>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Penalty Rate (% per day)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className={`form-input ${errors.penaltyRate ? 'error' : ''}`}
                value={formData.penaltyRate || ''}
                onChange={(e) => updateFormData({ penaltyRate: e.target.value })}
                placeholder="e.g., 0.02 for 0.02% per day"
              />
              {errors.penaltyRate && (
                <span className="error-message">{errors.penaltyRate}</span>
              )}
              <span className="input-helper">Daily penalty rate on reducing balance (e.g., 0.02 = 0.02% per day)</span>
            </div>

            <div className="form-group">
              <label className="form-label">Late Fee (UGX)</label>
              <input
                type="number"
                min="0"
                step="100"
                className={`form-input ${errors.lateFee ? 'error' : ''}`}
                value={formData.lateFee || '0'}
                onChange={(e) => updateFormData({ lateFee: e.target.value })}
                placeholder="0"
                disabled
              />
              {errors.lateFee && (
                <span className="error-message">{errors.lateFee}</span>
              )}
              <span className="input-helper">Penalty charged for late repayments (currently disabled)</span>
            </div>

            <div className="form-group">
              <label className="form-label">Default Fee (UGX)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className={`form-input ${errors.defaultFee ? 'error' : ''}`}
                value={formData.defaultFee || '0'}
                onChange={(e) => updateFormData({ defaultFee: e.target.value })}
                placeholder="0"
                disabled
              />
              {errors.defaultFee && (
                <span className="error-message">{errors.defaultFee}</span>
              )}
              <span className="input-helper">Penalty for loan defaults (currently disabled)</span>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">Grace Period</h3>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Grace Period (Days)</label>
              <input
                type="number"
                min="0"
                step="1"
                className={`form-input ${errors.defaultGracePeriodDays ? 'error' : ''}`}
                value={formData.defaultGracePeriodDays || ''}
                onChange={(e) => updateFormData({ defaultGracePeriodDays: e.target.value })}
                placeholder="Enter grace period in days"
              />
              {errors.defaultGracePeriodDays && (
                <span className="error-message">{errors.defaultGracePeriodDays}</span>
              )}
              <span className="input-helper">Number of days before penalties apply after missed payment</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeesAndPenaltiesStep;
