import React, { useState, useEffect, useCallback } from 'react';
import { X, Download, Mail, Printer, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { paymentReceiptTemplate } from '../templates/documentTemplates';
import documentGenerationService from '../services/documentGenerationService';
import { useNotification } from '../hooks/useNotification';
import NotificationModal from './NotificationModal/NotificationModal';
import './PaymentReceiptModal.css';

const PaymentReceiptModal = ({ paymentId, onClose }) => {
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exportLoading, setExportLoading] = useState({ pdf: false, word: false });
  
  // Use notification hook
  const { notification, showSuccess, showError, hideNotification } = useNotification();

  const fetchReceipt = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching receipt for payment ID:', paymentId);
      const response = await fetch(`http://localhost:8081/api/payments/receipts/${paymentId}`);
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch receipt (${response.status})`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      console.log('Receipt fetched successfully');
      setReceipt(data);
    } catch (err) {
      console.error('Error fetching receipt:', err);
      setError(err.message || 'Failed to load receipt');
    } finally {
      setLoading(false);
    }
  }, [paymentId]);

  useEffect(() => {
    if (paymentId) {
      fetchReceipt();
    }
  }, [paymentId, fetchReceipt]);

  const handlePrint = () => {
    // Get the receipt content
    const receiptContent = document.querySelector('.receipt-document');
    if (!receiptContent) return;

    // Create a new window for printing
    const printWindow = window.open('', '', 'width=800,height=600');
    
    // Get all the styles from the current document
    const styles = Array.from(document.styleSheets)
      .map(styleSheet => {
        try {
          return Array.from(styleSheet.cssRules)
            .map(rule => rule.cssText)
            .join('\n');
        } catch (e) {
          // Handle CORS issues with external stylesheets
          return '';
        }
      })
      .join('\n');

    // Write the content to the new window
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payment Receipt - ${receipt?.receiptNumber || ''}</title>
          <style>
            ${styles}
            body {
              margin: 0;
              padding: 20px;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            }
            @media print {
              body { margin: 0; padding: 10px; }
            }
          </style>
        </head>
        <body>
          ${receiptContent.outerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    
    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };
  };

  // Prepare receipt data for document generation
  const prepareReceiptData = () => {
    if (!receipt) return null;

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'UGX',
        minimumFractionDigits: 0
      }).format(amount || 0);
    };

    return {
      receiptNumber: receipt.receiptNumber || 'N/A',
      receiptDate: receipt.generatedDate || new Date().toISOString().split('T')[0],
      paymentMethod: receipt.payment?.paymentMethod || 'N/A',
      transactionRef: receipt.payment?.transactionReference || 'N/A',
      clientName: receipt.client?.name || 'N/A',
      clientId: receipt.client?.id || 'N/A',
      clientPhone: receipt.client?.phone || 'N/A',
      loanNumber: receipt.loan?.loanNumber || 'N/A',
      balanceBeforeFormatted: formatCurrency(receipt.balanceBefore || 0),
      amountPaidFormatted: formatCurrency(receipt.payment?.amountPaid || 0),
      principalPaymentFormatted: formatCurrency(receipt.breakdown?.principalPaid || 0),
      interestPaymentFormatted: formatCurrency(receipt.breakdown?.interestPaid || 0),
      penaltyPaymentFormatted: formatCurrency(receipt.breakdown?.fine || 0),
      balanceAfterFormatted: formatCurrency(receipt.outstandingBalance || 0),
      receivedBy: localStorage.getItem('tindigwa_user') ? JSON.parse(localStorage.getItem('tindigwa_user')).name : 'Tindigwa Staff'
    };
  };

  // Handle PDF Export
  const handleExportPDF = async () => {
    setExportLoading({ ...exportLoading, pdf: true });

    try {
      const data = prepareReceiptData();
      if (!data) {
        throw new Error('Receipt data not available');
      }

      console.log('[PaymentReceipt] Generating PDF with data:', data);
      
      await documentGenerationService.generatePDF(paymentReceiptTemplate, data);
      
      showSuccess('PDF document created successfully!', { 
        title: 'Success',
        autoClose: 3000 
      });
    } catch (error) {
      console.error('[PaymentReceipt] PDF generation error:', error);
      showError(`Failed to generate PDF: ${error.message}`, { 
        title: 'Export Failed' 
      });
    } finally {
      setExportLoading({ ...exportLoading, pdf: false });
    }
  };

  // Handle Word Export
  const handleExportWord = async () => {
    setExportLoading({ ...exportLoading, word: true });

    try {
      const data = prepareReceiptData();
      if (!data) {
        throw new Error('Receipt data not available');
      }

      console.log('[PaymentReceipt] Generating Word document with data:', data);
      
      await documentGenerationService.generateDOCX(paymentReceiptTemplate, data);
      
      showSuccess('Word document created successfully!', { 
        title: 'Success',
        autoClose: 3000 
      });
    } catch (error) {
      console.error('[PaymentReceipt] Word generation error:', error);
      showError(`Failed to generate Word document: ${error.message}`, { 
        title: 'Export Failed' 
      });
    } finally {
      setExportLoading({ ...exportLoading, word: false });
    }
  };

  const handleEmail = () => {
    alert('Email functionality coming soon!');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  if (!paymentId) return null;

  return (
    <div className="receipt-modal-overlay" onClick={onClose}>
      <div className="receipt-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="receipt-modal-header">
          <h2>Payment Receipt</h2>
          <button className="receipt-close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Actions Bar */}
        {!loading && !error && (
          <div className="receipt-actions-bar no-print">
            <button className="receipt-action-btn print-btn" onClick={handlePrint}>
              <Printer size={18} />
              Print
            </button>
            <button 
              className="receipt-action-btn pdf-btn" 
              onClick={handleExportPDF}
              disabled={exportLoading.pdf}
            >
              {exportLoading.pdf ? (
                <>
                  <div className="spinner-small-inline"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Download size={18} />
                  Export as PDF
                </>
              )}
            </button>
            <button 
              className="receipt-action-btn word-btn" 
              onClick={handleExportWord}
              disabled={exportLoading.word}
            >
              {exportLoading.word ? (
                <>
                  <div className="spinner-small-inline"></div>
                  Generating...
                </>
              ) : (
                <>
                  <FileText size={18} />
                  Export as Word
                </>
              )}
            </button>
          </div>
        )}

        {/* Content */}
        <div className="receipt-modal-body">
          {loading && (
            <div className="receipt-loading">
              <div className="receipt-spinner"></div>
              <p>Loading receipt...</p>
            </div>
          )}

          {error && (
            <div className="receipt-error">
              <AlertCircle size={48} />
              <p>{error}</p>
              <button onClick={fetchReceipt}>Retry</button>
            </div>
          )}

          {!loading && !error && receipt && (
            <div className="receipt-document">
              {/* Receipt Header */}
              <div className="receipt-doc-header">
                <div className="receipt-logo">
                  <div className="logo-circle">T</div>
                  <h1>Tindigwa Loan Management</h1>
                </div>
                <div className="receipt-number-section">
                  <span className="receipt-label">Receipt #</span>
                  <span className="receipt-number">{receipt.receiptNumber}</span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="receipt-status-badge">
                <CheckCircle size={20} />
                <span>Payment Received</span>
              </div>

              {/* Date Information */}
              <div className="receipt-dates">
                <div className="date-item">
                  <span className="date-label">Generated:</span>
                  <span className="date-value">{receipt.generatedDate} at {receipt.generatedTime}</span>
                </div>
                <div className="date-item">
                  <span className="date-label">Payment Date:</span>
                  <span className="date-value">{receipt.payment?.paymentDate}</span>
                </div>
              </div>

              {/* Amount Summary - Prominent Display */}
              <div className="receipt-amount-display">
                <span className="amount-label">Amount Paid</span>
                <span className="amount-value">{formatCurrency(receipt.payment?.amountPaid)}</span>
                <span className="amount-method">{receipt.payment?.paymentMethod}</span>
              </div>

              {/* Payment Breakdown */}
              <div className="receipt-section">
                <h3>Payment Breakdown</h3>
                <div className="breakdown-table">
                  <div className="breakdown-row">
                    <span className="breakdown-label">Principal Payment</span>
                    <span className="breakdown-value">{formatCurrency(receipt.breakdown?.principalPaid)}</span>
                  </div>
                  <div className="breakdown-row">
                    <span className="breakdown-label">Interest Payment</span>
                    <span className="breakdown-value">{formatCurrency(receipt.breakdown?.interestPaid)}</span>
                  </div>
                  <div className="breakdown-row">
                    <span className="breakdown-label">Fees</span>
                    <span className="breakdown-value">{formatCurrency(receipt.breakdown?.feesPaid)}</span>
                  </div>
                  {receipt.breakdown?.fine > 0 && (
                    <div className="breakdown-row late-fee">
                      <span className="breakdown-label">Late Payment Fee</span>
                      <span className="breakdown-value">{formatCurrency(receipt.breakdown?.fine)}</span>
                    </div>
                  )}
                  <div className="breakdown-row total-row">
                    <span className="breakdown-label">Total Paid</span>
                    <span className="breakdown-value">{formatCurrency(receipt.breakdown?.totalPaid)}</span>
                  </div>
                </div>
              </div>

              {/* Loan Information */}
              {receipt.loan && (
                <div className="receipt-section">
                  <h3>Loan Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">Loan Number</span>
                      <span className="info-value">{receipt.loan.loanNumber}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Installment #</span>
                      <span className="info-value">{receipt.payment?.installmentNumber}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Principal Amount</span>
                      <span className="info-value">{formatCurrency(receipt.loan.principalAmount)}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Interest Rate</span>
                      <span className="info-value">{receipt.loan.interestRate}%</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Loan Term</span>
                      <span className="info-value">{receipt.loan.loanTerm} months</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Outstanding Balance</span>
                      <span className="info-value outstanding">{formatCurrency(receipt.outstandingBalance)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Installment Details */}
              {receipt.installment && (
                <div className="receipt-section">
                  <h3>Installment Details</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">Due Date</span>
                      <span className="info-value">{receipt.installment.dueDate}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Status</span>
                      <span className={`status-badge-small ${receipt.installment.status?.toLowerCase()}`}>
                        {receipt.installment.status}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Scheduled Amount</span>
                      <span className="info-value">{formatCurrency(receipt.installment.scheduledAmount)}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Remaining</span>
                      <span className="info-value">{formatCurrency(receipt.installment.outstandingAmount)}</span>
                    </div>
                  </div>
                  
                  {receipt.status?.isLate && (
                    <div className="late-payment-notice">
                      <AlertCircle size={18} />
                      <span>{receipt.status.lateMessage}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Transaction Details */}
              <div className="receipt-section">
                <h3>Transaction Details</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Payment Method</span>
                    <span className="info-value">{receipt.payment?.paymentMethod || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Transaction Reference</span>
                    <span className="info-value">{receipt.payment?.transactionReference || 'N/A'}</span>
                  </div>
                  {receipt.payment?.notes && (
                    <div className="info-item full-width">
                      <span className="info-label">Notes</span>
                      <span className="info-value">{receipt.payment.notes}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="receipt-footer">
                <div className="footer-stamp">
                  <p className="stamp-text">{receipt.officialStamp}</p>
                  <p className="footer-note">{receipt.notes}</p>
                </div>
                <div className="footer-signature">
                  <div className="signature-line"></div>
                  <p>Authorized Signature</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Notification Modal */}
      <NotificationModal
        isOpen={notification.isOpen}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onClose={hideNotification}
        autoClose={notification.autoClose}
        position={notification.position}
      />
    </div>
  );
};

export default PaymentReceiptModal;
