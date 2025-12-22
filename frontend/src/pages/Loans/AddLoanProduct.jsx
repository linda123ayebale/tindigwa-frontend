import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import LoanProductService from './LoanProductService';
import NotificationModal from '../../components/NotificationModal';
import { useNotification } from '../../hooks/useNotification';
import Sidebar from '../../components/Layout/Sidebar';
import Stepper from '../../components/Stepper/Stepper';
import BasicInformationStep from '../../components/LoanProductSteps/BasicInformationStep';
import InterestConfigurationStep from '../../components/LoanProductSteps/InterestConfigurationStep';
import RepaymentConfigurationStep from '../../components/LoanProductSteps/RepaymentConfigurationStep';
import FeesAndPenaltiesStep from '../../components/LoanProductSteps/FeesAndPenaltiesStep';
import LimitsAndRequirementsStep from '../../components/LoanProductSteps/LimitsAndRequirementsStep';
import './AddLoan.css';

const AddLoanProduct = () => {
  const navigate = useNavigate();
  const { notification, showSuccess, showError, hideNotification } = useNotification();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    // Step 1: Basic Information
    productName: '',
    description: '',
    active: true,
    
    // Step 2: Interest Configuration
    interestMethod: 'reducing',
    defaultInterestRate: '',
    interestType: 'percentage',
    ratePer: 'month',
    
    // Step 3: Repayment Configuration
    defaultRepaymentFrequency: 'daily',
    allowedRepaymentFrequencies: 'daily,weekly,bi-weekly,monthly',
    
    // Step 4: Fees & Penalties
    registrationFeeTiers: [],
    penaltyRate: '',
    processingFeeType: 'percentage',
    processingFeeValue: '',
    lateFee: '0',
    defaultFee: '0',
    defaultGracePeriodDays: '',
    
    // Step 5: Limits & Requirements
    minAmount: '',
    maxAmount: '',
    minDuration: '',
    maxDuration: '',
    defaultDuration: '',
    durationUnit: 'days', // Will be set dynamically based on repayment frequency
    requiresGuarantor: true,  // Always required for all loan products
    requiresCollateral: false // Never required
  });

  const steps = [
    { title: 'Basic Information', description: 'Product name and status' },
    { title: 'Interest Configuration', description: 'Interest rates and calculation' },
    { title: 'Repayment Configuration', description: 'Repayment schedules' },
    { title: 'Fees & Penalties', description: 'Processing fees and penalties' },
    { title: 'Limits & Requirements', description: 'Loan limits and security' }
  ];

  const updateFormData = (updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 1: // Basic Information
        if (!formData.productName?.trim()) {
          newErrors.productName = 'Product name is required';
        }
        break;
        
      case 2: // Interest Configuration
        if (!formData.defaultInterestRate || parseFloat(formData.defaultInterestRate) < 0) {
          newErrors.defaultInterestRate = 'Valid interest rate is required';
        }
        break;
        
      case 3: // Repayment Configuration
        // Default frequency is always set, no validation needed
        break;
        
      case 4: // Fees & Penalties
        if (formData.processingFeeValue && parseFloat(formData.processingFeeValue) < 0) {
          newErrors.processingFeeValue = 'Processing fee must be 0 or greater';
        }
        if (formData.penaltyRate && parseFloat(formData.penaltyRate) < 0) {
          newErrors.penaltyRate = 'Penalty rate must be 0 or greater';
        }
        if (formData.lateFee && parseFloat(formData.lateFee) < 0) {
          newErrors.lateFee = 'Late fee must be 0 or greater';
        }
        if (formData.defaultFee && parseFloat(formData.defaultFee) < 0) {
          newErrors.defaultFee = 'Default fee must be 0 or greater';
        }
        // Validate registration fee tiers
        if (formData.registrationFeeTiers && formData.registrationFeeTiers.length > 0) {
          formData.registrationFeeTiers.forEach((tier, index) => {
            if (tier.minAmount && tier.maxAmount && parseFloat(tier.minAmount) > parseFloat(tier.maxAmount)) {
              newErrors[`tier_${index}`] = 'Min amount must be less than max amount';
            }
          });
        }
        break;
        
      case 5: // Limits & Requirements
        if (formData.minAmount && parseFloat(formData.minAmount) < 0) {
          newErrors.minAmount = 'Minimum amount must be 0 or greater';
        }
        if (formData.maxAmount && parseFloat(formData.maxAmount) < 0) {
          newErrors.maxAmount = 'Maximum amount must be 0 or greater';
        }
        if (formData.minAmount && formData.maxAmount && 
            parseFloat(formData.minAmount) > parseFloat(formData.maxAmount)) {
          newErrors.maxAmount = 'Maximum amount must be greater than minimum amount';
        }
        if (formData.minDuration && formData.maxDuration && 
            parseFloat(formData.minDuration) > parseFloat(formData.maxDuration)) {
          newErrors.maxDuration = 'Maximum duration must be greater than minimum duration';
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
    const commonProps = {
      formData,
      updateFormData,
      errors
    };

    switch (currentStep) {
      case 1:
        return <BasicInformationStep {...commonProps} />;
      case 2:
        return <InterestConfigurationStep {...commonProps} />;
      case 3:
        return <RepaymentConfigurationStep {...commonProps} />;
      case 4:
        return <FeesAndPenaltiesStep {...commonProps} />;
      case 5:
        return <LimitsAndRequirementsStep {...commonProps} />;
      default:
        return <BasicInformationStep {...commonProps} />;
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Build payload to match backend LoanProduct entity structure
      // productCode and createdBy will be auto-generated by backend
      const payload = {
        productName: formData.productName.trim(),
        description: formData.description?.trim() || '',
        defaultInterestRate: parseFloat(formData.defaultInterestRate),
        interestMethod: formData.interestMethod,
        interestType: formData.interestType,
        ratePer: formData.ratePer,
        minDuration: formData.minDuration ? parseInt(formData.minDuration) : 1,
        maxDuration: formData.maxDuration ? parseInt(formData.maxDuration) : 36,
        defaultDuration: formData.defaultDuration ? parseInt(formData.defaultDuration) : 12,
        durationUnit: formData.durationUnit,
        defaultRepaymentFrequency: formData.defaultRepaymentFrequency,
        allowedRepaymentFrequencies: formData.allowedRepaymentFrequencies,
        processingFeeType: formData.processingFeeType,
        processingFeeValue: formData.processingFeeValue ? parseFloat(formData.processingFeeValue) : 0,
        lateFee: formData.lateFee ? parseFloat(formData.lateFee) : 0,
        defaultFee: formData.defaultFee ? parseFloat(formData.defaultFee) : 0,
        defaultGracePeriodDays: formData.defaultGracePeriodDays ? parseInt(formData.defaultGracePeriodDays) : 0,
        registrationFeeTiers: formData.registrationFeeTiers || [],
        penaltyRate: formData.penaltyRate ? parseFloat(formData.penaltyRate) : null,
        requiresGuarantor: formData.requiresGuarantor,
        requiresCollateral: formData.requiresCollateral,
        active: formData.active
      };

      if (formData.minAmount) {
        payload.minAmount = parseFloat(formData.minAmount);
      }
      if (formData.maxAmount) {
        payload.maxAmount = parseFloat(formData.maxAmount);
      }

      console.log('🚀 Submitting loan product data:', payload);
      
      await LoanProductService.create(payload);
      showSuccess('Loan product created successfully! Redirecting...');
      
      setTimeout(() => {
        navigate('/loans/products');
      }, 2000);
      
    } catch (error) {
      console.error('Error creating loan product:', error);
      const msg = error.response?.data?.message || error.message || 'Failed to create loan product';
      if (error.response?.data?.errors) {
        const serverErrors = error.response.data.errors;
        setErrors(prev => ({ ...prev, ...serverErrors }));
      }
      showError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="stepper-form-layout">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="stepper-main">
        {/* Header */}
        <div className="stepper-header">
          <div className="header-nav">
            <button 
              className="back-button"
              onClick={() => navigate('/loans/products')}
            >
              <ArrowLeft size={20} />
              Back to Products
            </button>
          </div>
          <div className="header-title">
            <h1>Add New Loan Product</h1>
            <p>Complete all steps to create a new loan product</p>
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
                {isSubmitting ? 'Creating Product...' : 'Save Product'}
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
      </main>
    </div>
  );
};

export default AddLoanProduct;
