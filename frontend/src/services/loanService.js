import ApiService from './api';

class LoanService {
  constructor() {
    this.basePath = '/loans';
  }

  // Get all loans
  async getAllLoans() {
    try {
      return await ApiService.get(this.basePath);
    } catch (error) {
      console.error('Error fetching loans:', error);
      throw error;
    }
  }

  // Get loan by ID
  async getLoanById(id) {
    try {
      return await ApiService.get(`${this.basePath}/${id}`);
    } catch (error) {
      console.error(`Error fetching loan ${id}:`, error);
      throw error;
    }
  }

  // Get loans by branch
  async getLoansByBranch(branch) {
    try {
      return await ApiService.get(`${this.basePath}/branch/${branch}`);
    } catch (error) {
      console.error(`Error fetching loans for branch ${branch}:`, error);
      throw error;
    }
  }

  // Create new loan
  async createLoan(loanData) {
    try {
      return await ApiService.post(this.basePath, loanData);
    } catch (error) {
      console.error('Error creating loan:', error);
      throw error;
    }
  }

  // Update existing loan
  async updateLoan(id, loanData) {
    try {
      return await ApiService.put(`${this.basePath}/${id}`, loanData);
    } catch (error) {
      console.error(`Error updating loan ${id}:`, error);
      throw error;
    }
  }

  // Calculate loan details
  calculateLoanDetails(principal, interestRate, durationDays, processingFee = 0) {
    const interest = (principal * interestRate * durationDays) / (365 * 100);
    const totalPayable = principal + interest + processingFee;
    
    return {
      principal,
      interest: Math.round(interest * 100) / 100,
      processingFee,
      totalPayable: Math.round(totalPayable * 100) / 100
    };
  }

  // Calculate payment schedule
  calculatePaymentSchedule(totalAmount, frequency, durationDays) {
    let numberOfPayments;
    let paymentInterval;

    switch (frequency.toLowerCase()) {
      case 'daily':
        numberOfPayments = durationDays;
        paymentInterval = 1;
        break;
      case 'weekly':
        numberOfPayments = Math.ceil(durationDays / 7);
        paymentInterval = 7;
        break;
      case 'monthly':
        numberOfPayments = Math.ceil(durationDays / 30);
        paymentInterval = 30;
        break;
      default:
        numberOfPayments = 1;
        paymentInterval = durationDays;
    }

    const paymentAmount = Math.round((totalAmount / numberOfPayments) * 100) / 100;
    
    return {
      numberOfPayments,
      paymentAmount,
      paymentInterval,
      frequency
    };
  }

  // Validate loan data
  validateLoanData(loanData) {
    const required = ['clientId', 'lendingBranch', 'amountDisbursed', 'loanDurationDays', 'interestRate'];
    const missing = required.filter(field => !loanData[field]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }

    // Amount validation
    if (loanData.amountDisbursed <= 0) {
      throw new Error('Loan amount must be greater than 0');
    }

    // Duration validation
    if (loanData.loanDurationDays <= 0) {
      throw new Error('Loan duration must be greater than 0 days');
    }

    // Interest rate validation
    if (loanData.interestRate < 0 || loanData.interestRate > 100) {
      throw new Error('Interest rate must be between 0 and 100 percent');
    }

    return true;
  }

  // Format loan data for API
  formatLoanData(formData) {
    return {
      clientId: parseInt(formData.clientId),
      lendingBranch: formData.lendingBranch?.trim(),
      amountDisbursed: parseFloat(formData.amountDisbursed),
      loanDurationDays: parseInt(formData.loanDurationDays),
      repaymentFrequency: formData.repaymentFrequency?.trim() || 'monthly',
      paymentStartDate: formData.paymentStartDate,
      paymentEndDate: formData.paymentEndDate,
      interestRate: parseFloat(formData.interestRate),
      totalPayable: parseFloat(formData.totalPayable),
      loanProcessingFee: parseFloat(formData.loanProcessingFee) || 0,
      agreementSigned: Boolean(formData.agreementSigned)
    };
  }

  // Get loan status based on dates and payments
  getLoanStatus(loan, payments = []) {
    const now = new Date();
    const startDate = new Date(loan.paymentStartDate);
    const endDate = new Date(loan.paymentEndDate);

    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const remainingBalance = loan.totalPayable - totalPaid;

    if (remainingBalance <= 0) {
      return 'PAID';
    } else if (now > endDate) {
      return 'OVERDUE';
    } else if (now >= startDate) {
      return 'ACTIVE';
    } else {
      return 'PENDING';
    }
  }
}

export default new LoanService();
