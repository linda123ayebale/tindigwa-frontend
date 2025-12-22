import axios from 'axios';
import api from './api';

const API_URL = 'http://localhost:8082/api';

const ExpensesService = {
  // Get all expenses
  getAllExpenses: () => {
    return axios.get(API_URL);
  },

  // Get expense by ID
  getExpenseById: (id) => {
    return axios.get(`${API_URL}/${id}`);
  },

  // Create expense
  createExpense: (data) => {
    return axios.post(API_URL, data);
  },

  // Update expense
  updateExpense: (id, data) => {
    return axios.put(`${API_URL}/${id}`, data);
  },

  // Delete expense
  deleteExpense: (id) => {
    return axios.delete(`${API_URL}/${id}`);
  },

  // Get expenses with filters
  getFilteredExpenses: (filters) => {
    return axios.get(`${API_URL}/filter`, { params: filters });
  },

  // === Approval Workflow Methods ===

  // Get pending expenses (awaiting approval)
  getPendingExpenses: () => {
    return api.get('pending');
  },

  // Get rejected expenses
  getRejectedExpenses: () => {
    return axios.get(`${API_URL}/rejected`);
  },

  // Get approved unpaid expenses (expenses to pay)
  getApprovedUnpaidExpenses: () => {
    return axios.get(`${API_URL}/approved-unpaid`);
  },

  // Approve expense
  approveExpense: (id, data) => {
    return axios.post(`${API_URL}/${id}/approve`, data);
  },

  // Reject expense
  rejectExpense: (id, data) => {
    return axios.post(`${API_URL}/${id}/reject`, data);
  },

  // Mark expense as paid
  markExpenseAsPaid: (id, data) => {
    return axios.post(`${API_URL}/${id}/mark-paid`, data);
  },

  // Get expense statistics
  getExpenseStatistics: (startDate, endDate) => {
    return axios.get(`${API_URL}/statistics`, {
      params: { startDate, endDate }
    });
  },

  // Get expense summary by category
  getExpenseSummaryByCategory: (startDate, endDate) => {
    return axios.get(`${API_URL}/summary/category`, {
      params: { startDate, endDate }
    });
  },

  // Get monthly expense totals
  getMonthlyExpenseTotals: (startDate, endDate) => {
    return axios.get(`${API_URL}/summary/monthly`, {
      params: { startDate, endDate }
    });
  },

  // Upload receipt
  uploadReceipt: (expenseId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axios.post(`${API_URL}/${expenseId}/receipt`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Delete receipt
  deleteReceipt: (expenseId) => {
    return axios.delete(`${API_URL}/${expenseId}/receipt`);
  },

  // Bulk import from CSV
  importExpenses: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axios.post(`${API_URL}/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Export to CSV
  exportExpenses: (filters) => {
    return axios.get(`${API_URL}/export`, {
      params: filters,
      responseType: 'blob'
    });
  }
};

// eslint-disable-next-line import/no-anonymous-default-export
export default ExpensesService;
