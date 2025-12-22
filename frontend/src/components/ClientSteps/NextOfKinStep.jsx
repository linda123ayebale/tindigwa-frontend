import React from 'react';
import './StepStyles.css';
import Sidebar from '../Layout/Sidebar';

const NextOfKinStep = ({ formData, onInputChange, updateFormData, errors = {}, isEditMode = false }) => {
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
    'Other'
  ];

  return (
    <div className="step-container">
       <Sidebar />
      <div className="step-header">
        <h2>Next of Kin</h2>
        <p>{isEditMode ? 'Please update next of kin information' : 'Please provide next of kin information'}</p>
      </div>

      <div className="step-form">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="nextOfKinFirstName" className="form-label">
              Next of Kin First Name
            </label>
            <input
              type="text"
              id="nextOfKinFirstName"
              name="nextOfKinFirstName"
              value={formData.nextOfKinFirstName || ''}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter first name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="nextOfKinLastName" className="form-label">
              Next of Kin Last Name
            </label>
            <input
              type="text"
              id="nextOfKinLastName"
              name="nextOfKinLastName"
              value={formData.nextOfKinLastName || ''}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter last name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="nextOfKinGender" className="form-label">
              Next of Kin Gender
            </label>
            <select
              id="nextOfKinGender"
              name="nextOfKinGender"
              value={formData.nextOfKinGender || ''}
              onChange={handleChange}
              className="form-input form-select"
            >
              <option value="">Select Gender</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="nextOfKinPhone" className="form-label">
              Next of Kin Phone
            </label>
            <input
              type="tel"
              id="nextOfKinPhone"
              name="nextOfKinPhone"
              value={formData.nextOfKinPhone || ''}
              onChange={handleChange}
              className={`form-input ${errors.nextOfKinPhone ? 'error' : ''}`}
              placeholder="Enter 10-digit phone number"
              maxLength="10"
            />
            {errors.nextOfKinPhone && <span className="error-message">{errors.nextOfKinPhone}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="nextOfKinRelationship" className="form-label">
              Relationship
            </label>
            <select
              id="nextOfKinRelationship"
              name="nextOfKinRelationship"
              value={formData.nextOfKinRelationship || ''}
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

          <div className="form-group">
            <label htmlFor="nextOfKinVillage" className="form-label">
              Next of Kin Village
            </label>
            <input
              type="text"
              id="nextOfKinVillage"
              name="nextOfKinVillage"
              value={formData.nextOfKinVillage || ''}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter village"
            />
          </div>

          <div className="form-group">
            <label htmlFor="nextOfKinParish" className="form-label">
              Next of Kin Parish
            </label>
            <input
              type="text"
              id="nextOfKinParish"
              name="nextOfKinParish"
              value={formData.nextOfKinParish || ''}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter parish"
            />
          </div>

          <div className="form-group">
            <label htmlFor="nextOfKinDistrict" className="form-label">
              Next of Kin District
            </label>
            <input
              type="text"
              id="nextOfKinDistrict"
              name="nextOfKinDistrict"
              value={formData.nextOfKinDistrict || ''}
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

export default NextOfKinStep;