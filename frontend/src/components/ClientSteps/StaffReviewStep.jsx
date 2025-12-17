import React from 'react';
import { User, Mail, MapPin, Users } from 'lucide-react';
import './StepStyles.css';

const StaffReviewStep = ({ formData, updateFormData, errors = {} }) => {
  return (
    <div className="step-container">
      <div className="step-header">
        <h2>Review & Submit</h2>
        <p>Please review all staff information before submitting</p>
      </div>

      <div className="step-form">
        <div className="review-sections">
          
          {/* Basic Information Section */}
          <div className="review-section">
            <div className="review-section-header">
              <User size={20} />
              <h3>Basic Information</h3>
            </div>
            <div className="review-grid">
              <div className="review-item">
                <label>Full Name:</label>
                <span>
                  {[formData.firstName, formData.middleName, formData.lastName]
                    .filter(Boolean)
                    .join(' ') || 'Not provided'}
                </span>
              </div>
              <div className="review-item">
                <label>Gender:</label>
                <span>{formData.gender || 'Not provided'}</span>
              </div>
              <div className="review-item">
                <label>Age:</label>
                <span>{formData.age || 'Not provided'}</span>
              </div>
              <div className="review-item">
                <label>National ID:</label>
                <span>{formData.nationalId || 'Not provided'}</span>
              </div>
              <div className="review-item">
                <label>Role:</label>
                <span className="role-badge">
                  {formData.role || 'Not selected'}
                </span>
              </div>
            </div>
          </div>

          {/* Photo Section */}
          {formData.passportPhotoPreview && (
            <div className="review-section">
              <div className="review-section-header">
                <User size={20} />
                <h3>Staff Photo</h3>
              </div>
              <div className="photo-review">
                <img 
                  src={formData.passportPhotoPreview} 
                  alt="Staff" 
                  className="review-photo"
                />
              </div>
            </div>
          )}

          {/* Contact Information Section */}
          <div className="review-section">
            <div className="review-section-header">
              <Mail size={20} />
              <h3>Contact Information</h3>
            </div>
            <div className="review-grid">
              <div className="review-item">
                <label>Phone Number:</label>
                <span>{formData.phoneNumber || 'Not provided'}</span>
              </div>
              <div className="review-item">
                <label>Email:</label>
                <span>{formData.email || 'Not provided'}</span>
              </div>
            </div>
          </div>

          {/* Address Information Section */}
          <div className="review-section">
            <div className="review-section-header">
              <MapPin size={20} />
              <h3>Address Information</h3>
            </div>
            <div className="review-grid">
              <div className="review-item">
                <label>Village:</label>
                <span>{formData.village || 'Not provided'}</span>
              </div>
              <div className="review-item">
                <label>Parish:</label>
                <span>{formData.parish || 'Not provided'}</span>
              </div>
              <div className="review-item">
                <label>District:</label>
                <span>{formData.district || 'Not provided'}</span>
              </div>
            </div>
          </div>

          {/* Next of Kin Section */}
          <div className="review-section">
            <div className="review-section-header">
              <Users size={20} />
              <h3>Next of Kin Information</h3>
            </div>
            <div className="review-grid">
              <div className="review-item">
                <label>Full Name:</label>
                <span>
                  {[formData.nextOfKinFirstName, formData.nextOfKinLastName]
                    .filter(Boolean)
                    .join(' ') || 'Not provided'}
                </span>
              </div>
              <div className="review-item">
                <label>Gender:</label>
                <span>{formData.nextOfKinGender || 'Not provided'}</span>
              </div>
              <div className="review-item">
                <label>Phone:</label>
                <span>{formData.nextOfKinPhone || 'Not provided'}</span>
              </div>
              <div className="review-item">
                <label>Relationship:</label>
                <span>{formData.nextOfKinRelationship || 'Not provided'}</span>
              </div>
              <div className="review-item">
                <label>Address:</label>
                <span>
                  {[formData.nextOfKinVillage, formData.nextOfKinParish, formData.nextOfKinDistrict]
                    .filter(Boolean)
                    .join(', ') || 'Not provided'}
                </span>
              </div>
            </div>
          </div>

          {/* System Information */}
          <div className="review-section">
            <div className="review-section-header">
              <User size={20} />
              <h3>System Information</h3>
            </div>
            <div className="review-grid">
              <div className="review-item">
                <label>Branch:</label>
                <span>{formData.branch || 'Main'}</span>
              </div>
              <div className="review-item">
                <label>Status:</label>
                <span className="status-active">Active</span>
              </div>
            </div>
          </div>

        </div>

        {/* Important Notice */}
        <div className="review-notice">
          <div className="notice-content">
            <h4>Important Notice</h4>
            <p>
              Please ensure all the information above is correct before submitting. 
              The staff member will be registered in the system and given access 
              based on their assigned role.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffReviewStep;