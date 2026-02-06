import React from 'react';
import './StepStyles.css';

const BasicInfoStep = ({ formData, onInputChange, updateFormData, errors = {}, isEditMode = false }) => {
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
        <h2>Basic Information</h2>
        <p>{isEditMode ? 'Please update the client\'s personal details' : 'Please provide the client\'s personal details'}</p>
      </div>

      <div className="step-form">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="firstName" className="form-label">
              First Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName || ''}
              onChange={handleChange}
              className={`form-input ${errors.firstName ? 'error' : ''}`}
              placeholder="Enter first name"
              required
            />
            {errors.firstName && <span className="error-message">{errors.firstName}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="middleName" className="form-label">
              Middle Name
            </label>
            <input
              type="text"
              id="middleName"
              name="middleName"
              value={formData.middleName || ''}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter middle name (optional)"
            />
          </div>

          <div className="form-group">
            <label htmlFor="lastName" className="form-label">
              Last Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName || ''}
              onChange={handleChange}
              className={`form-input ${errors.lastName ? 'error' : ''}`}
              placeholder="Enter last name"
              required
            />
            {errors.lastName && <span className="error-message">{errors.lastName}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="gender" className="form-label">
              Gender <span className="required">*</span>
            </label>
            <select
              id="gender"
              name="gender"
              value={formData.gender || ''}
              onChange={handleChange}
              className={`form-input form-select ${errors.gender ? 'error' : ''}`}
              required
            >
              <option value="">Select Gender</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
            {errors.gender && <span className="error-message">{errors.gender}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="age" className="form-label">
              Age
            </label>
            <input
              type="number"
              id="age"
              name="age"
              value={formData.age || ''}
              onChange={handleChange}
              className={`form-input ${errors.age ? 'error' : ''}`}
              placeholder="Enter age"
              min="18"
              max="100"
            />
            {errors.age && <span className="error-message">{errors.age}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="nationalId" className="form-label">
              National ID <span className="required">*</span>
            </label>
            <input
              type="text"
              id="nationalId"
              name="nationalId"
              value={formData.nationalId || ''}
              onChange={(e) => {
                // Auto-convert to uppercase as user types
                const { name } = e.target;
                const value = e.target.value.toUpperCase();
                if (onInputChange) {
                  onInputChange(name, value);
                } else if (updateFormData) {
                  updateFormData({ [name]: value });
                }
              }}
              className={`form-input ${errors.nationalId ? 'error' : ''}`}
              placeholder="Enter National ID"
              maxLength="14"
              required
            />
            {errors.nationalId && <span className="error-message">{errors.nationalId}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="phoneNumber" className="form-label">
              Phone Number <span className="required">*</span>
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber || ''}
              onChange={handleChange}
              className={`form-input ${errors.phoneNumber ? 'error' : ''}`}
              placeholder="Enter 10-digit phone number"
              maxLength="10"
              required
            />
            {errors.phoneNumber && <span className="error-message">{errors.phoneNumber}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="maritalStatus" className="form-label">
              Marital Status <span className="required">*</span>
            </label>
            <select
              id="maritalStatus"
              name="maritalStatus"
              value={formData.maritalStatus || ''}
              onChange={handleChange}
              className={`form-input form-select ${errors.maritalStatus ? 'error' : ''}`}
              required
            >
              <option value="">Select Marital Status</option>
              <option value="SINGLE">Single</option>
              <option value="MARRIED">Married</option>
            </select>
            {errors.maritalStatus && <span className="error-message">{errors.maritalStatus}</span>}
          </div>
        </div>

        {/* Spouse Information - Show only if Married */}
        {formData.maritalStatus === 'MARRIED' && (
          <div className="form-section" style={{ marginTop: '24px' }}>
            <h3 className="section-title">Spouse Information</h3>
            <p className="section-description">Required for married clients - spouse signature will be needed on loan agreements</p>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="spouseName" className="form-label">
                  Spouse Full Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="spouseName"
                  name="spouseName"
                  value={formData.spouseName || ''}
                  onChange={handleChange}
                  className={`form-input ${errors.spouseName ? 'error' : ''}`}
                  placeholder="Enter spouse's full name"
                  required
                />
                {errors.spouseName && <span className="error-message">{errors.spouseName}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="spousePhone" className="form-label">
                  Spouse Phone Number <span className="required">*</span>
                </label>
                <input
                  type="tel"
                  id="spousePhone"
                  name="spousePhone"
                  value={formData.spousePhone || ''}
                  onChange={handleChange}
                  className={`form-input ${errors.spousePhone ? 'error' : ''}`}
                  placeholder="Enter 10-digit phone number"
                  maxLength="10"
                  required
                />
                {errors.spousePhone && <span className="error-message">{errors.spousePhone}</span>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BasicInfoStep;
