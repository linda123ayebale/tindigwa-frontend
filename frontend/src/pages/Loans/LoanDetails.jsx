import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft,
  AlertCircle,
  XCircle,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Sidebar from '../../components/Layout/Sidebar';
import EditLoanModal from './EditLoanModal';
import AddPaymentModal from './AddPaymentModal';
import DeleteLoanModal from './DeleteLoanModal';
import LoanOverviewCard from '../../components/Loans/LoanOverviewCard';
import ClientInfoCard from '../../components/Loans/ClientInfoCard';
import OfficerInfoCard from '../../components/Loans/OfficerInfoCard';
import PaymentHistoryTable from '../../components/Loans/PaymentHistoryTable';


import ApprovalCard from '../../components/Loans/ApprovalCard';
import StatusBadge from '../../components/StatusBadge';
import LoanPaymentSchedule from '../../components/LoanPaymentSchedule';
import LoanService from '../../services/loanService';
import useLoanWebSocket from '../../hooks/useLoanWebSocket';
// Permission checks disabled - will be handled in roles module
// import { canApproveLoan, canDisburseLoan, canModifyLoan } from '../../utils/permissions';
import './LoanDetails.css';

const LoanDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loanData, setLoanData] = useState(null); // Complete loan data from API
  const [loading, setLoading] = useState(true);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentUserRole] = useState('ADMIN'); // Should come from auth context
  const [currentUserId] = useState(1); // Should come from auth context
  const [processingAction, setProcessingAction] = useState(false);

  // WebSocket integration for realtime loan updates
  useLoanWebSocket((message) => {
    if (message.loanId === parseInt(id)) {
      console.log('Loan updated via WebSocket:', message);
      // Reload loan data
      fetchLoanData();
    }
  });

  // Fetch comprehensive loan data from API using LoanService
  const fetchLoanData = async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      const response = await LoanService.getCompleteLoan(id);
      // ✅ API returns data directly (not wrapped in .data property)
      setLoanData(response);
      console.log('✅ Loan data loaded:', response);
    } catch (error) {
      console.error('❌ Error fetching complete loan data:', error);
      setLoanData(null);
      toast.error('Failed to load loan details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoanData();
  }, [id]);

  // Close action menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowActionMenu(false);
    if (showActionMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showActionMenu]);


  // Action Handlers

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
  };

  const handleSaveLoan = async (updatedLoan) => {
    try {
      await LoanService.updateLoan(updatedLoan.id, updatedLoan);
      toast.success('Loan updated successfully');
      await fetchLoanData(); // Reload complete data
    } catch (error) {
      console.error('Error updating loan:', error);
      toast.error('Failed to update loan');
      throw error;
    }
  };

  // Approve loan
  const handleApproveLoan = async () => {
    if (!loanData?.loan) return;
    // Permission check disabled - will be handled in roles module
    // if (!canApproveLoan(loanData.loan.workflowStatus, currentUserRole)) {
    //   toast.error('You do not have permission to approve this loan');
    //   return;
    // }
    
    try {
      setProcessingAction(true);
      await LoanService.approveLoan(id, currentUserId);
      toast.success('Loan approved successfully');
      await fetchLoanData();
    } catch (error) {
      console.error('Error approving loan:', error);
      toast.error('Error approving loan');
    } finally {
      setProcessingAction(false);
    }
  };

  // Reject loan
  const handleRejectLoan = async () => {
    const reason = prompt('Please enter rejection reason:');
    if (!reason) return;
    
    try {
      setProcessingAction(true);
      await LoanService.rejectLoan(id, currentUserId, reason);
      toast.success('Loan rejected');
      await fetchLoanData();
    } catch (error) {
      console.error('Error rejecting loan:', error);
      toast.error('Error rejecting loan');
    } finally {
      setProcessingAction(false);
    }
  };

  // Disburse loan


  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false);
  };

  const handleSavePayment = async (updatedLoan, paymentRecord) => {
    try {
      // Create payment via LoanService
      await LoanService.addPayment(updatedLoan.id, {
        loanId: updatedLoan.id,
        amountPaid: paymentRecord.amount,
        paymentDate: paymentRecord.paymentDate,
        paymentMethod: paymentRecord.paymentMethod,
        referenceNumber: paymentRecord.referenceNumber,
        notes: paymentRecord.notes
      });
      
      toast.success('Payment recorded successfully');
      await fetchLoanData(); // Reload complete data
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Failed to record payment');
      throw error;
    }
  };


  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  const handleConfirmDelete = async (loanId) => {
    try {
      await LoanService.deleteLoan(loanId);
      toast.success('Loan deleted successfully');
      navigate('/loans');
    } catch (error) {
      console.error('Error deleting loan:', error);
      toast.error('Failed to delete loan');
      throw error;
    }
  };





  // Permission checking

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

  if (!loanData) {
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

  // Destructure complete loan data
  const { loan, client, loanOfficer, tracking, payments, workflowHistory } = loanData;

  // Helper functions for formatting
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return 'USh 0';
    return `USh ${Number(amount).toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <div className="page-header">
          <div className="header-info">
            <div className="header-title">
              <h1>Loan Payment Details</h1>
              <span className="loan-id-header">{loan.id}</span>
            </div>
          </div>
          <div className="header-actions">
            <button className="back-btn" onClick={() => navigate('/loans')}>
              <ArrowLeft size={16} />
              Back to Loans
            </button>
          </div>
        </div>

        <div className="loan-details-content" style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div className="space-y-6">
            {/* Conditional Rendering Based on Workflow Status */}
            
            {/* REJECTED STATE */}
            {loan.workflowStatus === 'REJECTED' && (
              <>
                <ApprovalCard 
                  loan={loan}
                  workflowStatus={loan.workflowStatus}
                  rejectedBy={loan.rejectedByName}
                  rejectedAt={loan.rejectedAt}
                  rejectionReason={loan.rejectionReason}
                />
                <LoanOverviewCard loanData={loanData} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                  <ClientInfoCard client={client} />
                  <OfficerInfoCard officer={loanOfficer} />
                </div>
                
                {/* Workflow Timeline */}
                <div className="details-card">
                  <h2 className="section-title">Workflow Timeline</h2>
                  {workflowHistory && workflowHistory.length > 0 ? (
                    <div className="info-grid">
                      {workflowHistory.map((event, index) => (
                        <div key={index} className="info-item">
                          <label>{event.action || 'Event'}</label>
                          <span>
                            {formatTimestamp(event.timestamp)}
                            {event.performedBy && ` — By: ${event.performedBy}`}
                          </span>
                          {event.notes && (
                            <small style={{ fontSize: '13px', color: '#718096', fontStyle: 'italic', marginTop: '4px' }}>
                              &ldquo;{event.notes}&rdquo;
                            </small>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: '#718096', fontSize: '14px' }}>No workflow events recorded yet</p>
                  )}
                </div>
              </>
            )}

            {/* PENDING APPROVAL STATE */}
            {loan.workflowStatus === 'PENDING_APPROVAL' && (
              <>
                <ApprovalCard 
                  loan={loan}
                  workflowStatus={loan.workflowStatus}
                  onApprove={handleApproveLoan}
                  onReject={handleRejectLoan}
                />
                <LoanOverviewCard loanData={loanData} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                  <ClientInfoCard client={client} />
                  <OfficerInfoCard officer={loanOfficer} />
                </div>
                
                {/* Workflow Timeline */}
                <div className="details-card">
                  <h2 className="section-title">Workflow Timeline</h2>
                  {workflowHistory && workflowHistory.length > 0 ? (
                    <div className="info-grid">
                      {workflowHistory.map((event, index) => (
                        <div key={index} className="info-item">
                          <label>{event.action || 'Event'}</label>
                          <span>
                            {formatTimestamp(event.timestamp)}
                            {event.performedBy && ` — By: ${event.performedBy}`}
                          </span>
                          {event.notes && (
                            <small style={{ fontSize: '13px', color: '#718096', fontStyle: 'italic', marginTop: '4px' }}>
                              &ldquo;{event.notes}&rdquo;
                            </small>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: '#718096', fontSize: '14px' }}>No workflow events recorded yet</p>
                  )}
                </div>
              </>
            )}

            {/* APPROVED STATE */}
            {loan.workflowStatus === 'APPROVED' && (
              <>
                <ApprovalCard 
                  loan={loan}
                  workflowStatus={loan.workflowStatus}
                  approvedBy={loan.approvedByName}
                  approvedAt={loan.approvedAt}
                />
                <LoanOverviewCard loanData={loanData} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                  <ClientInfoCard client={client} />
                  <OfficerInfoCard officer={loanOfficer} />
                </div>
                
                {/* Payment Tracking */}
                {tracking && (
                  <div className="details-card">
                    <h2 className="section-title">Payment Tracking</h2>
                    <div className="info-grid">
                      <div className="info-item">
                        <label>Payment Progress</label>
                        <span>
                          {tracking.installmentsPaid} of {tracking.totalInstallments} payments made
                          ({tracking.totalInstallments > 0 
                            ? ((tracking.installmentsPaid / tracking.totalInstallments) * 100).toFixed(1) 
                            : 0}%)
                        </span>
                      </div>
                      <div className="info-item">
                        <label>Amount Paid</label>
                        <span>
                          {formatCurrency(tracking.amountPaid)} of {formatCurrency(loan?.totalPayable)}
                        </span>
                      </div>
                      <div className="info-item">
                        <label>Outstanding Balance</label>
                        <span>{formatCurrency(tracking.balance)}</span>
                      </div>
                      <div className="info-item">
                        <label>Next Payment Due</label>
                        <span>{formatDate(tracking.nextPaymentDate)}</span>
                      </div>
                      <div className="info-item">
                        <label>Next Payment Amount</label>
                        <span>{formatCurrency(tracking.nextPaymentAmount)}</span>
                      </div>
                      {tracking.status && (
                        <div className="info-item">
                          <label>Status</label>
                          <StatusBadge status={tracking.status} size="sm" />
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Planned Payment Schedule (before disbursement) */}
                <div className="details-card">
                  <h2 className="section-title">Planned Payment Schedule</h2>
                  <p style={{ color: '#718096', fontSize: '14px', marginBottom: '16px' }}>
                    This is the planned repayment schedule. The actual schedule will be generated when the loan is disbursed.
                  </p>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Total Installments</label>
                      <span>{loan.loanTerm || 'N/A'} months</span>
                    </div>
                    <div className="info-item">
                      <label>Repayment Frequency</label>
                      <span>{loan.repaymentFrequency || 'Monthly'}</span>
                    </div>
                    <div className="info-item">
                      <label>Estimated Monthly Payment</label>
                      <span>{formatCurrency((loan.totalPayable || 0) / (loan.loanTerm || 1))}</span>
                    </div>
                    <div className="info-item">
                      <label>Interest Method</label>
                      <span>{loan.interestMethod || 'Flat'}</span>
                    </div>
                  </div>
                </div>
                
                {/* Workflow Timeline */}
                <div className="details-card">
                  <h2 className="section-title">Workflow Timeline</h2>
                  {workflowHistory && workflowHistory.length > 0 ? (
                    <div className="info-grid">
                      {workflowHistory.map((event, index) => (
                        <div key={index} className="info-item">
                          <label>{event.action || 'Event'}</label>
                          <span>
                            {formatTimestamp(event.timestamp)}
                            {event.performedBy && ` — By: ${event.performedBy}`}
                          </span>
                          {event.notes && (
                            <small style={{ fontSize: '13px', color: '#718096', fontStyle: 'italic', marginTop: '4px' }}>
                              &ldquo;{event.notes}&rdquo;
                            </small>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: '#718096', fontSize: '14px' }}>No workflow events recorded yet</p>
                  )}
                </div>
              </>
            )}

            {/* DISBURSED STATE */}
            {loan.workflowStatus === 'DISBURSED' && (
              <>
                <LoanOverviewCard loanData={loanData} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                  <ClientInfoCard client={client} />
                  <OfficerInfoCard officer={loanOfficer} />
                </div>
                
                {/* Payment Tracking */}
                {tracking && (
                  <div className="details-card">
                    <h2 className="section-title">Payment Tracking</h2>
                    <div className="info-grid">
                      <div className="info-item">
                        <label>Payment Progress</label>
                        <span>
                          {tracking.installmentsPaid} of {tracking.totalInstallments} payments made
                          ({tracking.totalInstallments > 0 
                            ? ((tracking.installmentsPaid / tracking.totalInstallments) * 100).toFixed(1) 
                            : 0}%)
                        </span>
                      </div>
                      <div className="info-item">
                        <label>Amount Paid</label>
                        <span>
                          {formatCurrency(tracking.amountPaid)} of {formatCurrency(loan?.totalPayable)}
                        </span>
                      </div>
                      <div className="info-item">
                        <label>Outstanding Balance</label>
                        <span>{formatCurrency(tracking.balance)}</span>
                      </div>
                      <div className="info-item">
                        <label>Next Payment Due</label>
                        <span>{formatDate(tracking.nextPaymentDate)}</span>
                      </div>
                      <div className="info-item">
                        <label>Next Payment Amount</label>
                        <span>{formatCurrency(tracking.nextPaymentAmount)}</span>
                      </div>
                      {tracking.status && (
                        <div className="info-item">
                          <label>Status</label>
                          <StatusBadge status={tracking.status} size="sm" />
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Payment Schedule */}
                <LoanPaymentSchedule loanId={loan.id} />
                
                {payments && payments.length > 0 && <PaymentHistoryTable payments={payments} />}
                
                {/* Workflow Timeline */}
                <div className="details-card">
                  <h2 className="section-title">Workflow Timeline</h2>
                  {workflowHistory && workflowHistory.length > 0 ? (
                    <div className="info-grid">
                      {workflowHistory.map((event, index) => (
                        <div key={index} className="info-item">
                          <label>{event.action || 'Event'}</label>
                          <span>
                            {formatTimestamp(event.timestamp)}
                            {event.performedBy && ` — By: ${event.performedBy}`}
                          </span>
                          {event.notes && (
                            <small style={{ fontSize: '13px', color: '#718096', fontStyle: 'italic', marginTop: '4px', display: 'block' }}>
                              &ldquo;{event.notes}&rdquo;
                            </small>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: '#718096', fontSize: '14px' }}>No workflow events recorded yet</p>
                  )}
                </div>
              </>
            )}

            {/* COMPLETED STATE */}
            {loan.workflowStatus === 'COMPLETED' && (
              <>
                <div className="loan-completed-card details-card">
                  <div className="completion-badge">
                    <CheckCircle2 size={28} className="check-icon" />
                  </div>
                  <h2 style={{ color: '#16a34a', marginBottom: '8px' }}>Loan Fully Repaid</h2>
                  <p style={{ color: '#065f46', marginBottom: '0' }}>This loan has been completed successfully. All payments have been received.</p>
                </div>
                <LoanOverviewCard loanData={loanData} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                  <ClientInfoCard client={client} />
                  <OfficerInfoCard officer={loanOfficer} />
                </div>
                
                {/* Payment Tracking */}
                {tracking && (
                  <div className="details-card">
                    <h2 className="section-title">Payment Tracking</h2>
                    <div className="info-grid">
                      <div className="info-item">
                        <label>Payment Progress</label>
                        <span>
                          {tracking.installmentsPaid} of {tracking.totalInstallments} payments made
                          ({tracking.totalInstallments > 0 
                            ? ((tracking.installmentsPaid / tracking.totalInstallments) * 100).toFixed(1) 
                            : 0}%)
                        </span>
                      </div>
                      <div className="info-item">
                        <label>Amount Paid</label>
                        <span>
                          {formatCurrency(tracking.amountPaid)} of {formatCurrency(loan?.totalPayable)}
                        </span>
                      </div>
                      <div className="info-item">
                        <label>Outstanding Balance</label>
                        <span>{formatCurrency(tracking.balance)}</span>
                      </div>
                      <div className="info-item">
                        <label>Next Payment Due</label>
                        <span>{formatDate(tracking.nextPaymentDate)}</span>
                      </div>
                      <div className="info-item">
                        <label>Next Payment Amount</label>
                        <span>{formatCurrency(tracking.nextPaymentAmount)}</span>
                      </div>
                      {tracking.status && (
                        <div className="info-item">
                          <label>Status</label>
                          <StatusBadge status={tracking.status} size="sm" />
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Payment Schedule */}
                <LoanPaymentSchedule loanId={loan.id} />
                
                {payments && payments.length > 0 && <PaymentHistoryTable payments={payments} />}
                
                {/* Workflow Timeline */}
                <div className="details-card">
                  <h2 className="section-title">Workflow Timeline</h2>
                  {workflowHistory && workflowHistory.length > 0 ? (
                    <div className="info-grid">
                      {workflowHistory.map((event, index) => (
                        <div key={index} className="info-item">
                          <label>{event.action || 'Event'}</label>
                          <span>
                            {formatTimestamp(event.timestamp)}
                            {event.performedBy && ` — By: ${event.performedBy}`}
                          </span>
                          {event.notes && (
                            <small style={{ fontSize: '13px', color: '#718096', fontStyle: 'italic', marginTop: '4px', display: 'block' }}>
                              &ldquo;{event.notes}&rdquo;
                            </small>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: '#718096', fontSize: '14px' }}>No workflow events recorded yet</p>
                  )}
                </div>
              </>
            )}

            {/* DEFAULTED STATE */}
            {loan.workflowStatus === 'DEFAULTED' && (
              <>
                <div className="details-card" style={{ borderColor: '#f8d7da', background: '#fff5f5' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', background: '#fee', borderRadius: '50%', color: '#dc3545' }}>
                      <XCircle size={28} />
                    </div>
                    <div>
                      <h2 style={{ color: '#dc3545', marginBottom: '4px' }}>Loan Defaulted</h2>
                      <p style={{ color: '#721c24', marginBottom: '0' }}>This loan has been marked as defaulted. No further payments are expected.</p>
                    </div>
                  </div>
                </div>
                <LoanOverviewCard loanData={loanData} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                  <ClientInfoCard client={client} />
                  <OfficerInfoCard officer={loanOfficer} />
                </div>
                
                {/* Payment Tracking */}
                {tracking && (
                  <div className="details-card">
                    <h2 className="section-title">Payment Tracking</h2>
                    <div className="info-grid">
                      <div className="info-item">
                        <label>Payment Progress</label>
                        <span>
                          {tracking.installmentsPaid} of {tracking.totalInstallments} payments made
                          ({tracking.totalInstallments > 0 
                            ? ((tracking.installmentsPaid / tracking.totalInstallments) * 100).toFixed(1) 
                            : 0}%)
                        </span>
                      </div>
                      <div className="info-item">
                        <label>Amount Paid</label>
                        <span>
                          {formatCurrency(tracking.amountPaid)} of {formatCurrency(loan?.totalPayable)}
                        </span>
                      </div>
                      <div className="info-item">
                        <label>Outstanding Balance</label>
                        <span>{formatCurrency(tracking.balance)}</span>
                      </div>
                      <div className="info-item">
                        <label>Next Payment Due</label>
                        <span>{formatDate(tracking.nextPaymentDate)}</span>
                      </div>
                      <div className="info-item">
                        <label>Next Payment Amount</label>
                        <span>{formatCurrency(tracking.nextPaymentAmount)}</span>
                      </div>
                      {tracking.status && (
                        <div className="info-item">
                          <label>Status</label>
                          <StatusBadge status={tracking.status} size="sm" />
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Payment Schedule */}
                <LoanPaymentSchedule loanId={loan.id} />
                
                {payments && payments.length > 0 && <PaymentHistoryTable payments={payments} />}
                
                {/* Workflow Timeline */}
                <div className="details-card">
                  <h2 className="section-title">Workflow Timeline</h2>
                  {workflowHistory && workflowHistory.length > 0 ? (
                    <div className="info-grid">
                      {workflowHistory.map((event, index) => (
                        <div key={index} className="info-item">
                          <label>{event.action || 'Event'}</label>
                          <span>
                            {formatTimestamp(event.timestamp)}
                            {event.performedBy && ` — By: ${event.performedBy}`}
                          </span>
                          {event.notes && (
                            <small style={{ fontSize: '13px', color: '#718096', fontStyle: 'italic', marginTop: '4px', display: 'block' }}>
                              &ldquo;{event.notes}&rdquo;
                            </small>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: '#718096', fontSize: '14px' }}>No workflow events recorded yet</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
      
      {/* Edit Loan Modal */}
      <EditLoanModal
        loan={loan}
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSave={handleSaveLoan}
      />

      {/* Add Payment Modal */}
      <AddPaymentModal
        loan={loan}
        isOpen={isPaymentModalOpen}
        onClose={handleClosePaymentModal}
        onSave={handleSavePayment}
      />

      {/* Delete Loan Modal */}
      <DeleteLoanModal
        loan={loan}
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default LoanDetails;
