import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Phone
} from 'lucide-react';
import ClientService from '../../services/clientService';
import NotificationModal from '../../components/NotificationModal';
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal';
import { useNotification } from '../../hooks/useNotification';
import Sidebar from '../../components/Layout/Sidebar';
import '../../styles/table-common.css';
import './Clients.css';

const Clients = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { notification, showSuccess, showError, hideNotification } = useNotification();

  // Fetch clients from API
  const fetchClients = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('🔄 Fetching clients from API...');
      
      const clientsData = await ClientService.getAllClients();
      console.log('✅ Clients fetched successfully:', clientsData);
      
      // Transform NEW backend data structure (User-Person-NextOfKin-Guarantor)
      const transformedClients = (clientsData || []).map(client => ({
        ...client,
        // Build full name from new backend structure
        fullName: [client.firstName, client.middleName, client.lastName]
          .filter(name => name && name.trim())
          .join(' ') || 'N/A',
        
        // Map new backend fields
        firstName: client.firstName || '',
        lastName: client.lastName || '',
        gender: client.gender || '',
        age: client.age || '',
        nationalId: client.nationalId || '',
        email: client.email || 'No email',
        phone: client.phoneNumber || 'No phone',
        village: client.village || '',
        parish: client.parish || '',
        district: client.district || '',
        branch: client.branch || 'Main',
        
        // Next of Kin and Guarantor info
        nextOfKin: client.nextOfKin ? {
          fullName: client.nextOfKin.fullName || 'N/A',
          phoneNumber: client.nextOfKin.phoneNumber || 'N/A'
        } : null,
        
        guarantor: client.guarantor ? {
          fullName: client.guarantor.fullName || 'N/A', 
          phoneNumber: client.guarantor.phoneNumber || 'N/A'
        } : null,
        
        // Default values for table display
        clientType: 'individual', // All our clients are individuals
        status: 'active', // Default to active
        createdAt: client.createdAt || new Date().toISOString(),
      }));
      
      setClients(transformedClients);
      
    } catch (error) {
      console.error('❌ Error fetching clients:', error);
      setError(error.message);
      // If API fails, we can show empty state instead of crashing
      setClients([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);


  const handleDeleteClient = (client) => {
    console.log('🗑️ Delete button clicked for client:', client);
    setClientToDelete(client);
    setShowDeleteModal(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!clientToDelete) return;
    
    try {
      setIsDeleting(true);
      console.log('🗑️ Proceeding with deletion of client ID:', clientToDelete.id);
      
      const response = await ClientService.deleteClient(clientToDelete.id);
      console.log('🗑️ Delete response:', response);
      
      // Remove client from local state
      setClients(prevClients => prevClients.filter(c => c.id !== clientToDelete.id));
      
      // Show success notification
      showSuccess(`${clientToDelete.fullName} has been deleted successfully.`);
      
      // Close modal
      setShowDeleteModal(false);
      setClientToDelete(null);
      
    } catch (error) {
      console.error('❌ Error deleting client:', error);
      showError(`Failed to delete ${clientToDelete.fullName}: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setClientToDelete(null);
    setIsDeleting(false);
  };

  const handleViewClient = (clientId) => {
    // Navigate to client details page
    navigate(`/clients/${clientId}`);
  };

  const handleEditClient = (client) => {
    console.log('🔧 Edit button clicked for client:', client);
    console.log('🔧 Client ID:', client.id);
    console.log('🔧 Navigating to:', `/clients/edit/${client.id}`);
    
    // Navigate to edit client page instead of opening modal
    navigate(`/clients/edit/${client.id}`);
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.phone.includes(searchTerm);
    
    const matchesFilter = filterStatus === 'all' || client.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  // Pagination logic
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentClients = filteredClients.slice(startIndex, endIndex);

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
  }, [searchTerm, filterStatus]);


  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="page-header">
          <div className="header-content">
            <h1>Clients</h1>
          </div>
          <button 
            className="add-client-btn"
            onClick={() => navigate('/clients/add')}
          >
            <Plus size={16} />
            Add New Client
          </button>
        </div>

        <div className="clients-content">
          {/* Filters and Search */}
          <div className="clients-controls">
            <div className="search-box">
              <Search size={20} className="search-icon" />
              <input
                type="text"
                placeholder="Search clients by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="filter-controls">
              <div className="filter-group">
                <Filter size={16} />
                <select 
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="prospect">Prospect</option>
                </select>
              </div>
            </div>
          </div>

          {/* Clients Table */}
          <div className="clients-table-container">
            {isLoading ? (
              <div className="empty-state">
                <div style={{ fontSize: '48px' }}>⏳</div>
                <h3>Loading clients...</h3>
                <p>Fetching data from backend...</p>
              </div>
            ) : error ? (
              <div className="empty-state">
                <div style={{ fontSize: '48px', color: '#dc3545' }}>❌</div>
                <h3>Error loading clients</h3>
                <p>{error}</p>
                <button 
                  className="add-client-btn primary"
                  onClick={fetchClients}
                >
                  🔄 Retry
                </button>
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="empty-state">
                <Users size={48} />
                <h3>No clients found</h3>
                <p>
                  {searchTerm || filterStatus !== 'all' 
                    ? 'Try adjusting your search or filter criteria.'
                    : clients.length === 0 
                      ? 'No clients in the database. Add your first client to get started.'
                      : 'Get started by adding your first client.'
                  }
                </p>
                {!searchTerm && filterStatus === 'all' && (
                  <button 
                    className="add-client-btn primary"
                    onClick={() => navigate('/clients/add')}
                  >
                    <Plus size={16} />
                    Add Your First Client
                  </button>
                )}
              </div>
            ) : (
              <>
                <table className="clients-table">
                  <thead>
                    <tr>
                      <th>Client</th>
                      <th>Contact</th>
                      <th>Location</th>
                      <th>National ID</th>
                      <th>Next of Kin</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentClients.map((client) => (
                      <tr key={client.id}>
                        <td>
                          <div className="client-name">{client.fullName}</div>
                          <div className="client-meta">
                            {client.gender && <span className="badge">{client.gender}</span>}
                            {client.age && <span className="age-badge">{client.age} yrs</span>}
                          </div>
                        </td>
                        
                        <td>
                          <div className="contact-item">
                            <Phone size={14} />
                            <span>{client.phone}</span>
                          </div>
                          {client.email !== 'No email' && (
                            <div className="contact-email">{client.email}</div>
                          )}
                        </td>
                        
                        <td>
                          {[client.village, client.parish, client.district]
                            .filter(Boolean)
                            .join(', ') || <span className="no-data">-</span>}
                        </td>
                        
                        <td>{client.nationalId || '-'}</td>
                        
                        <td>
                          {client.nextOfKin ? (
                            <>
                              <div>{client.nextOfKin.fullName}</div>
                              {client.nextOfKin.phoneNumber !== 'N/A' && (
                                <div className="nok-phone">{client.nextOfKin.phoneNumber}</div>
                              )}
                            </>
                          ) : (
                            <span>-</span>
                          )}
                        </td>
                        
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="action-btn view"
                              title="View Details"
                              onClick={() => handleViewClient(client.id)}
                            >
                              <Eye size={16} />
                            </button>
                            <button 
                              className="action-btn edit"
                              title="Edit"
                              onClick={() => handleEditClient(client)}
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              className="action-btn delete"
                              title="Delete"
                              onClick={() => handleDeleteClient(client)}
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
                {filteredClients.length > itemsPerPage && (
                  <div className="pagination-container">
                    <div className="pagination-info">
                      <p>Showing {startIndex + 1}-{Math.min(endIndex, filteredClients.length)} of {filteredClients.length} clients</p>
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
        </div>
      </main>

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
      
      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        itemType="client"
        itemName={clientToDelete?.fullName}
        itemDetails={[
          `National ID: ${clientToDelete?.nationalId || 'Not provided'}`,
          `Phone: ${clientToDelete?.phone || 'Not provided'}`
        ]}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default Clients;
