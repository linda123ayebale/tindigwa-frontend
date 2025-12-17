// src/services/BranchService.js
import ApiService from './api';

class BranchService {
  constructor() {
    this.basePath = '/branches'; // or '/api/branches' depending on ApiService
  }

  async getAllBranches() {
    try {
      return await ApiService.get(this.basePath);
    } catch (error) {
      console.error('Error fetching branches:', error);
      throw error;
    }
  }

  async getBranchById(id) {
    try {
      return await ApiService.get(`${this.basePath}/${id}`);
    } catch (error) {
      console.error(`Error fetching branch ${id}:`, error);
      throw error;
    }
  }

  async createBranch(formData) {
    const branchData = this.formatBranchData(formData);
    this.validateBranchData(branchData);

    try {
      return await ApiService.post(this.basePath, branchData);
    } catch (error) {
      console.error('Error creating branch:', error);
      throw error;
    }
  }

  async updateBranch(id, formData) {
    const branchData = this.formatBranchData(formData);
    this.validateBranchData(branchData);

    try {
      return await ApiService.put(`${this.basePath}/${id}`, branchData);
    } catch (error) {
      console.error(`Error updating branch ${id}:`, error);
      throw error;
    }
  }

  async deleteBranch(id) {
    try {
      return await ApiService.delete(`${this.basePath}/${id}`);
    } catch (error) {
      console.error(`Error deleting branch ${id}:`, error);
      throw error;
    }
  }

  validateBranchData(branchData) {
    const required = ['branchCode', 'branchName', 'location'];
    const missing = required.filter(field => !branchData[field]?.trim());

    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }

    return true;
  }

  formatBranchData(formData) {
    return {
      branchCode: formData.branchCode?.trim(),
      branchName: formData.branchName?.trim(),
      location: formData.location?.trim(),
    };
  }
}

export default new BranchService();
