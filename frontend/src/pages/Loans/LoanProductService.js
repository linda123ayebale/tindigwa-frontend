import api from '../../services/api';

const LoanProductService = {
  // Get all loan products
  getAll: async () => {
    try {
      const response = await api.get('/loan-products');
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Error fetching loan products:', error);
      throw error;
    }
  },

  // Get loan product by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/loan-products/${id}`);
      return response;
    } catch (error) {
      console.error(`Error fetching loan product ${id}:`, error);
      throw error;
    }
  },

  // Create new loan product
  create: async (productData) => {
    try {
      const response = await api.post('/loan-products/addLoanProduct', productData);
      return response;
    } catch (error) {
      console.error('Error creating loan product:', error);
      throw error;
    }
  },

  // Update loan product
  update: async (id, productData) => {
    try {
      const response = await api.put(`/loan-products/${id}`, productData);
      return response;
    } catch (error) {
      console.error(`Error updating loan product ${id}:`, error);
      throw error;
    }
  },

  // Delete loan product
  delete: async (id) => {
    try {
      const response = await api.delete(`/loan-products/${id}`);
      return response;
    } catch (error) {
      console.error(`Error deleting loan product ${id}:`, error);
      throw error;
    }
  }
};

export default LoanProductService;
