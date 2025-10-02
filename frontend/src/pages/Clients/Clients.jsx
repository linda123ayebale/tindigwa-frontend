import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, 
  Users, 
  CreditCard, 
  DollarSign, 
  FileText, 
  Settings,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Phone,
  Mail,
  Building,
  BarChart3,
  Eye
} from 'lucide-react';
import EditClientModal from '../../components/EditClientModal';
import ClientService from '../../services/clientService';
import './Clients.css';

const Clients = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [isEditClientFormOpen, setIsEditClientFormOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch clients from API
  const fetchClients = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('🔄 Fetching clients from API...');
      
      const clientsData = await ClientService.getAllClients();
      console.log('✅ Clients fetched successfully:', clientsData);
      
      // Transform backend data to match frontend expectations
      const transformedClients = (clientsData || []).map(client => ({
        ...client,
        // Ensure required fields for table display
        fullName: `${client.givenName || client.firstName || ''} ${client.surname || client.lastName || ''}`.trim() || 'N/A',
        firstName: client.givenName || client.firstName || '',
        lastName: client.surname || client.lastName || '',
        email: client.email || client.phoneNumber || 'No email',
        phone: client.phoneNumber || client.phone || 'No phone',
        company: client.company || '',
        clientType: client.clientType || 'individual',
        status: client.status || 'active',
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

  const sidebarItems = [
    { title: 'Dashboard', icon: Home, path: '/dashboard' },
    { title: 'Clients', icon: Users, path: '/clients', active: true },
    { title: 'Loans', icon: CreditCard, path: '/loans' },
    { title: 'Payments', icon: DollarSign, path: '/payments' },
    { title: 'Finances', icon: BarChart3, path: '/finances' },
    { title: 'Reports', icon: FileText, path: '/reports' },
    { title: 'Settings', icon: Settings, path: '/settings' }
  ];


  const handleDeleteClient = (clientId) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      setClients(prevClients => prevClients.filter(client => client.id !== clientId));
    }
  };

  const handleViewClient = (clientId) => {
    // Navigate to client details page
    navigate(`/clients/${clientId}`);
  };

  const handleEditClient = (client) => {
    setClientToEdit(client);
    setIsEditClientFormOpen(true);
  };

  const handleUpdateClient = async (updatedClientData) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the client in the state
      setClients(prevClients => 
        prevClients.map(client => 
          client.id === updatedClientData.id 
            ? updatedClientData 
            : client
        )
      );
      
      setIsEditClientFormOpen(false);
      setClientToEdit(null);
      
      // Show success message
      alert('Client updated successfully!');
      
    } catch (error) {
      console.error('Error updating client:', error);
      alert('Failed to update client. Please try again.');
    }
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.phone.includes(searchTerm);
    
    const matchesFilter = filterStatus === 'all' || client.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2>TINDIGWA</h2>
        </div>
        
        <nav className="sidebar-nav">
          {sidebarItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <button
                key={index}
                className={`nav-item ${item.active ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
              >
                <IconComponent size={20} />
                <span>{item.title}</span>
              </button>
            );
          })}
        </nav>
      </aside>

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
              <div className="clients-table">
                <div className="table-header">
                  <div className="table-row header-row">
                    <div className="table-cell">Client</div>
                    <div className="table-cell">Contact</div>
                    <div className="table-cell">Type</div>
                    <div className="table-cell">Status</div>
                    <div className="table-cell">Date Added</div>
                    <div className="table-cell">Actions</div>
                  </div>
                </div>
                
                <div className="table-body">
                  {filteredClients.map((client) => (
                    <div key={client.id} className="table-row">
                      <div className="table-cell">
                        <div className="client-name">{client.fullName}</div>
                      </div>
                      
                      <div className="table-cell">
                        <div className="contact-info">
                          <div className="contact-item">
                            <Phone size={14} />
                            <span>{client.phone}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="table-cell">
                        <span className={`client-type ${client.clientType}`}>
                          {client.clientType === 'business' ? 'Business' : 'Individual'}
                        </span>
                      </div>
                      
                      <div className="table-cell">
                        <span className={`status-badge ${client.status}`}>
                          {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                        </span>
                      </div>
                      
                      <div className="table-cell">
                        {formatDate(client.createdAt)}
                      </div>
                      
                      <div className="table-cell">
                        <div className="action-buttons">
                          <button 
                            className="action-btn view"
                            title="View Client Details"
                            onClick={() => handleViewClient(client.id)}
                          >
                            <Eye size={14} />
                          </button>
                          <button 
                            className="action-btn edit"
                            title="Edit Client"
                            onClick={() => handleEditClient(client)}
                          >
                            <Edit size={14} />
                          </button>
                          <button 
                            className="action-btn delete"
                            title="Delete Client"
                            onClick={() => handleDeleteClient(client.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Edit Client Modal */}
      <EditClientModal
        client={clientToEdit}
        isOpen={isEditClientFormOpen}
        onClose={() => {
          setIsEditClientFormOpen(false);
          setClientToEdit(null);
        }}
        onSave={handleUpdateClient}
      />
    </div>
  );
};

export default Clients;
