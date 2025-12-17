import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Phone,
  Eye,
  Users,
  UserCheck,
  UserCog,
  DollarSign
} from 'lucide-react';
import StaffService from '../../services/staffService';
import NotificationModal from '../../components/NotificationModal';
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal';
import { useNotification } from '../../hooks/useNotification';
import Sidebar from '../../components/Layout/Sidebar';
import '../../styles/table-common.css';
import './ViewStaff.css'; // Use dedicated staff styles

const ViewStaff = () => {
  const navigate = useNavigate();
  const [staff, setStaff] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { notification, showSuccess, showError, hideNotification } = useNotification();

  // Fetch staff from API
  const fetchStaff = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('🔄 Fetching staff from API...');
      
      const staffData = await StaffService.getAllStaff();
      console.log('✅ Staff fetched successfully:', staffData);
      
      // Transform staff data for display
      const transformedStaff = (staffData || []).map(staffMember => ({
        ...staffMember,
        // Build full name
        fullName: [staffMember.firstName, staffMember.middleName, staffMember.lastName]
          .filter(name => name && name.trim())
          .join(' ') || 'N/A',
        
        // Map fields
        firstName: staffMember.firstName || '',
        lastName: staffMember.lastName || '',
        gender: staffMember.gender || '',
        age: staffMember.age || '',
        nationalId: staffMember.nationalId || '',
        email: staffMember.email || 'No email',
        phone: staffMember.phoneNumber || 'No phone',
        village: staffMember.village || '',
        parish: staffMember.parish || '',
        district: staffMember.district || '',
        branch: staffMember.branch || 'Main',
        role: staffMember.role || staffMember.staffType || 'STAFF',
        
        // Next of Kin info
        nextOfKin: staffMember.nextOfKin ? {
          fullName: staffMember.nextOfKin.fullName || 'N/A',
          phoneNumber: staffMember.nextOfKin.phoneNumber || 'N/A'
        } : null,
        
        // Default values
        status: staffMember.status || 'active',
        createdAt: staffMember.createdAt || new Date().toISOString(),
      }));
      
      setStaff(transformedStaff);
      
    } catch (error) {
      console.error('❌ Error fetching staff:', error);
      setError(error.message);
      setStaff([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleDeleteStaff = (staffMember) => {
    console.log('🗑️ Delete button clicked for staff:', staffMember);
    setStaffToDelete(staffMember);
    setShowDeleteModal(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!staffToDelete) return;
    
    try {
      setIsDeleting(true);
      console.log('🗑️ Proceeding with deletion of staff ID:', staffToDelete.id);
      
      const response = await StaffService.deleteStaff(staffToDelete.id);
      console.log('🗑️ Delete response:', response);
      
      // Remove staff from local state
      setStaff(prevStaff => prevStaff.filter(s => s.id !== staffToDelete.id));
      
      // Show success notification
      showSuccess(`${staffToDelete.fullName} has been successfully removed from the staff. The staff member's access has been revoked.`);
      
      // Close modal
      setShowDeleteModal(false);
      setStaffToDelete(null);
      
    } catch (error) {
      console.error('❌ Error deleting staff:', error);
      
      // Provide more user-friendly error messages
      let errorMessage = error.message;
      if (errorMessage.includes('404')) {
        errorMessage = 'Staff member not found. They may have already been removed.';
      } else if (errorMessage.includes('403')) {
        errorMessage = 'You do not have permission to remove this staff member.';
      } else if (errorMessage.includes('400')) {
        errorMessage = 'Cannot remove this staff member. They may have active responsibilities.';
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (!errorMessage || errorMessage === 'undefined') {
        errorMessage = 'An unknown error occurred while removing the staff member.';
      }
      
      showError(`Failed to remove ${staffToDelete.fullName}: ${errorMessage}`);
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setStaffToDelete(null);
    setIsDeleting(false);
  };

  const handleViewStaff = (staffId) => {
    navigate(`/users/staff/${staffId}`);
  };

  const handleEditStaff = (staffMember) => {
    console.log('🔧 Edit button clicked for staff:', staffMember);
    navigate(`/users/staff/edit/${staffMember.id}`);
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'LOAN_OFFICER':
        return <UserCheck size={16} />;
      case 'CASHIER':
        return <DollarSign size={16} />;
      case 'SUPERVISOR':
        return <UserCog size={16} />;
      default:
        return <Users size={16} />;
    }
  };

  const getRoleDisplayName = (role) => {
    return StaffService.getStaffTypeDisplayName(role);
  };

  const filteredStaff = staff.filter(staffMember => {
    const matchesSearch = staffMember.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staffMember.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staffMember.phone.includes(searchTerm) ||
                         staffMember.role.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterRole === 'all' || staffMember.role === filterRole;
    
    return matchesSearch && matchesFilter;
  });

  // Pagination logic
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentStaff = filteredStaff.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisibleButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisibleButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);
    
    if (endPage - startPage + 1 < maxVisibleButtons) {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          className={`pagination-btn ${currentPage === i ? 'active' : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }
    
    return buttons;
  };

  // Reset to page 1 when search or filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterRole]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get staff statistics
  const getStaffStats = () => {
    const stats = {
      total: staff.length,
      loanOfficers: staff.filter(s => s.role === 'LOAN_OFFICER').length,
      cashiers: staff.filter(s => s.role === 'CASHIER').length,
      supervisors: staff.filter(s => s.role === 'SUPERVISOR').length,
      active: staff.filter(s => s.status === 'active').length
    };
    return stats;
  };

  const stats = getStaffStats();

  if (isLoading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading staff members...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main">
          <div className="error-state">
            <h3>Error loading staff</h3>
            <p>{error}</p>
            <button onClick={fetchStaff} className="retry-button">
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        {/* Header Section */}
        <div className="page-header">
          <div className="header-content">
            <h1>Staff Management</h1>
            <p>Manage staff members and their roles</p>
          </div>
          <button
            className="add-button primary"
            onClick={() => navigate('/users/add-staff')}
          >
            <Plus size={20} />
            Add Staff Member
          </button>
        </div>

        <div className="staff-content">
          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <Users size={24} />
              </div>
              <div className="stat-info">
                <h3>{stats.total}</h3>
                <p>Total Staff</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <UserCheck size={24} />
              </div>
              <div className="stat-info">
                <h3>{stats.loanOfficers}</h3>
                <p>Loan Officers</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <DollarSign size={24} />
              </div>
              <div className="stat-info">
                <h3>{stats.cashiers}</h3>
                <p>Cashiers</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <UserCog size={24} />
              </div>
              <div className="stat-info">
                <h3>{stats.supervisors}</h3>
                <p>Supervisors</p>
              </div>
            </div>
          </div>

        {/* Filters and Search */}
        <div className="filters-section">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search staff by name, email, phone, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-group">
            <Filter size={20} />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Roles</option>
              <option value="LOAN_OFFICER">Loan Officers</option>
              <option value="CASHIER">Cashiers</option>
              <option value="SUPERVISOR">Supervisors</option>
            </select>
          </div>
        </div>

        {/* Staff Table */}
        <div className="table-container">
          {filteredStaff.length === 0 ? (
            <div className="empty-state">
              <Users size={48} />
              <h3>No staff members found</h3>
              <p>
                {searchTerm || filterRole !== 'all' 
                  ? 'Try adjusting your search or filter criteria.' 
                  : 'Get started by adding your first staff member.'}
              </p>
              {(!searchTerm && filterRole === 'all') && (
                <button
                  className="add-button primary"
                  onClick={() => navigate('/users/add-staff')}
                >
                  <Plus size={20} />
                  Add First Staff Member
                </button>
              )}
            </div>
          ) : (
            <>
              <table className="staff-table">
                <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Contact</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Date Added</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentStaff.map((staffMember) => (
                  <tr key={staffMember.id}>
                    <td>
                      <div className="staff-name">{staffMember.fullName}</div>
                      <div className="staff-id">ID: {staffMember.nationalId || staffMember.id}</div>
                    </td>
                    
                    <td>
                      <span className="role-badge">
                        {getRoleIcon(staffMember.role)}
                        {getRoleDisplayName(staffMember.role)}
                      </span>
                    </td>
                    
                    <td>
                      <div className="contact-item">
                        <Phone size={14} />
                        <span>{staffMember.phone}</span>
                      </div>
                      {staffMember.email !== 'No email' && (
                        <div className="contact-email">{staffMember.email}</div>
                      )}
                    </td>
                    
                    <td>
                      {[staffMember.village, staffMember.parish, staffMember.district]
                        .filter(Boolean)
                        .join(', ') || '-'}
                    </td>
                    
                    <td>
                      <span className={`status-badge ${staffMember.status === 'active' ? 'status-completed' : 'status-pending'}`}>
                        {staffMember.status}
                      </span>
                    </td>
                    
                    <td>{formatDate(staffMember.createdAt)}</td>
                    
                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-btn view"
                          onClick={() => handleViewStaff(staffMember.id)}
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="action-btn edit"
                          onClick={() => handleEditStaff(staffMember)}
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={() => handleDeleteStaff(staffMember)}
                          title="Delete"
                          disabled={isDeleting}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                </tbody>
              </table>

              {/* Pagination */}
              {filteredStaff.length > itemsPerPage && (
                <div className="pagination-container">
                  <div className="pagination-info">
                    <p>Showing {startIndex + 1}-{Math.min(endIndex, filteredStaff.length)} of {filteredStaff.length} staff members</p>
                  </div>
                  <div className="pagination">
                    <button 
                      className="pagination-btn"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                    {renderPaginationButtons()}
                    <button 
                      className="pagination-btn"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

          {/* Summary */}
          {filteredStaff.length > 0 && !( filteredStaff.length > itemsPerPage) && (
            <div className="table-summary">
              <p>Showing {filteredStaff.length} of {staff.length} staff members</p>
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
        itemName={staffToDelete?.fullName}
        itemType="staff member"
        itemDetails={[
          `Role: ${staffToDelete?.role ? StaffService.getStaffTypeDisplayName(staffToDelete.role) : 'Not specified'}`,
          `Phone: ${staffToDelete?.phone || 'Not provided'}`,
          `National ID: ${staffToDelete?.nationalId || 'Not provided'}`
        ]}
      />

      {/* Notification Modal */}
      <NotificationModal
        isOpen={notification.isOpen}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onClose={hideNotification}
        autoClose={notification.autoClose}
        position={notification.position}
      />
    </div>
  );
};

export default ViewStaff;