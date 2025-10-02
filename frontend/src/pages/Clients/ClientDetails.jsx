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
  Calendar,
  Edit
} from 'lucide-react';
// Removed EditClientModal import - using page-based approach instead
import './ClientDetails.css';

const ClientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching client data - replace with actual API call
    const fetchClient = async () => {
      setLoading(true);
      
      // Sample clients data (same as in Clients.jsx)
      const sampleClients = [
        {
          id: 1,
          // Profile Information
          surname: 'Smith',
          givenName: 'John',
          fullName: 'John Smith',
          age: '35',
          nationalIdNumber: 'CM123456789',
          village: 'Buea Village',
          parish: 'Buea Parish',
          district: 'Fako',
          lengthOfStay: '10 years',
          sourceOfIncome: 'Small Business',
          passportPhotoUrl: 'https://via.placeholder.com/150',
          phoneNumber: '+237654321098',
          email: 'john.smith@email.com',
          
          // Spouse Information
          spouseName: 'Mary Smith',
          spouseId: 'CM987654321',
          
          // Guarantor Information
          guarantorName: 'Paul Ndongmo',
          guarantorAge: '45',
          guarantorContact: '+237698765432',
          guarantorNationalId: 'CM456789123',
          guarantorVillage: 'Limbe Village',
          guarantorParish: 'Limbe Parish',
          guarantorDistrict: 'Fako',
          guarantorSourceOfIncome: 'Civil Servant',
          
          // Employment Information
          employerName: 'Local Market Association',
          position: 'Shop Owner',
          monthlyIncome: '150000',
          employmentLength: '5 years',
          
          // System Information
          clientType: 'business',
          status: 'active',
          createdAt: '2024-01-15T10:00:00Z',
          
          // Documents
          agreementSigned: true,
          agreementNotes: 'All documents verified and signed properly.'
        },
        {
          id: 2,
          // Profile Information
          surname: 'Doe',
          givenName: 'Jane',
          fullName: 'Jane Doe',
          age: '28',
          nationalIdNumber: 'CM234567890',
          village: 'Douala Village',
          parish: 'Douala Parish',
          district: 'Wouri',
          lengthOfStay: '5 years',
          sourceOfIncome: 'Farming',
          passportPhotoUrl: 'https://via.placeholder.com/150',
          phoneNumber: '+237654321097',
          email: 'jane.doe@email.com',
          
          // Spouse Information
          spouseName: '',
          spouseId: '',
          
          // Guarantor Information
          guarantorName: 'Alice Fotso',
          guarantorAge: '40',
          guarantorContact: '+237698765431',
          guarantorNationalId: 'CM567890234',
          guarantorVillage: 'Douala Village',
          guarantorParish: 'Douala Parish',
          guarantorDistrict: 'Wouri',
          guarantorSourceOfIncome: 'Teacher',
          
          // Employment Information
          employerName: '',
          position: 'Self-employed Farmer',
          monthlyIncome: '80000',
          employmentLength: '3 years',
          
          // System Information
          clientType: 'individual',
          status: 'active',
          createdAt: '2024-01-20T14:30:00Z',
          
          // Documents
          agreementSigned: true,
          agreementNotes: ''
        },
        {
          id: 3,
          // Profile Information
          surname: 'Johnson',
          givenName: 'Michael',
          fullName: 'Michael Johnson',
          age: '42',
          nationalIdNumber: 'CM345678901',
          village: 'Bamenda Village',
          parish: 'Bamenda Parish',
          district: 'Mezam',
          lengthOfStay: '15 years',
          sourceOfIncome: 'Technology Services',
          passportPhotoUrl: 'https://via.placeholder.com/150',
          phoneNumber: '+237654321096',
          email: 'michael.j@email.com',
          
          // Spouse Information
          spouseName: 'Sarah Johnson',
          spouseId: 'CM876543210',
          
          // Guarantor Information
          guarantorName: 'Emmanuel Tabi',
          guarantorAge: '50',
          guarantorContact: '+237698765430',
          guarantorNationalId: 'CM678901345',
          guarantorVillage: 'Bamenda Village',
          guarantorParish: 'Bamenda Parish',
          guarantorDistrict: 'Mezam',
          guarantorSourceOfIncome: 'Business Owner',
          
          // Employment Information
          employerName: 'Tech Solutions Inc',
          position: 'IT Consultant',
          monthlyIncome: '300000',
          employmentLength: '8 years',
          
          // System Information
          clientType: 'business',
          status: 'prospect',
          createdAt: '2024-02-01T09:15:00Z',
          
          // Documents
          agreementSigned: false,
          agreementNotes: 'Pending final document review.'
        }
      ];

      // Find client by ID
      const foundClient = sampleClients.find(c => c.id === parseInt(id));
      
      setTimeout(() => {
        setClient(foundClient);
        setLoading(false);
      }, 500);
    };

    fetchClient();
  }, [id]);

  const handleBack = () => {
    navigate('/clients');
  };

  const handleEditClient = () => {
    // Navigate to edit client page instead of opening modal
    navigate(`/clients/edit/${client.id}`);
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

  if (!client) {
    return (
      <div className="client-details-error">
        <h2>Client not found</h2>
        <p>The client you're looking for doesn't exist or has been removed.</p>
        <button onClick={handleBack} className="back-button">
          <ArrowLeft size={16} />
          Back to Clients
        </button>
      </div>
    );
  }

  return (
    <div className="client-details-layout">
      {/* Page Header - Reusing the same structure as Clients page */}
      <div className="page-header">
        <div className="header-content">
          <h1>Client Details</h1>
        </div>
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
    </div>
  );
};

export default ClientDetails;
