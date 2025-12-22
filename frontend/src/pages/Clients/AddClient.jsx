import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import ClientService from '../../services/clientService';
import Stepper from '../../components/Stepper/Stepper';
import BasicInfoStep from '../../components/ClientSteps/BasicInfoStep';
import ContactAddressStep from '../../components/ClientSteps/ContactAddressStep';
import GuarantorStep from '../../components/ClientSteps/GuarantorStep';
import EmploymentStep from '../../components/ClientSteps/EmploymentStep';
import DocumentsReviewStep from '../../components/ClientSteps/DocumentsReviewStep';
import NotificationModal from '../../components/NotificationModal';
import { useNotification } from '../../hooks/useNotification';
import { validatePhoneNumber, validateEmail } from '../../utils/validation';
import './AddClient.css';
import Sidebar from '../../components/Layout/Sidebar';


const AddClient = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { notification, showSuccess, showError, hideNotification } = useNotification();
  
  const [formData, setFormData] = useState({
    // Basic Information
    firstName: '',
    middleName: '',
    lastName: '',
    gender: '',
    age: '',
    nationalId: '',
    phoneNumber: '',
    email: '',
    maritalStatus: '',
    spouseName: '',
    spousePhone: '',
    
    // Photo Information
    passportPhotoFile: null,
    passportPhotoPreview: '',
    
    // Address Information
    village: '',
    parish: '',
    district: '',
    
    // Guarantor Information
    guarantorFirstName: '',
    guarantorLastName: '',
    guarantorGender: '',
    guarantorPhone: '',
    guarantorRelationship: '',
    
    // Employment Information
    employmentStatus: '',
    occupation: '',
    monthlyIncome: '',
    
    // Agreement
    agreementSigned: false
  });

  const steps = [
    { title: 'Basic Information', description: 'Personal details' },
    { title: 'Contact & Address', description: 'Location information' },
    { title: 'Guarantor', description: 'Guarantor information' },
    { title: 'Employment', description: 'Work & income' },
    { title: 'Review & Submit', description: 'Documents & confirmation' }
  ];

  const updateFormData = (updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 1: // Basic Information
        if (!formData.firstName?.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName?.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.gender?.trim()) newErrors.gender = 'Gender is required';
        if (!formData.nationalId?.trim()) newErrors.nationalId = 'National ID is required';
        if (!formData.maritalStatus?.trim()) newErrors.maritalStatus = 'Marital status is required';
        
        // Phone number validation - MANDATORY
        const phoneValidation = validatePhoneNumber(formData.phoneNumber);
        if (!phoneValidation.isValid) {
          newErrors.phoneNumber = phoneValidation.error;
        }
        
        // Spouse validation - MANDATORY if married
        if (formData.maritalStatus === 'MARRIED') {
          if (!formData.spouseName?.trim()) {
            newErrors.spouseName = 'Spouse name is required for married clients';
          }
          if (!formData.spousePhone?.trim()) {
            newErrors.spousePhone = 'Spouse phone number is required for married clients';
          } else {
            const spousePhoneValidation = validatePhoneNumber(formData.spousePhone);
            if (!spousePhoneValidation.isValid) {
              newErrors.spousePhone = spousePhoneValidation.error;
            }
          }
        }
        
        if (formData.age && (formData.age < 18 || formData.age > 100)) {
          newErrors.age = 'Age must be between 18 and 100';
        }
        break;
      
      case 2: // Contact & Address - optional fields, minimal validation
        // Email validation (optional but must be valid if provided)
        const emailValidation = validateEmail(formData.email, false);
        if (!emailValidation.isValid) {
          newErrors.email = emailValidation.error;
        }
        break;
        
      case 3: // Guarantor - optional fields
        // Validate guarantor phone if provided
        if (formData.guarantorPhone && formData.guarantorPhone.trim()) {
          const guarantorPhoneValidation = validatePhoneNumber(formData.guarantorPhone);
          if (!guarantorPhoneValidation.isValid) {
            newErrors.guarantorPhone = guarantorPhoneValidation.error;
          }
        }
        break;
        
      case 4: // Employment - optional fields
        break;
        
      case 5: // Documents & Review
        if (!formData.agreementSigned) {
          newErrors.agreementSigned = 'You must confirm the client agreement';
        }
        break;
        
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCompletedSteps(prev => [...new Set([...prev, currentStep])]);
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <BasicInfoStep formData={formData} updateFormData={updateFormData} errors={errors} />;
      case 2:
        return <ContactAddressStep formData={formData} updateFormData={updateFormData} errors={errors} />;
      case 3:
        return <GuarantorStep formData={formData} updateFormData={updateFormData} errors={errors} />;
      case 4:
        return <EmploymentStep formData={formData} updateFormData={updateFormData} errors={errors} />;
      case 5:
        return <DocumentsReviewStep formData={formData} updateFormData={updateFormData} errors={errors} />;
      default:
        return <BasicInfoStep formData={formData} updateFormData={updateFormData} errors={errors} />;
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Map form data to new backend API format (ClientRegistrationRequest)
      const clientData = {
        // Basic Information - NEW BACKEND FORMAT
        firstName: formData.firstName,
        middleName: formData.middleName || '',
        lastName: formData.lastName,
        gender: formData.gender,
        age: formData.age ? parseInt(formData.age) : undefined,
        nationalId: formData.nationalId || '',
        phoneNumber: formData.phoneNumber,
        email: formData.email || '',
        maritalStatus: formData.maritalStatus || 'SINGLE',
        spouseName: formData.spouseName || '',
        spousePhone: formData.spousePhone || '',
        
        // Address Information
        village: formData.village || '',
        parish: formData.parish || '',
        district: formData.district || '',
        
        // Guarantor Information (new format)
        guarantorFirstName: formData.guarantorFirstName || '',
        guarantorLastName: formData.guarantorLastName || '',
        guarantorGender: formData.guarantorGender || '',
        guarantorPhone: formData.guarantorPhone || '',
        guarantorRelationship: formData.guarantorRelationship || '',
        
        // Legacy guarantor fields (for backwards compatibility)
        guarantorName: formData.guarantorFirstName && formData.guarantorLastName 
          ? `${formData.guarantorFirstName} ${formData.guarantorLastName}`.trim() 
          : '',
        guarantorAge: formData.guarantorAge || undefined,
        guarantorContact: formData.guarantorPhone || '',
        guarantorNationalId: formData.guarantorNationalId || '',
        guarantorVillage: formData.guarantorVillage || '',
        guarantorParish: formData.guarantorParish || '',
        guarantorDistrict: formData.guarantorDistrict || '',
        
        // Legacy Next of Kin fields (for staff registration)
        nextOfKinFirstName: '',
        nextOfKinLastName: '',
        nextOfKinGender: '',
        nextOfKinPhone: '',
        nextOfKinRelationship: '',
        
        // Employment Information
        employmentStatus: formData.employmentStatus || '',
        occupation: formData.occupation || '',
        monthlyIncome: formData.monthlyIncome || '',
        
        // System Information
        branch: 'Main',
        agreementSigned: formData.agreementSigned || true,
        
        // Legacy fields for backward compatibility
        surname: formData.lastName,
        givenName: formData.firstName,
        nationalIdNumber: formData.nationalId || '',
        sourceOfIncome: formData.occupation || ''
      };
      
      console.log('Submitting client data:', clientData);
      
      // Call the API
      const result = await ClientService.createClient(clientData);
      
      console.log('Client created successfully:', result);
      
      // Show success notification
      showSuccess('Client saved successfully! The client has been registered in the system.');
      
      // Navigate back to clients list after a short delay
      setTimeout(() => navigate('/clients'), 2000);
      
    } catch (error) {
      console.error('Error creating client:', error);
      
      // Show user-friendly error message
      let errorMessage = error.message;
      if (errorMessage.includes('First name is required')) {
        errorMessage = 'Please fill in the first name field.';
      } else if (errorMessage.includes('Last name is required')) {
        errorMessage = 'Please fill in the last name field.';
      } else if (errorMessage.includes('Gender is required')) {
        errorMessage = 'Please select a gender.';
      } else if (errorMessage.includes('Gender must be either MALE or FEMALE')) {
        errorMessage = 'Please select a valid gender (Male or Female).';
      } else if (errorMessage.includes('National ID is required')) {
        errorMessage = 'Please fill in the National ID field.';
      } else if (errorMessage.includes('Phone number is required')) {
        errorMessage = 'Please fill in the phone number field.';
      } else if (errorMessage.includes('Duplicate entry') && errorMessage.includes('national_id')) {
        errorMessage = 'This National ID is already registered. Please check the National ID number.';
      }
      
      showError(`Error saving client: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="stepper-form-layout">
      <Sidebar />
      {/* Header */}
      <div className="stepper-header">
        <div className="header-nav">
          <button 
            className="back-button"
            onClick={() => navigate('/clients')}
          >
            <ArrowLeft size={20} />
            Back to Clients
          </button>
        </div>
        <div className="header-title">
          <h1>Add New Client</h1>
          <p>Complete all steps to register a new client</p>
        </div>
      </div>

      {/* Stepper */}
      <Stepper 
        steps={steps} 
        currentStep={currentStep} 
        completedSteps={completedSteps} 
      />

      {/* Step Content */}
      <div className="stepper-content">
        {renderCurrentStep()}
      </div>

      {/* Navigation Buttons */}
      <div className="stepper-navigation">
        <div className="nav-buttons">
          {currentStep > 1 && (
            <button 
              type="button" 
              className="nav-button secondary"
              onClick={handlePrevious}
            >
              <ChevronLeft size={20} />
              Previous
            </button>
          )}
          
          <div className="nav-spacer"></div>
          
          {currentStep < steps.length ? (
            <button 
              type="button" 
              className="nav-button primary"
              onClick={handleNext}
            >
              Next
              <ChevronRight size={20} />
            </button>
          ) : (
            <button 
              type="button" 
              className="nav-button primary submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Client'}
            </button>
          )}
        </div>
      </div>
      
      {/* Notification Modal */}
      <NotificationModal
        isOpen={notification.isOpen}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onClose={hideNotification}
        autoClose={notification.autoClose}
        position={notification.position}
      />
    </div>
  );
};

export default AddClient;
