import api from './api';

const PaymentService = {
  // Get all payments
  getAll: async () => {
    try {
      const response = await api.get('/payments');
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Error fetching payments:', error);
      throw error;
    }
  },

  // Get payment by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/payments/${id}`);
      return response;
    } catch (error) {
      console.error(`Error fetching payment ${id}:`, error);
      throw error;
    }
  },

  // Get payments by loan ID
  getByLoanId: async (loanId) => {
    try {
      const response = await api.get(`/payments/loan/${loanId}`);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error(`Error fetching payments for loan ${loanId}:`, error);
      throw error;
    }
  },

  // Get payment history for a loan (chronological order)
  getPaymentHistory: async (loanId) => {
    try {
      const response = await api.get(`/payments/loan/${loanId}/history`);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error(`Error fetching payment history for loan ${loanId}:`, error);
      throw error;
    }
  },

  // Get payments by status
  getByStatus: async (status) => {
    try {
      const response = await api.get(`/payments/status/${status}`);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error(`Error fetching payments with status ${status}:`, error);
      throw error;
    }
  },

  // Get payments by method
  getByMethod: async (method) => {
    try {
      const response = await api.get(`/payments/method/${method}`);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error(`Error fetching payments with method ${method}:`, error);
      throw error;
    }
  },

  // Get payments in date range
  getByDateRange: async (startDate, endDate) => {
    try {
      const response = await api.get(`/payments/date-range?startDate=${startDate}&endDate=${endDate}`);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error(`Error fetching payments in date range:`, error);
      throw error;
    }
  },

  // Get late payments
  getLatePayments: async () => {
    try {
      const response = await api.get('/payments/late');
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Error fetching late payments:', error);
      throw error;
    }
  },

  // Record a new payment
  recordPayment: async (paymentData) => {
    try {
      const response = await api.post('/payments/record', paymentData);
      return response;
    } catch (error) {
      console.error('Error recording payment:', error);
      throw error;
    }
  },

  // Process payment with full calculation
  processPayment: async (paymentData) => {
    try {
      const response = await api.post('/payments/process', paymentData);
      return response;
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  },

  // Create basic payment
  create: async (paymentData) => {
    try {
      const response = await api.post('/payments', paymentData);
      return response;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  },

  // Update payment
  update: async (id, paymentData) => {
    try {
      const response = await api.put(`/payments/${id}`, paymentData);
      return response;
    } catch (error) {
      console.error(`Error updating payment ${id}:`, error);
      throw error;
    }
  },

  // Edit payment (only RECORDED payments)
  editPayment: async (id, updates) => {
    try {
      const response = await api.put(`/payments/${id}/edit`, updates);
      return response;
    } catch (error) {
      console.error(`Error editing payment ${id}:`, error);
      throw error;
    }
  },

  // Update payment status
  updateStatus: async (id, status) => {
    try {
      const response = await api.patch(`/payments/${id}/status`, { status });
      return response;
    } catch (error) {
      console.error(`Error updating payment status ${id}:`, error);
      throw error;
    }
  },

  // Cancel payment
  cancel: async (id, reason) => {
    try {
      const response = await api.patch(`/payments/${id}/cancel`, { reason });
      return response;
    } catch (error) {
      console.error(`Error cancelling payment ${id}:`, error);
      throw error;
    }
  },

  // Soft delete payment (only RECORDED payments)
  softDelete: async (id) => {
    try {
      const response = await api.delete(`/payments/${id}/soft-delete`);
      return response;
    } catch (error) {
      console.error(`Error soft deleting payment ${id}:`, error);
      throw error;
    }
  },

  // Hard delete payment
  delete: async (id) => {
    try {
      const response = await api.delete(`/payments/${id}`);
      return response;
    } catch (error) {
      console.error(`Error deleting payment ${id}:`, error);
      throw error;
    }
  },

  // Reverse payment
  reversePayment: async (id, data = {}) => {
    try {
      const response = await api.post(`/payments/${id}/reverse`, data);
      return response;
    } catch (error) {
      console.error(`Error reversing payment ${id}:`, error);
      throw error;
    }
  },

  // Get payment receipt
  getReceipt: async (id) => {
    try {
      const response = await api.get(`/payments/receipts/${id}`);
      return response;
    } catch (error) {
      console.error(`Error fetching receipt for payment ${id}:`, error);
      throw error;
    }
  },

  // Get payment summary for loan
  getPaymentSummary: async (loanId) => {
    try {
      const response = await api.get(`/payments/loan/${loanId}/summary`);
      return response;
    } catch (error) {
      console.error(`Error fetching payment summary for loan ${loanId}:`, error);
      throw error;
    }
  },

  // Get loan balance
  getLoanBalance: async (loanId) => {
    try {
      const response = await api.get(`/payments/loan/${loanId}/balance`);
      return response;
    } catch (error) {
      console.error(`Error fetching balance for loan ${loanId}:`, error);
      throw error;
    }
  },

  // Get total paid for loan
  getTotalPaid: async (loanId) => {
    try {
      const response = await api.get(`/payments/loan/${loanId}/total-paid`);
      return response;
    } catch (error) {
      console.error(`Error fetching total paid for loan ${loanId}:`, error);
      throw error;
    }
  },

  // Get outstanding balance for loan
  getOutstandingBalance: async (loanId) => {
    try {
      const response = await api.get(`/payments/loan/${loanId}/outstanding`);
      return response;
    } catch (error) {
      console.error(`Error fetching outstanding balance for loan ${loanId}:`, error);
      throw error;
    }
  },

  // ANALYTICS ENDPOINTS

  // Get payment analytics
  getAnalytics: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      
      const queryString = queryParams.toString();
      const endpoint = `/payments/analytics${queryString ? `?${queryString}` : ''}`;
      const response = await api.get(endpoint);
      return response;
    } catch (error) {
      console.error('Error fetching payment analytics:', error);
      throw error;
    }
  },

  // Get payment trends
  getTrends: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      if (params.days) queryParams.append('days', params.days);
      
      const queryString = queryParams.toString();
      const endpoint = `/payments/analytics/trends${queryString ? `?${queryString}` : ''}`;
      const response = await api.get(endpoint);
      return response;
    } catch (error) {
      console.error('Error fetching payment trends:', error);
      throw error;
    }
  },

  // Get payment methods analytics
  getMethodsAnalytics: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      if (params.days) queryParams.append('days', params.days);
      
      const queryString = queryParams.toString();
      const endpoint = `/payments/analytics/methods${queryString ? `?${queryString}` : ''}`;
      const response = await api.get(endpoint);
      return response;
    } catch (error) {
      console.error('Error fetching payment methods analytics:', error);
      throw error;
    }
  },

  // Get analytics summary
  getSummary: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      if (params.days) queryParams.append('days', params.days);
      
      const queryString = queryParams.toString();
      const endpoint = `/payments/analytics/summary${queryString ? `?${queryString}` : ''}`;
      const response = await api.get(endpoint);
      return response;
    } catch (error) {
      console.error('Error fetching payment summary:', error);
      throw error;
    }
  },

  // Get collection efficiency
  getCollectionEfficiency: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      
      const queryString = queryParams.toString();
      const endpoint = `/payments/analytics/collection-efficiency${queryString ? `?${queryString}` : ''}`;
      const response = await api.get(endpoint);
      return response;
    } catch (error) {
      console.error('Error fetching collection efficiency:', error);
      throw error;
    }
  },

  // Get late payment analysis
  getLatePaymentAnalysis: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      
      const queryString = queryParams.toString();
      const endpoint = `/payments/analytics/late-payments${queryString ? `?${queryString}` : ''}`;
      const response = await api.get(endpoint);
      return response;
    } catch (error) {
      console.error('Error fetching late payment analysis:', error);
      throw error;
    }
  },

  // Get top performers
  getTopPerformers: async (limit = 10) => {
    try {
      const response = await api.get(`/payments/analytics/top-performers?limit=${limit}`);
      return response;
    } catch (error) {
      console.error('Error fetching top performers:', error);
      throw error;
    }
  },

  // Get client payment performance
  getClientPerformance: async (clientId) => {
    try {
      const response = await api.get(`/payments/analytics/client/${clientId}/performance`);
      return response;
    } catch (error) {
      console.error(`Error fetching client ${clientId} performance:`, error);
      throw error;
    }
  },

  // Get portfolio health
  getPortfolioHealth: async () => {
    try {
      const response = await api.get('/payments/analytics/portfolio-health');
      return response;
    } catch (error) {
      console.error('Error fetching portfolio health:', error);
      throw error;
    }
  },

  // Get payment forecast
  getForecast: async (daysAhead = 30) => {
    try {
      const response = await api.get(`/payments/analytics/forecast?daysAhead=${daysAhead}`);
      return response;
    } catch (error) {
      console.error('Error fetching payment forecast:', error);
      throw error;
    }
  },

  // Get dashboard metrics
  getDashboardMetrics: async () => {
    try {
      const response = await api.get('/payments/analytics/dashboard');
      return response;
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      throw error;
    }
  },

  // Get late payment trends
  getLateTrends: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.days) queryParams.append('days', params.days);
      
      const queryString = queryParams.toString();
      const endpoint = `/payments/analytics/late-trends${queryString ? `?${queryString}` : ''}`;
      const response = await api.get(endpoint);
      return response;
    } catch (error) {
      console.error('Error fetching late payment trends:', error);
      throw error;
    }
  },

  // VALIDATION ENDPOINTS

  // Validate payment
  validatePayment: async (paymentData) => {
    try {
      const response = await api.post('/payments/validate', paymentData);
      return response;
    } catch (error) {
      console.error('Error validating payment:', error);
      throw error;
    }
  },

  // Quick validate
  quickValidate: async (loanId, amount) => {
    try {
      const response = await api.post(`/payments/validate/quick?loanId=${loanId}&amount=${amount}`);
      return response;
    } catch (error) {
      console.error('Error quick validating payment:', error);
      throw error;
    }
  }
};

export default PaymentService;
