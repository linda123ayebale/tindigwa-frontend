import React from 'react';
import { Info } from 'lucide-react';

const BasicInformationStep = ({ formData, updateFormData, errors }) => {
  return (
    <div className="step-container">
      <div className="step-header">
        <h2>
          <Info size={24} />
          Basic Information
        </h2>
        <p>Enter the basic details for this loan product</p>
      </div>

      <div className="step-form">
        <div className="form-section">
          <div className="form-grid">
            <div className="form-group full-width">
              <label className="form-label">
                Product Name <span className="required">*</span>
              </label>
              <input
                type="text"
                className={`form-input ${errors.productName ? 'error' : ''}`}
                value={formData.productName || ''}
                onChange={(e) => updateFormData({ productName: e.target.value })}
                placeholder="Enter product name (code will be auto-generated)"
              />
              {errors.productName && (
                <span className="error-message">{errors.productName}</span>
              )}
              <span className="input-helper">The product code will be automatically generated</span>
            </div>

            <div className="form-group full-width">
              <label className="form-label">Description</label>
              <textarea
                className="form-input form-textarea"
                value={formData.description || ''}
                onChange={(e) => updateFormData({ description: e.target.value })}
                placeholder="Enter a detailed description of this loan product"
                rows={4}
              />
              <span className="input-helper">Optional: Describe the purpose and features of this product</span>
            </div>

            <div className="form-group">
              <label className="form-label">
                Status <span className="required">*</span>
              </label>
              <select
                className="form-input form-select"
                value={formData.active !== undefined ? (formData.active ? 'ACTIVE' : 'INACTIVE') : 'ACTIVE'}
                onChange={(e) => updateFormData({ active: e.target.value === 'ACTIVE' })}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
              <span className="input-helper">Active products are available for new loans</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicInformationStep;
