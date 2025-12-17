import React, { useState } from 'react';
import { 
  DollarSign,
  Check,
  AlertTriangle,
  FileText,
  Download
} from 'lucide-react';
import loanAgreementService from '../../services/loanAgreementService';
import '../ClientSteps/StepStyles.css';

const AdditionalDetailsReviewStep = ({ formData, updateFormData, errors = {}, selectedProduct, showSuccess, showError }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleCheckboxChange = (name) => {
    updateFormData({ [name]: !formData[name] });
  };


  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(amount || 0).replace('UGX', 'USh');
  };

  // Calculate fees from loan product
  const calculateProcessingFee = () => {
    if (!selectedProduct || !formData.principal) return 0;
    const principal = parseFloat(formData.principal);
    const rate = selectedProduct.processingFeeValue;
    
    // Handle both percentage (4 = 4%) and decimal (0.04 = 4%) formats
    // If rate is less than 1, assume it's already a decimal (0.04)
    // If rate is >= 1, assume it's a percentage (4)
    let fee;
    if (rate < 1) {
      // Already in decimal format (e.g., 0.04 for 4%)
      fee = principal * rate;
    } else {
      // In percentage format (e.g., 4 for 4%)
      fee = principal * (rate / 100);
    }
    
    console.log('Processing Fee Calculation:', {
      principal,
      rate,
      isDecimal: rate < 1,
      calculation: rate < 1 ? `${principal} × ${rate}` : `${principal} × (${rate} / 100)`,
      result: fee
    });
    
    return fee;
  };

  const calculateRegistrationFee = () => {
    console.log('Registration Fee Calculation:', {
      isFirstTimeClient: formData.isFirstTimeClient,
      clientLoanCount: formData.clientLoanCount,
      hasProduct: !!selectedProduct,
      hasTiers: !!selectedProduct?.registrationFeeTiers,
      principal: formData.principal
    });

    // Only waive if client is EXPLICITLY a returning borrower (false)
    // If null/undefined, calculate the fee (first-time or unknown)
    if (formData.isFirstTimeClient === false) {
      console.log('Registration fee waived - returning client');
      return 0;
    }
    
    if (!selectedProduct || !selectedProduct.registrationFeeTiers || !formData.principal) {
      console.log('Registration fee = 0 - missing product/tiers/principal');
      return 0;
    }
    
    const principal = parseFloat(formData.principal);
    for (const tier of selectedProduct.registrationFeeTiers) {
      if (principal >= tier.minAmount && principal <= tier.maxAmount) {
        console.log('Registration fee found:', tier.fee, 'for tier:', tier);
        return tier.fee;
      }
    }
    
    console.log('Registration fee = 0 - no matching tier found for principal:', principal);
    return 0;
  };

  // Calculate number of installments
  const calculateNumberOfInstallments = () => {
    if (!selectedProduct) return 0;
    
    const duration = selectedProduct.maxDuration || selectedProduct.minDuration || 1;
    const frequency = selectedProduct.defaultRepaymentFrequency;
    const unit = selectedProduct.durationUnit;
    
    // Calculate based on frequency and duration unit
    if (frequency === 'monthly') {
      if (unit === 'months') return duration;
      if (unit === 'days') return Math.ceil(duration / 30);
      if (unit === 'weeks') return Math.ceil(duration / 4);
    } else if (frequency === 'daily') {
      if (unit === 'days') return duration;
      if (unit === 'months') return duration * 30;
      if (unit === 'weeks') return duration * 7;
    } else if (frequency === 'weekly') {
      if (unit === 'weeks') return duration;
      if (unit === 'days') return Math.ceil(duration / 7);
      if (unit === 'months') return Math.ceil(duration * 4);
    }
    
    return duration; // fallback
  };

  // Calculate installment amount
  const calculateInstallmentAmount = () => {
    if (!formData.principal || !selectedProduct) return 0;
    
    const principal = parseFloat(formData.principal);
    const interestRate = selectedProduct.defaultInterestRate / 100; // 25% = 0.25
    const numberOfInstallments = calculateNumberOfInstallments();
    
    if (numberOfInstallments === 0) return 0;
    
    // For flat rate: Total Interest = Principal × Rate × Duration (in rate periods)
    // If rate is "per month" and duration is 3 months, total interest = principal × 0.25 × 3
    let ratePeriods = 1;
    if (selectedProduct.ratePer === 'month') {
      const duration = selectedProduct.maxDuration || selectedProduct.minDuration || 1;
      if (selectedProduct.durationUnit === 'months') {
        ratePeriods = duration;
      } else if (selectedProduct.durationUnit === 'days') {
        ratePeriods = duration / 30;
      }
    }
    
    const totalInterest = principal * interestRate * ratePeriods;
    const totalAmount = principal + totalInterest;
    
    return totalAmount / numberOfInstallments;
  };

  // Calculate daily payment amount (for any repayment frequency)
  const calculateDailyPayment = () => {
    if (!formData.principal || !selectedProduct) return 0;
    
    const principal = parseFloat(formData.principal);
    const interestRate = selectedProduct.defaultInterestRate / 100;
    const duration = selectedProduct.maxDuration || selectedProduct.minDuration || 1;
    const unit = selectedProduct.durationUnit;
    
    // Convert duration to days
    let totalDays = 0;
    switch (unit) {
      case 'days':
        totalDays = duration;
        break;
      case 'weeks':
        totalDays = duration * 7;
        break;
      case 'months':
        totalDays = duration * 30;
        break;
      case 'years':
        totalDays = duration * 365;
        break;
      default:
        totalDays = duration;
    }
    
    // Calculate total interest based on rate period
    let ratePeriods = 1;
    if (selectedProduct.ratePer === 'month') {
      if (unit === 'months') {
        ratePeriods = duration;
      } else if (unit === 'days') {
        ratePeriods = duration / 30;
      } else if (unit === 'weeks') {
        ratePeriods = (duration * 7) / 30;
      }
    }
    
    const totalInterest = principal * interestRate * ratePeriods;
    const totalAmount = principal + totalInterest;
    
    // Divide by total days
    return totalDays > 0 ? totalAmount / totalDays : 0;
  };

  // Generate PDF Loan Agreement
  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    try {
      console.log('Starting PDF generation...');
      console.log('FormData:', formData);
      console.log('SelectedProduct:', selectedProduct);
      await loanAgreementService.generatePDF(formData, selectedProduct);
      
      if (showSuccess) {
        showSuccess('Loan Agreement PDF generated successfully!', { 
          title: 'Success',
          autoClose: 3000 
        });
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      console.error('Error stack:', error.stack);
      console.error('Error message:', error.message);
      
      if (showError) {
        showError(`Failed to generate PDF: ${error.message}`, { 
          title: 'Export Failed' 
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate DOCX Loan Agreement
  const handleGenerateDOCX = async () => {
    setIsGenerating(true);
    try {
      console.log('Starting DOCX generation...');
      console.log('FormData:', formData);
      console.log('SelectedProduct:', selectedProduct);
      await loanAgreementService.generateDOCX(formData, selectedProduct);
      
      if (showSuccess) {
        showSuccess('Loan Agreement Word document generated successfully!', { 
          title: 'Success',
          autoClose: 3000 
        });
      }
    } catch (error) {
      console.error('Error generating DOCX:', error);
      console.error('Error stack:', error.stack);
      console.error('Error message:', error.message);
      
      if (showError) {
        showError(`Failed to generate Word document: ${error.message}`, { 
          title: 'Export Failed' 
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="step-container">
      <div className="step-header">
        <h2>Final Review & Confirmation</h2>
        <p>Review all loan details and confirm to submit the application</p>
        
        {/* Document Export Buttons */}
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          marginTop: '20px',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <button
            type="button"
            onClick={handleGeneratePDF}
            disabled={isGenerating}
            className="nav-button submit"
            style={{
              backgroundColor: '#dc3545',
              borderColor: '#dc3545',
              opacity: isGenerating ? 0.6 : 1,
              cursor: isGenerating ? 'not-allowed' : 'pointer'
            }}
          >
            <FileText size={18} />
            {isGenerating ? 'Generating...' : 'Export as PDF'}
          </button>
          <button
            type="button"
            onClick={handleGenerateDOCX}
            disabled={isGenerating}
            className="nav-button primary"
            style={{
              backgroundColor: '#2b579a',
              borderColor: '#2b579a',
              opacity: isGenerating ? 0.6 : 1,
              cursor: isGenerating ? 'not-allowed' : 'pointer'
            }}
          >
            <Download size={18} />
            {isGenerating ? 'Generating...' : 'Export as Word'}
          </button>
        </div>
        <p style={{ 
          textAlign: 'center', 
          marginTop: '10px', 
          fontSize: '0.9em', 
          color: '#666' 
        }}>
          Generate professional loan agreement documents with all terms and conditions
        </p>
      </div>

      <div className="step-form">
        {/* Loan Fees Section - Read Only from Product */}
        <div className="form-section">
          <h3 className="section-title">
            <DollarSign size={18} style={{ display: 'inline', marginRight: '8px' }} />
            Loan Fees (From Loan Product)
          </h3>
          
          <div className="info-card" style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="info-row">
                <label className="form-label" style={{ fontWeight: '600', color: '#666', marginBottom: '8px', display: 'block' }}>
                  Registration Fee
                  <span className="fee-type-badge upfront" style={{ marginLeft: '8px', backgroundColor: '#28a745', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75em' }}>Upfront</span>
                </label>
                <div className="fee-value" style={{ fontSize: '1.2em', fontWeight: '700', color: '#333' }}>
                  {formatCurrency(calculateRegistrationFee())}
                </div>
                <div className="input-helper" style={{ marginTop: '4px', fontSize: '0.85em', color: '#666' }}>
                  {formData.isFirstTimeClient === false
                    ? 'Registration Fee Waived (Returning Client)'
                    : 'Charged once for first-time borrowers based on principal amount tier'}
                </div>
              </div>

              <div className="info-row">
                <label className="form-label" style={{ fontWeight: '600', color: '#666', marginBottom: '8px', display: 'block' }}>
                  Processing Fee
                  <span className="fee-type-badge upfront" style={{ marginLeft: '8px', backgroundColor: '#28a745', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75em' }}>Upfront</span>
                </label>
                <div className="fee-value" style={{ fontSize: '1.2em', fontWeight: '700', color: '#333' }}>
                  {formatCurrency(calculateProcessingFee())}
                </div>
                <div className="input-helper" style={{ marginTop: '4px', fontSize: '0.85em', color: '#666' }}>
                  {selectedProduct?.processingFeeValue 
                    ? `${selectedProduct.processingFeeValue < 1 ? (selectedProduct.processingFeeValue * 100) : selectedProduct.processingFeeValue}% of principal amount`
                    : 'Based on product configuration'}
                </div>
              </div>

              <div className="info-row">
                <label className="form-label" style={{ fontWeight: '600', color: '#666', marginBottom: '8px', display: 'block' }}>
                  Penalty Rate
                  <span className="fee-type-badge penalty" style={{ marginLeft: '8px', backgroundColor: '#dc3545', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75em' }}>Conditional</span>
                </label>
                <div className="fee-value" style={{ fontSize: '1.2em', fontWeight: '700', color: '#333' }}>
                  {selectedProduct?.penaltyRate || 0}% per day
                </div>
                <div className="input-helper" style={{ marginTop: '4px', fontSize: '0.85em', color: '#666' }}>
                  Applied on reducing balance after grace period
                </div>
              </div>

              <div className="info-row">
                <label className="form-label" style={{ fontWeight: '600', color: '#666', marginBottom: '8px', display: 'block' }}>
                  Grace Period
                  <span className="fee-type-badge" style={{ marginLeft: '8px', backgroundColor: '#6c757d', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75em' }}>Info</span>
                </label>
                <div className="fee-value" style={{ fontSize: '1.2em', fontWeight: '700', color: '#333' }}>
                  {selectedProduct?.defaultGracePeriodDays || 0} days
                </div>
                <div className="input-helper" style={{ marginTop: '4px', fontSize: '0.85em', color: '#666' }}>
                  Days before penalties apply
                </div>
              </div>
            </div>
            
            <div className="fee-summary" style={{ marginTop: '20px', padding: '16px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #dee2e6' }}>
              <div className="summary-header" style={{ marginBottom: '12px', fontWeight: '600', color: '#333' }}>Total Upfront Fees</div>
              <div className="summary-amount" style={{ fontSize: '1.5em', fontWeight: '700', color: '#28a745' }}>
                {formatCurrency(Number(calculateRegistrationFee()) + Number(calculateProcessingFee()))}
              </div>
              <div className="summary-note" style={{ marginTop: '8px', fontSize: '0.85em', color: '#666' }}>
                * Penalty fees will only apply if payment is late or loan defaults
              </div>
            </div>
          </div>
        </div>

        {/* Loan Status, Title, and Description removed - not needed at registration */}


        {/* Final Review Section */}
        <div className="final-review">
          <h3>Final Review</h3>
          <div className="review-sections">
            {/* Client Information */}
            <div className="review-section">
              <h4>Client Information</h4>
              <div className="review-grid">
                <div className="review-item">
                  <span className="review-label">Borrower:</span>
                  <span className="review-value">{formData.borrowerName || 'Not selected'}</span>
                </div>
                {formData.borrowerPhone && (
                  <div className="review-item">
                    <span className="review-label">Phone:</span>
                    <span className="review-value">{formData.borrowerPhone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Guarantor Information */}
            {formData.clientId && (
              <div className="review-section">
                <h4>Guarantor Information</h4>
                <div className="review-grid">
                  <div className="review-item">
                    <span className="review-label">Guarantor Name:</span>
                    <span className="review-value">
                      {formData.guarantorName || 'Loading...'}
                    </span>
                  </div>
                  <div className="review-item">
                    <span className="review-label">Phone Number:</span>
                    <span className="review-value">
                      {formData.guarantorPhone || 'N/A'}
                    </span>
                  </div>
                  <div className="review-item">
                    <span className="review-label">Relationship:</span>
                    <span className="review-value">
                      {formData.guarantorRelationship || 'N/A'}
                    </span>
                  </div>
                  <div className="review-item">
                    <span className="review-label">Address:</span>
                    <span className="review-value">
                      {formData.guarantorAddress || 'Address not provided'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Loan Details - Expanded with all loan information */}
            <div className="review-section">
              <h4>Loan Details</h4>
              <div className="review-grid">
                <div className="review-item">
                  <span className="review-label">Principal Amount:</span>
                  <span className="review-value">{formatCurrency(formData.principal)}</span>
                </div>
                <div className="review-item">
                  <span className="review-label">Interest Rate:</span>
                  <span className="review-value">
                    {selectedProduct?.defaultInterestRate || formData.interestRate || 0}% per {selectedProduct?.ratePer || formData.ratePer || 'month'}
                  </span>
                </div>
                <div className="review-item">
                  <span className="review-label">Interest Method:</span>
                  <span className="review-value" style={{ textTransform: 'capitalize' }}>
                    {selectedProduct?.interestMethod === 'reducing' ? 'Reducing Balance' : 
                     selectedProduct?.interestMethod === 'reducing_equal_installments' ? 'Reducing - Equal Installments' :
                     selectedProduct?.interestMethod === 'flat' ? 'Flat Rate' :
                     selectedProduct?.interestMethod || 'N/A'}
                  </span>
                </div>
                <div className="review-item">
                  <span className="review-label">Processing Fee:</span>
                  <span className="review-value">{formatCurrency(calculateProcessingFee())}</span>
                </div>
                <div className="review-item">
                  <span className="review-label">Duration:</span>
                  <span className="review-value">{selectedProduct?.maxDuration || formData.loanDuration || 0} {selectedProduct?.durationUnit || formData.durationUnit || 'days'}</span>
                </div>
                <div className="review-item">
                  <span className="review-label">Repayment Frequency:</span>
                  <span className="review-value" style={{ textTransform: 'capitalize' }}>
                    {selectedProduct?.defaultRepaymentFrequency || formData.repaymentFrequency || 'Monthly'}
                  </span>
                </div>
                <div className="review-item">
                  <span className="review-label">Number of Installments:</span>
                  <span className="review-value">{calculateNumberOfInstallments()}</span>
                </div>
                <div className="review-item">
                  <span className="review-label">Amount per Installment:</span>
                  <span className="review-value">{formatCurrency(calculateInstallmentAmount())}</span>
                </div>
                <div className="review-item">
                  <span className="review-label">Daily Payment Amount:</span>
                  <span className="review-value">
                    {formatCurrency(calculateDailyPayment())}
                    <span style={{ fontSize: '0.85em', color: '#666', marginLeft: '8px' }}>per day</span>
                  </span>
                </div>
                <div className="review-item">
                  <span className="review-label">Status:</span>
                  <span className="review-value">Pending Approval</span>
                </div>
              </div>
            </div>

          </div>

          {/* Stylish Confirmation Section */}
          <div className="confirmation-section">
            <div className="confirmation-card">
              <div className="confirmation-header">
                <div className="confirmation-icon">
                  <Check size={24} />
                </div>
                <h4>Final Confirmation Required</h4>
              </div>
              
              <div className="confirmation-content">
                <p>Please review all information above and confirm to proceed with loan creation.</p>
                
                <label className="stylish-checkbox">
                  <input
                    type="checkbox"
                    name="agreementSigned"
                    checked={formData.agreementSigned || false}
                    onChange={() => handleCheckboxChange('agreementSigned')}
                    className="checkbox-input"
                  />
                  <span className="checkbox-custom"></span>
                  <span className="checkbox-text">
                    I confirm that the loan agreement has been signed and all details are accurate
                    <span className="required">*</span>
                  </span>
                </label>
                
                {errors.agreementSigned && (
                  <div className="error-notification">
                    <AlertTriangle size={16} />
                    <span>{errors.agreementSigned}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Validation Message */}
            {!formData.agreementSigned && (
              <div className="validation-notification">
                <div className="notification-content">
                  <AlertTriangle size={20} />
                  <div className="notification-text">
                    <strong>Action Required</strong>
                    <p>Please confirm the loan agreement above to enable submission.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdditionalDetailsReviewStep;
