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
      const response = await ApiService.get(`${this.basePath}/${id}`);
      console.log('Raw API response for client:', response); // Debug logging
      return response;
    } catch (error) {
      console.error(`Error fetching client ${id}:`, error);
      throw error;
    }
  }

  // Alias for getClientById for consistency
  async getById(id) {
    return this.getClientById(id);
  }

  // Create new client
  async createClient(clientData) {
    try {
      return await ApiService.post(`${this.basePath}/save-client`, clientData);
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  }

  // Update existing client
  async updateClient(id, clientData) {
    try {
      return await ApiService.put(`${this.basePath}/update-client/${id}`, clientData);
    } catch (error) {
      console.error(`Error updating client ${id}:`, error);
      throw error;
    }
  }

  // Delete client
  async deleteClient(id) {
    try {
      return await ApiService.delete(`${this.basePath}/delete-client/${id}`);
    } catch (error) {
      console.error(`Error deleting client ${id}:`, error);
      throw error;
    }
  }

  // Validate client data before sending to API
  validateClientData(clientData) {
    // Map frontend field names to backend requirements
    const firstName = clientData.firstName || clientData.givenName;
    const lastName = clientData.lastName || clientData.surname;
    const nationalId = clientData.nationalId || clientData.nationalIdNumber;
    const phoneNumber = clientData.phoneNumber;
    
    const missing = [];
    if (!firstName?.trim()) missing.push('First Name');
    if (!lastName?.trim()) missing.push('Last Name');
    if (!nationalId?.trim()) missing.push('National ID');
    if (!phoneNumber?.trim()) missing.push('Phone Number');
    
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }

    // Age validation
    if (clientData.age && (clientData.age < 18 || clientData.age > 100)) {
      throw new Error('Age must be between 18 and 100');
    }

    return true;
  }

  // Format client data for API - matches new backend ClientRegistrationRequest
  formatClientData(formData) {
    return {
      // Basic Information
      firstName: formData.firstName?.trim() || formData.givenName?.trim(),
      middleName: formData.middleName?.trim() || formData.givenName?.trim(),
      lastName: formData.lastName?.trim() || formData.surname?.trim(),
      age: formData.age ? parseInt(formData.age) : undefined,
      nationalId: formData.nationalId?.trim() || formData.nationalIdNumber?.trim(),
      phoneNumber: formData.phoneNumber?.trim(),
      email: formData.email?.trim() || '',
      
      // Address Information
      village: formData.village?.trim() || '',
      parish: formData.parish?.trim() || '',
      district: formData.district?.trim() || '',
      
      // Guarantor Information (for clients)
      guarantorFirstName: formData.guarantorFirstName?.trim() || '',
      guarantorLastName: formData.guarantorLastName?.trim() || '',
      guarantorPhone: formData.guarantorPhone?.trim() || '',
      guarantorRelationship: formData.guarantorRelationship?.trim() || '',
      
      // Employment Information
      employmentStatus: formData.employmentStatus?.trim() || '',
      occupation: formData.occupation?.trim() || formData.sourceOfIncome?.trim() || '',
      monthlyIncome: formData.monthlyIncome?.trim() || '',
      
      // System Information
      branch: formData.branch?.trim() || 'Main',
      agreementSigned: formData.agreementSigned !== undefined ? formData.agreementSigned : true,
      
      // Legacy/Backward compatibility fields
      surname: formData.surname?.trim() || formData.lastName?.trim(),
      givenName: formData.givenName?.trim() || formData.middleName?.trim(),
      nationalIdNumber: formData.nationalIdNumber?.trim() || formData.nationalId?.trim(),
      sourceOfIncome: formData.sourceOfIncome?.trim() || formData.occupation?.trim(),
      guarantorName: formData.guarantorName?.trim() || '',
      guarantorAge: formData.guarantorAge ? parseInt(formData.guarantorAge) : undefined,
      guarantorContact: formData.guarantorContact?.trim() || '',
      guarantorNationalId: formData.guarantorNationalId?.trim() || '',
      guarantorVillage: formData.guarantorVillage?.trim() || '',
      guarantorParish: formData.guarantorParish?.trim() || '',
      guarantorDistrict: formData.guarantorDistrict?.trim() || '',
      guarantorIncomeSource: formData.guarantorIncomeSource?.trim() || ''
    };
  }
}

// eslint-disable-next-line import/no-anonymous-default-export
export default new ClientService();
