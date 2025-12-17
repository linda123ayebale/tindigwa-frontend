import React from 'react';
import StatusBadge from '../StatusBadge';
import './LoanOverviewCard.css';

/**
 * LoanOverviewCard - Displays comprehensive loan overview with all financial and operational details
 * Organized into sections: Loan Summary, Financial Details, Repayment Details, Dates, Balance Summary
 */
const LoanOverviewCard = ({ loanData }) => {
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || amount === 0) return 'USh 0';
    return `USh ${Number(amount).toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  if (!loanData || !loanData.loan) {
    return <div className="loan-overview-card"><p>Loading loan information...</p></div>;
  }

  const { loan } = loanData;

  return (
    <div className="loan-overview-card">
      <div className="overview-header">
        <h3>Loan Overview</h3>
        <div className="status-badges">
          <StatusBadge status={loan.workflowStatus} size="sm" />
          <StatusBadge status={loan.loanStatus} size="sm" />
        </div>
      </div>

      {/* Loan Summary Section */}
      <div className="overview-section">
        <h4 className="section-title">Loan Summary</h4>
        <div className="two-column-grid">
          <div className="row">
            <span className="label">Loan Number</span>
            <span className="value">{loan.loanNumber || 'N/A'}</span>
          </div>
          <div className="row">
            <span className="label">Product</span>
            <span className="value">{loanData.loanProduct || 'N/A'}</span>
          </div>
          <div className="row">
            <span className="label">Loan Category</span>
            <span className="value">{loanData.loanCategory || 'N/A'}</span>
          </div>
          <div className="row">
            <span className="label">Loan Type</span>
            <span className="value">{loanData.loanType || 'N/A'}</span>
          </div>
          <div className="row">
            <span className="label">Loan Purpose</span>
            <span className="value">{loanData.loanPurpose || loan.description || 'N/A'}</span>
          </div>
          <div className="row">
            <span className="label">Loan Status</span>
            <span className="value"><StatusBadge status={loan.loanStatus} size="xs" /></span>
          </div>
        </div>
      </div>

      {/* Financial Details Section */}
      <div className="overview-section">
        <h4 className="section-title">Financial Details</h4>
        <div className="two-column-grid">
          <div className="row">
            <span className="label">Principal Amount</span>
            <span className="value">{formatCurrency(loan.principalAmount)}</span>
          </div>
          <div className="row">
            <span className="label">Total Payable</span>
            <span className="value">{formatCurrency(loan.totalPayable)}</span>
          </div>
          <div className="row">
            <span className="label">Processing Fee</span>
            <span className="value">{formatCurrency(loanData.processingFee || loan.processingFee)}</span>
          </div>
          <div className="row">
            <span className="label">Late Payment Fee</span>
            <span className="value">{formatCurrency(loanData.lateFee || loan.lateFee)}</span>
          </div>
          <div className="row">
            <span className="label">Insurance Fee</span>
            <span className="value">{formatCurrency(loanData.insuranceFee)}</span>
          </div>
          <div className="row">
            <span className="label">Collateral Value</span>
            <span className="value">{formatCurrency(loanData.collateralValue)}</span>
          </div>
        </div>
      </div>

      {/* Repayment Details Section */}
      <div className="overview-section">
        <h4 className="section-title">Repayment Details</h4>
        <div className="two-column-grid">
          <div className="row">
            <span className="label">Interest Rate & Method</span>
            <span className="value">
              {loanData.interestRate || loan.interestRate}% {loanData.interestMethod || loan.interestMethod}
            </span>
          </div>
          <div className="row">
            <span className="label">Duration</span>
            <span className="value">
              {loan.loanDuration} {loan.durationUnit}
            </span>
          </div>
          <div className="row">
            <span className="label">Repayment Frequency</span>
            <span className="value">{loanData.repaymentFrequency || loan.repaymentFrequency}</span>
          </div>
          <div className="row">
            <span className="label">Number of Installments</span>
            <span className="value">{loanData.numberOfInstallments || loan.numberOfRepayments}</span>
          </div>
          <div className="row">
            <span className="label">Grace Period</span>
            <span className="value">
              {loanData.gracePeriodDays !== undefined ? loanData.gracePeriodDays : loan.gracePeriodDays} days
            </span>
          </div>
          <div className="row">
            <span className="label">Branch</span>
            <span className="value">{loan.lendingBranch || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Dates Section */}
      <div className="overview-section">
        <h4 className="section-title">Key Dates</h4>
        <div className="two-column-grid">
          <div className="row">
            <span className="label">Application Date</span>
            <span className="value">{formatDate(loanData.applicationDate || loan.createdAt)}</span>
          </div>
          <div className="row">
            <span className="label">Approval Date</span>
            <span className="value">{formatDate(loanData.approvalDate || loan.approvalDate)}</span>
          </div>
          <div className="row">
            <span className="label">Disbursement Date</span>
            <span className="value">{formatDate(loanData.disbursementDate || loan.disbursedAt || loan.releaseDate)}</span>
          </div>
          <div className="row">
            <span className="label">First Repayment Date</span>
            <span className="value">{formatDate(loanData.firstRepaymentDate || loan.firstRepaymentDate)}</span>
          </div>
          <div className="row">
            <span className="label">Maturity Date</span>
            <span className="value">{formatDate(loanData.maturityDate || loan.paymentEndDate)}</span>
          </div>
          <div className="row">
            <span className="label">Last Payment Date</span>
            <span className="value">{formatDate(loanData.lastPaymentDate)}</span>
          </div>
        </div>
      </div>

      {/* Balance Summary Section */}
      <div className="overview-section highlight">
        <h4 className="section-title">Balance Summary</h4>
        <div className="two-column-grid">
          <div className="row">
            <span className="label">Total Amount Paid</span>
            <span className="value highlight-value">{formatCurrency(loanData.totalPaid)}</span>
          </div>
          <div className="row">
            <span className="label">Outstanding Balance</span>
            <span className="value highlight-value">{formatCurrency(loanData.outstandingBalance)}</span>
          </div>
          <div className="row">
            <span className="label">Principal Paid</span>
            <span className="value">{formatCurrency(loanData.principalPaid)}</span>
          </div>
          <div className="row">
            <span className="label">Interest Paid</span>
            <span className="value">{formatCurrency(loanData.interestPaid)}</span>
          </div>
          <div className="row">
            <span className="label">Next Payment Amount</span>
            <span className="value">{formatCurrency(loanData.nextPaymentAmount)}</span>
          </div>
          <div className="row">
            <span className="label">Next Payment Due</span>
            <span className="value">{formatDate(loanData.nextPaymentDue)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanOverviewCard;
