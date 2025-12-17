import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  MapPin, 
  User, 
  Users,
  Briefcase,
  FileText,
  Calendar
} from 'lucide-react';
// Removed EditClientModal import - using page-based approach instead
import ClientService from '../../services/clientService';
import NotificationModal from '../../components/NotificationModal';
import { useNotification } from '../../hooks/useNotification';
import './ClientDetails.css';

const ClientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notification, showNotification, hideNotification } = useNotification();
  
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await ClientService.getById(id);
        
        if (response && response.id) {
          // Map backend data structure to component state
          // Backend returns ClientResponse directly (not wrapped in success/data)
          const clientData = response;
          setClient({
            id: clientData.id,
            // Profile Information - matching actual backend response structure
            surname: clientData.lastName,
            givenName: clientData.firstName,
            fullName: clientData.fullName || `${clientData.firstName || ''} ${clientData.middleName || ''} ${clientData.lastName || ''}`.trim(),
            age: clientData.age?.toString(),
            nationalIdNumber: clientData.nationalId,
            village: clientData.village,
            parish: clientData.parish,
            district: clientData.district,
            lengthOfStay: clientData.lengthOfStay,
            sourceOfIncome: clientData.occupation,
            phoneNumber: clientData.phoneNumber,
            email: clientData.email,
            gender: clientData.gender,
            
            // Spouse Information - not in current backend response
            spouseName: clientData.spouseName,
            spouseId: clientData.spouseId,
            
            // Next of Kin/Guarantor Information - mapping from backend nextOfKin object
            guarantorName: clientData.nextOfKin?.fullName || '',
            guarantorAge: clientData.nextOfKin?.age?.toString() || '',
            guarantorContact: clientData.nextOfKin?.phoneNumber || '',
            guarantorNationalId: clientData.nextOfKin?.nationalId || '',
            guarantorVillage: clientData.nextOfKin?.village || '',
            guarantorParish: clientData.nextOfKin?.parish || '',
            guarantorDistrict: clientData.nextOfKin?.district || '',
            guarantorSourceOfIncome: clientData.nextOfKin?.sourceOfIncome || '',
            guarantorGender: clientData.nextOfKin?.gender || '',
            
            // Employment Information
            employerName: clientData.employerName || 'Self-employed',
            position: clientData.position,
            monthlyIncome: clientData.monthlyIncome?.toString(),
            employmentLength: clientData.employmentLength,
            
            // System Information
            clientType: 'individual', // Default since backend response doesn't include this
            status: 'active', // Default since backend doesn't have status field
            createdAt: clientData.createdAt,
            updatedAt: clientData.updatedAt,
            
            // Documents - these fields may not exist in backend yet
            agreementSigned: clientData.agreementSigned || false,
            agreementNotes: clientData.agreementNotes || ''
          });
        } else {
          setError('Client not found');
          showNotification('Client not found', 'error');
        }
      } catch (err) {
        console.error('Error fetching client:', err);
        setError('Failed to load client details');
        showNotification('Failed to load client details', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchClient();
    }
  }, [id, showNotification]);

  const handleBack = () => {
    navigate('/clients');
  };


  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'Not specified';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="client-details-loading">
        <div className="loading-spinner"></div>
        <p>Loading client details...</p>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="client-details-error">
        <h2>{error || 'Client not found'}</h2>
        <p>
          {error === 'Client not found' 
            ? "The client you're looking for doesn't exist or has been removed."
            : "An error occurred while loading the client details. Please try again."
          }
        </p>
        <button onClick={handleBack} className="back-button">
          <ArrowLeft size={16} />
          Back to Clients
        </button>
      </div>
    );
  }

  return (
    <div className="client-details-layout">
      {/* Page Header - Title on left, back button on right */}
      <div className="page-header">
        <h1>Client Details</h1>
        <button onClick={handleBack} className="back-button">
          <ArrowLeft size={18} />
          <span>Back to Clients</span>
        </button>
      </div>

      {/* Content */}
      <div className="client-details-content">
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
                <span>{client.fullName}</span>
              </div>
              <div className="detail-item">
                <label>Age</label>
                <span>{client.age || 'Not specified'}</span>
              </div>
              <div className="detail-item">
                <label>Gender</label>
                <span>{client.gender ? (client.gender === 'MALE' ? 'Male' : 'Female') : 'Not specified'}</span>
              </div>
              <div className="detail-item">
                <label>National ID Number</label>
                <span>{client.nationalIdNumber || 'Not specified'}</span>
              </div>
              <div className="detail-item">
                <label>Source of Income</label>
                <span>{client.sourceOfIncome || 'Not specified'}</span>
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
                  {client.phoneNumber}
                </span>
              </div>
              <div className="detail-item">
                <label>Email Address</label>
                <span className="contact-value">
                  <Mail size={14} />
                  {client.email || 'Not provided'}
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
                <span>{client.village || 'Not specified'}</span>
              </div>
              <div className="detail-item">
                <label>Parish</label>
                <span>{client.parish || 'Not specified'}</span>
              </div>
              <div className="detail-item">
                <label>District</label>
                <span>{client.district || 'Not specified'}</span>
              </div>
              <div className="detail-item">
                <label>Length of Stay</label>
                <span>{client.lengthOfStay || 'Not specified'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Spouse Information */}
        {(client.spouseName || client.spouseId) && (
          <div className="details-section">
            <div className="section-header">
              <Users size={20} />
              <h2>Spouse Information</h2>
            </div>
            <div className="section-content">
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Spouse Name</label>
                  <span>{client.spouseName || 'Not specified'}</span>
                </div>
                <div className="detail-item">
                  <label>Spouse ID</label>
                  <span>{client.spouseId || 'Not specified'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Guarantor Information */}
        <div className="details-section">
          <div className="section-header">
            <Users size={20} />
            <h2>Guarantor Information</h2>
          </div>
          <div className="section-content">
            <div className="detail-grid">
              <div className="detail-item">
                <label>Guarantor Name</label>
                <span>{client.guarantorName || 'Not specified'}</span>
              </div>
              <div className="detail-item">
                <label>Age</label>
                <span>{client.guarantorAge || 'Not specified'}</span>
              </div>
              <div className="detail-item">
                <label>Gender</label>
                <span>{client.guarantorGender ? (client.guarantorGender === 'MALE' ? 'Male' : 'Female') : 'Not specified'}</span>
              </div>
              <div className="detail-item">
                <label>Contact</label>
                <span className="contact-value">
                  <Phone size={14} />
                  {client.guarantorContact || 'Not specified'}
                </span>
              </div>
              <div className="detail-item">
                <label>National ID</label>
                <span>{client.guarantorNationalId || 'Not specified'}</span>
              </div>
              <div className="detail-item">
                <label>Village</label>
                <span>{client.guarantorVillage || 'Not specified'}</span>
              </div>
              <div className="detail-item">
                <label>Parish</label>
                <span>{client.guarantorParish || 'Not specified'}</span>
              </div>
              <div className="detail-item">
                <label>District</label>
                <span>{client.guarantorDistrict || 'Not specified'}</span>
              </div>
              <div className="detail-item">
                <label>Source of Income</label>
                <span>{client.guarantorSourceOfIncome || 'Not specified'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Employment Information */}
        <div className="details-section">
          <div className="section-header">
            <Briefcase size={20} />
            <h2>Employment Information</h2>
          </div>
          <div className="section-content">
            <div className="detail-grid">
              <div className="detail-item">
                <label>Employer Name</label>
                <span>{client.employerName || 'Self-employed'}</span>
              </div>
              <div className="detail-item">
                <label>Position</label>
                <span>{client.position || 'Not specified'}</span>
              </div>
              <div className="detail-item">
                <label>Monthly Income</label>
                <span className="income-value">
                  {formatCurrency(client.monthlyIncome)}
                </span>
              </div>
              <div className="detail-item">
                <label>Employment Length</label>
                <span>{client.employmentLength || 'Not specified'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Documents & Agreement */}
        <div className="details-section">
          <div className="section-header">
            <FileText size={20} />
            <h2>Documents & Agreement</h2>
          </div>
          <div className="section-content">
            <div className="detail-grid">
              <div className="detail-item">
                <label>Agreement Status</label>
                <span className={`agreement-status ${client.agreementSigned ? 'signed' : 'pending'}`}>
                  {client.agreementSigned ? '✓ Signed' : '⏳ Pending'}
                </span>
              </div>
              {client.agreementNotes && (
                <div className="detail-item full-width">
                  <label>Additional Notes</label>
                  <span className="notes-text">{client.agreementNotes}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="details-section">
          <div className="section-header">
            <Calendar size={20} />
            <h2>System Information</h2>
          </div>
          <div className="section-content">
            <div className="detail-grid">
              <div className="detail-item">
                <label>Client ID</label>
                <span>#{client.id}</span>
              </div>
              <div className="detail-item">
                <label>Date Added</label>
                <span>{formatDate(client.createdAt)}</span>
              </div>
              <div className="detail-item">
                <label>Client Type</label>
                <span className={`client-type ${client.clientType}`}>
                  {client.clientType === 'business' ? 'Business' : 'Individual'}
                </span>
              </div>
              <div className="detail-item">
                <label>Status</label>
                <span className={`status-badge ${client.status}`}>
                  {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal removed - using page-based editing instead */}
      
      {/* Notification Modal */}
      {notification.show && (
        <NotificationModal
          type={notification.type}
          message={notification.message}
          onClose={hideNotification}
        />
      )}
    </div>
  );
};

export default ClientDetails;
