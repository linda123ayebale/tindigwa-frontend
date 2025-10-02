import ApiService from './api';

class BranchService {
  constructor() {
    this.basePath = '/branches';
  }

  // Get all branches
  async getAllBranches() {
    try {
      return await ApiService.get(this.basePath);
    } catch (error) {
      console.error('Error fetching branches:', error);
      throw error;
    }
  }

  // Get branch by ID
  async getBranchById(id) {
    try {
      return await ApiService.get(`${this.basePath}/${id}`);
    } catch (error) {
      console.error(`Error fetching branch ${id}:`, error);
      throw error;
    }
  }

  // Create new branch
  async createBranch(branchData) {
    try {
      return await ApiService.post(this.basePath, branchData);
    } catch (error) {
      console.error('Error creating branch:', error);
      throw error;
    }
  }

  // Update existing branch
  async updateBranch(id, branchData) {
    try {
      return await ApiService.put(`${this.basePath}/${id}`, branchData);
    } catch (error) {
      console.error(`Error updating branch ${id}:`, error);
      throw error;
    }
  }

  // Delete branch
  async deleteBranch(id) {
    try {
      return await ApiService.delete(`${this.basePath}/${id}`);
    } catch (error) {
      console.error(`Error deleting branch ${id}:`, error);
      throw error;
    }
  }

  // Validate branch data
  validateBranchData(branchData) {
    const required = ['name', 'location'];
    const missing = required.filter(field => !branchData[field]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }

    return true;
  }

  // Format branch data for API
  formatBranchData(formData) {
    return {
      name: formData.name?.trim(),
      location: formData.location?.trim(),
      address: formData.address?.trim() || '',
      phoneNumber: formData.phoneNumber?.trim() || '',
      email: formData.email?.trim() || '',
      managerName: formData.managerName?.trim() || '',
      status: formData.status || 'active'
    };
  }
}

export default new BranchService();
