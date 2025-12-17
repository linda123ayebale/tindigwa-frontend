import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  Plus,
  History,
  Search,
  Filter,
  Download,
  Calendar,
  X,
  ChevronDown
} from 'lucide-react';
import api from '../../../services/api';
import Sidebar from '../../../components/Layout/Sidebar';
import './PaymentHistory.css';

const PaymentHistory = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    paymentMethod: '',
    minAmount: '',
    maxAmount: '',
    loanId: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await api.get('/payments');
      const paymentsData = Array.isArray(response) ? response : [];
      
      // Sort by payment date descending (most recent first)
      const sortedPayments = paymentsData.sort((a, b) => 
        new Date(b.paymentDate) - new Date(a.paymentDate)
      );
      
      setPayments(sortedPayments);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...payments];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(payment => 
        payment.loanNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.id?.toString().includes(searchTerm)
      );
    }

    // Date range filter
    if (filters.startDate) {
      filtered = filtered.filter(p => 
        new Date(p.paymentDate) >= new Date(filters.startDate)
      );
    }

    if (filters.endDate) {
      filtered = filtered.filter(p => 
        new Date(p.paymentDate) <= new Date(filters.endDate)
      );
    }

    // Payment method filter
    if (filters.paymentMethod) {
      filtered = filtered.filter(p => 
        p.paymentMethod === filters.paymentMethod
      );
    }

    // Amount range filter
    if (filters.minAmount) {
      filtered = filtered.filter(p => 
        parseFloat(p.amountPaid) >= parseFloat(filters.minAmount)
      );
    }

    if (filters.maxAmount) {
      filtered = filtered.filter(p => 
        parseFloat(p.amountPaid) <= parseFloat(filters.maxAmount)
      );
    }

    // Loan ID filter
    if (filters.loanId) {
      filtered = filtered.filter(p => 
        p.loanId?.toString() === filters.loanId
      );
    }

    return filtered;
  };

  const filteredPayments = applyFilters();

  // Pagination
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPayments = filteredPayments.slice(startIndex, startIndex + itemsPerPage);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      paymentMethod: '',
      minAmount: '',
      maxAmount: '',
      loanId: ''
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  const exportToCSV = () => {
    const headers = ['Payment ID', 'Date', 'Loan', 'Client', 'Amount', 'Method', 'Reference', 'Notes'];
    const rows = filteredPayments.map(p => [
      p.id,
      formatDate(p.paymentDate),
      p.loanNumber || `LN-${p.loanId}`,
      p.clientName || 'N/A',
      p.amountPaid,
      p.paymentMethod,
      p.referenceNumber || '',
      p.notes || ''
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payment-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const formatCurrency = (amount) => {
    return `UGX ${Number(amount || 0).toLocaleString()}`;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getTotalAmount = () => {
    return filteredPayments.reduce((sum, p) => sum + parseFloat(p.amountPaid || 0), 0);
  };



  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="payment-history-page">
          {/* Page Header */}
          <div className="page-header">
            <div className="header-content">
              <h1>Payment History</h1>
              <p className="page-description">Complete payment transaction history with advanced filters</p>
            </div>
            <div className="header-actions">
              <button className="btn-secondary" onClick={exportToCSV}>
                <Download size={16} />
                Export CSV
              </button>
              <button className="btn-primary" onClick={() => navigate('/payments/record')}>
                <Plus size={16} />
                Record Payment
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="summary-cards">
            <div className="summary-card purple">
              <div className="card-icon">
                <History size={24} />
              </div>
              <div className="card-content">
                <p className="card-label">Total Payments</p>
                <h3 className="card-value">{filteredPayments.length}</h3>
              </div>
            </div>

            <div className="summary-card green">
              <div className="card-icon">
                <DollarSign size={24} />
              </div>
              <div className="card-content">
                <p className="card-label">Total Amount</p>
                <h3 className="card-value">{formatCurrency(getTotalAmount())}</h3>
              </div>
            </div>

            <div className="summary-card blue">
              <div className="card-icon">
                <Calendar size={24} />
              </div>
              <div className="card-content">
                <p className="card-label">Date Range</p>
                <h3 className="card-value">
                  {filters.startDate && filters.endDate 
                    ? `${formatDate(filters.startDate)} - ${formatDate(filters.endDate)}`
                    : 'All Time'
                  }
                </h3>
              </div>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="actions-bar">
            <div className="search-wrapper">
              <Search size={20} className="search-icon" />
              <input
                type="text"
                placeholder="Search by loan, client, or reference..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="search-input"
              />
            </div>

            <div className="action-buttons">
              <button 
                className={`btn-filter ${showFilters ? 'active' : ''}`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter size={16} />
                Advanced Filters
                <ChevronDown size={16} className={showFilters ? 'rotate' : ''} />
              </button>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <div className="filter-panel">
              <div className="filter-header">
                <h3>Advanced Filters</h3>
                <button className="btn-text" onClick={clearFilters}>
                  <X size={16} />
                  Clear All
                </button>
              </div>
              
              <div className="filter-grid">
                <div className="filter-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={filters.startDate}
                    onChange={handleFilterChange}
                  />
                </div>

                <div className="filter-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={filters.endDate}
                    onChange={handleFilterChange}
                  />
                </div>

                <div className="filter-group">
                  <label>Payment Method</label>
                  <select name="paymentMethod" value={filters.paymentMethod} onChange={handleFilterChange}>
                    <option value="">All Methods</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Mobile Money">Mobile Money</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Card">Card</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>Min Amount</label>
                  <input
                    type="number"
                    name="minAmount"
                    placeholder="0"
                    value={filters.minAmount}
                    onChange={handleFilterChange}
                  />
                </div>

                <div className="filter-group">
                  <label>Max Amount</label>
                  <input
                    type="number"
                    name="maxAmount"
                    placeholder="0"
                    value={filters.maxAmount}
                    onChange={handleFilterChange}
                  />
                </div>

                <div className="filter-group">
                  <label>Loan ID</label>
                  <input
                    type="text"
                    name="loanId"
                    placeholder="Enter loan ID"
                    value={filters.loanId}
                    onChange={handleFilterChange}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Payments Table */}
          <div className="table-container">
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading payment history...</p>
              </div>
            ) : paginatedPayments.length === 0 ? (
              <div className="empty-state">
                <History size={48} className="empty-icon" />
                <h3>No Payment Records</h3>
                <p>No payments found matching your criteria</p>
                {(searchTerm || Object.values(filters).some(v => v)) && (
                  <button className="btn-primary" onClick={clearFilters}>
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Payment ID</th>
                      <th>Date</th>
                      <th>Loan</th>
                      <th>Client</th>
                      <th>Amount</th>
                      <th>Method</th>
                      <th>Reference</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedPayments.map((payment) => (
                      <tr key={payment.id}>
                        <td>#{payment.id}</td>
                        <td>
                          <div className="date-cell">
                            <Calendar size={14} />
                            {formatDate(payment.paymentDate)}
                          </div>
                        </td>
                        <td>
                          <button 
                            className="loan-link"
                            onClick={() => navigate(`/loans/${payment.loanId}`)}
                          >
                            {payment.loanNumber || `LN-${payment.loanId}`}
                          </button>
                        </td>
                        <td>{payment.clientName || 'Unknown'}</td>
                        <td className="amount">{formatCurrency(payment.amountPaid)}</td>
                        <td>
                          <span className={`method-badge ${payment.paymentMethod?.toLowerCase().replace(' ', '-')}`}>
                            {payment.paymentMethod}
                          </span>
                        </td>
                        <td className="reference">{payment.referenceNumber || '-'}</td>
                        <td className="notes">
                          {payment.notes ? (
                            <span title={payment.notes}>
                              {payment.notes.length > 30 
                                ? `${payment.notes.substring(0, 30)}...` 
                                : payment.notes}
                            </span>
                          ) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

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
              </>
            )}
          </div>

          {/* Footer Summary */}
          {filteredPayments.length > 0 && (
            <div className="table-footer">
              <div className="footer-stats">
                <p>
                  Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredPayments.length)} of {filteredPayments.length} payments
                </p>
                <p className="total-summary">
                  <strong>Total Amount:</strong> {formatCurrency(getTotalAmount())}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PaymentHistory;
