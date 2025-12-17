import ApiService from './api';

class LoanService {
  constructor() {
    this.basePath = '/loans';
  }

  // Get all approved loans (main loans list)
  async getAllLoans() {
    try {
      return await ApiService.get(`${this.basePath}/table-view`);
    } catch (error) {
      console.error('Error fetching loans:', error);
      throw error;
    }
  }

  // Get all loans for admin (regardless of status)
  async getAllLoansForAdmin() {
    try {
      return await ApiService.get(`${this.basePath}/admin/table-view`);
    } catch (error) {
      console.error('Error fetching all loans:', error);
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
  
  // Get complete loan details with all related data (client, officer, tracking, payments, workflow)
  async getCompleteLoan(id) {
    try {
      console.log(`🔍 Fetching complete loan details for ID: ${id}`);
      const response = await ApiService.get(`${this.basePath}/${id}/complete`);
      console.log('✅ Complete loan data received:', response);
      return response;
    } catch (error) {
      console.error(`❌ Error fetching complete loan ${id}:`, error);
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

  // Create new loan using legacy endpoint (no loan officer required)
  async createLoan(loanData, loanOfficerId) {
    try {
      // Use legacy endpoint which handles loan officer assignment automatically
      return await ApiService.post(`${this.basePath}/legacy`, loanData);
    } catch (error) {
      console.error('Error creating loan:', error);
      throw error;
    }
  }
  
  // Legacy method for backward compatibility
  async createLoanLegacy(loanData) {
    return this.createLoan(loanData, 1); // Use default officer ID
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

  // Helper method to calculate duration in days
  calculateDurationInDays(duration, unit) {
    const durationNum = parseInt(duration) || 0;
    switch (unit?.toLowerCase()) {
      case 'days':
        return durationNum;
      case 'weeks':
        return durationNum * 7;
      case 'months':
        return durationNum * 30;
      case 'years':
        return durationNum * 365;
      default:
        return durationNum * 30; // Default to months
    }
  }

  // Format loan data for new API structure (exclude loanOfficerId - it's handled separately)
  formatLoanData(formData) {
    return {
      // CLIENT & PRODUCT RELATIONSHIPS
      clientId: parseInt(formData.clientId) || 1, // TODO: Get from actual client selection
      productId: formData.productId ? parseInt(formData.productId) : null,
      
      // LOAN IDENTIFICATION (loanNumber auto-generated by backend)
      loanTitle: formData.loanTitle || null,
      description: formData.description || null,
      
      // AMOUNTS & DISBURSEMENT  
      principalAmount: parseFloat(formData.principal) || parseFloat(formData.amountDisbursed) || 0,
      releaseDate: formData.releaseDate || formData.disbursementDate || null,
      disbursedBy: formData.disbursedBy || 'Cash',
      cashBankAccount: formData.cashBankAccount || null,
      
      // INTEREST & TERMS CONFIGURATION
      interestMethod: formData.interestMethod || 'flat',
      interestType: formData.interestType || 'percentage',
      interestRate: parseFloat(formData.interestRate) || 0,
      fixedInterestAmount: formData.interestType === 'fixed' ? parseFloat(formData.fixedInterestAmount) : null,
      ratePer: formData.ratePer || 'month',
      
      // LOAN DURATION
      loanDuration: parseInt(formData.loanDuration) || 0,
      durationUnit: formData.durationUnit || 'months',
      loanDurationDays: parseInt(formData.loanDurationDays) || this.calculateDurationInDays(formData.loanDuration, formData.durationUnit),
      
      // REPAYMENT CONFIGURATION
      repaymentFrequency: formData.repaymentFrequency?.trim() || 'monthly',
      numberOfRepayments: parseInt(formData.numberOfRepayments) || 0,
      gracePeriodDays: parseInt(formData.gracePeriodDays) || 0,
      
      // PAYMENT DATES
      paymentStartDate: formData.paymentStartDate || null,
      firstRepaymentDate: formData.firstRepaymentDate || null,
      firstRepaymentAmount: formData.firstRepaymentAmount ? parseFloat(formData.firstRepaymentAmount) : null,
      
      // FEES & CHARGES
      processingFee: parseFloat(formData.processingFee) || parseFloat(formData.loanProcessingFee) || 0,
      lateFee: parseFloat(formData.lateFee) || 0,
      defaultFee: parseFloat(formData.defaultFee) || 0,
      
      // STATUS & BRANCH
      loanStatus: formData.loanStatus || 'pending',
      lendingBranch: formData.lendingBranch?.trim() || 'Main Branch - Kampala',
      
      // AGREEMENTS & APPROVALS
      agreementSigned: Boolean(formData.agreementSigned),
      
      // SYSTEM FIELDS
      createdBy: 'Frontend User' // TODO: Get from logged in user
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

  // ========================
  // LOAN PRODUCT METHODS
  // ========================

  // Get all loan products
  async getAllLoanProducts(activeOnly = true) {
    try {
      const url = `/loan-products${activeOnly ? '?activeOnly=true' : ''}`;
      return await ApiService.get(url);
    } catch (error) {
      console.error('Error fetching loan products:', error);
      throw error;
    }
  }

  // Get loan product by ID
  async getLoanProductById(id) {
    try {
      return await ApiService.get(`/loan-products/${id}`);
    } catch (error) {
      console.error(`Error fetching loan product ${id}:`, error);
      throw error;
    }
  }

  // Get loan product by code
  async getLoanProductByCode(code) {
    try {
      return await ApiService.get(`/loan-products/code/${code}`);
    } catch (error) {
      console.error(`Error fetching loan product ${code}:`, error);
      throw error;
    }
  }

  // Search loan products by name
  async searchLoanProducts(name) {
    try {
      return await ApiService.get(`/loan-products/search?name=${encodeURIComponent(name)}`);
    } catch (error) {
      console.error('Error searching loan products:', error);
      throw error;
    }
  }

  // Get products suitable for amount
  async getLoanProductsForAmount(amount) {
    try {
      return await ApiService.get(`/loan-products/suitable-for-amount?amount=${amount}`);
    } catch (error) {
      console.error('Error fetching products for amount:', error);
      throw error;
    }
  }

  // ========================
  // CLIENT & GUARANTOR METHODS
  // ========================

  // Get guarantor information for a client
  async getClientGuarantor(clientId) {
    try {
      return await ApiService.get(`/clients/${clientId}/guarantor`);
    } catch (error) {
      console.error(`Error fetching guarantor for client ${clientId}:`, error);
      throw error;
    }
  }

  // Get all clients (for client selection)
  async getAllClients() {
    try {
      return await ApiService.get('/clients');
    } catch (error) {
      console.error('Error fetching clients:', error);
      throw error;
    }
  }

  // Get all loan officers (for loan officer selection)
  async getLoanOfficers() {
    try {
      return await ApiService.get('/users/loan-officers');
    } catch (error) {
      console.error('Error fetching loan officers:', error);
      throw error;
    }
  }

  // ========================
  // VALIDATION HELPERS
  // ========================

  // Validate loan data against product constraints - DISABLED
  // This validation has been disabled to allow flexible loan terms
  validateLoanAgainstProduct(loanData, product) {
    // Return empty errors array to bypass all product constraints
    return [];
    
    /* COMMENTED OUT - Original validation logic:
    const errors = [];

    // Amount validation
    if (loanData.principalAmount < product.minAmount) {
      errors.push(`Loan amount must be at least ${product.minAmount.toLocaleString()}`);
    }
    if (loanData.principalAmount > product.maxAmount) {
      errors.push(`Loan amount cannot exceed ${product.maxAmount.toLocaleString()}`);
    }

    // Duration validation
    if (loanData.loanDuration < product.minDuration) {
      errors.push(`Loan duration must be at least ${product.minDuration} ${product.durationUnit}`);
    }
    if (loanData.loanDuration > product.maxDuration) {
      errors.push(`Loan duration cannot exceed ${product.maxDuration} ${product.durationUnit}`);
    }

    // Repayment frequency validation - REMOVED to allow all frequencies
    // Allow any repayment frequency (daily, weekly, monthly, etc.)
    // if (!product.allowedRepaymentFrequencies.includes(loanData.repaymentFrequency)) {
    //   errors.push(`Repayment frequency '${loanData.repaymentFrequency}' is not allowed for this product`);
    // }

    return errors;
    */
  }

  // Calculate processing fee based on product
  calculateProcessingFeeForProduct(amount, product) {
    if (!product) return 0;
    
    if (product.processingFeeType === 'percentage') {
      return amount * (product.processingFeeValue / 100);
    } else {
      return product.processingFeeValue;
    }
  }
  // ========================
  // WORKFLOW METHODS
  // ========================
  
  // Get loans pending approval (for cashiers)
  async getLoansPendingApproval() {
    try {
      const response = await ApiService.get(`${this.basePath}/pending-approval`);
      const data = Array.isArray(response) ? response : [];
      console.log(`✅ Found ${data.length} pending loans`);
      return { data };
    } catch (error) {
      console.error('Error fetching pending loans:', error);
      return { data: [] };
    }
  }
  
  // Get rejected loans - uses dedicated /rejected endpoint for instant loading
  async getRejectedLoans() {
    try {
      console.log('🔍 Fetching rejected loans from /rejected endpoint...');
      const response = await ApiService.get(`${this.basePath}/rejected`);
      const data = Array.isArray(response) ? response : [];
      console.log(`✅ Found ${data.length} rejected loans`);
      return { data };
    } catch (error) {
      console.error('❌ Error fetching rejected loans:', error);
      return { data: [] };
    }
  }
  
  // Get approved loans
  async getApprovedLoans() {
    try {
      console.log('🔍 Fetching approved loans...');
      const response = await ApiService.get(`${this.basePath}`);
      const data = Array.isArray(response) ? response : [];
      console.log(`✅ Found ${data.length} approved loans`);
      return { data };
    } catch (error) {
      console.error('❌ Error fetching approved loans:', error);
      return { data: [] };
    }
  }
  
  // Get loans created by a specific loan officer
  async getLoansByCreator(loanOfficerId) {
    try {
      return await ApiService.get(`${this.basePath}/created-by/${loanOfficerId}`);
    } catch (error) {
      console.error(`Error fetching loans by creator ${loanOfficerId}:`, error);
      throw error;
    }
  }
  
  // Get loans processed by a specific cashier
  async getLoansProcessedBy(cashierId) {
    try {
      return await ApiService.get(`${this.basePath}/processed-by/${cashierId}`);
    } catch (error) {
      console.error(`Error fetching loans processed by ${cashierId}:`, error);
      throw error;
    }
  }
  
  // Approve a loan
  async approveLoan(loanId, userId) {
    try {
      return await ApiService.post(`${this.basePath}/${loanId}/approve`, { approvedBy: userId });
    } catch (error) {
      console.error(`Error approving loan ${loanId}:`, error);
      throw error;
    }
  }
  
  // Reject a loan
  async rejectLoan(loanId, userId, reason) {
    try {
      return await ApiService.post(`${this.basePath}/${loanId}/reject`, { rejectedBy: userId, reason });
    } catch (error) {
      console.error(`Error rejecting loan ${loanId}:`, error);
      throw error;
    }
  }
  
  // Disburse a loan
  async disburseLoan(loanId, userId) {
    try {
      return await ApiService.post(`${this.basePath}/${loanId}/disburse`, { disbursedBy: userId });
    } catch (error) {
      console.error(`Error disbursing loan ${loanId}:`, error);
      throw error;
    }
  }
  
  // Add payment to a loan
  async addPayment(loanId, paymentData) {
    try {
      return await ApiService.post('/payments', paymentData);
    } catch (error) {
      console.error(`Error adding payment for loan ${loanId}:`, error);
      throw error;
    }
  }
  
  // Delete a loan (only for REJECTED loans)
  async deleteLoan(loanId) {
    try {
      console.log(`🗑️ Deleting loan ${loanId}`);
      return await ApiService.delete(`${this.basePath}/${loanId}`);
    } catch (error) {
      console.error(`❌ Error deleting loan ${loanId}:`, error);
      throw error;
    }
  }
  
  // Archive a loan (only for COMPLETED loans)
  async archiveLoan(loanId) {
    try {
      console.log(`📦 Archiving loan ${loanId}`);
      return await ApiService.post(`${this.basePath}/${loanId}/archive`);
    } catch (error) {
      console.error(`❌ Error archiving loan ${loanId}:`, error);
      throw error;
    }
  }
  
  // Get archived loans
  async getArchivedLoans() {
    try {
      console.log('📂 Fetching archived loans');
      return await ApiService.get(`${this.basePath}/archived`);
    } catch (error) {
      console.error('❌ Error fetching archived loans:', error);
      throw error;
    }
  }
  
  // Unarchive a loan (restore to active loans)
  async unarchiveLoan(loanId) {
    try {
      console.log(`🔄 Unarchiving loan ${loanId}`);
      return await ApiService.post(`${this.basePath}/${loanId}/unarchive`);
    } catch (error) {
      console.error(`❌ Error unarchiving loan ${loanId}:`, error);
      throw error;
    }
  }
  
  // Get workflow summary for a loan
  async getWorkflowSummary(loanId) {
    try {
      return await ApiService.get(`${this.basePath}/${loanId}/workflow`);
    } catch (error) {
      console.error(`Error fetching workflow summary for loan ${loanId}:`, error);
      throw error;
    }
  }
  
  // Check if user can modify a loan
  async canModifyLoan(loanId, userId) {
    try {
      const response = await ApiService.get(`${this.basePath}/${loanId}/can-modify/${userId}`);
      return response;
    } catch (error) {
      console.error(`Error checking modify permission for loan ${loanId}:`, error);
      return false;
    }
  }
  
  // Check if client is a first-time borrower (for registration fee calculation)
  async isClientFirstTimeBorrower(clientId) {
    try {
      const response = await ApiService.get(`${this.basePath}/client/${clientId}/is-first-time`);
      return response; // { clientId, isFirstTime, loanCount, message }
    } catch (error) {
      console.error(`Error checking first-time borrower status for client ${clientId}:`, error);
      // Conservative default: treat as returning client to avoid overcharging unexpectedly
      return { clientId, isFirstTime: false, loanCount: 1 };
    }
  }

  // Get workflow status display info
  getWorkflowStatusInfo(workflowStatus) {
    const statusMap = {
      'PENDING_APPROVAL': {
        label: 'Pending Approval',
        color: 'warning',
        icon: 'clock',
        description: 'Waiting for cashier approval'
      },
      'APPROVED': {
        label: 'Approved',
        color: 'success',
        icon: 'check-circle',
        description: 'Approved and ready for disbursement'
      },
      'REJECTED': {
        label: 'Rejected',
        color: 'danger',
        icon: 'x-circle',
        description: 'Rejected by cashier'
      }
    };
    
    return statusMap[workflowStatus] || {
      label: workflowStatus || 'Unknown',
      color: 'secondary',
      icon: 'help-circle',
      description: 'Unknown workflow status'
    };
  }
}

// eslint-disable-next-line import/no-anonymous-default-export
export default new LoanService();
