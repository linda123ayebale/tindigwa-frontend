import React, { useState, useEffect } from 'react';
import { X, ArrowLeft, ArrowRight } from 'lucide-react';
import './AddClientForm.css'; // Reusing the same styles

const EditClientForm = ({ client, onSubmit, onCancel, isOpen }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    // Profile fields
    surname: '',
    givenName: '',
    age: '',
    nationalIdNumber: '',
    village: '',
    parish: '',
    district: '',
    lengthOfStay: '',
    sourceOfIncome: '',
    passportPhotoUrl: '',
    phoneNumber: '',
    
    // Spouse fields
    spouseName: '',
    spouseId: '',
    
    // Guarantor fields
    guarantorName: '',
    guarantorAge: '',
    guarantorContact: '',
    guarantorNationalId: '',
    guarantorVillage: '',
    guarantorParish: '',
    guarantorDistrict: '',
    guarantorSourceOfIncome: '',
    
    // Employment fields
    employerName: '',
    position: '',
    monthlyIncome: '',
    employmentLength: '',
    
    // Documents
    documents: [],
    agreementSigned: false,
    agreementNotes: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps = [
    { id: 'profile', label: 'Profile', active: currentStep === 0 },
    { id: 'guarantor', label: 'Guarantor', active: currentStep === 1 },
    { id: 'spouse', label: 'Spouse', active: currentStep === 2 },
    { id: 'employment', label: 'Employment', active: currentStep === 3 },
    { id: 'documents', label: 'Documents', active: currentStep === 4 }
  ];

  // Populate form with client data when client changes
  useEffect(() => {
    console.log('EditClientForm useEffect triggered:', { client });
    // Only populate form data when a different client is selected
    if (client) {
      console.log('Client data being used to populate form:', client);
      const newFormData = {
        surname: client.surname || '',
        givenName: client.givenName || '',
        age: client.age || '',
        nationalIdNumber: client.nationalIdNumber || '',
        village: client.village || '',
        parish: client.parish || '',
        district: client.district || '',
        lengthOfStay: client.lengthOfStay || '',
        sourceOfIncome: client.sourceOfIncome || '',
        passportPhotoUrl: client.passportPhotoUrl || '',
        phoneNumber: client.phoneNumber || '',
        spouseName: client.spouseName || '',
        spouseId: client.spouseId || '',
        guarantorName: client.guarantorName || '',
        guarantorAge: client.guarantorAge || '',
        guarantorContact: client.guarantorContact || '',
        guarantorNationalId: client.guarantorNationalId || '',
        guarantorVillage: client.guarantorVillage || '',
        guarantorParish: client.guarantorParish || '',
        guarantorDistrict: client.guarantorDistrict || '',
        guarantorSourceOfIncome: client.guarantorSourceOfIncome || '',
        employerName: client.employerName || '',
        position: client.position || '',
        monthlyIncome: client.monthlyIncome || '',
        employmentLength: client.employmentLength || '',
        documents: client.documents || [],
        agreementSigned: client.agreementSigned || false,
        agreementNotes: client.agreementNotes || ''
      };
      console.log('Setting form data to:', newFormData);
      setFormData(newFormData);
      // Reset to first step when opening
      setCurrentStep(0);
      setErrors({});
    }
  }, [client?.id]); // Only depend on client.id - form will populate when a new client is selected

  const validateCurrentStep = () => {
    const newErrors = {};

    switch (currentStep) {
      case 0: // Profile
        if (!formData.surname.trim()) {
          newErrors.surname = 'Surname is required';
        }
        if (!formData.givenName.trim()) {
          newErrors.givenName = 'Given name is required';
        }
        if (!formData.phoneNumber.trim()) {
          newErrors.phoneNumber = 'Phone number is required';
        }
        break;
      case 1: // Guarantor
        if (!formData.guarantorName.trim()) {
          newErrors.guarantorName = 'Guarantor name is required';
        }
        if (!formData.guarantorContact.trim()) {
          newErrors.guarantorContact = 'Guarantor contact is required';
        }
        break;
      case 4: // Documents
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
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
      const updatedClientData = {
        ...client, // Keep original client data (id, createdAt, etc.)
        ...formData,
        fullName: `${formData.givenName} ${formData.surname}`,
        updatedAt: new Date().toISOString(),
      };

      await onSubmit(updatedClientData);
      
    } catch (error) {
      console.error('Error updating client:', error);
      // Handle error (show notification, etc.)
    } finally {
      setIsSubmitting(false);
    }
  };

  // Profile Step Component
  const ProfileStep = () => (
    <div className="step-content">
      <div className="form-group">
        <label htmlFor="surname">Surname</label>
        <input
          type="text"
          id="surname"
          name="surname"
          value={formData.surname}
          onChange={handleInputChange}
          className={errors.surname ? 'error' : ''}
          placeholder="Enter surname"
        />
        {errors.surname && <span className="error-message">{errors.surname}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="givenName">Given Name</label>
        <input
          type="text"
          id="givenName"
          name="givenName"
          value={formData.givenName}
          onChange={handleInputChange}
          className={errors.givenName ? 'error' : ''}
          placeholder="Enter given name"
        />
        {errors.givenName && <span className="error-message">{errors.givenName}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="age">Age</label>
        <input
          type="number"
          id="age"
          name="age"
          value={formData.age}
          onChange={handleInputChange}
          placeholder="Enter age"
        />
      </div>

      <div className="form-group">
        <label htmlFor="nationalIdNumber">National ID Number</label>
        <input
          type="text"
          id="nationalIdNumber"
          name="nationalIdNumber"
          value={formData.nationalIdNumber}
          onChange={handleInputChange}
          placeholder="Enter national ID number"
        />
      </div>

      <div className="form-group">
        <label htmlFor="village">Village</label>
        <input
          type="text"
          id="village"
          name="village"
          value={formData.village}
          onChange={handleInputChange}
          placeholder="Enter village"
        />
      </div>

      <div className="form-group">
        <label htmlFor="parish">Parish</label>
        <input
          type="text"
          id="parish"
          name="parish"
          value={formData.parish}
          onChange={handleInputChange}
          placeholder="Enter parish"
        />
      </div>

      <div className="form-group">
        <label htmlFor="district">District</label>
        <input
          type="text"
          id="district"
          name="district"
          value={formData.district}
          onChange={handleInputChange}
          placeholder="Enter district"
        />
      </div>

      <div className="form-group">
        <label htmlFor="lengthOfStay">Length of Stay at Residence</label>
        <input
          type="text"
          id="lengthOfStay"
          name="lengthOfStay"
          value={formData.lengthOfStay}
          onChange={handleInputChange}
          placeholder="Enter length of stay"
        />
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
        <label htmlFor="passportPhotoUrl">Passport Photo URL</label>
        <input
          type="url"
          id="passportPhotoUrl"
          name="passportPhotoUrl"
          value={formData.passportPhotoUrl}
          onChange={handleInputChange}
          placeholder="Enter passport photo URL"
        />
      </div>

      <div className="form-group">
        <label htmlFor="phoneNumber">Phone Number</label>
        <input
          type="tel"
          id="phoneNumber"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleInputChange}
          className={errors.phoneNumber ? 'error' : ''}
          placeholder="Enter phone number"
        />
        {errors.phoneNumber && <span className="error-message">{errors.phoneNumber}</span>}
      </div>
    </div>
  );

  // Guarantor Step Component
  const GuarantorStep = () => (
    <div className="step-content">
      <div className="form-group">
        <label htmlFor="guarantorName">Guarantor Name</label>
        <input
          type="text"
          id="guarantorName"
          name="guarantorName"
          value={formData.guarantorName}
          onChange={handleInputChange}
          className={errors.guarantorName ? 'error' : ''}
          placeholder="Enter guarantor name"
        />
        {errors.guarantorName && <span className="error-message">{errors.guarantorName}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="guarantorAge">Guarantor Age</label>
        <input
          type="number"
          id="guarantorAge"
          name="guarantorAge"
          value={formData.guarantorAge}
          onChange={handleInputChange}
          placeholder="Enter guarantor age"
        />
      </div>

      <div className="form-group">
        <label htmlFor="guarantorContact">Guarantor Contact</label>
        <input
          type="text"
          id="guarantorContact"
          name="guarantorContact"
          value={formData.guarantorContact}
          onChange={handleInputChange}
          className={errors.guarantorContact ? 'error' : ''}
          placeholder="Enter guarantor contact"
        />
        {errors.guarantorContact && <span className="error-message">{errors.guarantorContact}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="guarantorNationalId">Guarantor National ID</label>
        <input
          type="text"
          id="guarantorNationalId"
          name="guarantorNationalId"
          value={formData.guarantorNationalId}
          onChange={handleInputChange}
          placeholder="Enter guarantor national ID"
        />
      </div>

      <div className="form-group">
        <label htmlFor="guarantorVillage">Guarantor Village</label>
        <input
          type="text"
          id="guarantorVillage"
          name="guarantorVillage"
          value={formData.guarantorVillage}
          onChange={handleInputChange}
          placeholder="Enter guarantor village"
        />
      </div>

      <div className="form-group">
        <label htmlFor="guarantorParish">Guarantor Parish</label>
        <input
          type="text"
          id="guarantorParish"
          name="guarantorParish"
          value={formData.guarantorParish}
          onChange={handleInputChange}
          placeholder="Enter guarantor parish"
        />
      </div>

      <div className="form-group">
        <label htmlFor="guarantorDistrict">Guarantor District</label>
        <input
          type="text"
          id="guarantorDistrict"
          name="guarantorDistrict"
          value={formData.guarantorDistrict}
          onChange={handleInputChange}
          placeholder="Enter guarantor district"
        />
      </div>

      <div className="form-group">
        <label htmlFor="guarantorSourceOfIncome">Guarantor Source of Income</label>
        <input
          type="text"
          id="guarantorSourceOfIncome"
          name="guarantorSourceOfIncome"
          value={formData.guarantorSourceOfIncome}
          onChange={handleInputChange}
          placeholder="Enter guarantor source of income"
        />
      </div>
    </div>
  );

  // Spouse Step Component
  const SpouseStep = () => (
    <div className="step-content">
      <div className="form-group">
        <label htmlFor="spouseName">Spouse Name</label>
        <input
          type="text"
          id="spouseName"
          name="spouseName"
          value={formData.spouseName}
          onChange={handleInputChange}
          placeholder="Enter spouse name"
        />
      </div>

      <div className="form-group">
        <label htmlFor="spouseId">Spouse ID</label>
        <input
          type="text"
          id="spouseId"
          name="spouseId"
          value={formData.spouseId}
          onChange={handleInputChange}
          placeholder="Enter spouse ID"
        />
      </div>
    </div>
  );

  // Employment Step Component
  const EmploymentStep = () => (
    <div className="step-content">
      <div className="form-group">
        <label htmlFor="employerName">Employer Name</label>
        <input
          type="text"
          id="employerName"
          name="employerName"
          value={formData.employerName}
          onChange={handleInputChange}
          placeholder="Enter employer name"
        />
      </div>

      <div className="form-group">
        <label htmlFor="position">Position</label>
        <input
          type="text"
          id="position"
          name="position"
          value={formData.position}
          onChange={handleInputChange}
          placeholder="Enter position"
        />
      </div>

      <div className="form-group">
        <label htmlFor="monthlyIncome">Monthly Income</label>
        <input
          type="number"
          id="monthlyIncome"
          name="monthlyIncome"
          value={formData.monthlyIncome}
          onChange={handleInputChange}
          placeholder="Enter monthly income"
        />
      </div>

      <div className="form-group">
        <label htmlFor="employmentLength">Employment Length</label>
        <input
          type="text"
          id="employmentLength"
          name="employmentLength"
          value={formData.employmentLength}
          onChange={handleInputChange}
          placeholder="Enter employment length"
        />
      </div>
    </div>
  );

  // Documents Step Component
  const DocumentsStep = () => (
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
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  agreementSigned: e.target.checked
                }));
                // Clear error when checkbox is checked
                if (e.target.checked && errors.agreementSigned) {
                  setErrors(prev => ({
                    ...prev,
                    agreementSigned: ''
                  }));
                }
              }}
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
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <ProfileStep />;
      case 1:
        return <GuarantorStep />;
      case 2:
        return <SpouseStep />;
      case 3:
        return <EmploymentStep />;
      case 4:
        return <DocumentsStep />;
      default:
        return <ProfileStep />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="add-client-overlay">
      <div className="add-client-form-container">
        {/* Header with navigation tabs */}
        <div className="form-header">
          <div className="header-left">
            <h1>Edit Client - {client?.fullName}</h1>
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
          <div className="form-content">
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
                  {isSubmitting ? 'Updating...' : 'Update Client'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditClientForm;
