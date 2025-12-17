import React from 'react';
import './StepStyles.css';

const DocumentsReviewStep = ({ formData, updateFormData, errors = {}, isEditMode = false }) => {
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    updateFormData({ [name]: type === 'checkbox' ? checked : value });
  };

  // Handle photo file upload
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please upload a valid image file (JPEG, PNG, or GIF)');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        updateFormData({
          passportPhotoFile: file,
          passportPhotoPreview: e.target.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove uploaded photo
  const removePhoto = () => {
    updateFormData({
      passportPhotoFile: null,
      passportPhotoPreview: ''
    });
    
    // Clear file input
    const fileInput = document.getElementById('passportPhotoFile');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  return (
    <div className="step-container">
      <div className="step-header">
        <h2>Documents & Review</h2>
        <p>{isEditMode ? 'Please update documents and review information' : 'Please upload documents and review information'}</p>
      </div>

      <div className="step-form">
        {/* Photo Upload Section */}
        <div className="photo-upload-section">
          <label className="form-label">Passport Photo</label>
          
          {/* Single State-Changing Photo Upload Area */}
          <div className="photo-upload-container">
            <input
              type="file"
              id="passportPhotoFile"
              name="passportPhotoFile"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="photo-input"
            />
            
            {/* State 1: Empty/Upload State */}
            {!formData.passportPhotoPreview && (
              <label htmlFor="passportPhotoFile" className="photo-upload-area empty-state">
                <span className="upload-icon">📷</span>
                <span className="upload-text">Upload Photo</span>
                <span className="upload-hint">JPEG, PNG, or GIF (Max 5MB)</span>
              </label>
            )}
            
            {/* State 2: Preview State */}
            {formData.passportPhotoPreview && (
              <div className="photo-upload-area preview-state">
                <img 
                  src={formData.passportPhotoPreview} 
                  alt="Passport preview" 
                  className="preview-image"
                />
                
                {/* Remove button - top right corner */}
                <button 
                  type="button" 
                  onClick={removePhoto}
                  className="remove-photo-btn-corner"
                  title="Remove photo"
                >
                  ✕
                </button>
                
                {/* Change photo button - bottom overlay */}
                <div className="photo-overlay">
                  <label htmlFor="passportPhotoFile" className="change-photo-btn">
                    📷 Change Photo
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Review Summary */}
        <div className="review-section">
          <h3>Client Information Summary</h3>
          <div className="review-grid">
            <div className="review-item">
              <span className="review-label">Full Name:</span>
              <span className="review-value">
                {`${formData.firstName || ''} ${formData.middleName || ''} ${formData.lastName || ''}`.trim() || 'Not provided'}
              </span>
            </div>
            <div className="review-item">
              <span className="review-label">Age:</span>
              <span className="review-value">{formData.age || 'Not provided'}</span>
            </div>
            <div className="review-item">
              <span className="review-label">Phone Number:</span>
              <span className="review-value">{formData.phoneNumber || 'Not provided'}</span>
            </div>
            <div className="review-item">
              <span className="review-label">Email:</span>
              <span className="review-value">{formData.email || 'Not provided'}</span>
            </div>
            <div className="review-item">
              <span className="review-label">Address:</span>
              <span className="review-value">
                {`${formData.village || ''}, ${formData.parish || ''}, ${formData.district || ''}`.replace(/^,\s*|,\s*$/g, '') || 'Not provided'}
              </span>
            </div>
            <div className="review-item">
              <span className="review-label">Guarantor:</span>
              <span className="review-value">
                {formData.guarantorFirstName || formData.guarantorLastName 
                  ? `${formData.guarantorFirstName || ''} ${formData.guarantorLastName || ''}`.trim()
                  : 'Not provided'}
              </span>
            </div>
          </div>
        </div>

        {/* Agreement Section */}
        <div className="form-group full-width">
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="agreementSigned"
              name="agreementSigned"
              checked={formData.agreementSigned || false}
              onChange={handleChange}
              className="checkbox-input"
              required
            />
            <label htmlFor="agreementSigned" className="checkbox-text">
              I confirm that the client has signed all required agreement forms and consents to data processing.
            </label>
          </div>
          {errors.agreementSigned && (
            <span className="error-message">{errors.agreementSigned}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentsReviewStep;