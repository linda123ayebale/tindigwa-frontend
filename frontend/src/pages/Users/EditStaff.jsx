import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import StaffService from '../../services/staffService';
import Stepper from '../../components/Stepper/Stepper';
import StaffBasicInfoStep from '../../components/ClientSteps/StaffBasicInfoStep';
import ContactAddressStep from '../../components/ClientSteps/ContactAddressStep';
import NextOfKinStep from '../../components/ClientSteps/NextOfKinStep';
import StaffReviewStep from '../../components/ClientSteps/StaffReviewStep';
import NotificationModal from '../../components/NotificationModal';
import { useNotification } from '../../hooks/useNotification';
import { validatePhoneNumber, validateEmail } from '../../utils/validation';
import '../Clients/AddClient.css'; // Reuse the same styles
import Sidebar from '../../components/Layout/Sidebar';

const EditStaff = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const { notification, showSuccess, showError, hideNotification } = useNotification();
  
  // Form data state - matching staff structure
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
    role: '',
    
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
    branch: 'Main'
  });

  // Steps - Staff specific
  const steps = [
    { title: 'Basic Information', description: 'Personal details & role' },
    { title: 'Contact & Address', description: 'Location information' },
    { title: 'Next of Kin', description: 'Emergency contact' },
    { title: 'Review & Submit', description: 'Confirmation' }
  ];

  // updateFormData function
  const updateFormData = (updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  // Fetch existing staff data on component mount
  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        setLoading(true);
        console.log('🔍 Fetching staff data for ID:', id);
        
        const staffData = await StaffService.getStaffById(id);
        console.log('📊 Raw staff data received:', staffData);
        
        if (staffData && staffData.id) {
          console.log('✅ Staff data found, populating form...');
          
          // Map staff data to form structure
          const populatedData = {
            // Basic Information
            firstName: staffData.firstName || '',
            middleName: staffData.middleName || '',
            lastName: staffData.lastName || '',
            gender: staffData.gender || '',
            age: staffData.age?.toString() || '',
            nationalId: staffData.nationalId || '',
            phoneNumber: staffData.phoneNumber || '',
            email: staffData.email || '',
            role: staffData.role || staffData.staffType || '',
            
            // Photo Information
            passportPhotoFile: null, // File uploads can't be pre-populated
            passportPhotoPreview: '', // Photo preview will be empty in edit mode
            
            // Address Information
            village: staffData.village || '',
            parish: staffData.parish || '',
            district: staffData.district || '',
            
            // Next of Kin Information
            nextOfKinFirstName: staffData.nextOfKin?.firstName || 
                               staffData.nextOfKinFirstName || '',
            nextOfKinLastName: staffData.nextOfKin?.lastName || 
                              staffData.nextOfKinLastName || '',
            nextOfKinGender: staffData.nextOfKin?.gender || 
                            staffData.nextOfKinGender || '',
            nextOfKinPhone: staffData.nextOfKin?.phoneNumber || 
                           staffData.nextOfKinPhone || '',
            nextOfKinRelationship: staffData.nextOfKin?.relationship || 
                                  staffData.nextOfKinRelationship || '',
            nextOfKinVillage: staffData.nextOfKin?.village || 
                             staffData.nextOfKinVillage || '',
            nextOfKinParish: staffData.nextOfKin?.parish || 
                            staffData.nextOfKinParish || '',
            nextOfKinDistrict: staffData.nextOfKin?.district || 
                              staffData.nextOfKinDistrict || '',
            
            // System Information
            branch: staffData.branch || 'Main'
          };
          
          setFormData(populatedData);
          console.log('✅ Form data populated successfully:', populatedData);
        } else {
          console.error('❌ Staff member not found in response');
          showError('Staff member not found');
          navigate('/users/staff');
        }
      } catch (error) {
        console.error('❌ Error fetching staff data:', error);
        showError(`Failed to load staff data: ${error.message}`);
        navigate('/users/staff');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchStaffData();
    }
  }, [id, navigate, showError]);

  // Validation function
  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 1: // Basic Information
        if (!formData.firstName?.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName?.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.gender?.trim()) newErrors.gender = 'Gender is required';
        if (!formData.nationalId?.trim()) newErrors.nationalId = 'National ID is required';
        
        // Phone number validation - MANDATORY
        const phoneValidation = validatePhoneNumber(formData.phoneNumber);
        if (!phoneValidation.isValid) {
          newErrors.phoneNumber = phoneValidation.error;
        }
        
        if (!formData.role?.trim()) newErrors.role = 'Role is required';
        if (formData.age && (formData.age < 18 || formData.age > 70)) {
          newErrors.age = 'Age must be between 18 and 70';
        }
        break;
      
      case 2: // Contact & Address
        // Email validation (optional but must be valid if provided)
        const emailValidation = validateEmail(formData.email, false);
        if (!emailValidation.isValid) {
          newErrors.email = emailValidation.error;
        }
        break;
        
      case 3: // Next of Kin - optional but if provided, validate
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

  // Navigation functions
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

  // Step rendering function
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <StaffBasicInfoStep formData={formData} updateFormData={updateFormData} errors={errors} isEditMode={true} />;
      case 2:
        return <ContactAddressStep formData={formData} updateFormData={updateFormData} errors={errors} isEditMode={true} />;
      case 3:
        return <NextOfKinStep formData={formData} updateFormData={updateFormData} errors={errors} isEditMode={true} />;
      case 4:
        return <StaffReviewStep formData={formData} updateFormData={updateFormData} errors={errors} isEditMode={true} />;
      default:
        return <StaffBasicInfoStep formData={formData} updateFormData={updateFormData} errors={errors} />;
    }
  };

  // Submit function - adapted for UPDATE operation
  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Map form data to backend API format
      const staffData = {
        // Basic Information
        firstName: formData.firstName,
        middleName: formData.middleName || '',
        lastName: formData.lastName,
        gender: formData.gender,
        age: formData.age ? parseInt(formData.age) : undefined,
        nationalId: formData.nationalId || '',
        phoneNumber: formData.phoneNumber,
        email: formData.email || '',
        role: formData.role,
        
        // Address Information
        village: formData.village || '',
        parish: formData.parish || '',
        district: formData.district || '',
        
        // Next of Kin Information
        nextOfKinFirstName: formData.nextOfKinFirstName || '',
        nextOfKinLastName: formData.nextOfKinLastName || '',
        nextOfKinGender: formData.nextOfKinGender || '',
        nextOfKinPhone: formData.nextOfKinPhone || '',
        nextOfKinRelationship: formData.nextOfKinRelationship || '',
        nextOfKinVillage: formData.nextOfKinVillage || '',
        nextOfKinParish: formData.nextOfKinParish || '',
        nextOfKinDistrict: formData.nextOfKinDistrict || '',
        
        // System Information
        branch: formData.branch || 'Main'
      };
      
      console.log('📤 Updating staff data:', staffData);
      
      // Call the UPDATE API
      const result = await StaffService.updateStaff(id, staffData);
      
      console.log('✅ Staff updated successfully:', result);
      
      // Show success notification
      showSuccess('Staff member updated successfully! The staff information has been saved.');
      
      // Navigate back to staff list after a short delay
      setTimeout(() => navigate('/users/staff'), 2000);
      
    } catch (error) {
      console.error('❌ Error updating staff:', error);
      
      // Show user-friendly error message
      let errorMessage = error.message;
      if (errorMessage.includes('First name is required')) {
        errorMessage = 'Please fill in the first name field.';
      } else if (errorMessage.includes('Last name is required')) {
        errorMessage = 'Please fill in the last name field.';
      } else if (errorMessage.includes('Gender is required')) {
        errorMessage = 'Please select a gender.';
      } else if (errorMessage.includes('National ID is required')) {
        errorMessage = 'Please fill in the National ID field.';
      } else if (errorMessage.includes('Phone number is required')) {
        errorMessage = 'Please fill in the phone number field.';
      } else if (errorMessage.includes('Role is required')) {
        errorMessage = 'Please select a role.';
      } else if (errorMessage.includes('Duplicate entry') && errorMessage.includes('national_id')) {
        errorMessage = 'This National ID is already registered. Please check the National ID number.';
      }
      
      showError(`Error updating staff: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="add-client-loading">
        <div className="loading-spinner"></div>
        <p>Loading staff data...</p>
      </div>
    );
  }

  // JSX return - matching EditClient structure
  return (
    <div className="stepper-form-layout">
            <Sidebar />

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
          <h1>Edit Staff Member</h1>
          <p>Update staff member information</p>
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
              {isSubmitting ? 'Updating...' : 'Update Staff Member'}
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

export default EditStaff;