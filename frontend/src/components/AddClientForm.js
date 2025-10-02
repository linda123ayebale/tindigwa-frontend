import React, { useState, useEffect } from 'react';
import { X, ArrowLeft, ArrowRight } from 'lucide-react';
import './AddClientForm.css';

const AddClientForm = ({ onSubmit, onCancel, isOpen, isPageMode = false }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Direct state initialization like the working Loan form
  const [formData, setFormData] = useState({
    // Profile fields - matching backend Person entity
    firstName: '',
    givenName: '',
    lastName: '',
    age: '',
    nationalIdNumber: '', // National ID Number
    contact: '', // Changed from phoneNumber  
    village: '',
    parish: '',
    district: '',
    
    // Additional profile fields for ClientsProfile entity
    lengthOfStayValue: '', // Number value for length of stay
    lengthOfStayUnit: 'years', // Time unit (days, weeks, months, years)
    sourceOfIncome: '',
    passportPhotoFile: null, // File object
    passportPhotoPreview: '', // Preview URL
    
    // Marital status and spouse fields
    maritalStatus: 'single', // 'single', 'married', 'divorced', 'widowed'
    spouse: {
      firstName: '',
      givenName: '',
      lastName: ''
    },
    
    // Next of Kin fields - matching backend NextOfKin/Person entity structure
    nextOfKin: {
      firstName: '',
      givenName: '',
      lastName: '',
      age: '',
      contact: '',
      nationalId: '',
      village: '',
      parish: '',
      district: ''
    },
    
    // Guarantor fields - matching backend Guarantor/Person entity structure
    guarantor: {
      firstName: '',
      givenName: '',
      lastName: '',
      age: '',
      contact: '',
      nationalId: '',
      village: '',
      parish: '',
      district: ''
    },
    guarantorIncomeSource: '', // Additional field for guarantor
    
    // Employment fields
    employmentStatus: '',
    employerName: '',
    industry: '',
    position: '',
    employmentLengthValue: '',
    employmentLengthUnit: 'years',
    employerAddress: '',
    monthlyIncome: '',
    incomeFrequency: 'monthly',
    additionalIncome: '',
    incomeVerification: '',
    unemploymentReason: '',
    supportSource: '',
    otherSupportDetails: '',
    employmentNotes: '',
    
    // Documents
    documents: [],
    agreementSigned: false,
    agreementNotes: ''
  });

  const steps = [
    { id: 'profile', label: 'Profile', active: currentStep === 0 },
    { id: 'guarantor', label: 'Guarantor', active: currentStep === 1 },
    { id: 'nextOfKin', label: 'Next of Kin', active: currentStep === 2 },
    { id: 'spouse', label: 'Spouse', active: currentStep === 3 },
    { id: 'employment', label: 'Employment', active: currentStep === 4 },
    { id: 'documents', label: 'Documents', active: currentStep === 5 }
  ];

  const validateCurrentStep = () => {
    const newErrors = {};

    switch (currentStep) {
      case 0: // Profile
        if (!formData.firstName.trim()) {
          newErrors.firstName = 'First name is required';
        }
        if (!formData.lastName.trim()) {
          newErrors.lastName = 'Last name is required';
        }
        if (!formData.contact.trim()) {
          newErrors.contact = 'Contact number is required';
        }
        break;
      case 1: // Guarantor
        if (!formData.guarantor.firstName.trim()) {
          newErrors.guarantorFirstName = 'Guarantor first name is required';
        }
        if (!formData.guarantor.lastName.trim()) {
          newErrors.guarantorLastName = 'Guarantor last name is required';
        }
        if (!formData.guarantor.contact.trim()) {
          newErrors.guarantorContact = 'Guarantor contact is required';
        }
        break;
      case 2: // Next of Kin
        if (!formData.nextOfKin.firstName.trim()) {
          newErrors.nextOfKinFirstName = 'Next of kin first name is required';
        }
        if (!formData.nextOfKin.contact.trim()) {
          newErrors.nextOfKinContact = 'Next of kin contact is required';
        }
        break;
      case 3: // Spouse
        if (formData.maritalStatus === 'married') {
          if (!formData.spouse.firstName.trim()) {
            newErrors.spouseFirstName = 'Spouse first name is required for married clients';
          }
          if (!formData.spouse.lastName.trim()) {
            newErrors.spouseLastName = 'Spouse last name is required for married clients';
          }
        }
        break;
      case 4: // Employment
        if (!formData.employmentStatus.trim()) {
          newErrors.employmentStatus = 'Employment status is required';
        }
        
        // Validate employment details for working status
        if (['employed', 'self-employed', 'business-owner', 'farmer', 'other'].includes(formData.employmentStatus)) {
          if (!formData.employerName.trim()) {
            newErrors.employerName = 'Employer/Business name is required';
          }
          if (!formData.position.trim()) {
            newErrors.position = 'Position/Role is required';
          }
          if (!formData.monthlyIncome || formData.monthlyIncome <= 0) {
            newErrors.monthlyIncome = 'Valid monthly income is required';
          }
        }
        break;
      case 5: // Documents
        if (!formData.agreementSigned) {
          newErrors.agreementSigned = 'Client must sign the agreement forms before proceeding';
        }
        break;
      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateCurrentStep() && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (stepIndex) => {
    setCurrentStep(stepIndex);
  };

  const handleInputChange = React.useCallback((e) => {
    const { name, value, type, checked } = e.target;
    
    console.log('🔄 Input change:', { name, value, type, checked }); // Debug log
    
    // Handle nested object fields (guarantor, nextOfKin, spouse)
    if (name.includes('.')) {
      const [parentKey, childKey] = name.split('.');
      setFormData(prev => {
        const newData = {
          ...prev,
          [parentKey]: {
            ...prev[parentKey],
            [childKey]: type === 'checkbox' ? checked : value
          }
        };
        console.log('📝 Updated nested formData:', newData);
        return newData;
      });
    } else {
      setFormData(prev => {
        const newData = {
          ...prev,
          [name]: type === 'checkbox' ? checked : value
        };
        console.log('📝 Updated formData:', newData);
        return newData;
      });
    }

    // Clear error when user starts typing/changing input
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = {
          ...prev,
          [name]: ''
        };
        console.log('🧹 Cleared error for:', name);
        return newErrors;
      });
    }
  }, [errors]);

  // Handle photo file upload
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          passportPhoto: 'Please upload a valid image file (JPEG, PNG, or GIF)'
        }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          passportPhoto: 'File size must be less than 5MB'
        }));
        return;
      }

      // Clear any previous errors
      setErrors(prev => ({
        ...prev,
        passportPhoto: ''
      }));

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateCurrentStep()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Format the data for submission
      const clientData = {
        ...formData,
        fullName: `${formData.firstName} ${formData.givenName ? formData.givenName + ' ' : ''}${formData.lastName}`.trim(),
        createdAt: new Date().toISOString(),
        // Include photo file for backend processing
        passportPhoto: formData.passportPhotoFile,
        hasPhoto: !!formData.passportPhotoFile
      };

      await onSubmit(clientData);
      
      // Reset form after successful submission - just close the modal
      // The parent component will handle the reset when reopening
      setCurrentStep(0);
      setErrors({});
      
    } catch (error) {
      console.error('Error submitting form:', error);
      // Handle error (show notification, etc.)
    } finally {
      setIsSubmitting(false);
    }
  };

  // Profile Step Component
  const ProfileStep = React.memo(({ formData, handleInputChange, errors, removePhoto, handlePhotoUpload }) => {console.log('🔄 ProfileStep render', formData.firstName); return (
    <div className="step-content">
      <div className="form-group">
        <label htmlFor="firstName">First Name</label>
        <input
          key="firstName-input"
          type="text"
          id="firstName"
          name="firstName"
          value={formData.firstName || ''}
          onChange={handleInputChange}
          className={errors.firstName ? 'error' : ''}
          placeholder="Enter first name"
          autoComplete="given-name"
          required
        />
        {errors.firstName && <span className="error-message">{errors.firstName}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="givenName">Given Name (Middle Name)</label>
        <input
          key="givenName-input"
          type="text"
          id="givenName"
          name="givenName"
          value={formData.givenName || ''}
          onChange={handleInputChange}
          placeholder="Enter given/middle name (optional)"
          autoComplete="additional-name"
        />
      </div>

      <div className="form-group">
        <label htmlFor="lastName">Last Name</label>
        <input
          key="lastName-input"
          type="text"
          id="lastName"
          name="lastName"
          value={formData.lastName || ''}
          onChange={handleInputChange}
          className={errors.lastName ? 'error' : ''}
          placeholder="Enter last name"
          autoComplete="family-name"
          required
        />
        {errors.lastName && <span className="error-message">{errors.lastName}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="age">Age</label>
        <input
          key="age-input"
          type="number"
          id="age"
          name="age"
          value={formData.age || ''}
          onChange={handleInputChange}
          placeholder="Enter age"
          min="18"
          max="100"
          autoComplete="age"
        />
      </div>

      <div className="form-group">
        <label htmlFor="nationalIdNumber">National ID Number</label>
        <input
          key="nationalIdNumber-input"
          type="text"
          id="nationalIdNumber"
          name="nationalIdNumber"
          value={formData.nationalIdNumber || ''}
          onChange={handleInputChange}
          placeholder="Enter national ID number"
          autoComplete="off"
        />
      </div>

      <div className="form-group">
        <label htmlFor="contact">Contact Number</label>
        <input
          key="contact-input"
          type="tel"
          id="contact"
          name="contact"
          value={formData.contact || ''}
          onChange={handleInputChange}
          className={errors.contact ? 'error' : ''}
          placeholder="Enter phone number"
          autoComplete="tel"
          required
        />
        {errors.contact && <span className="error-message">{errors.contact}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="village">Village</label>
        <input
          type="text"
          id="village"
          name="village"
          value={formData.village || ''}
          onChange={handleInputChange}

          placeholder="Enter village"
          autoComplete="address-level4"
        />
      </div>

      <div className="form-group">
        <label htmlFor="parish">Parish</label>
        <input
          type="text"
          id="parish"
          name="parish"
          value={formData.parish || ''}
          onChange={handleInputChange}

          placeholder="Enter parish"
          autoComplete="address-level3"
        />
      </div>

      <div className="form-group">
        <label htmlFor="district">District</label>
        <input
          type="text"
          id="district"
          name="district"
          value={formData.district || ''}
          onChange={handleInputChange}

          placeholder="Enter district"
          autoComplete="address-level2"
        />
      </div>

      <div className="form-group">
        <label htmlFor="lengthOfStayValue">Length of Stay at Residence</label>
        <div className="compound-input">
          <input
            type="number"
            id="lengthOfStayValue"
            name="lengthOfStayValue"
            value={formData.lengthOfStayValue}
            onChange={handleInputChange}
            placeholder="Enter duration"
            min="0"
            style={{ width: '60%', marginRight: '8px' }}
          />
          <select
            name="lengthOfStayUnit"
            value={formData.lengthOfStayUnit}
            onChange={handleInputChange}
            style={{ width: '38%' }}
          >
            <option value="days">Day(s)</option>
            <option value="weeks">Week(s)</option>
            <option value="months">Month(s)</option>
            <option value="years">Year(s)</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="sourceOfIncome">Source of Income</label>
        <input
          type="text"
          id="sourceOfIncome"
          name="sourceOfIncome"
          value={formData.sourceOfIncome}
          onChange={handleInputChange}
          placeholder="Enter source of income"
        />
      </div>

      <div className="form-group">
        <label htmlFor="passportPhotoFile">Passport Photo</label>
        
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
        
        {errors.passportPhoto && (
          <span className="error-message">{errors.passportPhoto}</span>
        )}
      </div>
    </div>
  )});

  // Guarantor Step Component
  const GuarantorStep = React.memo(({ formData, handleInputChange, errors }) => {console.log('🔄 GuarantorStep render'); return (
    <div className="step-content">
      <div className="form-group">
        <label htmlFor="guarantor.firstName">Guarantor First Name</label>
        <input
          type="text"
          id="guarantor.firstName"
          name="guarantor.firstName"
          value={formData.guarantor.firstName}
          onChange={handleInputChange}
          className={errors.guarantorFirstName ? 'error' : ''}
          placeholder="Enter guarantor first name"
          required
        />
        {errors.guarantorFirstName && <span className="error-message">{errors.guarantorFirstName}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="guarantor.givenName">Guarantor Given Name</label>
        <input
          type="text"
          id="guarantor.givenName"
          name="guarantor.givenName"
          value={formData.guarantor.givenName}
          onChange={handleInputChange}
          placeholder="Enter guarantor given/middle name (optional)"
        />
      </div>

      <div className="form-group">
        <label htmlFor="guarantor.lastName">Guarantor Last Name</label>
        <input
          type="text"
          id="guarantor.lastName"
          name="guarantor.lastName"
          value={formData.guarantor.lastName}
          onChange={handleInputChange}
          className={errors.guarantorLastName ? 'error' : ''}
          placeholder="Enter guarantor last name"
          required
        />
        {errors.guarantorLastName && <span className="error-message">{errors.guarantorLastName}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="guarantor.age">Guarantor Age</label>
        <input
          type="number"
          id="guarantor.age"
          name="guarantor.age"
          value={formData.guarantor.age}
          onChange={handleInputChange}
          placeholder="Enter guarantor age"
          min="18"
        />
      </div>

      <div className="form-group">
        <label htmlFor="guarantor.contact">Guarantor Contact</label>
        <input
          type="tel"
          id="guarantor.contact"
          name="guarantor.contact"
          value={formData.guarantor.contact}
          onChange={handleInputChange}
          className={errors.guarantorContact ? 'error' : ''}
          placeholder="Enter guarantor contact number"
          required
        />
        {errors.guarantorContact && <span className="error-message">{errors.guarantorContact}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="guarantor.nationalId">Guarantor National ID</label>
        <input
          type="text"
          id="guarantor.nationalId"
          name="guarantor.nationalId"
          value={formData.guarantor.nationalId}
          onChange={handleInputChange}
          placeholder="Enter guarantor national ID"
        />
      </div>

      <div className="form-group">
        <label htmlFor="guarantor.village">Guarantor Village</label>
        <input
          type="text"
          id="guarantor.village"
          name="guarantor.village"
          value={formData.guarantor.village}
          onChange={handleInputChange}
          placeholder="Enter guarantor village"
        />
      </div>

      <div className="form-group">
        <label htmlFor="guarantor.parish">Guarantor Parish</label>
        <input
          type="text"
          id="guarantor.parish"
          name="guarantor.parish"
          value={formData.guarantor.parish}
          onChange={handleInputChange}
          placeholder="Enter guarantor parish"
        />
      </div>

      <div className="form-group">
        <label htmlFor="guarantor.district">Guarantor District</label>
        <input
          type="text"
          id="guarantor.district"
          name="guarantor.district"
          value={formData.guarantor.district}
          onChange={handleInputChange}
          placeholder="Enter guarantor district"
        />
      </div>

      <div className="form-group">
        <label htmlFor="guarantorIncomeSource">Guarantor Source of Income</label>
        <input
          type="text"
          id="guarantorIncomeSource"
          name="guarantorIncomeSource"
          value={formData.guarantorIncomeSource}
          onChange={handleInputChange}
          placeholder="Enter guarantor source of income"
        />
      </div>
    </div>
  )});

  // Next of Kin Step Component
  const NextOfKinStep = React.memo(({ formData, handleInputChange, errors }) => {console.log('🔄 NextOfKinStep render'); return (
    <div className="step-content">
      <div className="form-group">
        <label htmlFor="nextOfKin.firstName">Next of Kin First Name</label>
        <input
          type="text"
          id="nextOfKin.firstName"
          name="nextOfKin.firstName"
          value={formData.nextOfKin.firstName}
          onChange={handleInputChange}
          className={errors.nextOfKinFirstName ? 'error' : ''}
          placeholder="Enter next of kin first name"
          required
        />
        {errors.nextOfKinFirstName && <span className="error-message">{errors.nextOfKinFirstName}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="nextOfKin.givenName">Next of Kin Given Name</label>
        <input
          type="text"
          id="nextOfKin.givenName"
          name="nextOfKin.givenName"
          value={formData.nextOfKin.givenName}
          onChange={handleInputChange}
          placeholder="Enter next of kin given/middle name (optional)"
        />
      </div>

      <div className="form-group">
        <label htmlFor="nextOfKin.lastName">Next of Kin Last Name</label>
        <input
          type="text"
          id="nextOfKin.lastName"
          name="nextOfKin.lastName"
          value={formData.nextOfKin.lastName}
          onChange={handleInputChange}
          placeholder="Enter next of kin last name"
        />
      </div>

      <div className="form-group">
        <label htmlFor="nextOfKin.age">Next of Kin Age</label>
        <input
          type="number"
          id="nextOfKin.age"
          name="nextOfKin.age"
          value={formData.nextOfKin.age}
          onChange={handleInputChange}
          placeholder="Enter next of kin age"
          min="0"
        />
      </div>

      <div className="form-group">
        <label htmlFor="nextOfKin.contact">Next of Kin Contact</label>
        <input
          type="tel"
          id="nextOfKin.contact"
          name="nextOfKin.contact"
          value={formData.nextOfKin.contact}
          onChange={handleInputChange}
          className={errors.nextOfKinContact ? 'error' : ''}
          placeholder="Enter next of kin contact number"
          required
        />
        {errors.nextOfKinContact && <span className="error-message">{errors.nextOfKinContact}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="nextOfKin.nationalId">Next of Kin National ID</label>
        <input
          type="text"
          id="nextOfKin.nationalId"
          name="nextOfKin.nationalId"
          value={formData.nextOfKin.nationalId}
          onChange={handleInputChange}
          placeholder="Enter next of kin national ID"
        />
      </div>

      <div className="form-group">
        <label htmlFor="nextOfKin.village">Next of Kin Village</label>
        <input
          type="text"
          id="nextOfKin.village"
          name="nextOfKin.village"
          value={formData.nextOfKin.village}
          onChange={handleInputChange}
          placeholder="Enter next of kin village"
        />
      </div>

      <div className="form-group">
        <label htmlFor="nextOfKin.parish">Next of Kin Parish</label>
        <input
          type="text"
          id="nextOfKin.parish"
          name="nextOfKin.parish"
          value={formData.nextOfKin.parish}
          onChange={handleInputChange}
          placeholder="Enter next of kin parish"
        />
      </div>

      <div className="form-group">
        <label htmlFor="nextOfKin.district">Next of Kin District</label>
        <input
          type="text"
          id="nextOfKin.district"
          name="nextOfKin.district"
          value={formData.nextOfKin.district}
          onChange={handleInputChange}
          placeholder="Enter next of kin district"
        />
      </div>
    </div>
  )});

  // Spouse Step Component
  const SpouseStep = React.memo(({ formData, handleInputChange, errors }) => {console.log('🔄 SpouseStep render'); return (
    <div className="step-content">
      {/* Marital Status Selection */}
      <div className="form-group">
        <label htmlFor="maritalStatus">Marital Status</label>
        <select
          id="maritalStatus"
          name="maritalStatus"
          value={formData.maritalStatus}
          onChange={handleInputChange}
          className="form-input"
        >
          <option value="single">Single</option>
          <option value="married">Married</option>
          <option value="divorced">Divorced</option>
          <option value="widowed">Widowed</option>
        </select>
      </div>

      {/* Show spouse fields only if married */}
      {formData.maritalStatus === 'married' && (
        <div className="spouse-details">
          <h3 style={{ 
            marginTop: '24px', 
            marginBottom: '16px', 
            color: '#374151', 
            fontSize: '16px',
            fontWeight: '600'
          }}>Spouse Information</h3>
          
          <div className="form-group">
            <label htmlFor="spouse.firstName">Spouse First Name</label>
            <input
              type="text"
              id="spouse.firstName"
              name="spouse.firstName"
              value={formData.spouse.firstName}
              onChange={handleInputChange}
              className={errors.spouseFirstName ? 'error' : ''}
              placeholder="Enter spouse first name"
              required
            />
            {errors.spouseFirstName && (
              <span className="error-message">{errors.spouseFirstName}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="spouse.givenName">Spouse Given Name (Optional)</label>
            <input
              type="text"
              id="spouse.givenName"
              name="spouse.givenName"
              value={formData.spouse.givenName}
              onChange={handleInputChange}
              placeholder="Enter spouse given/middle name (optional)"
            />
          </div>

          <div className="form-group">
            <label htmlFor="spouse.lastName">Spouse Last Name</label>
            <input
              type="text"
              id="spouse.lastName"
              name="spouse.lastName"
              value={formData.spouse.lastName}
              onChange={handleInputChange}
              className={errors.spouseLastName ? 'error' : ''}
              placeholder="Enter spouse last name"
              required
            />
            {errors.spouseLastName && (
              <span className="error-message">{errors.spouseLastName}</span>
            )}
          </div>
        </div>
      )}

      {/* Information message for non-married status - Glass floating window */}
      {formData.maritalStatus !== 'married' && (
        <div className={`marital-status-floating-notice ${formData.maritalStatus}`}>
          <div className="notice-icon">
            {formData.maritalStatus === 'single' && '👤'}
            {formData.maritalStatus === 'divorced' && '🔄'}
            {formData.maritalStatus === 'widowed' && '🕊'}
          </div>
          <div className="notice-text">
            {formData.maritalStatus === 'single' && 'No spouse information needed for single status.'}
            {formData.maritalStatus === 'divorced' && 'No current spouse information needed.'}
            {formData.maritalStatus === 'widowed' && 'No current spouse information needed.'}
          </div>
          <div className="notice-checkmark">✓</div>
        </div>
      )}
    </div>
  )});

  // Employment Step Component
  const EmploymentStep = React.memo(({ formData, handleInputChange, errors }) => {console.log('🔄 EmploymentStep render'); return (
    <div className="step-content">
      <div className="employment-header">
        <h2 className="section-title">Employment Information</h2>
        <p className="section-subtitle">Please provide details about the client's current employment and income</p>
      </div>

      {/* Employment Status Section */}
      <div className="employment-section">
        <h3 className="subsection-title">
          <span className="icon">💼</span>
          Employment Status
        </h3>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="employmentStatus">Employment Status <span className="required">*</span></label>
            <select
              id="employmentStatus"
              name="employmentStatus"
              value={formData.employmentStatus}
              onChange={handleInputChange}
              className={`form-input ${errors.employmentStatus ? 'error' : ''}`}
              required
            >
              <option value="">Select employment status</option>
              <option value="employed">Employed</option>
              <option value="self-employed">Self-Employed</option>
              <option value="business-owner">Business Owner</option>
              <option value="farmer">Farmer</option>
              <option value="unemployed">Unemployed</option>
              <option value="retired">Retired</option>
              <option value="student">Student</option>
              <option value="other">Other</option>
            </select>
            {errors.employmentStatus && <span className="error-message">{errors.employmentStatus}</span>}
          </div>
        </div>
      </div>

      {/* Employment Details - Show only if employed, self-employed, business owner, or farmer */}
      {['employed', 'self-employed', 'business-owner', 'farmer', 'other'].includes(formData.employmentStatus) && (
        <>
          {/* Employer/Business Information */}
          <div className="employment-section">
            <h3 className="subsection-title">
              <span className="icon">🏢</span>
              {formData.employmentStatus === 'self-employed' || formData.employmentStatus === 'business-owner' 
                ? 'Business Information' 
                : formData.employmentStatus === 'farmer'
                ? 'Farming Details'
                : 'Employer Information'}
            </h3>
            
            <div className="form-row">
              <div className="form-group flex-2">
                <label htmlFor="employerName">
                  {formData.employmentStatus === 'self-employed' || formData.employmentStatus === 'business-owner' 
                    ? 'Business Name' 
                    : formData.employmentStatus === 'farmer'
                    ? 'Farm/Agricultural Business Name'
                    : 'Employer Name'} <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="employerName"
                  name="employerName"
                  value={formData.employerName}
                  onChange={handleInputChange}
                  className={errors.employerName ? 'error' : ''}
                  placeholder={
                    formData.employmentStatus === 'self-employed' || formData.employmentStatus === 'business-owner' 
                      ? 'Enter your business name' 
                      : formData.employmentStatus === 'farmer'
                      ? 'Enter farm or agricultural business name'
                      : 'Enter employer name'
                  }
                  required
                />
                {errors.employerName && <span className="error-message">{errors.employerName}</span>}
              </div>
              
              <div className="form-group flex-1">
                <label htmlFor="industry">Industry/Sector</label>
                <select
                  id="industry"
                  name="industry"
                  value={formData.industry}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="">Select industry</option>
                  <option value="agriculture">Agriculture & Farming</option>
                  <option value="retail">Retail & Trade</option>
                  <option value="manufacturing">Manufacturing</option>
                  <option value="construction">Construction</option>
                  <option value="education">Education</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="transport">Transportation</option>
                  <option value="hospitality">Hospitality & Tourism</option>
                  <option value="finance">Banking & Finance</option>
                  <option value="government">Government</option>
                  <option value="NGO">Non-Governmental Organization</option>
                  <option value="technology">Technology</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group flex-2">
                <label htmlFor="position">
                  {formData.employmentStatus === 'self-employed' || formData.employmentStatus === 'business-owner' 
                    ? 'Role/Business Type' 
                    : formData.employmentStatus === 'farmer'
                    ? 'Type of Farming'
                    : 'Position/Job Title'} <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="position"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  className={errors.position ? 'error' : ''}
                  placeholder={
                    formData.employmentStatus === 'self-employed' || formData.employmentStatus === 'business-owner' 
                      ? 'e.g., Shop Owner, Contractor, Consultant' 
                      : formData.employmentStatus === 'farmer'
                      ? 'e.g., Crop Farming, Livestock, Mixed Farming'
                      : 'Enter your position or job title'
                  }
                  required
                />
                {errors.position && <span className="error-message">{errors.position}</span>}
              </div>
              
              <div className="form-group flex-1">
                <label htmlFor="employmentLength">
                  {formData.employmentStatus === 'self-employed' || formData.employmentStatus === 'business-owner' 
                    ? 'Years in Business' 
                    : formData.employmentStatus === 'farmer'
                    ? 'Years Farming'
                    : 'Years at Current Job'}
                </label>
                <div className="length-input-group">
                  <input
                    type="number"
                    id="employmentLengthValue"
                    name="employmentLengthValue"
                    value={formData.employmentLengthValue}
                    onChange={handleInputChange}
                    className="length-value-input"
                    placeholder="0"
                    min="0"
                    max="50"
                  />
                  <select
                    id="employmentLengthUnit"
                    name="employmentLengthUnit"
                    value={formData.employmentLengthUnit}
                    onChange={handleInputChange}
                    className="length-unit-select"
                  >
                    <option value="months">Month(s)</option>
                    <option value="years">Year(s)</option>
                  </select>
                </div>
              </div>
            </div>

            {formData.employmentStatus === 'employed' && (
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="employerAddress">Employer Address</label>
                  <textarea
                    id="employerAddress"
                    name="employerAddress"
                    value={formData.employerAddress}
                    onChange={handleInputChange}
                    rows="2"
                    placeholder="Enter employer's physical address"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Income Information */}
          <div className="employment-section">
            <h3 className="subsection-title">
              <span className="icon">💰</span>
              Income Information
            </h3>
            
            <div className="form-row">
              <div className="form-group flex-1">
                <label htmlFor="monthlyIncome">Monthly Income (UGX) <span className="required">*</span></label>
                <div className="currency-input-group">
                  <span className="currency-symbol">UGX</span>
                  <input
                    type="number"
                    id="monthlyIncome"
                    name="monthlyIncome"
                    value={formData.monthlyIncome}
                    onChange={handleInputChange}
                    className={`currency-input ${errors.monthlyIncome ? 'error' : ''}`}
                    placeholder="0"
                    min="0"
                    step="1000"
                    required
                  />
                </div>
                {errors.monthlyIncome && <span className="error-message">{errors.monthlyIncome}</span>}
              </div>
              
              <div className="form-group flex-1">
                <label htmlFor="incomeFrequency">Payment Frequency</label>
                <select
                  id="incomeFrequency"
                  name="incomeFrequency"
                  value={formData.incomeFrequency}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                  <option value="bi-weekly">Bi-weekly</option>
                  <option value="daily">Daily</option>
                  <option value="seasonal">Seasonal</option>
                  <option value="irregular">Irregular</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="additionalIncome">Additional Income Sources (Optional)</label>
                <textarea
                  id="additionalIncome"
                  name="additionalIncome"
                  value={formData.additionalIncome}
                  onChange={handleInputChange}
                  rows="2"
                  placeholder="Describe any other sources of income (e.g., rental income, side business, remittances)"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="incomeVerification">Income Verification</label>
                <select
                  id="incomeVerification"
                  name="incomeVerification"
                  value={formData.incomeVerification}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="">Select verification method</option>
                  <option value="payslip">Pay Slip/Salary Statement</option>
                  <option value="bank-statement">Bank Statements</option>
                  <option value="employer-letter">Employer Letter</option>
                  <option value="business-records">Business Records</option>
                  <option value="tax-returns">Tax Returns</option>
                  <option value="self-declaration">Self Declaration</option>
                  <option value="witness-verification">Witness Verification</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Unemployed/Student Information */}
      {['unemployed', 'student', 'retired'].includes(formData.employmentStatus) && (
        <div className="employment-section">
          <h3 className="subsection-title">
            <span className="icon">ℹ️</span>
            Additional Information
          </h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="unemploymentReason">
                {formData.employmentStatus === 'unemployed' ? 'Reason for Unemployment' :
                 formData.employmentStatus === 'student' ? 'Institution/Course Information' :
                 'Retirement Information'}
              </label>
              <textarea
                id="unemploymentReason"
                name="unemploymentReason"
                value={formData.unemploymentReason}
                onChange={handleInputChange}
                rows="3"
                placeholder={
                  formData.employmentStatus === 'unemployed' ? 'Please explain the reason for unemployment and any job-seeking activities' :
                  formData.employmentStatus === 'student' ? 'Please provide details about current studies, institution name, and expected graduation' :
                  'Please provide details about retirement and any pension or savings'
                }
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="supportSource">Source of Financial Support</label>
              <select
                id="supportSource"
                name="supportSource"
                value={formData.supportSource}
                onChange={handleInputChange}
                className="form-input"
              >
                <option value="">Select support source</option>
                <option value="family">Family Support</option>
                <option value="savings">Personal Savings</option>
                <option value="pension">Pension/Retirement Benefits</option>
                <option value="social-benefits">Social Benefits/Welfare</option>
                <option value="spouse-income">Spouse's Income</option>
                <option value="business-income">Small Business/Trading</option>
                <option value="remittances">Money from Abroad</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          
          {formData.supportSource === 'other' && (
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="otherSupportDetails">Other Support Details</label>
                <input
                  type="text"
                  id="otherSupportDetails"
                  name="otherSupportDetails"
                  value={formData.otherSupportDetails}
                  onChange={handleInputChange}
                  placeholder="Please specify other sources of financial support"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Employment Notes */}
      <div className="employment-section">
        <h3 className="subsection-title">
          <span className="icon">📝</span>
          Additional Notes
        </h3>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="employmentNotes">Employment Notes (Optional)</label>
            <textarea
              id="employmentNotes"
              name="employmentNotes"
              value={formData.employmentNotes}
              onChange={handleInputChange}
              rows="3"
              placeholder="Any additional information about employment, career plans, or special circumstances..."
            />
          </div>
        </div>
      </div>
    </div>
  )});

  // Documents Step Component
  const DocumentsStep = React.memo(({ formData, handleInputChange, errors }) => {console.log('🔄 DocumentsStep render'); return (
    <div className="step-content">
      <div className="form-group">
        <h3>Agreement Forms</h3>
        <p>Please confirm that the client has signed the required agreement forms.</p>
        
        <div className="checkbox-group">
          <label className={`checkbox-label ${errors.agreementSigned ? 'error' : ''}`}>
            <input
              type="checkbox"
              name="agreementSigned"
              checked={formData.agreementSigned || false}
              onChange={handleInputChange}
            />
            <span className="checkbox-text">
              Yes, the client has signed all required agreement forms
            </span>
          </label>
          {errors.agreementSigned && (
            <span className="error-message">
              {errors.agreementSigned}
            </span>
          )}
        </div>
        
        {formData.agreementSigned === false && (
          <div className="warning-message">
            <p>⚠️ The client must sign all agreement forms before proceeding.</p>
          </div>
        )}
        
        <div className="form-group">
          <label htmlFor="agreementNotes">Additional Notes (Optional)</label>
          <textarea
            id="agreementNotes"
            name="agreementNotes"
            value={formData.agreementNotes || ''}
            onChange={handleInputChange}
            rows="3"
            placeholder="Enter any additional notes about the agreement or documentation..."
          />
        </div>
      </div>
    </div>
  )});

  const renderStepContent = () => {
    const stepProps = {
      formData,
      handleInputChange,
      errors,
      removePhoto,      // for photo handling
      handlePhotoUpload, // for photo upload
      setFormData,      // for direct state updates if needed
      setErrors         // for direct error updates if needed
    };
    
    switch (currentStep) {
      case 0:
        return <ProfileStep key="profile-step" {...stepProps} />;
      case 1:
        return <GuarantorStep key="guarantor-step" {...stepProps} />;
      case 2:
        return <NextOfKinStep key="nextofkin-step" {...stepProps} />;
      case 3:
        return <SpouseStep key="spouse-step" {...stepProps} />;
      case 4:
        return <EmploymentStep key="employment-step" {...stepProps} />;
      case 5:
        return <DocumentsStep key="documents-step" {...stepProps} />;
      default:
        return <ProfileStep key="profile-step-default" {...stepProps} />;
    }
  };

  // Skip modal checks when in page mode
  if (!isPageMode && !isOpen) return null;

  const formContent = (
    <>
      {/* Navigation tabs */}
      <div className="form-tabs">
        {steps.map((step, index) => (
          <button
            key={step.id}
            type="button"
            className={`tab-button ${
              index === currentStep ? 'active' : ''
            } ${
              index < currentStep ? 'completed' : ''
            }`}
            onClick={() => goToStep(index)}
          >
            {step.label}
          </button>
        ))}
      </div>

      {/* Form content */}
      <form onSubmit={handleSubmit} className="multi-step-form">
        <div className="form-content" key={`step-${currentStep}`}>
          {renderStepContent()}
        </div>

        {/* Navigation buttons */}
        <div className="form-navigation">
          <div className="nav-left">
            {currentStep > 0 && (
              <button
                type="button"
                className="nav-button prev-button"
                onClick={prevStep}
              >
                <ArrowLeft size={16} />
                Previous
              </button>
            )}
          </div>

          <div className="nav-right">
            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                className="nav-button next-button"
                onClick={nextStep}
              >
                Next
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                type="submit"
                className="nav-button submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save & Continue'}
              </button>
            )}
          </div>
        </div>
      </form>
    </>
  );

  // Render as page content (no modal wrapper)
  if (isPageMode) {
    return (
      <div className="add-client-page-form">
        {formContent}
      </div>
    );
  }

  // Render as modal (original behavior)
  return (
    <div className="add-client-overlay">
      <div className="add-client-form-container">
        {/* Header with navigation tabs */}
        <div className="form-header">
          <div className="header-left">
            <h1>Add New Client</h1>
          </div>
          <div className="header-right">
            <button 
              type="button" 
              className="close-button"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {formContent}
      </div>
    </div>
  );
};

export default AddClientForm;
