import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  Search,
  Filter,
  Download,
  RefreshCw,
  Calendar,
  CreditCard,
  Eye,
  FileText
} from 'lucide-react';
import PaymentService from '../../../services/PaymentService';
import Sidebar from '../../../components/Layout/Sidebar';
import PaymentReceiptModal from '../../../components/PaymentReceiptModal';
import PaymentDetailsModal from '../../../components/PaymentDetailsModal';
import './AllPayments.css';

const AllPayments = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [selectedPaymentDetailsId, setSelectedPaymentDetailsId] = useState(null);
  const itemsPerPage = 5;

  // Fetch all payments
  const fetchPayments = async () => {
    setLoading(true);
    try {
      const payments = await PaymentService.getAll();
      setPayments(payments);
      console.log('✅ Fetched', payments.length, 'payments from backend');
    } catch (error) {
      console.error('❌ Error fetching payments:', error);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // Filter payments
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = searchTerm === '' || 
      payment.loanId?.toString().includes(searchTerm) ||
      payment.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.paymentMethod?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      payment.paymentStatus?.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPayments = filteredPayments.slice(startIndex, startIndex + itemsPerPage);

  // Format currency
  const formatCurrency = (amount) => {
    return `UGX ${Number(amount || 0).toLocaleString()}`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status badge class
  const getStatusClass = (status) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower === 'completed') return 'status-completed';
    if (statusLower === 'pending') return 'status-pending';
    if (statusLower === 'cancelled') return 'status-cancelled';
    return 'status-default';
  };

  // Export to CSV
  const handleExport = () => {
    const csvContent = [
      ['Payment ID', 'Loan ID', 'Amount', 'Date', 'Method', 'Status', 'Reference'],
      ...filteredPayments.map(p => [
        p.id,
        p.loanId,
        p.amountPaid,
        p.paymentDate,
        p.paymentMethod,
        p.paymentStatus,
        p.referenceNumber || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // View payment details
  const handleViewPayment = (paymentId) => {
    setSelectedPaymentDetailsId(paymentId);
  };

  // View payment receipt
  const handleViewReceipt = (paymentId) => {
    setSelectedPaymentId(paymentId);
  };


  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="all-payments-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="header-content">
          <h1>All Payments</h1>
          <p className="page-description">Complete list of all loan repayments</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={fetchPayments}>
            <RefreshCw size={16} />
            Refresh
          </button>
          <button className="btn-secondary" onClick={handleExport}>
            <Download size={16} />
            Export CSV
          </button>
          <button className="btn-primary" onClick={() => navigate('/payments/record')}>
            <DollarSign size={16} />
            Record Payment
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="summary-cards">
        <div className="stat-card">
          <div className="stat-icon total">
            <DollarSign size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Payments</span>
            <span className="stat-value">{payments.length}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon success">
            <DollarSign size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Amount</span>
            <span className="stat-value">
              {formatCurrency(payments.reduce((sum, p) => sum + (p.amountPaid || 0), 0))}
            </span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon info">
            <Calendar size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Today</span>
            <span className="stat-value">
              {payments.filter(p => {
                const paymentDate = new Date(p.paymentDate);
                const today = new Date();
                return paymentDate.toDateString() === today.toDateString();
              }).length}
            </span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon warning">
            <CreditCard size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">This Month</span>
            <span className="stat-value">
              {payments.filter(p => {
                const paymentDate = new Date(p.paymentDate);
                const today = new Date();
                return paymentDate.getMonth() === today.getMonth() &&
                       paymentDate.getFullYear() === today.getFullYear();
              }).length}
            </span>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="search-box">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search by loan ID, reference, or payment method..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="filter-controls">
          <div className="filter-group">
            <Filter size={16} />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="results-info">
          Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredPayments.length)} of {filteredPayments.length}
        </div>
      </div>

      {/* Payments Table */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading payments...</p>
        </div>
      ) : currentPayments.length === 0 ? (
        <div className="empty-state">
          <DollarSign size={48} />
          <h3>No payments found</h3>
          <p>No payments match your search criteria</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="payments-table">
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Loan ID</th>
                <th>Amount</th>
                <th>Payment Date</th>
                <th>Method</th>
                <th>Status</th>
                <th>Reference</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentPayments.map((payment) => (
                <tr key={payment.id}>
                  <td>#{payment.id}</td>
                  <td>
                    <button 
                      className="link-button"
                      onClick={() => navigate(`/loans/${payment.loanId}`)}
                    >
                      LN-{payment.loanId}
                    </button>
                  </td>
                  <td className="amount">{formatCurrency(payment.amountPaid)}</td>
                  <td>{formatDate(payment.paymentDate)}</td>
                  <td>
                    <span className="payment-method">{payment.paymentMethod || 'N/A'}</span>
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusClass(payment.paymentStatus)}`}>
                      {payment.paymentStatus || 'Unknown'}
                    </span>
                  </td>
                  <td className="reference">{payment.referenceNumber || '-'}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn view"
                        onClick={() => handleViewPayment(payment.id)}
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="action-btn receipt"
                        onClick={() => handleViewReceipt(payment.id)}
                        title="View Receipt"
                      >
                        <FileText size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </button>
          <span className="pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="pagination-btn"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      )}
        </div>
      </main>

      {/* Receipt Modal */}
      {selectedPaymentId && (
        <PaymentReceiptModal
          paymentId={selectedPaymentId}
          onClose={() => setSelectedPaymentId(null)}
        />
      )}

      {/* Payment Details Modal */}
      {selectedPaymentDetailsId && (
        <PaymentDetailsModal
          paymentId={selectedPaymentDetailsId}
          onClose={() => setSelectedPaymentDetailsId(null)}
        />
      )}
    </div>
  );
};

export default AllPayments;
