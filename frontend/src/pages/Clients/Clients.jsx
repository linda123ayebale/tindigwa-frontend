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
import AddClientForm from '../../components/AddClientForm';
import EditClientModal from '../../components/EditClientModal';
import './Clients.css';

const Clients = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [isAddClientFormOpen, setIsAddClientFormOpen] = useState(false);
  const [isEditClientFormOpen, setIsEditClientFormOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  // const [isLoading, setIsLoading] = useState(false);

  // Sample data - replace with actual API call
  useEffect(() => {
    const sampleClients = [
      {
        id: 1,
        // Basic info for table display
        fullName: 'John Smith',
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@email.com',
        phone: '+1-234-567-8900',
        company: 'Smith Enterprises',
        clientType: 'business',
        status: 'active',
        createdAt: '2024-01-15T10:00:00Z',
        
        // Detailed info for EditClientForm
        surname: 'Smith',
        givenName: 'John',
        age: '35',
        nationalIdNumber: 'CM123456789',
        village: 'Buea Village',
        parish: 'Buea Parish',
        district: 'Fako',
        lengthOfStay: '10 years',
        sourceOfIncome: 'Small Business',
        passportPhotoUrl: 'https://via.placeholder.com/150',
        phoneNumber: '+1-234-567-8900',
        
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
        
        // Documents
        documents: [],
        agreementSigned: true,
        agreementNotes: 'All documents verified and signed properly.'
      },
      {
        id: 2,
        // Basic info for table display
        fullName: 'Jane Doe',
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@email.com',
        phone: '+1-234-567-8901',
        company: '',
        clientType: 'individual',
        status: 'active',
        createdAt: '2024-01-20T14:30:00Z',
        
        // Detailed info for EditClientForm
        surname: 'Doe',
        givenName: 'Jane',
        age: '28',
        nationalIdNumber: 'CM234567890',
        village: 'Douala Village',
        parish: 'Douala Parish',
        district: 'Wouri',
        lengthOfStay: '5 years',
        sourceOfIncome: 'Farming',
        passportPhotoUrl: 'https://via.placeholder.com/150',
        phoneNumber: '+1-234-567-8901',
        
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
        
        // Documents
        documents: [],
        agreementSigned: true,
        agreementNotes: ''
      },
      {
        id: 3,
        // Basic info for table display
        fullName: 'Michael Johnson',
        firstName: 'Michael',
        lastName: 'Johnson',
        email: 'michael.j@email.com',
        phone: '+1-234-567-8902',
        company: 'Tech Solutions Inc',
        clientType: 'business',
        status: 'prospect',
        createdAt: '2024-02-01T09:15:00Z',
        
        // Detailed info for EditClientForm
        surname: 'Johnson',
        givenName: 'Michael',
        age: '42',
        nationalIdNumber: 'CM345678901',
        village: 'Bamenda Village',
        parish: 'Bamenda Parish',
        district: 'Mezam',
        lengthOfStay: '15 years',
        sourceOfIncome: 'Technology Services',
        passportPhotoUrl: 'https://via.placeholder.com/150',
        phoneNumber: '+1-234-567-8902',
        
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
        
        // Documents
        documents: [],
        agreementSigned: false,
        agreementNotes: 'Pending final document review.'
      }
    ];
    setClients(sampleClients);
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

  const handleAddClient = async (clientData) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newClient = {
        id: clients.length + 1,
        ...clientData
      };
      
      setClients(prevClients => [newClient, ...prevClients]);
      setIsAddClientFormOpen(false);
      
      // Show success message (you could use a toast library here)
      alert('Client added successfully!');
      
    } catch (error) {
      console.error('Error adding client:', error);
      alert('Failed to add client. Please try again.');
    }
  };

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
            onClick={() => setIsAddClientFormOpen(true)}
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
            {filteredClients.length === 0 ? (
              <div className="empty-state">
                <Users size={48} />
                <h3>No clients found</h3>
                <p>
                  {searchTerm || filterStatus !== 'all' 
                    ? 'Try adjusting your search or filter criteria.'
                    : 'Get started by adding your first client.'
                  }
                </p>
                {!searchTerm && filterStatus === 'all' && (
                  <button 
                    className="add-client-btn primary"
                    onClick={() => setIsAddClientFormOpen(true)}
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

      {/* Add Client Form Modal */}
      <AddClientForm
        isOpen={isAddClientFormOpen}
        onSubmit={handleAddClient}
        onCancel={() => setIsAddClientFormOpen(false)}
      />

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
