import React from 'react';
import './StepStyles.css';

const EmploymentStep = ({ formData, onInputChange, updateFormData, errors = {}, isEditMode = false }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Support both prop names for compatibility
    if (onInputChange) {
      onInputChange(name, value);
    } else if (updateFormData) {
      updateFormData({ [name]: value });
    }
  };

  return (
    <div className="step-container">
      <div className="step-header">
        <h2>Employment & Income</h2>
        <p>{isEditMode ? 'Please update work and financial information' : 'Please provide work and financial information'}</p>
      </div>

      <div className="step-form">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="employmentStatus" className="form-label">
              Employment Status
            </label>
            <select
              id="employmentStatus"
              name="employmentStatus"
              value={formData.employmentStatus || ''}
              onChange={handleChange}
              className="form-select"
            >
              <option value="">Select Employment Status</option>
              <option value="Employed">Employed</option>
              <option value="Unemployed">Unemployed</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="occupation" className="form-label">
              Occupation
            </label>
            <input
              type="text"
              id="occupation"
              name="occupation"
              value={formData.occupation || ''}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter occupation/job title"
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="monthlyIncome" className="form-label">
              Monthly Income (UGX)
            </label>
            <input
              type="number"
              id="monthlyIncome"
              name="monthlyIncome"
              value={formData.monthlyIncome || ''}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter estimated monthly income"
              min="0"
              step="1000"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmploymentStep;