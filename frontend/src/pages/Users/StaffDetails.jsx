import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  MapPin, 
  User, 
  Users,
  UserCheck,
  UserCog,
  DollarSign,
  Briefcase,
  Calendar,
  Edit
} from 'lucide-react';
import StaffService from '../../services/staffService';
import NotificationModal from '../../components/NotificationModal';
import { useNotification } from '../../hooks/useNotification';
import Sidebar from '../../components/Layout/Sidebar';
import './StaffDetails.css';

const StaffDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notification, showError, hideNotification } = useNotification();
  
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔄 Fetching staff details for ID:', id);
        const response = await StaffService.getStaffById(id);
        
        if (response && response.id) {
          // Map backend data structure to component state
          const staffData = response;
          setStaff({
            id: staffData.id,
            // Profile Information
            firstName: staffData.firstName,
            middleName: staffData.middleName,
            lastName: staffData.lastName,
            fullName: staffData.fullName || `${staffData.firstName || ''} ${staffData.middleName || ''} ${staffData.lastName || ''}`.trim(),
            age: staffData.age?.toString(),
            nationalId: staffData.nationalId,
            village: staffData.village,
            parish: staffData.parish,
            district: staffData.district,
            phoneNumber: staffData.phoneNumber,
            email: staffData.email,
            gender: staffData.gender,
            
            // Role Information
            role: staffData.role || staffData.staffType || 'STAFF',
            branch: staffData.branch || 'Main',
            
            // Next of Kin Information
            nextOfKin: staffData.nextOfKin ? {
              fullName: staffData.nextOfKin.fullName || '',
              phoneNumber: staffData.nextOfKin.phoneNumber || '',
              relationship: staffData.nextOfKin.relationship || '',
              village: staffData.nextOfKin.village || '',
              parish: staffData.nextOfKin.parish || '',
              district: staffData.nextOfKin.district || ''
            } : null,
            
            // System Information
            status: staffData.status || 'active',
            createdAt: staffData.createdAt,
            updatedAt: staffData.updatedAt
          });
        } else {
          setError('Staff member not found');
          showError('Staff member not found');
        }
      } catch (err) {
        console.error('❌ Error fetching staff:', err);
        setError('Failed to load staff details');
        showError('Failed to load staff details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchStaff();
    }
  }, [id, showError]);

  const handleBack = () => {
    navigate('/users/staff');
  };


  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'LOAN_OFFICER':
        return <UserCheck size={20} />;
      case 'CASHIER':
        return <DollarSign size={20} />;
      case 'SUPERVISOR':
        return <UserCog size={20} />;
      case 'ADMIN':
        return <UserCog size={20} />;
      default:
        return <Users size={20} />;
    }
  };

  const getRoleDisplayName = (role) => {
    return StaffService.getStaffTypeDisplayName(role);
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main">
          <div className="staff-details-loading">
            <div className="loading-spinner"></div>
            <p>Loading staff details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !staff) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main">
          <div className="staff-details-error">
            <h2>{error || 'Staff member not found'}</h2>
            <p>
              {error === 'Staff member not found' 
                ? "The staff member you're looking for doesn't exist or has been removed."
                : "An error occurred while loading the staff details. Please try again."
              }
            </p>
            <button onClick={handleBack} className="back-button">
              <ArrowLeft size={16} />
              Back to Staff
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
        {/* Page Header */}
        <div className="page-header">
          <button onClick={handleBack} className="back-button">
            <ArrowLeft size={18} />
            <span>Back to Staff</span>
          </button>
          <div className="header-title">
            <h1>Staff Details</h1>
          </div>
          <div className="header-spacer"></div>
        </div>

        {/* Content */}
        <div className="staff-details-content">
          {/* Personal Information */}
          <div className="details-section">
            <div className="section-header">
              <User size={20} />
              <h2>Personal Information</h2>
            </div>
            <div className="section-content">
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Full Name</label>
                  <span>{staff.fullName}</span>
                </div>
                <div className="detail-item">
                  <label>Age</label>
                  <span>{staff.age || 'Not specified'}</span>
                </div>
                <div className="detail-item">
                  <label>Gender</label>
                  <span>{staff.gender ? (staff.gender === 'MALE' ? 'Male' : 'Female') : 'Not specified'}</span>
                </div>
                <div className="detail-item">
                  <label>National ID Number</label>
                  <span>{staff.nationalId || 'Not specified'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="details-section">
            <div className="section-header">
              <Phone size={20} />
              <h2>Contact Information</h2>
            </div>
            <div className="section-content">
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Phone Number</label>
                  <span className="contact-value">
                    <Phone size={14} />
                    {staff.phoneNumber || 'Not provided'}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Email Address</label>
                  <span className="contact-value">
                    <Mail size={14} />
                    {staff.email || 'Not provided'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="details-section">
            <div className="section-header">
              <MapPin size={20} />
              <h2>Address Information</h2>
            </div>
            <div className="section-content">
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Village</label>
                  <span>{staff.village || 'Not specified'}</span>
                </div>
                <div className="detail-item">
                  <label>Parish</label>
                  <span>{staff.parish || 'Not specified'}</span>
                </div>
                <div className="detail-item">
                  <label>District</label>
                  <span>{staff.district || 'Not specified'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Role Information */}
          <div className="details-section">
            <div className="section-header">
              {getRoleIcon(staff.role)}
              <h2>Role Information</h2>
            </div>
            <div className="section-content">
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Role</label>
                  <span className="role-badge">
                    {getRoleIcon(staff.role)}
                    {getRoleDisplayName(staff.role)}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Branch</label>
                  <span>{staff.branch}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Next of Kin Information */}
          {staff.nextOfKin && (
            <div className="details-section">
              <div className="section-header">
                <Users size={20} />
                <h2>Next of Kin Information</h2>
              </div>
              <div className="section-content">
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Name</label>
                    <span>{staff.nextOfKin.fullName || 'Not specified'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Phone Number</label>
                    <span className="contact-value">
                      <Phone size={14} />
                      {staff.nextOfKin.phoneNumber || 'Not specified'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Relationship</label>
                    <span>{staff.nextOfKin.relationship || 'Not specified'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Village</label>
                    <span>{staff.nextOfKin.village || 'Not specified'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Parish</label>
                    <span>{staff.nextOfKin.parish || 'Not specified'}</span>
                  </div>
                  <div className="detail-item">
                    <label>District</label>
                    <span>{staff.nextOfKin.district || 'Not specified'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* System Information */}
          <div className="details-section">
            <div className="section-header">
              <Calendar size={20} />
              <h2>System Information</h2>
            </div>
            <div className="section-content">
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Staff ID</label>
                  <span>#{staff.id}</span>
                </div>
                <div className="detail-item">
                  <label>Date Added</label>
                  <span>{formatDate(staff.createdAt)}</span>
                </div>
                <div className="detail-item">
                  <label>Status</label>
                  <span className={`status-badge ${staff.status}`}>
                    {staff.status.charAt(0).toUpperCase() + staff.status.slice(1)}
                  </span>
                </div>
                {staff.updatedAt && (
                  <div className="detail-item">
                    <label>Last Updated</label>
                    <span>{formatDate(staff.updatedAt)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

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
      </main>
    </div>
  );
};

export default StaffDetails;