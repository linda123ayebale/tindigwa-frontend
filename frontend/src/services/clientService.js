import ApiService from './api';

class ClientService {
  constructor() {
    this.basePath = '/clients';
  }

  // Get all clients
  async getAllClients() {
    try {
      return await ApiService.get(this.basePath);
    } catch (error) {
      console.error('Error fetching clients:', error);
      throw error;
    }
  }

  // Get client by ID
  async getClientById(id) {
    try {
      return await ApiService.get(`${this.basePath}/${id}`);
    } catch (error) {
      console.error(`Error fetching client ${id}:`, error);
      throw error;
    }
  }

  // Create new client
  async createClient(clientData) {
    try {
      return await ApiService.post(this.basePath, clientData);
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  }

  // Update existing client
  async updateClient(id, clientData) {
    try {
      return await ApiService.put(`${this.basePath}/${id}`, clientData);
    } catch (error) {
      console.error(`Error updating client ${id}:`, error);
      throw error;
    }
  }

  // Delete client
  async deleteClient(id) {
    try {
      return await ApiService.delete(`${this.basePath}/${id}`);
    } catch (error) {
      console.error(`Error deleting client ${id}:`, error);
      throw error;
    }
  }

  // Validate client data before sending to API
  validateClientData(clientData) {
    const required = ['surname', 'givenName', 'age', 'nationalIdNumber', 'phoneNumber'];
    const missing = required.filter(field => !clientData[field]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }

    // Age validation
    if (clientData.age < 18 || clientData.age > 100) {
      throw new Error('Age must be between 18 and 100');
    }

    return true;
  }

  // Format client data for API
  formatClientData(formData) {
    return {
      surname: formData.surname?.trim(),
      givenName: formData.givenName?.trim(),
      age: parseInt(formData.age),
      nationalIdNumber: formData.nationalIdNumber?.trim(),
      village: formData.village?.trim() || '',
      parish: formData.parish?.trim() || '',
      district: formData.district?.trim() || '',
      lengthOfStayYears: parseInt(formData.lengthOfStayYears) || 0,
      sourceOfIncome: formData.sourceOfIncome?.trim() || '',
      passportPhotoUrl: formData.passportPhotoUrl?.trim() || '',
      spouseName: formData.spouseName?.trim() || '',
      spouseId: formData.spouseId?.trim() || '',
      phoneNumber: formData.phoneNumber?.trim(),
      guarantorName: formData.guarantorName?.trim() || '',
      guarantorAge: parseInt(formData.guarantorAge) || 0,
      guarantorContact: formData.guarantorContact?.trim() || '',
      guarantorNationalId: formData.guarantorNationalId?.trim() || '',
      guarantorVillage: formData.guarantorVillage?.trim() || '',
      guarantorParish: formData.guarantorParish?.trim() || '',
      guarantorDistrict: formData.guarantorDistrict?.trim() || '',
      guarantorIncomeSource: formData.guarantorIncomeSource?.trim() || ''
    };
  }
}

export default new ClientService();
