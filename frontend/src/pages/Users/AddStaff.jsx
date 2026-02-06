import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import StaffService from '../../services/staffService';
import Stepper from '../../components/Stepper/Stepper';
import StaffBasicInfoStep from '../../components/ClientSteps/StaffBasicInfoStep';
import ContactAddressStep from '../../components/ClientSteps/ContactAddressStep';
import NextOfKinStep from '../../components/ClientSteps/NextOfKinStep';
import StaffReviewStep from '../../components/ClientSteps/StaffReviewStep';
import NotificationModal from '../../components/NotificationModal';
import { useNotification } from '../../hooks/useNotification';
import { validatePhoneNumber, validateEmail, validateNationalId } from '../../utils/validation';
import '../Clients/AddClient.css'; // Reuse existing styles
import Sidebar from '../../components/Layout/Sidebar';

const AddStaff = () => {
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
    role: '', // Staff role (LOAN_OFFICER, CASHIER, SUPERVISOR)
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
    nextOfKinGender: '',
    nextOfKinPhone: '',
    nextOfKinRelationship: '',
    nextOfKinVillage: '',
    nextOfKinParish: '',
    nextOfKinDistrict: '',
    
    // System Information
    branch: 'Main',
    status: 'active'
  });

  const steps = [
    { title: 'Basic Information', description: 'Personal details & role' },
    { title: 'Contact & Address', description: 'Location information' },
    { title: 'Next of Kin', description: 'Emergency contact' },
    { title: 'Review & Submit', description: 'Confirm details' }
  ];

  const updateFormData = (updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
    
    // Clear errors for fields that are being updated
    const updatedFields = Object.keys(updates);
    if (updatedFields.length > 0) {
      setErrors(prev => {
        const newErrors = { ...prev };
        updatedFields.forEach(field => {
          delete newErrors[field];
        });
        return newErrors;
      });
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 1: // Basic Information
        if (!formData.firstName?.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName?.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.gender?.trim()) newErrors.gender = 'Gender is required';
        if (!formData.role?.trim()) newErrors.role = 'Role is required';
        
        // National ID validation - MANDATORY with Uganda NIN format
        const ninValidation = validateNationalId(formData.nationalId, true);
        if (!ninValidation.isValid) {
          newErrors.nationalId = ninValidation.error;
        }
        
        // Phone number validation - MANDATORY
        const phoneValidation = validatePhoneNumber(formData.phoneNumber);
        if (!phoneValidation.isValid) {
          newErrors.phoneNumber = phoneValidation.error;
        }
        
        if (formData.age && (formData.age < 18 || formData.age > 70)) {
          newErrors.age = 'Age must be between 18 and 70';
        }
        
        // Email validation (optional but must be valid if provided)
        const emailValidation = validateEmail(formData.email, false);
        if (!emailValidation.isValid) {
          newErrors.email = emailValidation.error;
        }
        break;
      
      case 2: // Contact & Address - optional fields, minimal validation
        break;
        
      case 3: // Next of Kin - optional fields
        // Validate next of kin phone if provided
        if (formData.nextOfKinPhone && formData.nextOfKinPhone.trim()) {
          const nokPhoneValidation = validatePhoneNumber(formData.nextOfKinPhone);
          if (!nokPhoneValidation.isValid) {
            newErrors.nextOfKinPhone = nokPhoneValidation.error;
          }
        }
        break;
        
      case 4: // Review - no additional validation needed
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
        return <StaffBasicInfoStep formData={formData} updateFormData={updateFormData} errors={errors} />;
      case 2:
        return <ContactAddressStep formData={formData} updateFormData={updateFormData} errors={errors} />;
      case 3:
        return <NextOfKinStep formData={formData} updateFormData={updateFormData} errors={errors} />;
      case 4:
        return <StaffReviewStep formData={formData} updateFormData={updateFormData} errors={errors} />;
      default:
        return <StaffBasicInfoStep formData={formData} updateFormData={updateFormData} errors={errors} />;
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      return;
    }
    
    setIsSubmitting(true);
    console.log('🖾️ Starting staff submission process...');
    
    try {
      // Format staff data for the API
      const staffData = StaffService.formatStaffData(formData);
      
      console.log('🖾️ Form data:', formData);
      console.log('🖾️ Formatted staff data:', staffData);
      
      // Validate the data before sending
      StaffService.validateStaffData(staffData);
      console.log('✅ Staff data validation passed');
      
      // Call the API
      console.log('🚀 Calling API to create staff...');
      const result = await StaffService.createStaff(staffData);
      
      console.log('✅ Staff created successfully:', result);
      
      // Show success notification
      showSuccess('Staff member saved successfully! The staff member has been registered in the system.');
      
      // Navigate back to staff list after a short delay
      console.log('🧠 Navigating to /users/staff in 2 seconds...');
      setTimeout(() => {
        console.log('🧠 Executing navigation to /users/staff');
        navigate('/users/staff');
      }, 2000);
      
    } catch (error) {
      console.error('❌ Error creating staff:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      // Show user-friendly error message
      let errorMessage = error.message;
      if (errorMessage.includes('First name is required')) {
        errorMessage = 'Please fill in the first name field.';
      } else if (errorMessage.includes('Last name is required')) {
        errorMessage = 'Please fill in the last name field.';
      } else if (errorMessage.includes('Gender is required')) {
        errorMessage = 'Please select a gender.';
      } else if (errorMessage.includes('Role is required')) {
        errorMessage = 'Please select a role.';
      } else if (errorMessage.includes('National ID is required')) {
        errorMessage = 'Please fill in the National ID field.';
      } else if (errorMessage.includes('Phone number is required')) {
        errorMessage = 'Please fill in the phone number field.';
      } else if (errorMessage.includes('Duplicate entry') && errorMessage.includes('national_id')) {
        errorMessage = 'This National ID is already registered. Please check the National ID number.';
      }
      
      showError(`Error saving staff member: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="stepper-form-layout">

      {/* Header */}
      <div className="stepper-header">
        <div className="header-nav">
          <button 
            className="back-button"
            onClick={() => navigate('/users/staff')}
          >
            <ArrowLeft size={20} />
            Back to Staff
          </button>
        </div>
        <div className="header-title">
          <h1>Add New Staff Member</h1>
          <p>Complete all steps to register a new staff member</p>
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
              {isSubmitting ? 'Submitting...' : 'Submit Staff Member'}
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

export default AddStaff;