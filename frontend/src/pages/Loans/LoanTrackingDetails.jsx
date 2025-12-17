import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Sidebar from '../../components/Layout/Sidebar';
import { toast } from 'react-hot-toast';
import LoanService from '../../services/loanService';
import './LoanTrackingDetails.css';

const LoanTrackingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrackingData();
  }, [id]);

  const fetchTrackingData = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching complete loan data for ID:', id);
      
      const response = await LoanService.getCompleteLoan(id);
      const completeData = response.data;
      
      console.log('✅ Complete loan data received:', completeData);
      
      // Use tracking data from the complete loan response
      if (completeData && completeData.tracking) {
        setTrackingData({
          loanNumber: completeData.loan?.loanNumber || '-',
          totalOwed: completeData.tracking.totalAmountDue || 0,
          totalPaid: completeData.tracking.totalAmountPaid || 0,
          balanceRemaining: completeData.tracking.outstandingBalance || 0,
          completionPercentage: completeData.tracking.percentagePaid || 0,
          principalAmount: completeData.loan?.principalAmount || 0,
          interestAmount: completeData.tracking.interestAccrued || 0,
          totalAmount: completeData.tracking.totalAmountDue || 0,
          penaltiesTotal: completeData.tracking.penaltiesTotal || 0,
          installmentsTotal: completeData.tracking.installmentsTotal || 0,
          installmentsPaid: completeData.tracking.installmentsPaid || 0,
          installmentsRemaining: completeData.tracking.installmentsRemaining || 0,
          nextInstallmentDate: completeData.tracking.nextInstallmentDate,
          lastPaymentDate: completeData.tracking.lastPaymentDate
        });
      } else {
        toast.error('Tracking data not available for this loan');
        setTrackingData(null);
      }
    } catch (error) {
      console.error('❌ Error fetching tracking data:', error);
      toast.error('Failed to load loan tracking details');
      setTrackingData(null);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading tracking details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!trackingData) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main">
          <div className="empty-state-pending">
            <p>No tracking data found</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        {/* Header Section */}
        <div className="page-header">
          <button
            onClick={() => navigate('/loans/tracking')}
            className="back-button"
          >
            <ArrowLeft size={20} />
            Back to Loan Tracking
          </button>
          <div className="header-content">
            <h1>Loan Tracking Details</h1>
            <p className="page-description">
              Loan Number: {trackingData.loanNumber || '-'}
            </p>
          </div>
        </div>

        <div className="tracking-details-content">
          {/* Key Metrics Cards */}
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-label">Total Owed</div>
              <div className="metric-value">{formatCurrency(trackingData.totalOwed || 0)}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Total Paid</div>
              <div className="metric-value">{formatCurrency(trackingData.totalPaid || 0)}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Balance Remaining</div>
              <div className="metric-value">{formatCurrency(trackingData.balanceRemaining || 0)}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Completion %</div>
              <div className="metric-value">{trackingData.completionPercentage || 0}%</div>
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="breakdown-section">
            <h2>Financial Breakdown</h2>
            <div className="breakdown-grid">
              <div className="breakdown-item">
                <span className="breakdown-label">Principal Amount:</span>
                <span className="breakdown-value">{formatCurrency(trackingData.principalAmount || 0)}</span>
              </div>
              <div className="breakdown-item">
                <span className="breakdown-label">Interest Amount:</span>
                <span className="breakdown-value">{formatCurrency(trackingData.interestAmount || 0)}</span>
              </div>
              <div className="breakdown-item">
                <span className="breakdown-label">Total Amount:</span>
                <span className="breakdown-value">{formatCurrency(trackingData.totalAmount || 0)}</span>
              </div>
            </div>
          </div>

          {/* Payment History - Placeholder */}
          <div className="payment-history-section">
            <h2>Payment History</h2>
            <p className="placeholder-text">Payment history will be displayed here</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoanTrackingDetails;
