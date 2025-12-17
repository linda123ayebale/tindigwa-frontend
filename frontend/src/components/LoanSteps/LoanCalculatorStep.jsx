import React, { useMemo } from 'react';
import { Calculator, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import { generateSchedule, deriveTermAndFrequency } from '../../services/scheduleService';
import '../ClientSteps/StepStyles.css';

const LoanCalculatorStep = ({ formData, updateFormData, errors = {} }) => {
  // Calculate loan schedule and totals
  const calculations = useMemo(() => {
    try {
      const principal = parseFloat(formData.principal) || 0;
      const interestRate = parseFloat(formData.interestRate) || 0;
      const processingFee = parseFloat(formData.processingFee) || 0;

      if (principal <= 0 || !formData.loanDuration || !formData.repaymentFrequency) {
        return { 
          schedule: [], 
          totalPayable: principal + processingFee, 
          totalInterest: 0,
          endDate: formData.releaseDate || new Date().toISOString().split('T')[0],
          monthlyPayment: 0,
          termDays: 0,
          numberOfPayments: 0
        };
      }

      // Calculate term and frequency details
      const { termDays } = deriveTermAndFrequency({
        durationValue: Number(formData.loanDuration || 0),
        durationUnit: formData.durationUnit || 'months',
        frequency: formData.repaymentFrequency || 'monthly'
      });

      // Generate payment schedule
      const { schedule, totalPayable } = generateSchedule({
        principal,
        ratePct: interestRate,
        frequency: formData.repaymentFrequency,
        termDays,
        startDate: formData.releaseDate || new Date().toISOString().split('T')[0],
        method: formData.interestMethod || 'flat',
        firstRepaymentDate: formData.firstRepaymentDate || undefined,
        firstRepaymentAmount: formData.firstRepaymentAmount ? Number(formData.firstRepaymentAmount) : undefined,
        feesTotal: processingFee,
      });

      const totalInterest = totalPayable - principal - processingFee;
      const endDate = schedule.length ? schedule[schedule.length - 1].dueDate : formData.releaseDate;
      const monthlyPayment = schedule.length ? schedule[0].amount : 0;

      return {
        schedule,
        totalPayable,
        totalInterest,
        endDate,
        monthlyPayment,
        termDays,
        numberOfPayments: schedule.length
      };
    } catch (error) {
      console.warn('Calculation error:', error);
      return { 
        schedule: [], 
        totalPayable: parseFloat(formData.principal) || 0, 
        totalInterest: 0,
        endDate: formData.releaseDate || new Date().toISOString().split('T')[0],
        monthlyPayment: 0,
        termDays: 0,
        numberOfPayments: 0
      };
    }
  }, [
    formData.principal,
    formData.interestRate,
    formData.interestMethod,
    formData.loanDuration,
    formData.durationUnit,
    formData.repaymentFrequency,
    formData.releaseDate,
    formData.firstRepaymentDate,
    formData.firstRepaymentAmount,
    formData.processingFee
  ]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(amount || 0).replace('UGX', 'USh');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  return (
    <div className="step-container">
      <div className="step-header">
        <h2>
          <Calculator size={20} />
          Loan Calculator & Schedule Preview
        </h2>
        <p>Review calculated loan details and payment schedule</p>
      </div>

      <div className="step-form">
        {/* Loan Summary Cards */}
        <div className="calculator-summary">
          <div className="summary-cards">
            <div className="summary-card primary">
              <div className="card-icon">
                <DollarSign size={24} />
              </div>
              <div className="card-content">
                <div className="card-label">Total Payable</div>
                <div className="card-value">{formatCurrency(calculations.totalPayable)}</div>
                <div className="card-detail">
                  Principal: {formatCurrency(formData.principal)} + Interest: {formatCurrency(calculations.totalInterest)}
                  {formData.processingFee > 0 && ` + Fees: ${formatCurrency(formData.processingFee)}`}
                </div>
              </div>
            </div>

            <div className="summary-card">
              <div className="card-icon">
                <Calendar size={24} />
              </div>
              <div className="card-content">
                <div className="card-label">Payment Schedule</div>
                <div className="card-value">{calculations.numberOfPayments} payments</div>
                <div className="card-detail">
                  From {formatDate(formData.releaseDate || new Date())} to {formatDate(calculations.endDate)}
                </div>
              </div>
            </div>

            <div className="summary-card">
              <div className="card-icon">
                <TrendingUp size={24} />
              </div>
              <div className="card-content">
                <div className="card-label">Payment Amount</div>
                <div className="card-value">{formatCurrency(calculations.monthlyPayment)}</div>
                <div className="card-detail">
                  Per {formData.repaymentFrequency || 'monthly'} payment
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Loan Details Grid */}
        <div className="loan-details-grid">
          <h3>Loan Details Summary</h3>
          <div className="details-grid">
            <div className="detail-row">
              <span className="detail-label">Principal Amount:</span>
              <span className="detail-value">{formatCurrency(formData.principal)}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Interest Method:</span>
              <span className="detail-value">
                {formData.interestMethod?.replace(/_/g, ' ') || 'Flat Rate'}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Interest Rate:</span>
              <span className="detail-value">
                {formData.interestType === 'fixed' 
                  ? `${formatCurrency(formData.fixedInterestAmount)} per cycle`
                  : `${formData.interestRate}% per ${formData.ratePer}`
                }
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Loan Duration:</span>
              <span className="detail-value">
                {formData.loanDuration} {formData.durationUnit} ({calculations.termDays} days)
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Repayment Frequency:</span>
              <span className="detail-value">{formData.repaymentFrequency}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Processing Fee:</span>
              <span className="detail-value">{formatCurrency(formData.processingFee)}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Grace Period:</span>
              <span className="detail-value">{formData.gracePeriodDays || 0} days</span>
            </div>
            <div className="detail-row highlight">
              <span className="detail-label">Total Interest:</span>
              <span className="detail-value">{formatCurrency(calculations.totalInterest)}</span>
            </div>
          </div>
        </div>

        {/* Payment Schedule Table */}
        {calculations.schedule.length > 0 && (
          <div className="schedule-section">
            <h3>Payment Schedule Preview</h3>
            <div className="schedule-info">
              <p>Showing {Math.min(12, calculations.schedule.length)} of {calculations.schedule.length} payments</p>
            </div>
            
            <div className="schedule-table-container">
              <div className="schedule-table">
                <div className="table-header">
                  <div className="header-cell">Payment #</div>
                  <div className="header-cell">Due Date</div>
                  <div className="header-cell">Payment Amount</div>
                  <div className="header-cell">Principal</div>
                  <div className="header-cell">Interest</div>
                  <div className="header-cell">Balance</div>
                </div>
                <div className="table-body">
                  {calculations.schedule.slice(0, 12).map((payment, index) => (
                    <div key={index} className="table-row">
                      <div className="table-cell">{payment.number}</div>
                      <div className="table-cell">{formatDate(payment.dueDate)}</div>
                      <div className="table-cell amount">{formatCurrency(payment.amount)}</div>
                      <div className="table-cell amount">{formatCurrency(payment.principal)}</div>
                      <div className="table-cell amount">{formatCurrency(payment.interest)}</div>
                      <div className="table-cell amount">{formatCurrency(payment.balance)}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              {calculations.schedule.length > 12 && (
                <div className="table-footer">
                  <p>... and {calculations.schedule.length - 12} more payments</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Calculation Warnings */}
        {formData.principal && calculations.totalPayable === 0 && (
          <div className="warning-message">
            <p><strong>Missing Information:</strong> Please complete the previous steps to see loan calculations.</p>
            <ul>
              {!formData.principal && <li>Principal amount is required</li>}
              {!formData.loanDuration && <li>Loan duration is required</li>}
              {!formData.repaymentFrequency && <li>Repayment frequency is required</li>}
              {!formData.interestRate && formData.interestType !== 'fixed' && <li>Interest rate is required</li>}
              {!formData.fixedInterestAmount && formData.interestType === 'fixed' && <li>Fixed interest amount is required</li>}
            </ul>
          </div>
        )}

        {/* Interest Calculation Note */}
        {calculations.schedule.length > 0 && (
          <div className="calculation-note">
            <h4>Calculation Method: {formData.interestMethod?.replace(/_/g, ' ') || 'Flat Rate'}</h4>
            <div className="method-description">
              {formData.interestMethod === 'flat' && (
                <p>Interest is calculated on the original principal amount for the entire loan term.</p>
              )}
              {formData.interestMethod === 'reducing_equal_installments' && (
                <p>Interest is calculated on the reducing principal balance with equal installment amounts.</p>
              )}
              {formData.interestMethod === 'reducing_equal_principal' && (
                <p>Equal principal amounts with reducing interest calculated on remaining balance.</p>
              )}
              {formData.interestMethod === 'interest_only' && (
                <p>Only interest payments during the term, with principal due at maturity.</p>
              )}
              {formData.interestMethod === 'compound' && (
                <p>Interest is compounded and added to the principal balance.</p>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="calculator-actions">
          <div className="action-buttons">
            {/* <button 
              type="button"
              className="action-btn secondary"
              onClick={() => {
                // TODO: Export schedule to CSV/PDF
                console.log('Export schedule');
              }}
            >
              Export Schedule
            </button>
            <button 
              type="button"
              className="action-btn secondary"
              onClick={() => {
                // TODO: Print schedule
                window.print();
              }}
            >
              Print Schedule
            </button> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanCalculatorStep;