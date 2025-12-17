import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight
} from 'lucide-react';
import loanService from '../../services/loanService';
import Stepper from '../../components/Stepper/Stepper';
import ClientLoanProductStep from '../../components/LoanSteps/ClientLoanProductStep';
import PrincipalAmountStep from '../../components/LoanSteps/PrincipalAmountStep';
import AdditionalDetailsReviewStep from '../../components/LoanSteps/AdditionalDetailsReviewStep';
import NotificationModal from '../../components/NotificationModal';
import Sidebar from '../../components/Layout/Sidebar';
import { useNotification } from '../../hooks/useNotification';
import './AddLoan.css';

const AddLoan = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { notification, showSuccess, showError, hideNotification } = useNotification();
  
  // New state for loan products and guarantor info
  const [loanProducts, setLoanProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [guarantorInfo, setGuarantorInfo] = useState(null);
  const [clients, setClients] = useState([]);
  const [loanOfficers, setLoanOfficers] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingGuarantor, setLoadingGuarantor] = useState(false);
  const [loadingLoanOfficers, setLoadingLoanOfficers] = useState(false);
  
  const today = new Date().toISOString().split('T')[0];
  
  const [formData, setFormData] = useState({
    // Step 1: Client & Product Selection
    clientId: '',
    borrowerName: '',
    borrowerPhone: '',
    borrowerEmail: '',
    productId: '',
    loanOfficerId: '',
    
    // Step 2: Principal Amount
    principal: '',
    applicationDate: today,
    
    // Step 3: Interest & Terms
    interestMethod: 'flat',
    interestType: 'percentage',
    interestRate: '',
    fixedInterestAmount: '',
    ratePer: 'month',
    loanDuration: '6',
    durationUnit: 'months',
    repaymentFrequency: 'monthly',
    numberOfRepayments: 6,
    gracePeriodDays: 0,
    
    // Step 4: Calculator (auto-calculated)
    // No form fields, just displays calculations
    
    // Step 4: Additional Details & Review
    processingFee: 0,
    registrationFee: 0,
    penaltyRate: 0,
    penaltyGraceDays: 0,
    agreementSigned: false,

    // First-time borrower flags populated after client selection
    isFirstTimeClient: null, // null = unknown, true = first-time, false = returning
    clientLoanCount: 0
  });

  const steps = [
    { title: 'Client & Product', description: 'Select borrower and loan product' },
    { title: 'Principal Amount', description: 'Set loan amount' },
    { title: 'Final Review & Confirmation', description: 'Review and confirm loan details' }
  ];

  const updateFormData = (updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  // Load loan products, clients and loan officers on component mount
  useEffect(() => {
    loadLoanProducts();
    loadClients();
    loadLoanOfficers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load guarantor info when clientId changes
  useEffect(() => {
    if (formData.clientId && formData.clientId !== '') {
      loadGuarantorInfo(formData.clientId);
    } else {
      setGuarantorInfo(null);
    }
  }, [formData.clientId]);

  // Update form data when product is selected
  useEffect(() => {
    if (selectedProduct) {
      applyProductDefaults(selectedProduct);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProduct]);

  // Update form data when guarantor info is loaded
  useEffect(() => {
    if (guarantorInfo) {
      updateFormData({
        guarantorName: guarantorInfo.fullName || 'N/A',
        guarantorPhone: guarantorInfo.phoneNumber || 'N/A',
        guarantorRelationship: guarantorInfo.relationship || 'N/A',
        guarantorAddress: guarantorInfo.fullAddress || 'N/A',
        guarantorOccupation: guarantorInfo.occupation || 'N/A'
      });
    } else {
      // Clear guarantor info if no guarantor found
      updateFormData({
        guarantorName: 'No guarantor found',
        guarantorPhone: 'N/A',
        guarantorRelationship: 'N/A',
        guarantorAddress: 'N/A',
        guarantorOccupation: 'N/A'
      });
    }
  }, [guarantorInfo]);

  const loadLoanProducts = async () => {
    setLoadingProducts(true);
    try {
      const products = await loanService.getAllLoanProducts();
      setLoanProducts(products);
      console.log('✅ Loaded loan products:', products);
    } catch (error) {
      console.error('❌ Error loading loan products:', error);
      showError('Failed to load loan products. Please refresh the page.');
    } finally {
      setLoadingProducts(false);
    }
  };

  const loadClients = async () => {
    try {
      const clientList = await loanService.getAllClients();
      setClients(clientList);
      console.log('✅ Loaded clients:', clientList);
    } catch (error) {
      console.error('❌ Error loading clients:', error);
    }
  };

  const loadLoanOfficers = async () => {
    setLoadingLoanOfficers(true);
    try {
      const officers = await loanService.getLoanOfficers();
      setLoanOfficers(officers);
      console.log('✅ Loaded loan officers:', officers);
    } catch (error) {
      console.error('❌ Error loading loan officers:', error);
      // Do not block the form, but warn
    } finally {
      setLoadingLoanOfficers(false);
    }
  };

  const loadGuarantorInfo = async (clientId) => {
    setLoadingGuarantor(true);
    try {
      const guarantor = await loanService.getClientGuarantor(clientId);
      setGuarantorInfo(guarantor);
      console.log('✅ Loaded guarantor info:', guarantor);
    } catch (error) {
      // Check if it's a 404 (no guarantor found) vs other errors
      if (error.message && error.message.includes('guarantor found')) {
        console.log('ℹ️ No guarantor found for client:', clientId);
        setGuarantorInfo(null);
      } else if (error.message && error.message.includes('Client not found')) {
        console.error('❌ Client not found:', clientId);
        setGuarantorInfo(null);
      } else {
        console.error('❌ Error loading guarantor:', error);
        setGuarantorInfo(null);
      }
      // Don't show error notification - guarantors are optional
    } finally {
      setLoadingGuarantor(false);
    }
  };

  const applyProductDefaults = (product) => {
    console.log('🎯 Applying product defaults:', product);
    
    updateFormData({
      interestRate: product.defaultInterestRate || '',
      interestMethod: product.interestMethod || 'flat',
      interestType: product.interestType || 'percentage',
      ratePer: product.ratePer || 'month',
      repaymentFrequency: product.defaultRepaymentFrequency || 'monthly',
      gracePeriodDays: product.defaultGracePeriodDays || 0,
      lateFee: product.lateFee || 0,
      defaultFee: product.defaultFee || 0,
      durationUnit: product.durationUnit || 'days',
      loanDuration: product.minDuration || product.maxDuration || '1',
    });

    // Calculate and set processing fee if principal amount is available
    if (formData.principal && parseFloat(formData.principal) > 0) {
      const processingFee = loanService.calculateProcessingFeeForProduct(
        parseFloat(formData.principal), 
        product
      );
      updateFormData({ processingFee });
    }
  };

  const handleProductChange = (productId) => {
    console.log('🔄 Product changed to:', productId);
    
    const product = loanProducts.find(p => p.id === parseInt(productId));
    setSelectedProduct(product);
    
    updateFormData({ productId });

    // Validate current loan amount against new product constraints
    if (product && formData.principal) {
      const amount = parseFloat(formData.principal);
      if (amount < product.minAmount || amount > product.maxAmount) {
        showError(`Loan amount must be between ${product.minAmount.toLocaleString()} and ${product.maxAmount.toLocaleString()} for ${product.productName}`);
      }
    }
  };

  const handleLoanOfficerChange = (officerId) => {
    console.log('🔄 Loan officer changed to:', officerId);
    
    // Find the selected loan officer to get their name
    const selectedOfficer = loanOfficers.find(officer => officer.id === parseInt(officerId));
    const loanOfficerName = selectedOfficer ? 
      (selectedOfficer.fullName || selectedOfficer.name || `${selectedOfficer.firstName} ${selectedOfficer.lastName}`) : 'Tindigwa Loan Officer';
    
    updateFormData({ 
      loanOfficerId: officerId,
      loanOfficerName: loanOfficerName
    });
  };

  const handleClientChange = async (clientId) => {
    console.log('🔄 Client changed to:', clientId);
    
    // Find the selected client to get their name
    const selectedClient = clients.find(client => client.id === parseInt(clientId));
    const borrowerName = selectedClient ? 
      (selectedClient.fullName || `${selectedClient.firstName} ${selectedClient.lastName}`) : '';
    
    // Optimistically update borrower details including spouse info
    updateFormData({ 
      clientId,
      borrowerName,
      borrowerPhone: selectedClient?.phoneNumber || '',
      borrowerEmail: selectedClient?.email || '',
      maritalStatus: selectedClient?.maritalStatus || 'SINGLE',
      spouseName: selectedClient?.spouseName || '',
      spousePhone: selectedClient?.spousePhone || ''
    });

    // Fetch whether this is a first-time borrower (affects registration fee)
    try {
      console.log('🔍 Checking first-time borrower status for client:', clientId);
      const status = await loanService.isClientFirstTimeBorrower(clientId);
      console.log('📘 First-time borrower API response:', JSON.stringify(status, null, 2));
      console.log('📘 isFirstTime value:', status.isFirstTime, 'type:', typeof status.isFirstTime);
      console.log('📘 loanCount value:', status.loanCount, 'type:', typeof status.loanCount);
      
      const isFirst = status.isFirstTime === true;
      console.log('📘 Setting isFirstTimeClient to:', isFirst);
      
      updateFormData({ 
        isFirstTimeClient: isFirst,
        clientLoanCount: status.loanCount ?? 0
      });
    } catch (e) {
      console.error('❌ Error checking first-time status:', e);
      console.warn('⚠️ Could not determine first-time status, defaulting to true (first-time) to ensure fee is charged if applicable');
      // Changed: Default to TRUE (first-time) instead of FALSE to avoid accidentally waiving fees
      updateFormData({ 
        isFirstTimeClient: true,
        clientLoanCount: 0 
      });
    }
  };

  const validateStep = (step) => {
    console.log('Validating step:', step);
    console.log('Form data:', formData);
    
    const newErrors = {};
    
    switch (step) {
      case 1: // Client & Product Selection
        console.log('Validating clientId:', formData.clientId);
        console.log('Validating productId:', formData.productId);
        console.log('Validating loanOfficerId:', formData.loanOfficerId);
        
        if (!formData.clientId || !formData.clientId.toString().trim()) {
          newErrors.clientId = 'Please select a client';
        }
        if (!formData.productId || !formData.productId.trim()) {
          newErrors.productId = 'Please select a loan product';
        }
        // Loan officer selection is now optional
        break;
      
      case 2: // Principal Amount
        if (!formData.principal || parseFloat(formData.principal) <= 0) {
          newErrors.principal = 'Principal amount is required and must be greater than 0';
        }
        if (!formData.applicationDate?.trim()) newErrors.applicationDate = 'Application date is required';
        break;
        
      case 3: // Final Review & Confirmation
        if (!formData.agreementSigned) {
          newErrors.agreementSigned = 'You must confirm the loan agreement';
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
      errors,
      loanProducts,
      selectedProduct,
      guarantorInfo,
      clients,
      loanOfficers,
      loadingProducts,
      loadingGuarantor,
      loadingLoanOfficers,
      onProductChange: handleProductChange,
      onClientChange: handleClientChange,
      onLoanOfficerChange: handleLoanOfficerChange,
      showSuccess,
      showError
    };

    switch (currentStep) {
      case 1:
        return <ClientLoanProductStep {...commonProps} />;
      case 2:
        return <PrincipalAmountStep {...commonProps} />;
      case 3:
        return <AdditionalDetailsReviewStep {...commonProps} />;
      default:
        return <ClientLoanProductStep {...commonProps} />;
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Product constraint validation disabled - allow flexible loan terms
      // if (selectedProduct) {
      //   const validationErrors = loanService.validateLoanAgainstProduct(formData, selectedProduct);
      //   if (validationErrors.length > 0) {
      //     showError(`Product validation failed: ${validationErrors.join(', ')}`);
      //     return;
      //   }
      // }

      // Use loanService to format the data properly
      const payload = loanService.formatLoanData(formData);
      
      console.log('🚀 Submitting loan data:', payload);
      
      console.log('Submitting loan data:', payload);
      
      // Get loan officer ID from form data (optional, default to 1 if not selected)
      const loanOfficerId = formData.loanOfficerId ? parseInt(formData.loanOfficerId) : 1;
      
      // Call the API with workflow support
      const result = await loanService.createLoan(payload, loanOfficerId);
      
      console.log('Loan created successfully:', result);
      
      // Show success notification
      showSuccess('Loan created successfully! Redirecting to loans list...');
      
      // Navigate back to loans list after a short delay
      setTimeout(() => {
        try {
          navigate('/loans');
        } catch (navError) {
          // If navigation fails, use window.location as fallback
          console.log('Navigation failed, using fallback redirect');
          window.location.href = '/loans';
        }
      }, 2000);
      
    } catch (error) {
      console.error('Error creating loan:', error);
      
      // Handle session expiration specifically
      if (error.message && error.message.includes('session has expired')) {
        showError('Your session expired during loan creation. Please log in again to continue.');
        // Give user time to see the message before redirect
        setTimeout(() => {
          window.location.href = '/login';
        }, 3000);
        return;
      }
      
      // Show user-friendly error message for other errors
      let errorMessage = error.message || 'An error occurred while creating the loan';
      
      // Handle specific validation errors
      if (errorMessage.includes('Client ID is required')) {
        errorMessage = 'Please select a valid borrower from the list.';
      } else if (errorMessage.includes('Product ID is required')) {
        errorMessage = 'Please select a loan product.';
      } else if (errorMessage.includes('Principal amount')) {
        errorMessage = 'Please enter a valid principal amount.';
      }
      
      showError(`Error creating loan: ${errorMessage}`);
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
              onClick={() => navigate('/loans')}
            >
              <ArrowLeft size={20} />
              Back to Loans
            </button>
          </div>
          <div className="header-title">
            <h1>Add New Loan</h1>
            <p>Complete all steps to create a new loan</p>
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
                {isSubmitting ? 'Creating Loan...' : 'Create Loan'}
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

export default AddLoan;
