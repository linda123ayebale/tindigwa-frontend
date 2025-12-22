import React, { useState, useEffect } from 'react';
import { DollarSign, Filter, Edit, Trash2, RotateCcw, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import PaymentService from '../../../services/PaymentService';
import StatusBadge from '../../../components/StatusBadge';
import usePaymentWebSocket from '../../../hooks/usePaymentWebSocket';

const PaymentsTab = ({ loans, showToast }) => {
  const [allPayments, setAllPayments] = useState([]);
  const [loadingAllPayments, setLoadingAllPayments] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [processingPaymentId, setProcessingPaymentId] = useState(null);
  const [currentUserRole] = useState('ADMIN'); // Should come from auth context

  // WebSocket integration for realtime payment updates
  usePaymentWebSocket((message) => {
    console.log('Payment WebSocket event:', message);
    fetchAllPayments(); // Reload payments on any payment event
  });

  // Fetch all payments across all loans
  const fetchAllPayments = async () => {
    setLoadingAllPayments(true);
    try {
      // Fetch payments from API using PaymentService
      const payments = await PaymentService.getAll();
      console.log('Fetched payments from database:', payments.length);
      
      // Debug: Log loan and payment data for troubleshooting
      console.log('Available loans for client name lookup:', loans.length);
      if (loans.length > 0) {
        console.log('Sample loan:', loans[0]);
      }
      if (payments.length > 0) {
        console.log('Sample payment:', payments[0]);
      }
      
      // Sort payments by date (most recent first) and enhance with loan data
      const enhancedPayments = payments.map(payment => {
        const loan = loans.find(l => l.id === payment.loanId);
        // Extract client name from various possible fields
        const clientName = payment.clientName || loan?.name || loan?.clientName || loan?.client?.name || 'Unknown Client';
        
        // Debug: Log client name resolution
        if (clientName === 'Unknown Client') {
          console.log('Client name not found for payment:', {
            paymentId: payment.id,
            loanId: payment.loanId,
            paymentClientName: payment.clientName,
            loanFound: !!loan,
            loanClientName: loan?.clientName,
            loanClient: loan?.client
          });
        }
        
        return {
          ...payment,
          clientName,
          amount: payment.amount || payment.amountPaid || 0, // API uses amountPaid field
          loanReference: payment.loanReference || loan?.loanNumber || `LN-${payment.loanId}`,
          paymentDate: payment.paymentDate || payment.createdAt,
          loanStatus: loan?.status || loan?.loanStatus || 'active'
        };
      }).sort((a, b) => new Date(b.paymentDate || b.createdAt) - new Date(a.paymentDate || a.createdAt));
      
      setAllPayments(enhancedPayments);
    } catch (error) {
      console.error('Error fetching payments from database:', error);
      setAllPayments([]);
    } finally {
      setLoadingAllPayments(false);
    }
  };

  // Load payments when component mounts or loans change
  useEffect(() => {
    if (loans.length > 0) {
      fetchAllPayments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loans]);

  // Refresh payments periodically
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      if (loans.length > 0) {
        fetchAllPayments();
      }
    }, 30000); // Refresh every 30 seconds
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return () => clearInterval(refreshInterval);
  }, [loans]);

  // Refresh payments manually
  const handleRefreshPayments = () => {
    fetchAllPayments();
    showToast('Payments refreshed', 'success');
  };

  // View payment receipt
  const handleViewReceipt = async (paymentId) => {
    try {
      const response = await PaymentService.getReceipt(paymentId);
      console.log('Payment receipt:', response);
      toast.success('Receipt generated');
      // TODO: Open receipt in modal or new window
    } catch (error) {
      console.error('Error fetching receipt:', error);
      toast.error('Failed to fetch receipt');
    }
  };

  // Edit payment (only RECORDED payments)
  const handleEditPayment = async (payment) => {
    if (payment.status !== 'RECORDED') {
      toast.error('Can only edit RECORDED payments');
      return;
    }
    
    // TODO: Open edit modal
    toast('Edit payment modal - to be implemented');
  };

  // Soft delete payment (only RECORDED payments)
  const handleDeletePayment = async (paymentId, paymentStatus) => {
    if (paymentStatus !== 'RECORDED') {
      toast.error('Can only delete RECORDED payments');
      return;
    }
    
    if (!window.confirm('Delete this payment? This will mark it as CANCELLED.')) return;
    
    try {
      setProcessingPaymentId(paymentId);
      await PaymentService.softDelete(paymentId);
      toast.success('Payment deleted successfully');
      await fetchAllPayments();
    } catch (error) {
      console.error('Error deleting payment:', error);
      toast.error('Failed to delete payment');
    } finally {
      setProcessingPaymentId(null);
    }
  };

  // Reverse payment
  const handleReversePayment = async (paymentId) => {
    if (!window.confirm('Reverse this payment? This will roll back the loan balance.')) return;
    
    try {
      setProcessingPaymentId(paymentId);
      await PaymentService.reversePayment(paymentId);
      toast.success('Payment reversed successfully');
      await fetchAllPayments();
    } catch (error) {
      console.error('Error reversing payment:', error);
      toast.error('Failed to reverse payment');
    } finally {
      setProcessingPaymentId(null);
    }
  };

  // Filter payments based on status
  const filteredPayments = allPayments.filter(payment => {
    if (statusFilter === 'all') return true;
    return payment.status === statusFilter;
  });

  // Pagination logic
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPayments = filteredPayments.slice(startIndex, endIndex);

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

  return (
    <div className="payments-tab">
      {/* Controls Section */}
      <div className="clients-controls">
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
              <option value="RECORDED">Recorded</option>
              <option value="POSTED">Posted</option>
              <option value="REVERSED">Reversed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
        
        <div className="results-info">
          <p>Showing {filteredPayments.length} payments</p>
        </div>

        <div className="header-actions">
          <button 
            className="add-client-btn"
            onClick={handleRefreshPayments}
            style={{ background: '#28a745', borderColor: '#28a745' }}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* All Payments History */}
      <div className="clients-table-container">
        {loadingAllPayments ? (
          <div className="empty-state">
            <div className="loading">Loading payments history...</div>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="empty-state">
            <DollarSign size={48} />
            <h3>No payments found</h3>
            <p>No payments match your current filter criteria.</p>
          </div>
        ) : (
          <>
            {/* Summary Stats */}
            <div className="payments-summary">
              <div className="summary-stats">
                <div className="stat-item">
                  <span className="stat-label">Total Payments</span>
                  <span className="stat-value">{allPayments.length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Total Amount</span>
                  <span className="stat-value">UGX {allPayments.reduce((sum, p) => sum + (p.amount || 0), 0).toLocaleString()}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Today</span>
                  <span className="stat-value">
                    {allPayments.filter(p => {
                      const paymentDate = new Date(p.paymentDate || p.createdAt);
                      const today = new Date();
                      return paymentDate.toDateString() === today.toDateString();
                    }).length} payments
                  </span>
                </div>
              </div>
            </div>
            
            {/* Payments Table */}
            <div className="clients-table">
              <div className="table-row header-row">
                <div className="table-cell">Date</div>
                <div className="table-cell">Loan Reference</div>
                <div className="table-cell">Client Name</div>
                <div className="table-cell">Amount</div>
                <div className="table-cell">Method</div>
                <div className="table-cell">Status</div>
                <div className="table-cell">Actions</div>
              </div>
              
              {currentPayments.map((payment, index) => {
                // Use already enhanced data
                const clientName = payment.clientName || 'Unknown Client';
                const amount = payment.amount || 0;
                
                const canEdit = payment.status === 'RECORDED' && currentUserRole === 'ADMIN';
                const canDelete = payment.status === 'RECORDED' && currentUserRole === 'ADMIN';
                const canReverse = currentUserRole === 'ADMIN';
                
                return (
                  <div key={payment.id || `payment-${index}`} className="table-row">
                    <div className="table-cell">
                      <div className="payment-date">
                        {new Date(payment.paymentDate || payment.createdAt).toLocaleDateString()}
                      </div>
                      <div className="payment-time" style={{ fontSize: '0.85em', color: '#666' }}>
                        {payment.paymentTime || new Date(payment.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    
                    <div className="table-cell">
                      <div className="loan-reference">{payment.loanReference || `LN-${payment.loanId}`}</div>
                    </div>
                    
                    <div className="table-cell">
                      <div className="client-name">{clientName}</div>
                    </div>
                    
                    <div className="table-cell">
                      <div className="amount-paid">UGX {amount.toLocaleString()}</div>
                    </div>
                    
                    <div className="table-cell">
                      <div className="payment-method">{payment.paymentMethod}</div>
                    </div>
                    
                    <div className="table-cell">
                      <StatusBadge status={payment.status || 'RECORDED'} size="sm" />
                    </div>
                    
                    <div className="table-cell">
                      <div className="action-buttons" style={{ display: 'flex', gap: '4px' }}>
                        <button 
                          className="action-btn view"
                          title="View Receipt"
                          onClick={() => handleViewReceipt(payment.id)}
                          style={{ padding: '4px 8px', fontSize: '14px' }}
                        >
                          <FileText size={14} />
                        </button>
                        {canEdit && (
                          <button 
                            className="action-btn edit"
                            title="Edit Payment"
                            onClick={() => handleEditPayment(payment)}
                            disabled={processingPaymentId === payment.id}
                            style={{ padding: '4px 8px', fontSize: '14px' }}
                          >
                            <Edit size={14} />
                          </button>
                        )}
                        {canDelete && (
                          <button 
                            className="action-btn delete"
                            title="Delete Payment"
                            onClick={() => handleDeletePayment(payment.id, payment.status)}
                            disabled={processingPaymentId === payment.id}
                            style={{ padding: '4px 8px', fontSize: '14px' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                        {canReverse && payment.status !== 'REVERSED' && payment.status !== 'CANCELLED' && (
                          <button 
                            className="action-btn reverse"
                            title="Reverse Payment"
                            onClick={() => handleReversePayment(payment.id)}
                            disabled={processingPaymentId === payment.id}
                            style={{ padding: '4px 8px', fontSize: '14px', background: '#dc3545' }}
                          >
                            <RotateCcw size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination-container">
                <div className="pagination-info">
                  <p>Showing {startIndex + 1}-{Math.min(endIndex, filteredPayments.length)} of {filteredPayments.length} payments</p>
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
  );
};

export default PaymentsTab;