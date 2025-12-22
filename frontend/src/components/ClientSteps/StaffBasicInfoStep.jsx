import React, { useState, useEffect } from 'react';
import { Camera, X } from 'lucide-react';
import './StepStyles.css';
import Sidebar from '../Layout/Sidebar';

const StaffBasicInfoStep = ({ formData, onInputChange, updateFormData, errors = {}, isEditMode = false }) => {
  const [roles, setRoles] = useState([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setIsLoadingRoles(true);
      console.log('🔄 Loading staff roles...');
      
      // Include all available roles in the system based on current database enum
      const allRoles = [
        { name: 'ADMIN', displayName: 'Administrator' },
        { name: 'LOAN_OFFICER', displayName: 'Loan Officer' },
        { name: 'CASHIER', displayName: 'Cashier' },
        { name: 'SUPERVISOR', displayName: 'Supervisor' }
      ];
      
      console.log('✅ Using all available roles:', allRoles);
      setRoles(allRoles);
      
    } catch (error) {
      console.error('❌ Error loading roles:', error);
      // Fallback to default staff roles
      setRoles([
        { name: 'LOAN_OFFICER', displayName: 'Loan Officer' },
        { name: 'CASHIER', displayName: 'Cashier' },
        { name: 'SUPERVISOR', displayName: 'Supervisor' }
      ]);
    } finally {
      setIsLoadingRoles(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Support both prop names for compatibility
    if (onInputChange) {
      onInputChange(name, value);
    } else if (updateFormData) {
      updateFormData({ [name]: value });
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        alert('Please select a valid image file (JPG, PNG, GIF)');
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        alert('File size must be less than 5MB');
        return;
      }

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      
      const photoData = {
        passportPhotoFile: file,
        passportPhotoPreview: previewUrl
      };

      if (onInputChange) {
        onInputChange('passportPhotoFile', file);
        onInputChange('passportPhotoPreview', previewUrl);
      } else if (updateFormData) {
        updateFormData(photoData);
      }
    }
  };

  const removePhoto = () => {
    // Clean up preview URL if it exists
    if (formData.passportPhotoPreview) {
      URL.revokeObjectURL(formData.passportPhotoPreview);
    }

    const photoData = {
      passportPhotoFile: null,
      passportPhotoPreview: ''
    };

    if (onInputChange) {
      onInputChange('passportPhotoFile', null);
      onInputChange('passportPhotoPreview', '');
    } else if (updateFormData) {
      updateFormData(photoData);
    }
  };

  return (
    <div className="step-container">

            <Sidebar />

      <div className="step-header">
        <h2>Basic Information</h2>
        <p>{isEditMode ? 'Please update the staff member\'s personal details' : 'Please provide the staff member\'s personal details'}</p>
      </div>

      <div className="step-form">
        {/* Photo Upload Section */}
        <div className="photo-upload-section">
          <label className="form-label">Staff Photo</label>
          <div className="photo-upload-container">
            {formData.passportPhotoPreview ? (
              <div className="photo-preview">
                <img 
                  src={formData.passportPhotoPreview} 
                  alt="Staff preview" 
                  className="preview-image"
                />
                <button 
                  type="button" 
                  className="remove-photo-btn"
                  onClick={removePhoto}
                  title="Remove photo"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="photo-upload-placeholder">
                <Camera size={32} />
                <p>Upload Staff Photo</p>
                <small>JPG, PNG, GIF (max 5MB)</small>
              </div>
            )}
            <input
              type="file"
              id="photoUpload"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="photo-input"
              style={{ display: 'none' }}
            />
            <label htmlFor="photoUpload" className="photo-upload-btn">
              {formData.passportPhotoPreview ? 'Change Photo' : 'Upload Photo'}
            </label>
          </div>
        </div>

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
              <option value="" disabled>Select Gender</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
            {errors.gender && <span className="error-message">{errors.gender}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="role" className="form-label">
              Role <span className="required">*</span>
            </label>
            <select
              id="role"
              name="role"
              value={formData.role || ''}
              onChange={handleChange}
              className={`form-input form-select ${errors.role ? 'error' : ''}`}
              required
              disabled={isLoadingRoles}
            >
              <option value="" disabled>
                {isLoadingRoles ? 'Loading roles...' : 'Select Role'}
              </option>
              {roles.map((role) => (
                <option key={role.id || role.name} value={role.name}>
                  {role.displayName || role.name}
                </option>
              ))}
            </select>
            {errors.role && <span className="error-message">{errors.role}</span>}
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
              max="70"
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
              onChange={handleChange}
              className={`form-input ${errors.nationalId ? 'error' : ''}`}
              placeholder="Enter national ID number"
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
        </div>
      </div>
    </div>
  );
};

export default StaffBasicInfoStep;