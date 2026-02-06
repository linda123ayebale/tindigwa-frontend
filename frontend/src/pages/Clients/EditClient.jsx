import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import { validatePhoneNumber, validateEmail, validateNationalId } from '../../utils/validation';
import '../Clients/AddClient.css'; // Reuse the same styles

const EditClient = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const { notification, showSuccess, showError, hideNotification } = useNotification();
  
  // Form data state - EXACTLY matching AddClient structure
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

  // Steps - EXACTLY matching AddClient
  const steps = [
    { title: 'Basic Information', description: 'Personal details' },
    { title: 'Contact & Address', description: 'Location information' },
    { title: 'Guarantor', description: 'Guarantor information' },
    { title: 'Employment', description: 'Work & income' },
    { title: 'Review & Submit', description: 'Documents & confirmation' }
  ];

  // updateFormData function - EXACTLY matching AddClient
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

  // Fetch existing client data on component mount
  useEffect(() => {
    const fetchClientData = async () => {
      try {
        setLoading(true);
        console.log('🔍 Fetching client data for ID:', id);
        
        const clientData = await ClientService.getClientById(id);
        console.log('📊 Raw client data received:', clientData);
        
        // Handle different response formats
        let actualClientData = clientData;
        if (clientData && clientData.data) {
          actualClientData = clientData.data;
        } else if (clientData && !clientData.data && clientData.id) {
          // Direct client object
          actualClientData = clientData;
        }
        
        if (actualClientData && actualClientData.id) {
          console.log('✅ Client data found, populating form...');
          console.log('🔍 DEBUGGING - Full client data structure:', JSON.stringify(actualClientData, null, 2));
          
          // COMPREHENSIVE mapping for ALL form fields
          const populatedData = {
            // Basic Information
            firstName: actualClientData.firstName || actualClientData.givenName || '',
            middleName: actualClientData.middleName || '', 
            lastName: actualClientData.lastName || actualClientData.surname || '',
            gender: actualClientData.gender || '',
            age: actualClientData.age?.toString() || '',
            nationalId: actualClientData.nationalId || actualClientData.nationalIdNumber || '',
            phoneNumber: actualClientData.phoneNumber || '',
            email: actualClientData.email || '',
            
            // Photo Information
            passportPhotoFile: null, // File uploads can't be pre-populated
            passportPhotoPreview: '', // Photo preview will be empty in edit mode
            
            // Address Information
            village: actualClientData.village || '',
            parish: actualClientData.parish || '',
            district: actualClientData.district || '',
            
            // Guarantor Information (FIXED - matches backend ClientResponse.GuarantorInfo)
            guarantorFirstName: actualClientData.guarantor?.firstName || 
                               actualClientData.guarantorFirstName ||
                               actualClientData.guarantorName?.split(' ')[0] || '',
            guarantorLastName: actualClientData.guarantor?.lastName || 
                              actualClientData.guarantorLastName ||
                              actualClientData.guarantorName?.split(' ').slice(1).join(' ') || '',
            guarantorGender: actualClientData.guarantor?.gender || 
                            actualClientData.guarantorGender || '',
            guarantorPhone: actualClientData.guarantor?.phoneNumber || 
                           actualClientData.guarantorPhone ||
                           actualClientData.guarantorContact || '',
            guarantorRelationship: actualClientData.guarantor?.relationship ||
                                  actualClientData.guarantorRelationship || '',
            
            // Employment Information (FIXED - matches backend ClientResponse flat fields)
            employmentStatus: actualClientData.employmentStatus ||
                             actualClientData.employmentLength || '',
            occupation: actualClientData.occupation || 
                       actualClientData.sourceOfIncome || '',
            monthlyIncome: actualClientData.monthlyIncome?.toString() || '',
            
            // Agreement (default to signed for existing clients)
            agreementSigned: true
          };
          
          // Additional debugging logs
          console.log('🔍 DEBUGGING - Guarantor data extraction:');
          console.log('  - guarantorFirstName:', populatedData.guarantorFirstName);
          console.log('  - guarantorLastName:', populatedData.guarantorLastName);
          console.log('  - guarantorGender:', populatedData.guarantorGender);
          console.log('  - guarantorPhone:', populatedData.guarantorPhone);
          console.log('  - guarantorRelationship:', populatedData.guarantorRelationship);
          
          console.log('🔍 DEBUGGING - Employment data extraction:');
          console.log('  - employmentStatus:', populatedData.employmentStatus);
          console.log('  - occupation:', populatedData.occupation);
          console.log('  - monthlyIncome:', populatedData.monthlyIncome);
          
          setFormData(populatedData);
          console.log('✅ Form data populated successfully:', populatedData);
        } else {
          console.error('❌ Client not found in response');
          showError('Client not found');
          navigate('/clients');
        }
      } catch (error) {
        console.error('❌ Error fetching client data:', error);
        showError(`Failed to load client data: ${error.message}`);
        navigate('/clients');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchClientData();
    }
  }, [id, navigate, showError]);

  // Validation function - EXACTLY matching AddClient
  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 1: // Basic Information
        if (!formData.firstName?.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName?.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.gender?.trim()) newErrors.gender = 'Gender is required';
        
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

  // Navigation functions - EXACTLY matching AddClient
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

  // Step rendering function - EXACTLY matching AddClient
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <BasicInfoStep formData={formData} updateFormData={updateFormData} errors={errors} isEditMode={true} />;
      case 2:
        return <ContactAddressStep formData={formData} updateFormData={updateFormData} errors={errors} isEditMode={true} />;
      case 3:
        return <GuarantorStep formData={formData} updateFormData={updateFormData} errors={errors} isEditMode={true} />;
      case 4:
        return <EmploymentStep formData={formData} updateFormData={updateFormData} errors={errors} isEditMode={true} />;
      case 5:
        return <DocumentsReviewStep formData={formData} updateFormData={updateFormData} errors={errors} isEditMode={true} />;
      default:
        return <BasicInfoStep formData={formData} updateFormData={updateFormData} errors={errors} />;
    }
  };

  // Submit function - adapted for UPDATE operation
  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Map form data to backend API format (same as AddClient)
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
      
      console.log('📤 Updating client data:', clientData);
      
      // Call the UPDATE API
      const result = await ClientService.updateClient(id, clientData);
      
      console.log('✅ Client updated successfully:', result);
      
      // Show success notification
      showSuccess('Client updated successfully! The client information has been saved.');
      
      // Navigate back to clients list after a short delay
      setTimeout(() => navigate('/clients'), 2000);
      
    } catch (error) {
      console.error('❌ Error updating client:', error);
      
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
      } else if (errorMessage.includes('Duplicate entry') && errorMessage.includes('national_id')) {
        errorMessage = 'This National ID is already registered. Please check the National ID number.';
      }
      
      showError(`Error updating client: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state - same as AddClient
  if (loading) {
    return (
      <div className="add-client-loading">
        <div className="loading-spinner"></div>
        <p>Loading client data...</p>
      </div>
    );
  }

  // JSX return - EXACTLY matching AddClient structure
  return (
    <div className="stepper-form-layout">
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
          <h1>Edit Client</h1>
          <p>Update client information</p>
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
              {isSubmitting ? 'Updating...' : 'Update Client'}
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

export default EditClient;