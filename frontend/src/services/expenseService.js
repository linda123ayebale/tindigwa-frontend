import ApiService from './api';

class ExpenseService {
  constructor() {
    this.basePath = '/expenses';
  }

  // Get all expenses
  async getAllExpenses() {
    try {
      return await ApiService.get(this.basePath);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      throw error;
    }
  }

  // Get expense by ID
  async getExpenseById(id) {
    try {
      return await ApiService.get(`${this.basePath}/${id}`);
    } catch (error) {
      console.error(`Error fetching expense ${id}:`, error);
      throw error;
    }
  }

  // Create new expense
  async createExpense(expenseData) {
    try {
      return await ApiService.post(this.basePath, expenseData);
    } catch (error) {
      console.error('Error creating expense:', error);
      throw error;
    }
  }

  // Update existing expense
  async updateExpense(id, expenseData) {
    try {
      return await ApiService.put(`${this.basePath}/${id}`, expenseData);
    } catch (error) {
      console.error(`Error updating expense ${id}:`, error);
      throw error;
    }
  }

  // Delete expense
  async deleteExpense(id) {
    try {
      return await ApiService.delete(`${this.basePath}/${id}`);
    } catch (error) {
      console.error(`Error deleting expense ${id}:`, error);
      throw error;
    }
  }

  // Get expenses by category (may need backend endpoint)
  async getExpensesByCategory(category) {
    try {
      return await ApiService.get(`${this.basePath}/category/${category}`);
    } catch (error) {
      console.error(`Error fetching expenses for category ${category}:`, error);
      throw error;
    }
  }

  // Get expenses by date range (may need backend endpoint)
  async getExpensesByDateRange(startDate, endDate) {
    try {
      return await ApiService.get(`${this.basePath}/date-range?start=${startDate}&end=${endDate}`);
    } catch (error) {
      console.error(`Error fetching expenses for date range ${startDate} to ${endDate}:`, error);
      throw error;
    }
  }

  // Get expense summary/statistics (may need backend endpoint)
  async getExpenseSummary(period = 'month') {
    try {
      return await ApiService.get(`${this.basePath}/summary?period=${period}`);
    } catch (error) {
      console.error(`Error fetching expense summary for period ${period}:`, error);
      throw error;
    }
  }

  // Validate expense data
  validateExpenseData(expenseData) {
    const required = ['description', 'amount', 'category', 'expenseDate'];
    const missing = required.filter(field => !expenseData[field]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }

    // Amount validation
    if (expenseData.amount <= 0) {
      throw new Error('Expense amount must be greater than 0');
    }

    // Date validation
    const expenseDate = new Date(expenseData.expenseDate);
    if (isNaN(expenseDate.getTime())) {
      throw new Error('Invalid expense date');
    }

    return true;
  }

  // Format expense data for API
  formatExpenseData(formData) {
    return {
      description: formData.description?.trim(),
      amount: parseFloat(formData.amount),
      category: formData.category?.trim(),
      expenseDate: formData.expenseDate,
      branchId: formData.branchId ? parseInt(formData.branchId) : null,
      approvedBy: formData.approvedBy?.trim() || '',
      receiptUrl: formData.receiptUrl?.trim() || '',
      notes: formData.notes?.trim() || '',
      status: formData.status || 'pending'
    };
  }

  // Get expense categories
  getExpenseCategories() {
    return [
      'Office Supplies',
      'Rent',
      'Utilities',
      'Marketing',
      'Salaries',
      'Transportation',
      'Professional Services',
      'Technology',
      'Training',
      'Miscellaneous'
    ];
  }

  // Calculate total expenses for a period
  calculateTotalExpenses(expenses) {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  }

  // Group expenses by category
  groupExpensesByCategory(expenses) {
    return expenses.reduce((groups, expense) => {
      const category = expense.category || 'Uncategorized';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(expense);
      return groups;
    }, {});
  }

  // Get expense statistics
  getExpenseStatistics(expenses) {
    const total = this.calculateTotalExpenses(expenses);
    const categorized = this.groupExpensesByCategory(expenses);
    const categoryTotals = {};
    
    Object.keys(categorized).forEach(category => {
      categoryTotals[category] = this.calculateTotalExpenses(categorized[category]);
    });

    return {
      total,
      count: expenses.length,
      averageAmount: expenses.length > 0 ? total / expenses.length : 0,
      categories: categoryTotals,
      highestExpense: expenses.length > 0 ? Math.max(...expenses.map(e => e.amount)) : 0,
      lowestExpense: expenses.length > 0 ? Math.min(...expenses.map(e => e.amount)) : 0
    };
  }
}

export default new ExpenseService();
