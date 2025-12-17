import ApiService from './api';

class PaymentService {
  constructor() {
    this.basePath = '/payments';
  }

  // Get all payments
  async getAllPayments() {
    try {
      return await ApiService.get(this.basePath);
    } catch (error) {
      console.error('Error fetching payments:', error);
      throw error;
    }
  }

  // Get payment by ID
  async getPaymentById(id) {
    try {
      return await ApiService.get(`${this.basePath}/${id}`);
    } catch (error) {
      console.error(`Error fetching payment ${id}:`, error);
      throw error;
    }
  }

  // Create new payment
  async createPayment(paymentData) {
    try {
      return await ApiService.post(this.basePath, paymentData);
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  }

  // Update existing payment
  async updatePayment(id, paymentData) {
    try {
      return await ApiService.put(`${this.basePath}/${id}`, paymentData);
    } catch (error) {
      console.error(`Error updating payment ${id}:`, error);
      throw error;
    }
  }

  // Delete payment
  async deletePayment(id) {
    try {
      return await ApiService.delete(`${this.basePath}/${id}`);
    } catch (error) {
      console.error(`Error deleting payment ${id}:`, error);
      throw error;
    }
  }

  // Get payments by loan ID
  async getPaymentsByLoanId(loanId) {
    try {
      return await ApiService.get(`${this.basePath}/loan/${loanId}`);
    } catch (error) {
      console.error(`Error fetching payments for loan ${loanId}:`, error);
      throw error;
    }
  }

  // Get all payments with enhanced details
  async getAllPaymentsWithDetails() {
    try {
      const payments = await this.getAllPayments();
      
      // Enhance with loan information if available
      const enhancedPayments = await Promise.all(
        payments.map(async (payment) => {
          try {
            // Try to get loan details for this payment
            const loanResponse = await ApiService.get(`/loans/${payment.loanId}`);
            return {
              ...payment,
              clientName: loanResponse.clientName || 'Unknown Client',
              loanReference: loanResponse.loanReference || `LN-${payment.loanId}`,
              loanAmount: loanResponse.totalPayable || loanResponse.principalAmount
            };
          } catch (error) {
            // If loan details not available, return payment as is
            return {
              ...payment,
              clientName: 'Unknown Client',
              loanReference: `LN-${payment.loanId}`
            };
          }
        })
      );
      
      // Sort by payment date (most recent first)
      return enhancedPayments.sort((a, b) => 
        new Date(b.paymentDate || b.createdAt) - new Date(a.paymentDate || a.createdAt)
      );
    } catch (error) {
      console.error('Error fetching payments with details:', error);
      throw error;
    }
  }

  // Get payment statistics
  getPaymentStats(payments) {
    const totalAmount = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const totalCount = payments.length;
    
    const today = new Date();
    const thisMonth = payments.filter(payment => {
      const paymentDate = new Date(payment.paymentDate || payment.createdAt);
      return paymentDate.getMonth() === today.getMonth() && 
             paymentDate.getFullYear() === today.getFullYear();
    });
    
    const thisWeek = payments.filter(payment => {
      const paymentDate = new Date(payment.paymentDate || payment.createdAt);
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      return paymentDate >= weekAgo;
    });
    
    return {
      totalAmount: Math.round(totalAmount * 100) / 100,
      totalCount,
      thisMonth: {
        count: thisMonth.length,
        amount: Math.round(thisMonth.reduce((sum, p) => sum + (p.amount || 0), 0) * 100) / 100
      },
      thisWeek: {
        count: thisWeek.length,
        amount: Math.round(thisWeek.reduce((sum, p) => sum + (p.amount || 0), 0) * 100) / 100
      }
    };
  }

  // Validate payment data
  validatePaymentData(paymentData) {
    const required = ['loanId', 'amount', 'paymentDate'];
    const missing = required.filter(field => !paymentData[field]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }

    // Amount validation
    if (paymentData.amount <= 0) {
      throw new Error('Payment amount must be greater than 0');
    }

    // Date validation
    const paymentDate = new Date(paymentData.paymentDate);
    if (isNaN(paymentDate.getTime())) {
      throw new Error('Invalid payment date');
    }

    return true;
  }

  // Format payment data for API
  formatPaymentData(formData) {
    return {
      loanId: parseInt(formData.loanId),
      amount: parseFloat(formData.amount),
      paymentDate: formData.paymentDate,
      paymentMethod: formData.paymentMethod?.trim() || 'cash',
      notes: formData.notes?.trim() || '',
      receivedBy: formData.receivedBy?.trim() || ''
    };
  }

  // Calculate payment summary for a loan
  calculatePaymentSummary(payments, totalLoanAmount) {
    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const remainingBalance = totalLoanAmount - totalPaid;
    const paymentCount = payments.length;
    
    return {
      totalPaid: Math.round(totalPaid * 100) / 100,
      remainingBalance: Math.round(remainingBalance * 100) / 100,
      paymentCount,
      isFullyPaid: remainingBalance <= 0,
      paymentPercentage: Math.round((totalPaid / totalLoanAmount) * 10000) / 100 // 2 decimal places
    };
  }

  // Get overdue payments
  getOverduePayments(payments, loan) {
    const today = new Date();
    const endDate = new Date(loan.paymentEndDate);
    
    if (today <= endDate) {
      return []; // Loan is not yet overdue
    }

    const totalPaid = this.calculatePaymentSummary(payments, loan.totalPayable).totalPaid;
    const remainingBalance = loan.totalPayable - totalPaid;

    if (remainingBalance <= 0) {
      return []; // Loan is fully paid
    }

    // Calculate overdue amount and days
    const overdueDays = Math.floor((today - endDate) / (1000 * 60 * 60 * 24));
    
    return [{
      loanId: loan.id,
      overdueAmount: remainingBalance,
      overdueDays,
      clientId: loan.clientId,
      lendingBranch: loan.lendingBranch
    }];
  }

  // Generate payment schedule suggestions
  generatePaymentSchedule(loan) {
    const { totalPayable, paymentStartDate, paymentEndDate, repaymentFrequency } = loan;
    const startDate = new Date(paymentStartDate);
    const endDate = new Date(paymentEndDate);
    const durationMs = endDate - startDate;
    const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));

    let paymentInterval;
    let numberOfPayments;

    switch (repaymentFrequency.toLowerCase()) {
      case 'daily':
        paymentInterval = 1;
        numberOfPayments = durationDays;
        break;
      case 'weekly':
        paymentInterval = 7;
        numberOfPayments = Math.ceil(durationDays / 7);
        break;
      case 'monthly':
        paymentInterval = 30;
        numberOfPayments = Math.ceil(durationDays / 30);
        break;
      default:
        paymentInterval = durationDays;
        numberOfPayments = 1;
    }

    const paymentAmount = Math.round((totalPayable / numberOfPayments) * 100) / 100;
    const schedule = [];

    for (let i = 0; i < numberOfPayments; i++) {
      const dueDate = new Date(startDate);
      dueDate.setDate(startDate.getDate() + (i * paymentInterval));
      
      // Don't add payments beyond the end date
      if (dueDate <= endDate) {
        schedule.push({
          paymentNumber: i + 1,
          dueDate: dueDate.toISOString().split('T')[0],
          amount: i === numberOfPayments - 1 
            ? Math.round((totalPayable - (paymentAmount * i)) * 100) / 100 // Last payment adjusts for rounding
            : paymentAmount,
          status: 'pending'
        });
      }
    }

    return schedule;
  }
}

export default new PaymentService();
