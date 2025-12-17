import ApiService from './api';

class RolesService {
  constructor() {
    this.basePath = '/roles';
  }

  // Get all roles
  async getAllRoles() {
    try {
      return await ApiService.get(this.basePath);
    } catch (error) {
      console.error('Error fetching roles:', error);
      throw error;
    }
  }

  // Get role by ID
  async getRoleById(id) {
    try {
      return await ApiService.get(`${this.basePath}/${id}`);
    } catch (error) {
      console.error(`Error fetching role ${id}:`, error);
      throw error;
    }
  }

  // Create new role
  async createRole(roleData) {
    try {
      return await ApiService.post(this.basePath, roleData);
    } catch (error) {
      console.error('Error creating role:', error);
      throw error;
    }
  }

  // Update existing role
  async updateRole(id, roleData) {
    try {
      return await ApiService.put(`${this.basePath}/${id}`, roleData);
    } catch (error) {
      console.error(`Error updating role ${id}:`, error);
      throw error;
    }
  }

  // Delete role
  async deleteRole(id) {
    try {
      return await ApiService.delete(`${this.basePath}/${id}`);
    } catch (error) {
      console.error(`Error deleting role ${id}:`, error);
      throw error;
    }
  }

  // Validate role data
  validateRoleData(roleData) {
    const required = ['name'];
    const missing = required.filter(field => !roleData[field]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }

    return true;
  }

  // Format role data for API
  formatRoleData(formData) {
    return {
      name: formData.name?.trim(),
      description: formData.description?.trim() || '',
      permissions: formData.permissions || [],
      status: formData.status || 'active'
    };
  }

  // Get default permissions list
  getAvailablePermissions() {
    return [
      // Client Management
      'clients:view',
      'clients:create',
      'clients:edit',
      'clients:delete',
      
      // Loan Management
      'loans:view',
      'loans:create',
      'loans:approve',
      'loans:disburse',
      'loans:edit',
      'loans:delete',
      
      // Payment Management
      'payments:view',
      'payments:record',
      'payments:edit',
      'payments:delete',
      
      // Financial Management
      'finances:view',
      'finances:manage',
      'expenses:create',
      'expenses:approve',
      
      // Reports
      'reports:view',
      'reports:generate',
      'reports:export',
      
      // System Administration
      'users:view',
      'users:create',
      'users:edit',
      'users:delete',
      'roles:manage',
      'settings:manage',
      
      // Branch Management
      'branches:view',
      'branches:manage'
    ];
  }

  // Get default roles
  getDefaultRoles() {
    return [
      {
        name: 'Super Admin',
        description: 'Full system access',
        permissions: this.getAvailablePermissions()
      },
      {
        name: 'Branch Manager',
        description: 'Manage branch operations',
        permissions: [
          'clients:view', 'clients:create', 'clients:edit',
          'loans:view', 'loans:create', 'loans:approve', 'loans:disburse',
          'payments:view', 'payments:record', 'payments:edit',
          'finances:view', 'expenses:create',
          'reports:view', 'reports:generate'
        ]
      },
      {
        name: 'Loan Officer',
        description: 'Handle client loans and payments',
        permissions: [
          'clients:view', 'clients:create', 'clients:edit',
          'loans:view', 'loans:create',
          'payments:view', 'payments:record',
          'reports:view'
        ]
      },
      {
        name: 'Accountant',
        description: 'Manage finances and expenses',
        permissions: [
          'clients:view',
          'loans:view',
          'payments:view', 'payments:record', 'payments:edit',
          'finances:view', 'finances:manage',
          'expenses:create', 'expenses:approve',
          'reports:view', 'reports:generate', 'reports:export'
        ]
      },
      {
        name: 'Cashier',
        description: 'Handle payments only',
        permissions: [
          'clients:view',
          'loans:view',
          'payments:view', 'payments:record'
        ]
      }
    ];
  }

  // Check if user has specific permission
  hasPermission(userPermissions, requiredPermission) {
    return userPermissions.includes(requiredPermission);
  }

  // Check if user has any of the required permissions
  hasAnyPermission(userPermissions, requiredPermissions) {
    return requiredPermissions.some(permission => 
      userPermissions.includes(permission)
    );
  }

  // Check if user has all required permissions
  hasAllPermissions(userPermissions, requiredPermissions) {
    return requiredPermissions.every(permission => 
      userPermissions.includes(permission)
    );
  }

  // Group permissions by category
  groupPermissionsByCategory(permissions) {
    const groups = {
      'Client Management': [],
      'Loan Management': [],
      'Payment Management': [],
      'Financial Management': [],
      'Reports': [],
      'System Administration': [],
      'Branch Management': []
    };

    permissions.forEach(permission => {
      const [category] = permission.split(':');
      switch (category) {
        case 'clients':
          groups['Client Management'].push(permission);
          break;
        case 'loans':
          groups['Loan Management'].push(permission);
          break;
        case 'payments':
          groups['Payment Management'].push(permission);
          break;
        case 'finances':
        case 'expenses':
          groups['Financial Management'].push(permission);
          break;
        case 'reports':
          groups['Reports'].push(permission);
          break;
        case 'users':
        case 'roles':
        case 'settings':
          groups['System Administration'].push(permission);
          break;
        case 'branches':
          groups['Branch Management'].push(permission);
          break;
        default:
          groups['System Administration'].push(permission);
      }
    });

    return groups;
  }
}

// eslint-disable-next-line import/no-anonymous-default-export
// eslint-disable-next-line import/no-anonymous-default-export
export default new RolesService();
