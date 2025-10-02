import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './AddClient.css';

const AddClient = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    // Basic Information
    firstName: '',
    middleName: '',
    lastName: '',
    age: '',
    nationalId: '',
    phoneNumber: '',
    email: '',
    
    // Photo Information
    passportPhotoFile: null,
    passportPhotoPreview: '',
    
    // Address Information
    village: '',
    parish: '',
    district: '',
    
    // Next of Kin Information
    nextOfKinFirstName: '',
    nextOfKinLastName: '',
    nextOfKinPhone: '',
    nextOfKinRelationship: '',
    
    // Employment Information
    employmentStatus: '',
    occupation: '',
    monthlyIncome: '',
    
    // Agreement
    agreementSigned: false
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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
        setFormData(prev => ({
          ...prev,
          passportPhotoFile: file,
          passportPhotoPreview: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove uploaded photo
  const removePhoto = () => {
    setFormData(prev => ({
      ...prev,
      passportPhotoFile: null,
      passportPhotoPreview: ''
    }));
    
    // Clear file input
    const fileInput = document.getElementById('passportPhotoFile');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.phoneNumber) {
      alert('Please fill in all required fields (First Name, Last Name, Phone Number)');
      return;
    }
    
    if (!formData.agreementSigned) {
      alert('Client must sign the agreement to proceed');
      return;
    }
    
    console.log('Client Registration Data:', formData);
    
    // Simulate saving
    alert('Client registered successfully!');
    navigate('/clients');
  };

  const employmentOptions = [
    'Employed',
    'Self-Employed', 
    'Business Owner',
    'Farmer',
    'Student',
    'Unemployed',
    'Retired'
  ];

  const relationshipOptions = [
    'Parent',
    'Spouse',
    'Sibling',
    'Child',
    'Uncle/Aunt',
    'Cousin',
    'Friend',
    'Other'
  ];

  return (
    <div className="add-client-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>TINDIGWA</h2>
        </div>
        
        <nav className="sidebar-nav">
          <button className="nav-item" onClick={() => navigate('/dashboard')}>
            <span>Dashboard</span>
          </button>
          <button className="nav-item active">
            <span>Clients</span>
          </button>
          <button className="nav-item" onClick={() => navigate('/loans')}>
            <span>Loans</span>
          </button>
          <button className="nav-item" onClick={() => navigate('/payments')}>
            <span>Payments</span>
          </button>
          <button className="nav-item" onClick={() => navigate('/settings')}>
            <span>Settings</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="page-header">
          <div className="header-content">
            <button 
              className="back-button"
              onClick={() => navigate('/clients')}
            >
              <ArrowLeft size={20} />
              Back to Clients
            </button>
            <h1>Add New Client</h1>
          </div>
        </div>

        <div className="content-container">
          <form onSubmit={handleSubmit}>
            {/* Basic Information Section */}
            <div className="info-section">
              <h2>Basic Information</h2>
              
              <div className="info-grid">
                <div className="info-row">
                  <span className="info-label">First Name *</span>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Enter first name"
                    className="info-input"
                    required
                  />
                </div>
                
                <div className="info-row">
                  <span className="info-label">Middle Name</span>
                  <input
                    type="text"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleInputChange}
                    placeholder="Enter middle name (optional)"
                    className="info-input"
                  />
                </div>
                
                <div className="info-row">
                  <span className="info-label">Last Name *</span>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Enter last name"
                    className="info-input"
                    required
                  />
                </div>
                
                <div className="info-row">
                  <span className="info-label">Age</span>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    placeholder="Enter age"
                    className="info-input"
                    min="18"
                    max="100"
                  />
                </div>
                
                <div className="info-row">
                  <span className="info-label">National ID</span>
                  <input
                    type="text"
                    name="nationalId"
                    value={formData.nationalId}
                    onChange={handleInputChange}
                    placeholder="Enter national ID number"
                    className="info-input"
                  />
                </div>
                
                <div className="info-row">
                  <span className="info-label">Phone Number *</span>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                    className="info-input"
                    required
                  />
                </div>
                
                <div className="info-row">
                  <span className="info-label">Email Address</span>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email address (optional)"
                    className="info-input"
                  />
                </div>
                
                <div className="info-row photo-upload-row">
                  <span className="info-label">Passport Photo</span>
                  
                  {/* Photo Preview */}
                  {formData.passportPhotoPreview && (
                    <div className="photo-preview">
                      <img 
                        src={formData.passportPhotoPreview} 
                        alt="Passport preview" 
                        className="preview-image"
                      />
                      <button 
                        type="button" 
                        onClick={removePhoto}
                        className="remove-photo-btn"
                        title="Remove photo"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  
                  {/* File Upload */}
                  <div className="photo-upload">
                    <input
                      type="file"
                      id="passportPhotoFile"
                      name="passportPhotoFile"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="photo-input"
                    />
                    <label htmlFor="passportPhotoFile" className="photo-upload-label">
                      <span className="upload-icon">📷</span>
                      <span className="upload-text">
                        {formData.passportPhotoPreview ? 'Change Photo' : 'Upload Photo'}
                      </span>
                      <span className="upload-hint">JPEG, PNG, or GIF (Max 5MB)</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Address Information Section */}
            <div className="info-section">
              <h2>Address Information</h2>
              
              <div className="info-grid">
                <div className="info-row">
                  <span className="info-label">Village</span>
                  <input
                    type="text"
                    name="village"
                    value={formData.village}
                    onChange={handleInputChange}
                    placeholder="Enter village"
                    className="info-input"
                  />
                </div>
                
                <div className="info-row">
                  <span className="info-label">Parish</span>
                  <input
                    type="text"
                    name="parish"
                    value={formData.parish}
                    onChange={handleInputChange}
                    placeholder="Enter parish"
                    className="info-input"
                  />
                </div>
                
                <div className="info-row">
                  <span className="info-label">District</span>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    placeholder="Enter district"
                    className="info-input"
                  />
                </div>
              </div>
            </div>


            {/* Next of Kin Information Section */}
            <div className="info-section">
              <h2>Next of Kin Information</h2>
              
              <div className="info-grid">
                <div className="info-row">
                  <span className="info-label">Next of Kin First Name</span>
                  <input
                    type="text"
                    name="nextOfKinFirstName"
                    value={formData.nextOfKinFirstName}
                    onChange={handleInputChange}
                    placeholder="Enter next of kin first name"
                    className="info-input"
                  />
                </div>
                
                <div className="info-row">
                  <span className="info-label">Next of Kin Last Name</span>
                  <input
                    type="text"
                    name="nextOfKinLastName"
                    value={formData.nextOfKinLastName}
                    onChange={handleInputChange}
                    placeholder="Enter next of kin last name"
                    className="info-input"
                  />
                </div>
                
                <div className="info-row">
                  <span className="info-label">Next of Kin Phone</span>
                  <input
                    type="tel"
                    name="nextOfKinPhone"
                    value={formData.nextOfKinPhone}
                    onChange={handleInputChange}
                    placeholder="Enter next of kin phone number"
                    className="info-input"
                  />
                </div>
                
                <div className="info-row">
                  <span className="info-label">Relationship</span>
                  <select
                    name="nextOfKinRelationship"
                    value={formData.nextOfKinRelationship}
                    onChange={handleInputChange}
                    className="info-input"
                  >
                    <option value="">Select Relationship</option>
                    {relationshipOptions.map((relationship, index) => (
                      <option key={index} value={relationship}>{relationship}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Employment Information Section */}
            <div className="info-section">
              <h2>Employment Information</h2>
              
              <div className="info-grid">
                <div className="info-row">
                  <span className="info-label">Employment Status</span>
                  <select
                    name="employmentStatus"
                    value={formData.employmentStatus}
                    onChange={handleInputChange}
                    className="info-input"
                  >
                    <option value="">Select Employment Status</option>
                    {employmentOptions.map((status, index) => (
                      <option key={index} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                
                <div className="info-row">
                  <span className="info-label">Occupation</span>
                  <input
                    type="text"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleInputChange}
                    placeholder="Enter occupation/job title"
                    className="info-input"
                  />
                </div>
                
                <div className="info-row">
                  <span className="info-label">Monthly Income (UGX)</span>
                  <input
                    type="number"
                    name="monthlyIncome"
                    value={formData.monthlyIncome}
                    onChange={handleInputChange}
                    placeholder="Enter estimated monthly income"
                    className="info-input"
                    min="0"
                    step="1000"
                  />
                </div>
              </div>
            </div>

            {/* Agreement Section */}
            <div className="info-section">
              <h2>Agreement</h2>
              
              <div className="agreement-section">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="agreementSigned"
                    checked={formData.agreementSigned}
                    onChange={handleInputChange}
                    className="checkbox-input"
                  />
                  <span className="checkbox-text">
                    I confirm that the client has signed all required agreement forms and consents to data processing.
                  </span>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="submit-section">
              <button type="submit" className="submit-button">
                Register Client
              </button>
              <button 
                type="button" 
                className="cancel-button"
                onClick={() => navigate('/clients')}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AddClient;