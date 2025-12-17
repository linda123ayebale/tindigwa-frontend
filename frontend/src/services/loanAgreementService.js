import documentGenerationService from './documentGenerationService';
import { loanAgreementTemplate, prepareLoanAgreementData } from '../templates/documentTemplates';

class LoanAgreementService {
  /**
   * Format currency for display
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(amount || 0).replace('UGX', 'USh');
  }

  /**
   * Format date for display
   */
  formatDate(date) {
    if (!date) return new Date().toLocaleDateString('en-GB');
    return new Date(date).toLocaleDateString('en-GB');
  }

  /**
   * Calculate loan metrics
   */
  calculateLoanMetrics(formData, selectedProduct) {
    const principal = parseFloat(formData.principal) || 0;
    const interestRate = (selectedProduct?.defaultInterestRate || 0) / 100;
    const duration = selectedProduct?.maxDuration || formData.loanDuration || 1;
    const unit = selectedProduct?.durationUnit || formData.durationUnit || 'days';
    const frequency = selectedProduct?.defaultRepaymentFrequency || formData.repaymentFrequency || 'daily';

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

    // Calculate number of installments
    let numberOfInstallments = 0;
    switch (frequency) {
      case 'daily':
        numberOfInstallments = totalDays;
        break;
      case 'weekly':
        numberOfInstallments = Math.ceil(totalDays / 7);
        break;
      case 'monthly':
        numberOfInstallments = Math.ceil(totalDays / 30);
        break;
      default:
        numberOfInstallments = totalDays;
    }

    // Calculate interest
    let ratePeriods = 1;
    if (selectedProduct?.ratePer === 'month') {
      if (unit === 'months') {
        ratePeriods = duration;
      } else if (unit === 'days') {
        ratePeriods = duration / 30;
      } else if (unit === 'weeks') {
        ratePeriods = (duration * 7) / 30;
      }
    }

    const totalInterest = principal * interestRate * ratePeriods;
    const processingFee = this.calculateProcessingFee(principal, selectedProduct);
    const registrationFee = this.calculateRegistrationFee(formData, selectedProduct);
    const totalAmount = principal + totalInterest;
    const installmentAmount = numberOfInstallments > 0 ? totalAmount / numberOfInstallments : 0;
    const dailyPayment = totalDays > 0 ? totalAmount / totalDays : 0;

    return {
      principal,
      interestRate: selectedProduct?.defaultInterestRate || 0,
      totalInterest,
      processingFee,
      registrationFee,
      totalAmount,
      numberOfInstallments,
      installmentAmount,
      dailyPayment,
      duration,
      durationUnit: unit,
      totalDays
    };
  }

  calculateProcessingFee(principal, selectedProduct) {
    if (!selectedProduct || !principal) return 0;
    const rate = selectedProduct.processingFeeValue;
    
    if (rate < 1) {
      return principal * rate;
    } else {
      return principal * (rate / 100);
    }
  }

  calculateRegistrationFee(formData, selectedProduct) {
    if (formData.isFirstTimeClient === false) return 0;
    if (!selectedProduct || !selectedProduct.registrationFeeTiers || !formData.principal) return 0;
    
    const principal = parseFloat(formData.principal);
    for (const tier of selectedProduct.registrationFeeTiers) {
      if (principal >= tier.minAmount && principal <= tier.maxAmount) {
        return tier.fee;
      }
    }
    return 0;
  }

  /**
   * Generate PDF Loan Agreement using reusable service
   */
  async generatePDF(formData, selectedProduct) {
    const metrics = this.calculateLoanMetrics(formData, selectedProduct);
    const data = prepareLoanAgreementData(formData, selectedProduct, metrics);
    
    return await documentGenerationService.generatePDF(loanAgreementTemplate, data);
  }

  /**
   * Generate DOCX Loan Agreement using reusable service
   */
  async generateDOCX(formData, selectedProduct) {
    const metrics = this.calculateLoanMetrics(formData, selectedProduct);
    const data = prepareLoanAgreementData(formData, selectedProduct, metrics);
    
    return await documentGenerationService.generateDOCX(loanAgreementTemplate, data);
  }
}

export default new LoanAgreementService();
