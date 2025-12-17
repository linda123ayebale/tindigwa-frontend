import React from 'react';
import './StepStyles.css';

const GuarantorStep = ({ formData, onInputChange, updateFormData, errors = {}, isEditMode = false }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Support both prop names for compatibility
    if (onInputChange) {
      onInputChange(name, value);
    } else if (updateFormData) {
      updateFormData({ [name]: value });
    }
  };

  const relationshipOptions = [
    'Parent',
    'Spouse',
    'Sibling',
    'Child',
    'Uncle/Aunt',
    'Cousin',
    'Friend',
    'Neighbor',
    'Business Partner',
    'Other'
  ];

  return (
    <div className="step-container">
      <div className="step-header">
        <h2>Guarantor</h2>
        <p>{isEditMode ? 'Please update guarantor information' : 'Please provide guarantor information'}</p>
      </div>

      <div className="step-form">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="guarantorFirstName" className="form-label">
              Guarantor First Name
            </label>
            <input
              type="text"
              id="guarantorFirstName"
              name="guarantorFirstName"
              value={formData.guarantorFirstName || ''}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter first name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="guarantorLastName" className="form-label">
              Guarantor Last Name
            </label>
            <input
              type="text"
              id="guarantorLastName"
              name="guarantorLastName"
              value={formData.guarantorLastName || ''}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter last name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="guarantorGender" className="form-label">
              Guarantor Gender
            </label>
            <select
              id="guarantorGender"
              name="guarantorGender"
              value={formData.guarantorGender || ''}
              onChange={handleChange}
              className="form-input form-select"
            >
              <option value="">Select Gender</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="guarantorPhone" className="form-label">
              Guarantor Phone
            </label>
            <input
              type="tel"
              id="guarantorPhone"
              name="guarantorPhone"
              value={formData.guarantorPhone || ''}
              onChange={handleChange}
              className={`form-input ${errors.guarantorPhone ? 'error' : ''}`}
              placeholder="Enter 10-digit phone number"
              maxLength="10"
            />
            {errors.guarantorPhone && <span className="error-message">{errors.guarantorPhone}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="guarantorRelationship" className="form-label">
              Relationship
            </label>
            <select
              id="guarantorRelationship"
              name="guarantorRelationship"
              value={formData.guarantorRelationship || ''}
              onChange={handleChange}
              className="form-select"
            >
              <option value="">Select Relationship</option>
              {relationshipOptions.map((relationship, index) => (
                <option key={index} value={relationship}>
                  {relationship}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuarantorStep;
