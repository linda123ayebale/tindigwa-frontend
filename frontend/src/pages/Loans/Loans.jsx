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
  Eye,
  Calendar,
  MoreVertical,
  DollarSign as PaymentIcon,
  AlertCircle,
  BarChart3
} from 'lucide-react';
import EditLoanModal from './EditLoanModal';
import AddPaymentModal from './AddPaymentModal';
import DeleteLoanModal from './DeleteLoanModal';
import './Loans.css';

const Loans = () => {
  const navigate = useNavigate();
  const [loans, setLoans] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showActionMenu, setShowActionMenu] = useState(null);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentLoan, setPaymentLoan] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingLoan, setDeletingLoan] = useState(null);

  // Calculate loan status based on start date, duration, and grace period
  const calculateLoanStatus = (startDate, durationDays, amountPaid = 0, totalAmount = 1000) => {
    const today = new Date();
    const loanStartDate = new Date(startDate);
    const daysSinceStart = Math.floor((today - loanStartDate) / (1000 * 60 * 60 * 24));
    
    const gracePeriodDays = 14;
    const defaultPeriodMonths = 6;
    const defaultPeriodDays = defaultPeriodMonths * 30;
    
    // If loan is fully paid
    if (amountPaid >= totalAmount) {
      return { status: 'completed', color: '#28a745', bgColor: '#d4edda' };
    }
    
    // If within loan duration
    if (daysSinceStart <= durationDays) {
      return { status: 'active', color: '#007bff', bgColor: '#d1ecf1' };
    }
    
    // If beyond loan duration but within grace period
    if (daysSinceStart <= (durationDays + gracePeriodDays)) {
      return { status: 'overdue', color: '#ffc107', bgColor: '#fff3cd' };
    }
    
    // If beyond grace period but less than 6 months
    if (daysSinceStart <= (durationDays + defaultPeriodDays)) {
      return { status: 'overdue', color: '#fd7e14', bgColor: '#fee2d5' };
    }
    
    // If beyond 6 months
    return { status: 'defaulted', color: '#dc3545', bgColor: '#f8d7da' };
  };

  // Sample loans data with examples of all status types
  useEffect(() => {
    const today = new Date();
    const formatDate = (daysAgo) => {
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
      return date.toISOString().split('T')[0];
    };

    const sampleLoans = [
      // COMPLETED STATUS - Fully paid loan
      {
        id: 'LN001',
        clientId: 'CL001',
        clientName: 'John Doe',
        clientType: 'individual',
        branch: 'Main Branch - Kampala',
        amount: 500000,
        duration: 90,
        frequency: 'Weekly',
        interestRate: 15.5,
        startDate: formatDate(120), // Started 120 days ago
        officer: 'Sarah Johnson',
        amountPaid: 577500, // Fully paid (principal + interest)
        totalAmount: 577500,
        createdAt: '2024-06-01T10:00:00Z'
      },
      // ACTIVE STATUS - Within loan duration, payments in progress
      {
        id: 'LN002',
        clientId: 'CL002',
        clientName: 'Emma Wilson',
        clientType: 'business',
        branch: 'Entebbe Branch',
        amount: 300000,
        duration: 90,
        frequency: 'Monthly',
        interestRate: 12.0,
        startDate: formatDate(45), // Started 45 days ago, still within 90-day duration
        officer: 'James Wilson',
        amountPaid: 150000, // Partial payment
        totalAmount: 336000,
        createdAt: '2024-07-15T14:30:00Z'
      },
      // OVERDUE STATUS (Grace Period) - Past due but within 14-day grace period
      {
        id: 'LN003',
        clientId: 'CL003',
        clientName: 'Peter Mukasa',
        clientType: 'individual',
        branch: 'Jinja Branch',
        amount: 450000,
        duration: 60,
        frequency: 'Bi-weekly',
        interestRate: 18.0,
        startDate: formatDate(70), // Started 70 days ago (10 days past 60-day duration)
        officer: 'Grace Nakato',
        amountPaid: 200000, // Partial payment, not fully paid
        totalAmount: 531000,
        createdAt: '2024-02-01T09:15:00Z'
      },
      // OVERDUE STATUS (Extended) - Past grace period but within 6 months
      {
        id: 'LN004',
        clientId: 'CL004',
        clientName: 'Alice Nambi',
        clientType: 'business',
        branch: 'Mbarara Branch',
        amount: 200000,
        duration: 45,
        frequency: 'Weekly',
        interestRate: 20.0,
        startDate: formatDate(90), // Started 90 days ago (45 days past due)
        officer: 'Robert Kasozi',
        amountPaid: 80000, // Minimal payment, far from completion
        totalAmount: 240000,
        createdAt: '2023-12-01T11:20:00Z'
      },
      // DEFAULTED STATUS - Beyond 6 months past due
      {
        id: 'LN005',
        clientId: 'CL005',
        clientName: 'Mary Smith',
        clientType: 'individual',
        branch: 'Gulu Branch',
        amount: 350000,
        duration: 60,
        frequency: 'Monthly',
        interestRate: 16.0,
        startDate: formatDate(270), // Started 270 days ago (way past 6 months)
        officer: 'Christine Auma',
        amountPaid: 50000, // Very little payment made
        totalAmount: 406000,
        createdAt: '2024-01-01T16:45:00Z'
      },
      // ACTIVE STATUS - Recent loan, just started
      {
        id: 'LN006',
        clientId: 'CL006',
        clientName: 'David Okello',
        clientType: 'business',
        branch: 'Kampala Central',
        amount: 600000,
        duration: 120,
        frequency: 'Weekly',
        interestRate: 14.0,
        startDate: formatDate(15), // Started 15 days ago
        officer: 'Rose Atim',
        amountPaid: 75000, // Early payment
        totalAmount: 684000,
        createdAt: '2024-08-01T10:30:00Z'
      }
    ];
    setLoans(sampleLoans);
  }, []);

  const sidebarItems = [
    { title: 'Dashboard', icon: Home, path: '/dashboard' },
    { title: 'Clients', icon: Users, path: '/clients' },
    { title: 'Loans', icon: CreditCard, path: '/loans', active: true },
    { title: 'Payments', icon: DollarSign, path: '/payments' },
    { title: 'Finances', icon: BarChart3, path: '/finances' },
    { title: 'Reports', icon: FileText, path: '/reports' },
    { title: 'Settings', icon: Settings, path: '/settings' }
  ];

  const handleDeleteLoan = (loanId) => {
    const loanToDelete = loans.find(loan => loan.id === loanId);
    
    if (!loanToDelete) {
      alert('Loan not found!');
      return;
    }

    setDeletingLoan(loanToDelete);
    setIsDeleteModalOpen(true);
    setShowActionMenu(null);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingLoan(null);
  };

  const handleConfirmDelete = async (loanId) => {
    try {
      // In a real application, you would make an API call here
      // await deleteLoanAPI(loanId);
      
      const loanToDelete = loans.find(loan => loan.id === loanId);
      
      setLoans(prevLoans => prevLoans.filter(loan => loan.id !== loanId));
      
      // Log the deletion for audit purposes
      console.log(`Loan ${loanId} deleted successfully:`, {
        deletedAt: new Date().toISOString(),
        loanId: loanToDelete.id,
        clientName: loanToDelete.clientName,
        amount: loanToDelete.amount
      });
      
      // You can add a toast notification here for better UX
      console.log(`Loan ${loanId} has been successfully deleted.`);
      
    } catch (error) {
      console.error('Error deleting loan:', error);
      throw error; // Re-throw to let modal handle the error
    }
  };

  const handleViewLoan = (loan) => {
    navigate(`/loans/details/${loan.id}`);
  };

  const handleEditLoan = (loan) => {
    setEditingLoan(loan);
    setIsEditModalOpen(true);
    setShowActionMenu(null);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingLoan(null);
  };

  const handleSaveLoan = (updatedLoan) => {
    setLoans(prevLoans => 
      prevLoans.map(loan => 
        loan.id === updatedLoan.id ? updatedLoan : loan
      )
    );
    // You can add a success notification here
    console.log('Loan updated successfully:', updatedLoan);
  };

  const handleAddPayment = (loan) => {
    setPaymentLoan(loan);
    setIsPaymentModalOpen(true);
    setShowActionMenu(null);
  };

  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setPaymentLoan(null);
  };

  const handleSavePayment = (updatedLoan, paymentRecord) => {
    setLoans(prevLoans => 
      prevLoans.map(loan => 
        loan.id === updatedLoan.id ? updatedLoan : loan
      )
    );
    // You can add a success notification here
    console.log('Payment processed successfully:', paymentRecord);
    console.log('Updated loan:', updatedLoan);
  };


  const handleMarkAsDefaulted = (loanId) => {
    if (window.confirm('Mark this loan as defaulted? This will update the loan status.')) {
      setLoans(prevLoans => 
        prevLoans.map(loan => 
          loan.id === loanId 
            ? { ...loan, status: 'defaulted', lastUpdated: new Date().toISOString() }
            : loan
        )
      );
      setShowActionMenu(null);
    }
  };

  const toggleActionMenu = (loanId) => {
    setShowActionMenu(showActionMenu === loanId ? null : loanId);
  };

  // Close action menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowActionMenu(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Filter loans based on search term and status
  const filteredLoans = loans.filter(loan => {
    const matchesSearch = 
      loan.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.clientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.officer.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    
    const loanStatus = calculateLoanStatus(loan.startDate, loan.duration, loan.amountPaid, loan.totalAmount);
    return matchesSearch && loanStatus.status === statusFilter;
  });

  const formatCurrency = (amount) => {
    return `USh ${amount.toLocaleString()}`;
  };

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
            <h1>Loans</h1>
          </div>
          <button 
            className="add-loan-btn"
            onClick={() => navigate('/loans/disbursement')}
          >
            <Plus size={16} />
            Register New Loan
          </button>
        </div>

        <div className="loans-content">
          {/* Filters and Search */}
          <div className="loans-controls">
            <div className="search-box">
              <Search size={20} className="search-icon" />
              <input
                type="text"
                placeholder="Search loans by client name, loan ID, or officer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="filter-controls">
              <div className="filter-group">
                <Filter size={16} />
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="overdue">Overdue</option>
                  <option value="defaulted">Defaulted</option>
                </select>
              </div>
            </div>
          </div>

          {/* Loans Table */}
          <div className="loans-table-container">
            {filteredLoans.length === 0 ? (
              <div className="empty-state">
                <CreditCard size={48} />
                <h3>No loans found</h3>
                <p>
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filter criteria.'
                    : 'Get started by registering your first loan.'
                  }
                </p>
                {!searchTerm && statusFilter === 'all' && (
                  <button 
                    className="add-loan-btn primary"
                    onClick={() => navigate('/loans/disbursement')}
                  >
                    <Plus size={16} />
                    Register Your First Loan
                  </button>
                )}
              </div>
            ) : (
              <div className="loans-table">
                <div className="table-header">
                  <div className="table-row header-row">
                    <div className="table-cell">Client</div>
                    <div className="table-cell">Amount</div>
                    <div className="table-cell">Duration</div>
                    <div className="table-cell">Officer</div>
                    <div className="table-cell">Status</div>
                    <div className="table-cell">Date</div>
                    <div className="table-cell">Actions</div>
                  </div>
                </div>
                
                <div className="table-body">
                  {filteredLoans.map((loan) => {
                    const statusInfo = calculateLoanStatus(
                      loan.startDate, 
                      loan.duration, 
                      loan.amountPaid, 
                      loan.totalAmount
                    );
                    const paymentProgress = ((loan.amountPaid / loan.totalAmount) * 100).toFixed(1);

                    return (
                      <div key={loan.id} className="table-row">
                        <div className="table-cell">
                          <div className="client-info">
                            <div className="client-name">{loan.clientName}</div>
                          </div>
                        </div>
                        
                        <div className="table-cell">
                          <div className="amount-info">
                            <div className="amount">{formatCurrency(loan.amount)}</div>
                          </div>
                        </div>
                        
                        <div className="table-cell">
                          <div className="duration">{loan.duration} days</div>
                        </div>
                        
                        <div className="table-cell">
                          <div className="officer-name">{loan.officer}</div>
                        </div>
                        
                        <div className="table-cell">
                          <span 
                            className="status-badge"
                            style={{ 
                              color: statusInfo.color, 
                              backgroundColor: statusInfo.bgColor 
                            }}
                          >
                            {statusInfo.status}
                          </span>
                        </div>
                        
                        <div className="table-cell">
                          <div className="date-info">
                            <Calendar size={12} />
                            {formatDate(loan.startDate)}
                          </div>
                        </div>
                        
                        <div className="table-cell">
                          <div className="action-buttons">
                            {/* Quick Action Buttons */}
                            <button 
                              className="action-btn view"
                              title="View Loan Details"
                              onClick={() => handleViewLoan(loan)}
                            >
                              <Eye size={20} />
                            </button>
                            
                            {statusInfo.status !== 'completed' && (
                              <button 
                                className="action-btn payment"
                                title="Add Payment"
                                onClick={() => handleAddPayment(loan)}
                              >
                                <PaymentIcon size={20} />
                              </button>
                            )}
                            
                            <button 
                              className="action-btn edit"
                              title="Edit Loan"
                              onClick={() => handleEditLoan(loan)}
                            >
                              <Edit size={20} />
                            </button>
                            
                            {/* More Actions Dropdown */}
                            <div className="action-dropdown">
                              <button 
                                className="action-btn more"
                                title="More Actions"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleActionMenu(loan.id);
                                }}
                              >
                                <MoreVertical size={20} />
                              </button>
                              
                              {showActionMenu === loan.id && (
                                <div className="dropdown-menu">
                                  {statusInfo.status === 'active' && (
                                    <button 
                                      className="dropdown-item"
                                      onClick={() => handleMarkAsDefaulted(loan.id)}
                                    >
                                      <AlertCircle size={14} />
                                      Mark as Defaulted
                                    </button>
                                  )}
                                  
                                  {statusInfo.status === 'active' && <div className="dropdown-divider"></div>}
                                  
                                  <button 
                                    className="dropdown-item danger"
                                    onClick={() => handleDeleteLoan(loan.id)}
                                  >
                                    <Trash2 size={14} />
                                    Delete Loan
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

        </div>
      </main>

      {/* Edit Loan Modal */}
      <EditLoanModal
        loan={editingLoan}
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSave={handleSaveLoan}
      />

      {/* Add Payment Modal */}
      <AddPaymentModal
        loan={paymentLoan}
        isOpen={isPaymentModalOpen}
        onClose={handleClosePaymentModal}
        onSave={handleSavePayment}
      />

      {/* Delete Loan Modal */}
      <DeleteLoanModal
        loan={deletingLoan}
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default Loans;
