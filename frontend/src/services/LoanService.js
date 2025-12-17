import api from './api';

const LoanService = {
  // Get all loans (approved loans)
  getAll: async () => {
    try {
      const response = await api.get('/loans');
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Error fetching loans:', error);
      throw error;
    }
  },

  // Get loan by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/loans/${id}`);
      return response;
    } catch (error) {
      console.error(`Error fetching loan ${id}:`, error);
      throw error;
    }
  },

  // Get complete loan details with all related data
  getCompleteDetails: async (id) => {
    try {
      const response = await api.get(`/loans/${id}/complete`);
      return response;
    } catch (error) {
      console.error(`Error fetching complete details for loan ${id}:`, error);
      throw error;
    }
  },

  // Get approved loans
  getApproved: async () => {
    try {
      const response = await api.get('/loans/approved');
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Error fetching approved loans:', error);
      throw error;
    }
  },

  // Get rejected loans
  getRejected: async () => {
    try {
      const response = await api.get('/loans/rejected');
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Error fetching rejected loans:', error);
      throw error;
    }
  },

  // Get archived loans
  getArchived: async () => {
    try {
      const response = await api.get('/loans/archived');
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Error fetching archived loans:', error);
      throw error;
    }
  },

  // Get loans pending approval
  getPendingApproval: async () => {
    try {
      const response = await api.get('/loans/pending-approval');
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Error fetching pending loans:', error);
      throw error;
    }
  },

  // Get loans by branch
  getByBranch: async (branch) => {
    try {
      const response = await api.get(`/loans/branch/${branch}`);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error(`Error fetching loans for branch ${branch}:`, error);
      throw error;
    }
  },

  // Get loans created by loan officer
  getByCreator: async (loanOfficerId) => {
    try {
      const response = await api.get(`/loans/created-by/${loanOfficerId}`);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error(`Error fetching loans by creator ${loanOfficerId}:`, error);
      throw error;
    }
  },

  // Get loans processed by cashier
  getProcessedBy: async (cashierId) => {
    try {
      const response = await api.get(`/loans/processed-by/${cashierId}`);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error(`Error fetching loans processed by ${cashierId}:`, error);
      throw error;
    }
  },

  // Create new loan
  create: async (loanData) => {
    try {
      const response = await api.post('/loans', loanData);
      return response;
    } catch (error) {
      console.error('Error creating loan:', error);
      throw error;
    }
  },

  // Update loan
  update: async (id, loanData) => {
    try {
      const response = await api.put(`/loans/${id}`, loanData);
      return response;
    } catch (error) {
      console.error(`Error updating loan ${id}:`, error);
      throw error;
    }
  },

  // Delete loan
  delete: async (id) => {
    try {
      const response = await api.delete(`/loans/${id}`);
      return response;
    } catch (error) {
      console.error(`Error deleting loan ${id}:`, error);
      throw error;
    }
  },

  // Approve loan
  approve: async (id, approvedBy) => {
    try {
      const response = await api.post(`/loans/${id}/approve`, { approvedBy });
      return response;
    } catch (error) {
      console.error(`Error approving loan ${id}:`, error);
      throw error;
    }
  },

  // Reject loan
  reject: async (id, rejectedBy, reason) => {
    try {
      const response = await api.post(`/loans/${id}/reject`, { rejectedBy, reason });
      return response;
    } catch (error) {
      console.error(`Error rejecting loan ${id}:`, error);
      throw error;
    }
  },

  // Disburse loan
  disburse: async (id, disbursedBy) => {
    try {
      const response = await api.post(`/loans/${id}/disburse`, { disbursedBy });
      return response;
    } catch (error) {
      console.error(`Error disbursing loan ${id}:`, error);
      throw error;
    }
  },

  // Archive loan
  archive: async (id) => {
    try {
      const response = await api.post(`/loans/${id}/archive`);
      return response;
    } catch (error) {
      console.error(`Error archiving loan ${id}:`, error);
      throw error;
    }
  },

  // Unarchive loan
  unarchive: async (id) => {
    try {
      const response = await api.post(`/loans/${id}/unarchive`);
      return response;
    } catch (error) {
      console.error(`Error unarchiving loan ${id}:`, error);
      throw error;
    }
  },

  // Get workflow summary for a loan
  getWorkflowSummary: async (loanId) => {
    try {
      const response = await api.get(`/loans/${loanId}/workflow`);
      return response;
    } catch (error) {
      console.error(`Error fetching workflow summary for loan ${loanId}:`, error);
      throw error;
    }
  },

  // Check if user can modify loan
  canModify: async (loanId, userId) => {
    try {
      const response = await api.get(`/loans/${loanId}/can-modify/${userId}`);
      return response;
    } catch (error) {
      console.error(`Error checking modify permission for loan ${loanId}:`, error);
      throw error;
    }
  },

  // Admin: Get all loans regardless of status
  getAllForAdmin: async () => {
    try {
      const response = await api.get('/loans/admin/all');
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Error fetching all loans for admin:', error);
      throw error;
    }
  }
};

export default LoanService;
