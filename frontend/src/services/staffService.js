import ApiService from './api';

class StaffService {
  constructor() {
    this.basePath = '/staff'; // Primary endpoint for staff-specific operations
    this.userPath = '/users'; // Fallback to users endpoint if staff endpoint doesn't exist
  }

  // Staff types constants
  static STAFF_TYPES = {
    LOAN_OFFICER: 'LOAN_OFFICER',
    CASHIER: 'CASHIER',
    SUPERVISOR: 'SUPERVISOR'
  };

  // Get all staff members
  async getAllStaff() {
    try {
      console.log('🔄 Fetching all staff members...');
      
      // Use the dedicated staff endpoint
      const response = await ApiService.get('/staff');
      console.log('✅ Staff members fetched successfully:', response);
      return response;
      
    } catch (error) {
      console.error('❌ Error fetching staff:', error);
      throw error;
    }
  }

  // Get staff by ID
  async getStaffById(id) {
    try {
      try {
        return await ApiService.get(`${this.basePath}/${id}`);
      } catch (error) {
        if (error.message.includes('404')) {
          return await ApiService.get(`${this.userPath}/${id}`);
        }
        throw error;
      }
    } catch (error) {
      console.error(`Error fetching staff ${id}:`, error);
      throw error;
    }
  }

  // Get staff by type (LOAN_OFFICER, CASHIER, SUPERVISOR)
  async getStaffByType(staffType) {
    try {
      try {
        return await ApiService.get(`${this.basePath}/type/${staffType}`);
      } catch (error) {
        if (error.message.includes('404')) {
          return await ApiService.get(`${this.userPath}?role=STAFF&type=${staffType}`);
        }
        throw error;
      }
    } catch (error) {
      console.error(`Error fetching staff of type ${staffType}:`, error);
      throw error;
    }
  }

  // Create new staff member
  async createStaff(staffData) {
    try {
      console.log('🖾️ Creating staff member with data:', staffData);
      
      // Use the dedicated staff endpoint
      const response = await ApiService.post('/staff/save-staff', staffData);
      console.log('✅ Staff member created successfully:', response);
      return response;
      
    } catch (error) {
      console.error('❌ Error creating staff:', error);
      throw error;
    }
  }

  // Update existing staff member
  async updateStaff(id, staffData) {
    try {
      try {
        return await ApiService.put(`${this.basePath}/update-staff/${id}`, staffData);
      } catch (error) {
        if (error.message.includes('404')) {
          const userData = { ...staffData, role: 'STAFF' };
          return await ApiService.put(`${this.userPath}/update-user/${id}`, userData);
        }
        throw error;
      }
    } catch (error) {
      console.error(`Error updating staff ${id}:`, error);
      throw error;
    }
  }

  // Delete staff member
  async deleteStaff(id) {
    try {
      try {
        return await ApiService.delete(`${this.basePath}/delete-staff/${id}`);
      } catch (error) {
        if (error.message.includes('404')) {
          return await ApiService.delete(`${this.userPath}/delete-user/${id}`);
        }
        throw error;
      }
    } catch (error) {
      console.error(`Error deleting staff ${id}:`, error);
      throw error;
    }
  }

  // Validate staff data before sending to API
  validateStaffData(staffData) {
    const firstName = staffData.firstName || staffData.givenName;
    const lastName = staffData.lastName || staffData.surname;
    const nationalId = staffData.nationalId || staffData.nationalIdNumber;
    const phoneNumber = staffData.phoneNumber;
    const role = staffData.role;
    
    const missing = [];
    if (!firstName?.trim()) missing.push('First Name');
    if (!lastName?.trim()) missing.push('Last Name');
    if (!nationalId?.trim()) missing.push('National ID');
    if (!phoneNumber?.trim()) missing.push('Phone Number');
    if (!role) missing.push('Role');
    
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }

    // Validate role - should be one of the valid staff roles
    const validRoles = ['LOAN_OFFICER', 'CASHIER', 'SUPERVISOR', 'ADMIN'];
    if (!validRoles.includes(role)) {
      throw new Error('Invalid role. Must be LOAN_OFFICER, CASHIER, SUPERVISOR, or ADMIN');
    }

    // Age validation
    if (staffData.age && (staffData.age < 18 || staffData.age > 70)) {
      throw new Error('Age must be between 18 and 70 for staff members');
    }

    return true;
  }

  // Format staff data for API
  formatStaffData(formData) {
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
      
      // Role Information (this is the key field that determines user type)
      role: formData.role?.trim(), // This should be LOAN_OFFICER, CASHIER, SUPERVISOR, or ADMIN
      gender: formData.gender?.trim(),
      
      // Next of Kin Information (instead of guarantor for staff)
      nextOfKinFirstName: formData.nextOfKinFirstName?.trim() || '',
      nextOfKinLastName: formData.nextOfKinLastName?.trim() || '',
      nextOfKinPhone: formData.nextOfKinPhone?.trim() || '',
      nextOfKinRelationship: formData.nextOfKinRelationship?.trim() || '',
      nextOfKinVillage: formData.nextOfKinVillage?.trim() || '',
      nextOfKinParish: formData.nextOfKinParish?.trim() || '',
      nextOfKinDistrict: formData.nextOfKinDistrict?.trim() || '',
      
      // System Information
      branch: formData.branch?.trim() || 'Main',
      status: formData.status || 'active',
      
      // Legacy/Backward compatibility fields
      surname: formData.surname?.trim() || formData.lastName?.trim(),
      givenName: formData.givenName?.trim() || formData.middleName?.trim(),
      nationalIdNumber: formData.nationalIdNumber?.trim() || formData.nationalId?.trim()
    };
  }

  // Get available staff types
  getStaffTypes() {
    return [
      { value: 'LOAN_OFFICER', label: 'Loan Officer', description: 'Handles loan applications and client relations' },
      { value: 'CASHIER', label: 'Cashier', description: 'Manages payments and cash transactions' },
      { value: 'SUPERVISOR', label: 'Supervisor', description: 'Supervises operations and staff management' }
    ];
  }

  // Get staff type display name
  getStaffTypeDisplayName(staffType) {
    const types = this.getStaffTypes();
    const type = types.find(t => t.value === staffType);
    return type ? type.label : staffType;
  }

  // Get permissions for staff type (based on roles service)
  getStaffPermissions(staffType) {
    switch (staffType) {
      case 'LOAN_OFFICER':
        return [
          'clients:view', 'clients:create', 'clients:edit',
          'loans:view', 'loans:create',
          'payments:view', 'payments:record',
          'reports:view'
        ];
      case 'CASHIER':
        return [
          'clients:view',
          'loans:view',
          'payments:view', 'payments:record'
        ];
      case 'SUPERVISOR':
        return [
          'clients:view', 'clients:create', 'clients:edit',
          'loans:view', 'loans:create', 'loans:approve', 'loans:disburse',
          'payments:view', 'payments:record', 'payments:edit',
          'finances:view', 'expenses:create',
          'reports:view', 'reports:generate',
          'users:view'
        ];
      default:
        return ['clients:view'];
    }
  }
}

// eslint-disable-next-line import/no-anonymous-default-export
export default new StaffService();