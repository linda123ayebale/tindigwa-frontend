import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight
} from 'lucide-react';
import loanService from '../../services/loanService';
import Stepper from '../../components/Stepper/Stepper';
import ClientLoanProductStep from '../../components/LoanSteps/ClientLoanProductStep';
import PrincipalDisbursementStep from '../../components/LoanSteps/PrincipalDisbursementStep';
import InterestTermsStep from '../../components/LoanSteps/InterestTermsStep';
import LoanCalculatorStep from '../../components/LoanSteps/LoanCalculatorStep';
import AdditionalDetailsReviewStep from '../../components/LoanSteps/AdditionalDetailsReviewStep';
import NotificationModal from '../../components/NotificationModal';
import Sidebar from '../../components/Layout/Sidebar';
import { useNotification } from '../../hooks/useNotification';
import './EditLoan.css';

const EditLoan = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
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
    
    // Step 2: Principal & Disbursement
    principal: '',
    releaseDate: today,
    disbursedBy: 'Cash',
    cashBankAccount: 'cash_001',
    
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
    firstRepaymentDate: '',
    firstRepaymentAmount: '',
    
    // Step 5: Additional Details & Review
    processingFee: 0,
    lateFee: 0,
    defaultFee: 0,
    loanStatus: 'open',
    guarantors: [],
    loanTitle: '',
    description: '',
    agreementSigned: false
  });

  const steps = [
    { title: 'Client & Product', description: 'Select borrower and loan product' },
    { title: 'Principal & Disbursement', description: 'Set amount and disbursement details' },
    { title: 'Interest & Terms', description: 'Configure loan terms' },
    { title: 'Calculator & Preview', description: 'Review calculations and schedule' },
    { title: 'Additional Details & Review', description: 'Final details and confirmation' }
  ];

  const updateFormData = (updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  // Load loan data on mount
  useEffect(() => {
    loadLoanData();
    loadLoanProducts();
    loadClients();
    loadLoanOfficers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Load loan data to edit
  const loadLoanData = async () => {
    try {
      setLoading(true);
      const response = await loanService.getLoanById(id);
      const loan = response.data || response;
      
      console.log('✅ Loaded loan data for editing:', loan);
      
      // Map backend data to form data
      setFormData({
        clientId: loan.clientId || loan.client?.id || '',
        borrowerName: loan.clientName || loan.client?.fullName || '',
        borrowerPhone: loan.client?.phoneNumber || '',
        borrowerEmail: loan.client?.email || '',
        productId: loan.productId || loan.loanProduct?.id || '',
        loanOfficerId: loan.loanOfficerId || '',
        
        principal: loan.principalAmount || '',
        releaseDate: loan.releaseDate || today,
        disbursedBy: loan.disbursedBy || 'Cash',
        cashBankAccount: loan.cashBankAccount || 'cash_001',
        
        interestMethod: loan.interestMethod || 'flat',
        interestType: loan.interestType || 'percentage',
        interestRate: loan.interestRate || '',
        fixedInterestAmount: loan.fixedInterestAmount || '',
        ratePer: loan.ratePer || 'month',
        loanDuration: loan.loanDuration || '6',
        durationUnit: loan.durationUnit || 'months',
        repaymentFrequency: loan.repaymentFrequency || 'monthly',
        numberOfRepayments: loan.numberOfRepayments || 6,
        gracePeriodDays: loan.gracePeriodDays || 0,
        firstRepaymentDate: loan.firstRepaymentDate || '',
        firstRepaymentAmount: loan.firstRepaymentAmount || '',
        
        processingFee: loan.processingFee || 0,
        lateFee: loan.lateFee || 0,
        defaultFee: loan.defaultFee || 0,
        loanStatus: loan.loanStatus || 'open',
        loanTitle: loan.loanTitle || '',
        description: loan.description || '',
        agreementSigned: loan.agreementSigned || true
      });
      
      // Set selected product if available
      if (loan.productId || loan.loanProduct?.id) {
        const productId = loan.productId || loan.loanProduct?.id;
        const product = loanProducts.find(p => p.id === parseInt(productId));
        if (product) {
          setSelectedProduct(product);
        }
      }
      
    } catch (error) {
      console.error('❌ Error loading loan data:', error);
      showError('Failed to load loan data. Redirecting...');
      setTimeout(() => navigate('/loans'), 2000);
    } finally {
      setLoading(false);
    }
  };

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
    }
  }, [guarantorInfo]);

  const loadLoanProducts = async () => {
    setLoadingProducts(true);
    try {
      const products = await loanService.getAllLoanProducts();
      setLoanProducts(products);
    } catch (error) {
      console.error('❌ Error loading loan products:', error);
      showError('Failed to load loan products.');
    } finally {
      setLoadingProducts(false);
    }
  };

  const loadClients = async () => {
    try {
      const clientList = await loanService.getAllClients();
      setClients(clientList);
    } catch (error) {
      console.error('❌ Error loading clients:', error);
    }
  };

  const loadLoanOfficers = async () => {
    setLoadingLoanOfficers(true);
    try {
      const officers = await loanService.getLoanOfficers();
      setLoanOfficers(officers);
    } catch (error) {
      console.error('❌ Error loading loan officers:', error);
    } finally {
      setLoadingLoanOfficers(false);
    }
  };

  const loadGuarantorInfo = async (clientId) => {
    setLoadingGuarantor(true);
    try {
      const guarantor = await loanService.getClientGuarantor(clientId);
      setGuarantorInfo(guarantor);
    } catch (error) {
      setGuarantorInfo(null);
    } finally {
      setLoadingGuarantor(false);
    }
  };

  const applyProductDefaults = (product) => {
    updateFormData({
      interestRate: product.defaultInterestRate || '',
      interestMethod: product.interestMethod || 'flat',
      interestType: product.interestType || 'percentage',
      ratePer: product.ratePer || 'month',
      repaymentFrequency: product.defaultRepaymentFrequency || 'monthly',
      gracePeriodDays: product.defaultGracePeriodDays || 0,
      lateFee: product.lateFee || 0,
      defaultFee: product.defaultFee || 0,
    });

    if (formData.principal && parseFloat(formData.principal) > 0) {
      const processingFee = loanService.calculateProcessingFeeForProduct(
        parseFloat(formData.principal), 
        product
      );
      updateFormData({ processingFee });
    }
  };

  const handleProductChange = (productId) => {
    const product = loanProducts.find(p => p.id === parseInt(productId));
    setSelectedProduct(product);
    updateFormData({ productId });
  };

  const handleClientChange = (clientId) => {
    const selectedClient = clients.find(client => client.id === parseInt(clientId));
    const borrowerName = selectedClient ? 
      (selectedClient.fullName || `${selectedClient.firstName} ${selectedClient.lastName}`) : '';
    
    updateFormData({ 
      clientId,
      borrowerName,
      borrowerPhone: selectedClient?.phoneNumber || '',
      borrowerEmail: selectedClient?.email || ''
    });
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 1:
        if (!formData.clientId || !formData.clientId.toString().trim()) {
          newErrors.clientId = 'Please select a client';
        }
        if (!formData.productId || !formData.productId.trim()) {
          newErrors.productId = 'Please select a loan product';
        }
        break;
      
      case 2:
        if (!formData.principal || parseFloat(formData.principal) <= 0) {
          newErrors.principal = 'Principal amount is required and must be greater than 0';
        }
        if (!formData.releaseDate?.trim()) newErrors.releaseDate = 'Release date is required';
        break;
        
      case 3:
        if (!formData.interestMethod?.trim()) newErrors.interestMethod = 'Interest method is required';
        if (formData.interestType === 'percentage') {
          if (!formData.interestRate || parseFloat(formData.interestRate) < 0) {
            newErrors.interestRate = 'Interest rate is required and must be 0 or greater';
          }
        }
        if (!formData.loanDuration || parseInt(formData.loanDuration) <= 0) {
          newErrors.loanDuration = 'Loan duration is required and must be greater than 0';
        }
        if (!formData.repaymentFrequency?.trim()) newErrors.repaymentFrequency = 'Repayment frequency is required';
        break;
        
      case 4:
        break;
        
      case 5:
        if (!formData.loanStatus?.trim()) newErrors.loanStatus = 'Loan status is required';
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
      onClientChange: handleClientChange
    };

    switch (currentStep) {
      case 1:
        return <ClientLoanProductStep {...commonProps} />;
      case 2:
        return <PrincipalDisbursementStep {...commonProps} />;
      case 3:
        return <InterestTermsStep {...commonProps} />;
      case 4:
        return <LoanCalculatorStep {...commonProps} />;
      case 5:
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
      const payload = loanService.formatLoanData(formData);
      
      console.log('🚀 Updating loan data:', payload);
      
      await loanService.updateLoan(id, payload);
      
      showSuccess('Loan updated successfully! Redirecting...');
      
      setTimeout(() => {
        try {
          navigate(`/loans/details/${id}`);
        } catch (navError) {
          window.location.href = `/loans/details/${id}`;
        }
      }, 2000);
      
    } catch (error) {
      console.error('Error updating loan:', error);
      
      let errorMessage = error.message || 'An error occurred while updating the loan';
      showError(`Error updating loan: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="stepper-form-layout">
        <Sidebar />
        <main className="stepper-main">
          <div className="loading-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading loan data...</p>
          </div>
        </main>
      </div>
    );
  }

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
              onClick={() => navigate(`/loans/details/${id}`)}
            >
              <ArrowLeft size={20} />
              Back to Loan Details
            </button>
          </div>
          <div className="header-title">
            <h1>Edit Loan</h1>
            <p>Update loan details and configuration</p>
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
                {isSubmitting ? 'Updating Loan...' : 'Update Loan'}
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

export default EditLoan;
