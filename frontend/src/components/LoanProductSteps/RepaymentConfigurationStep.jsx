import React from 'react';
import { Calendar } from 'lucide-react';

const RepaymentConfigurationStep = ({ formData, updateFormData, errors }) => {
  // Helper to determine duration unit based on frequency
  const getDurationUnitForFrequency = (frequency) => {
    if (frequency === 'daily') return 'days';
    if (frequency === 'weekly' || frequency === 'bi-weekly') return 'weeks';
    return 'months';
  };

  const handleFrequencyChange = (frequency) => {
    const durationUnit = getDurationUnitForFrequency(frequency);
    updateFormData({ 
      defaultRepaymentFrequency: frequency,
      durationUnit: durationUnit
    });
  };

  const handleAllowedFrequenciesChange = (frequency) => {
    const currentFrequencies = formData.allowedRepaymentFrequencies || 'daily,weekly,bi-weekly,monthly';
    const frequenciesArray = currentFrequencies.split(',');
    
    let updatedFrequencies;
    if (frequenciesArray.includes(frequency)) {
      // Remove the frequency
      updatedFrequencies = frequenciesArray.filter(f => f !== frequency);
    } else {
      // Add the frequency
      updatedFrequencies = [...frequenciesArray, frequency];
    }
    
    updateFormData({ allowedRepaymentFrequencies: updatedFrequencies.join(',') });
  };

  const isFrequencySelected = (frequency) => {
    const currentFrequencies = formData.allowedRepaymentFrequencies || 'daily,weekly,bi-weekly,monthly';
    return currentFrequencies.split(',').includes(frequency);
  };

  return (
    <div className="step-container">
      <div className="step-header">
        <h2>
          <Calendar size={24} />
          Repayment Configuration
        </h2>
        <p>Define how borrowers will repay loans under this product</p>
      </div>

      <div className="step-form">
        <div className="form-section">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                Default Frequency <span className="required">*</span>
              </label>
              <select
                className="form-input form-select"
                value={formData.defaultRepaymentFrequency || 'monthly'}
                onChange={(e) => handleFrequencyChange(e.target.value)}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="bi-weekly">Bi-Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
              <span className="input-helper">The default repayment schedule for new loans</span>
            </div>

            <div className="form-group full-width">
              <label className="form-label">
                Allowed Frequencies <span className="required">*</span>
              </label>
              <div className="checkbox-group">
                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={isFrequencySelected('daily')}
                    onChange={() => handleAllowedFrequenciesChange('daily')}
                  />
                  <span className="checkbox-label">Daily</span>
                </label>
                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={isFrequencySelected('weekly')}
                    onChange={() => handleAllowedFrequenciesChange('weekly')}
                  />
                  <span className="checkbox-label">Weekly</span>
                </label>
                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={isFrequencySelected('bi-weekly')}
                    onChange={() => handleAllowedFrequenciesChange('bi-weekly')}
                  />
                  <span className="checkbox-label">Bi-Weekly</span>
                </label>
                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={isFrequencySelected('monthly')}
                    onChange={() => handleAllowedFrequenciesChange('monthly')}
                  />
                  <span className="checkbox-label">Monthly</span>
                </label>
              </div>
              <span className="input-helper">Select which repayment frequencies are available for this product</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepaymentConfigurationStep;
