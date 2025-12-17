import React from 'react';
import './StepStyles.css';

const ContactAddressStep = ({ formData, updateFormData, errors = {}, isEditMode = false }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });
  };

  return (
    <div className="step-container">
      <div className="step-header">
        <h2>Contact & Address</h2>
        <p>{isEditMode ? 'Please update contact information and address details' : 'Please provide contact information and address details'}</p>
      </div>

      <div className="step-form">
        <div className="form-grid">
          <div className="form-group full-width">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email || ''}
              onChange={handleChange}
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="Enter email address (optional)"
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="village" className="form-label">
              Village
            </label>
            <input
              type="text"
              id="village"
              name="village"
              value={formData.village || ''}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter village"
            />
          </div>

          <div className="form-group">
            <label htmlFor="parish" className="form-label">
              Parish
            </label>
            <input
              type="text"
              id="parish"
              name="parish"
              value={formData.parish || ''}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter parish"
            />
          </div>

          <div className="form-group">
            <label htmlFor="district" className="form-label">
              District
            </label>
            <input
              type="text"
              id="district"
              name="district"
              value={formData.district || ''}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter district"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactAddressStep;