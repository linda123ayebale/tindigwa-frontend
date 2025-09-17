import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Home, 
  Users, 
  CreditCard, 
  DollarSign, 
  FileText, 
  Settings,
  ArrowLeft,
  Calendar,
  Building,
  User,
  Phone,
  Mail,
  MapPin,
  Clock,
  TrendingUp,
  Download,
  Edit,
  Trash2,
  AlertCircle,
  Check,
  X,
  BarChart3
} from 'lucide-react';
import './LoanDetails.css';

const LoanDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sample loan data - in real app, fetch from API based on ID
  useEffect(() => {
    const sampleLoans = [
      {
        id: 'LN001',
        clientId: 'CL001',
        clientName: 'John Doe',
        clientPhone: '+256 700 123 456',
        clientEmail: 'john.doe@email.com',
        clientAddress: 'Kampala, Uganda',
        clientType: 'individual',
        branch: 'Main Branch - Kampala',
        amount: 500000,
        duration: 90,
        frequency: 'Weekly',
        interestRate: 15.5,
        startDate: '2024-05-31',
        officer: 'Sarah Johnson',
        officerPhone: '+256 701 234 567',
        amountPaid: 500000,
        totalAmount: 577500,
        outstandingBalance: 77500,
        gracePeriod: 15,
        fineAmount: 0,
        createdAt: '2024-05-31T10:00:00Z',
        paymentStatus: 'On Track',
        latePayment: 'No',
        paymentHistory: [
          { date: '2024-06-07', amount: 50000, status: 'Paid' },
          { date: '2024-06-14', amount: 50000, status: 'Paid' },
          { date: '2024-06-21', amount: 50000, status: 'Paid' },
          { date: '2024-06-28', amount: 50000, status: 'Paid' },
          { date: '2024-07-05', amount: 50000, status: 'Paid' },
          { date: '2024-07-12', amount: 50000, status: 'Paid' },
          { date: '2024-07-19', amount: 50000, status: 'Paid' },
          { date: '2024-07-26', amount: 50000, status: 'Paid' },
          { date: '2024-08-02', amount: 50000, status: 'Paid' },
          { date: '2024-08-09', amount: 50000, status: 'Paid' }
        ]
      },
      {
        id: 'LN002',
        clientId: 'CL002',
        clientName: 'Mary Smith',
        clientPhone: '+256 702 345 678',
        clientEmail: 'mary.smith@email.com',
        clientAddress: 'Entebbe, Uganda',
        clientType: 'business',
        branch: 'Entebbe Branch',
        amount: 300000,
        duration: 60,
        frequency: 'Monthly',
        interestRate: 12.0,
        startDate: '2024-07-14',
        officer: 'James Wilson',
        officerPhone: '+256 703 456 789',
        amountPaid: 133600,
        totalAmount: 336000,
        outstandingBalance: 202400,
        gracePeriod: 15,
        fineAmount: 0,
        createdAt: '2024-07-14T14:30:00Z',
        paymentStatus: 'Defaulted',
        latePayment: 'No',
        paymentHistory: [
          { date: '2024-08-14', amount: 67200, status: 'Paid' },
          { date: '2024-09-14', amount: 66400, status: 'Missed' }
        ]
      }
    ];

    const foundLoan = sampleLoans.find(l => l.id === id);
    setLoan(foundLoan);
    setLoading(false);
  }, [id]);

  const sidebarItems = [
    { title: 'Dashboard', icon: Home, path: '/dashboard' },
    { title: 'Clients', icon: Users, path: '/clients' },
    { title: 'Loans', icon: CreditCard, path: '/loans', active: true },
    { title: 'Payments', icon: DollarSign, path: '/payments' },
    { title: 'Finances', icon: BarChart3, path: '/finances' },
    { title: 'Reports', icon: FileText, path: '/reports' },
    { title: 'Settings', icon: Settings, path: '/settings' }
  ];

  const formatCurrency = (amount) => {
    return `USh ${amount.toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading loan details...</p>
        </div>
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="dashboard-layout">
        <div className="error-state">
          <AlertCircle size={48} />
          <h3>Loan not found</h3>
          <p>The loan you're looking for doesn't exist or has been deleted.</p>
          <button className="back-btn" onClick={() => navigate('/loans')}>
            <ArrowLeft size={16} />
            Back to Loans
          </button>
        </div>
      </div>
    );
  }

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
          <div className="header-info">
            <h1>Loan Payment Details</h1>
          </div>
          <button className="back-btn" onClick={() => navigate('/loans')}>
            <ArrowLeft size={16} />
            Back to Loans
          </button>
        </div>

        <div className="loan-details-content">
          {/* Loan Information Card */}
          <div className="details-card">
            <h2>Loan Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>Loan ID</label>
                <span>{loan.id}</span>
              </div>
              <div className="info-item">
                <label>Payment Date</label>
                <span>{formatDate(loan.startDate)}</span>
              </div>
              <div className="info-item">
                <label>Amount Paid</label>
                <span>{formatCurrency(loan.amountPaid)}</span>
              </div>
              <div className="info-item">
                <label>Outstanding Balance</label>
                <span>{formatCurrency(loan.outstandingBalance)}</span>
              </div>
            </div>
          </div>

          {/* Payment Status Card */}
          <div className="details-card">
            <h2>Payment Status</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>Late Payment</label>
                <span>{loan.latePayment}</span>
              </div>
              <div className="info-item">
                <label>Grace Period</label>
                <span>{loan.gracePeriod} days</span>
              </div>
              <div className="info-item">
                <label>Fine Amount</label>
                <span>{formatCurrency(loan.fineAmount)}</span>
              </div>
              <div className="info-item">
                <label>Status</label>
                <span className={`status-badge ${loan.paymentStatus.toLowerCase().replace(' ', '-')}`}>
                  {loan.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Client Information Card */}
          <div className="details-card">
            <h2>Client Information</h2>
            <div className="client-info-container">
              <div className="client-avatar">
                <User size={32} />
              </div>
              <div className="client-details-grid">
                <div className="client-info-item">
                  <label className="client-label">Client Name</label>
                  <span className="client-value">{loan.clientName}</span>
                </div>
                <div className="client-info-item">
                  <label className="client-label">Client ID</label>
                  <span className="client-value">{loan.clientId}</span>
                </div>
                <div className="client-info-item">
                  <label className="client-label">Client Type</label>
                  <span className="client-value client-type">{loan.clientType}</span>
                </div>
                <div className="client-info-item">
                  <label className="client-label">Phone</label>
                  <span className="client-value contact-info">
                    <Phone size={16} />
                    {loan.clientPhone}
                  </span>
                </div>
                <div className="client-info-item">
                  <label className="client-label">Email</label>
                  <span className="client-value contact-info">
                    <Mail size={16} />
                    {loan.clientEmail}
                  </span>
                </div>
                <div className="client-info-item">
                  <label className="client-label">Address</label>
                  <span className="client-value contact-info">
                    <MapPin size={16} />
                    {loan.clientAddress}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Loan Details Card */}
          <div className="details-card">
            <h2>Loan Details</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>Principal Amount</label>
                <span>{formatCurrency(loan.amount)}</span>
              </div>
              <div className="info-item">
                <label>Interest Rate</label>
                <span>{loan.interestRate}% APR</span>
              </div>
              <div className="info-item">
                <label>Duration</label>
                <span>{loan.duration} days</span>
              </div>
              <div className="info-item">
                <label>Payment Frequency</label>
                <span>{loan.frequency}</span>
              </div>
              <div className="info-item">
                <label>Total Amount</label>
                <span>{formatCurrency(loan.totalAmount)}</span>
              </div>
              <div className="info-item">
                <label>Branch</label>
                <span className="branch-info">
                  <Building size={14} />
                  {loan.branch}
                </span>
              </div>
            </div>
          </div>

          {/* Officer Information Card */}
          <div className="details-card">
            <h2>Loan Officer</h2>
            <div className="officer-details">
              <div className="officer-avatar">
                <User size={24} />
              </div>
              <div className="officer-info">
                <div className="officer-name">{loan.officer}</div>
                <div className="officer-contact">
                  <Phone size={14} />
                  {loan.officerPhone}
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default LoanDetails;
