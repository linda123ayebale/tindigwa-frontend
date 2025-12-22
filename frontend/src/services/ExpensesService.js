import axios from 'axios';
import api from './api';

const API_URL = process.env.REACT_APP_API_BASE_URL ;

const ExpensesService = {
  // Get all expenses
  getAllExpenses: () => {
    return axios.get(API_URL + '/expense');
  },

  // Get expense by ID
  getExpenseById: (id) => {
    return axios.get(`${API_URL}/expense/${id}`);
  },

  // Create expense
  createExpense: (data) => {
    return axios.post(API_URL, data);
  },

  // Update expense
  updateExpense: (id, data) => {
    return axios.put(`${API_URL}/expense/${id}`, data);
  },

  // Delete expense
  deleteExpense: (id) => {
    return axios.delete(`${API_URL}/expense/${id}`);
  },

  // Get expenses with filters
  getFilteredExpenses: (filters) => {
    return axios.get(`${API_URL}/expense/filter`, { params: filters });
  },

  // === Approval Workflow Methods ===

  // Get pending expenses (awaiting approval)
  getPendingExpenses: () => {
    return api.get('/expense/pending');
  },

  // Get rejected expenses
  getRejectedExpenses: () => {
    return axios.get(`${API_URL}/expense/rejected`);
  },

  // Get approved unpaid expenses (expenses to pay)
  getApprovedUnpaidExpenses: () => {
    return axios.get(`${API_URL}/expense/approved-unpaid`);
  },

  // Approve expense
  approveExpense: (id, data) => {
    return axios.post(`${API_URL}/expense/${id}/approve`, data);
  },

  // Reject expense
  rejectExpense: (id, data) => {
    return axios.post(`${API_URL}/expense/${id}/reject`, data);
  },

  // Mark expense as paid
  markExpenseAsPaid: (id, data) => {
    return axios.post(`${API_URL}/expense/${id}/mark-paid`, data);
  },

  // Get expense statistics
  getExpenseStatistics: (startDate, endDate) => {
    return axios.get(`${API_URL}/expense/statistics`, {
      params: { startDate, endDate }
    });
  },

  // Get expense summary by category
  getExpenseSummaryByCategory: (startDate, endDate) => {
    return axios.get(`${API_URL}/expense/summary/category`, {
      params: { startDate, endDate }
    });
  },

  // Get monthly expense totals
  getMonthlyExpenseTotals: (startDate, endDate) => {
    return axios.get(`${API_URL}/expense/summary/monthly`, {
      params: { startDate, endDate }
    });
  },

  // Upload receipt
  uploadReceipt: (expenseId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axios.post(`${API_URL}/expense/${expenseId}/receipt`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Delete receipt
  deleteReceipt: (expenseId) => {
    return axios.delete(`${API_URL}/expense/${expenseId}/receipt`);
  },

  // Bulk import from CSV
  importExpenses: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axios.post(`${API_URL}/expense/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Export to CSV
  exportExpenses: (filters) => {
    return axios.get(`${API_URL}/expense/export`, {
      params: filters,
      responseType: 'blob'
    });
  }
};

// eslint-disable-next-line import/no-anonymous-default-export
export default ExpensesService;
