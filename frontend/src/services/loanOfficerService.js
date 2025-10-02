import ApiService from './api';

class LoanOfficerService {
  constructor() {
    this.basePath = '/loan-officers';
  }

  // Get all loan officers
  async getAllLoanOfficers() {
    try {
      return await ApiService.get(this.basePath);
    } catch (error) {
      console.error('Error fetching loan officers:', error);
      throw error;
    }
  }

  // Get loan officer by ID
  async getLoanOfficerById(id) {
    try {
      return await ApiService.get(`${this.basePath}/${id}`);
    } catch (error) {
      console.error(`Error fetching loan officer ${id}:`, error);
      throw error;
    }
  }

  // Create new loan officer
  async createLoanOfficer(officerData) {
    try {
      return await ApiService.post(this.basePath, officerData);
    } catch (error) {
      console.error('Error creating loan officer:', error);
      throw error;
    }
  }

  // Update existing loan officer
  async updateLoanOfficer(id, officerData) {
    try {
      return await ApiService.put(`${this.basePath}/${id}`, officerData);
    } catch (error) {
      console.error(`Error updating loan officer ${id}:`, error);
      throw error;
    }
  }

  // Delete loan officer
  async deleteLoanOfficer(id) {
    try {
      return await ApiService.delete(`${this.basePath}/${id}`);
    } catch (error) {
      console.error(`Error deleting loan officer ${id}:`, error);
      throw error;
    }
  }

  // Get loan officers by branch (may need to be added to backend)
  async getLoanOfficersByBranch(branchId) {
    try {
      return await ApiService.get(`${this.basePath}/branch/${branchId}`);
    } catch (error) {
      console.error(`Error fetching loan officers for branch ${branchId}:`, error);
      throw error;
    }
  }

  // Validate loan officer data
  validateLoanOfficerData(officerData) {
    const required = ['name', 'email', 'phoneNumber'];
    const missing = required.filter(field => !officerData[field]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(officerData.email)) {
      throw new Error('Please enter a valid email address');
    }

    return true;
  }

  // Format loan officer data for API
  formatLoanOfficerData(formData) {
    return {
      name: formData.name?.trim(),
      email: formData.email?.trim(),
      phoneNumber: formData.phoneNumber?.trim(),
      employeeId: formData.employeeId?.trim() || '',
      branchId: formData.branchId ? parseInt(formData.branchId) : null,
      position: formData.position?.trim() || 'Loan Officer',
      hireDate: formData.hireDate || new Date().toISOString().split('T')[0],
      status: formData.status || 'active',
      permissions: formData.permissions || []
    };
  }

  // Get officer performance metrics (may need backend endpoint)
  async getOfficerPerformance(officerId, dateRange = 'month') {
    try {
      return await ApiService.get(`${this.basePath}/${officerId}/performance?range=${dateRange}`);
    } catch (error) {
      console.error(`Error fetching performance for officer ${officerId}:`, error);
      throw error;
    }
  }
}

export default new LoanOfficerService();
