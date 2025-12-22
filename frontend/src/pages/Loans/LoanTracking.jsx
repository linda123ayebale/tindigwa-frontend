import React, { useState, useEffect } from 'react';
import { Search, Eye, Filter } from 'lucide-react';
import LoanService from '../../services/loanService';
import useLoanWebSocket from '../../hooks/useLoanWebSocket';
import { toast } from 'react-hot-toast';
import Sidebar from '../../components/Layout/Sidebar';
import { useNavigate } from 'react-router-dom';
import './LoanTracking.css';

const LoanTracking = () => {
  const navigate = useNavigate();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const response = await LoanService.getAllLoans();
      setLoans(response.data);
    } catch (error) {
      console.error('Error fetching loans:', error);
      toast.error('Failed to load loans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  // WebSocket updates
  useLoanWebSocket((message) => {
    if (
      message.action === 'loan.payment.recorded' ||
      message.action === 'loan.status.updated' ||
      message.action === 'loan.created'
    ) {
      fetchLoans();
    }
  });

  const calculateProgress = (loan) => {
    if (!loan.due || loan.due === 0) return 0;
    const progress = Math.round(((loan.paid || 0) / loan.due) * 100);
    return Math.min(progress, 100);
  };

  const filteredLoans = (loans || []).filter((loan) => {
    const matchesSearch =
      loan.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.loanNumber?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ||
      loan.status === statusFilter ||
      loan.statusBadgeClass === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredLoans.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentLoans = filteredLoans.slice(startIndex, startIndex + itemsPerPage);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return (
      String(date.getDate()).padStart(2, '0') +
      '-' +
      String(date.getMonth() + 1).padStart(2, '0') +
      '-' +
      date.getFullYear()
    );
  };

  const getStatusBadgeClass = (loan) => {
    if (loan.statusBadgeClass) {
      return `status-${loan.statusBadgeClass}`;
    }
    const statusMap = {
      open: 'status-open',
      'pending approval': 'status-pending',
      approved: 'status-approved',
      'in progress': 'status-in-progress',
      closed: 'status-closed',
      rejected: 'status-cancelled',
      draft: 'status-draft',
    };
    return statusMap[loan.status?.toLowerCase()] || 'status-draft';
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <div className="page-header">
          <h1>Loan Tracking</h1>
          <p className="page-description">Monitor loan progress and payment status</p>
        </div>

        <div className="clients-content">
          {/* Search + Filters */}
          <div className="clients-controls">
            <div className="search-box">
              <Search size={20} className="search-icon" />
              <input
                type="text"
                placeholder="Search by client or loan number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="filter-group">
              <Filter size={18} className="filter-icon" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="ALL">All Status</option>
                <option value="OPEN">Open</option>
                <option value="PENDING_APPROVAL">Pending Approval</option>
                <option value="APPROVED">Approved</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="CLOSED">Closed</option>
                <option value="REJECTED">Rejected</option>
                <option value="DRAFT">Draft</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading loan tracking data...</p>
            </div>
          ) : filteredLoans.length === 0 ? (
            <div className="empty-state-pending">
              <p>No loans found</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Loan Number</th>
                    <th>Client</th>
                    <th>Status</th>
                    <th>Updated At</th>
                    <th>Progress (%)</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {currentLoans.map((loan) => {
                    const progress = calculateProgress(loan);

                    return (
                      <tr key={loan.id}>
                        <td>{loan.loanNumber || '-'}</td>
                        <td>{loan.name || '-'}</td>
                        <td>
                          <span className={`status-badge ${getStatusBadgeClass(loan)}`}>
                            {loan.status}
                          </span>
                        </td>
                        <td>{formatDate(loan.released)}</td>

                        <td>
                          <div className="progress-container">
                            <div className="progress-bar">
                              <div className="progress-fill" style={{ width: `${progress}%` }} />
                            </div>
                            <span className="progress-text">{progress}%</span>
                          </div>
                        </td>

                        <td>
                          <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
                            
                            {/* ✅ FIXED NAVIGATION */}
                            <button
                              onClick={() => navigate(`/loans/${loan.id}/tracking`)}
                              className="action-btn view"
                              title="View Loan Tracking"
                            >
                              <Eye size={16} />
                            </button>

                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="pagination-container">
                <div className="pagination-info">
                  Showing {startIndex + 1}–
                  {Math.min(startIndex + itemsPerPage, filteredLoans.length)} of{' '}
                  {filteredLoans.length}
                </div>

                <div className="pagination">
                  <button
                    disabled={currentPage === 1}
                    className="pagination-btn"
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Previous
                  </button>

                  {[...Array(totalPages).keys()].map((page) => (
                    <button
                      key={page}
                      className={`pagination-btn ${
                        currentPage === page + 1 ? 'active' : ''
                      }`}
                      onClick={() => setCurrentPage(page + 1)}
                    >
                      {page + 1}
                    </button>
                  ))}

                  <button
                    disabled={currentPage === totalPages}
                    className="pagination-btn"
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default LoanTracking;
