// Local Payment Storage Service
// This provides a fallback for payment tracking when backend API is not fully ready

class PaymentStore {
  constructor() {
    this.storageKey = 'tindigwa_payments';
    this.init();
  }

  init() {
    // Initialize with existing data or empty array
    const stored = localStorage.getItem(this.storageKey);
    this.payments = stored ? JSON.parse(stored) : [];
  }

  // Save payments to localStorage
  save() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.payments));
  }

  // Add a new payment
  addPayment(paymentData) {
    // Check for duplicates based on amount, date, and loanId
    const isDuplicate = this.payments.some(existingPayment => 
      existingPayment.loanId === paymentData.loanId &&
      existingPayment.amount === paymentData.amount &&
      existingPayment.paymentDate === paymentData.paymentDate &&
      Math.abs(new Date(existingPayment.createdAt).getTime() - new Date().getTime()) < 5000 // Within 5 seconds
    );
    
    if (isDuplicate) {
      console.log('Duplicate payment detected, skipping:', paymentData);
      return null;
    }
    
    // Determine payment status based on various factors
    let status = 'completed'; // Default status
    
    // You can add logic here for different statuses based on:
    // - Payment method validation
    // - Amount verification
    // - External API responses
    if (paymentData.paymentMethod === 'Bank Transfer' || paymentData.paymentMethod === 'Mobile Money') {
      // For electronic payments, you might want to mark as 'pending' initially
      // status = 'pending';
    }
    
    const payment = {
      id: paymentData.id || `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...paymentData,
      createdAt: new Date().toISOString(),
      status: paymentData.status || status,
      paymentTime: new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    };

    this.payments.unshift(payment); // Add to beginning (most recent first)
    this.save();
    
    console.log('Payment added to local store:', payment);
    
    // Emit payment added event (lazy import to avoid circular dependencies)
    try {
      const { default: paymentEvents } = require('./paymentEvents');
      paymentEvents.paymentAdded(payment);
    } catch (error) {
      console.log('Could not emit payment event:', error.message);
    }
    
    return payment;
  }

  // Get all payments
  getAllPayments() {
    return [...this.payments];
  }

  // Get payments for a specific loan
  getPaymentsByLoanId(loanId) {
    return this.payments.filter(payment => payment.loanId === loanId);
  }

  // Get payment statistics
  getStats() {
    const total = this.payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const count = this.payments.length;

    const now = new Date();
    const thisMonth = this.payments.filter(payment => {
      const paymentDate = new Date(payment.paymentDate || payment.createdAt);
      return paymentDate.getMonth() === now.getMonth() && 
             paymentDate.getFullYear() === now.getFullYear();
    });

    return {
      total: Math.round(total * 100) / 100,
      count,
      thisMonth: {
        count: thisMonth.length,
        amount: Math.round(thisMonth.reduce((sum, p) => sum + (p.amount || 0), 0) * 100) / 100
      }
    };
  }

  // Update loan balance after payment (for frontend consistency)
  updateLoanBalance(loanId, paymentAmount, loans) {
    const updatedLoans = loans.map(loan => {
      if (loan.id === loanId) {
        const currentPaid = loan.amountPaid || 0;
        const newPaid = currentPaid + paymentAmount;
        const totalPayable = loan.totalPayable || loan.principalAmount || 0;
        const newBalance = Math.max(0, totalPayable - newPaid);

        return {
          ...loan,
          amountPaid: newPaid,
          outstandingBalance: newBalance,
          lastPaymentDate: new Date().toISOString().split('T')[0],
          lastPaymentAmount: paymentAmount
        };
      }
      return loan;
    });

    return updatedLoans;
  }

  // Clear all payments (for testing)
  clearAll() {
    this.payments = [];
    this.save();
    console.log('All payments cleared from local store');
  }

  // Export payments data
  exportData() {
    return {
      payments: this.payments,
      exportedAt: new Date().toISOString(),
      count: this.payments.length
    };
  }

  // Import payments data
  importData(data) {
    if (data && Array.isArray(data.payments)) {
      this.payments = data.payments;
      this.save();
      console.log('Payments imported:', this.payments.length);
      return true;
    }
    return false;
  }
}

// eslint-disable-next-line import/no-anonymous-default-export
export default new PaymentStore();