import documentGenerationService from '../services/documentGenerationService';

/**
 * Document Templates
 * 
 * This file contains template configurations for different document types.
 * Each template defines the structure and layout of the document.
 */

// ==================== LOAN AGREEMENT TEMPLATE ====================
export const loanAgreementTemplate = {
  fileName: 'Loan_Agreement_{{borrowerName}}',
  
  header: {
    background: true,
    title: 'TINDIGWA MICROFINANCE',
    subtitle: 'LOAN AGREEMENT CONTRACT'
  },
  
  sections: [
    {
      type: 'text',
      content: 'This Loan Agreement ("Agreement") is entered into on {{agreementDate}}, between Tindigwa Microfinance Limited ("Lender") and {{borrowerName}} ("Borrower"), collectively referred to as "the Parties".'
    },
    {
      title: '1. BORROWER INFORMATION',
      type: 'table',
      headers: ['Field', 'Details'],
      rows: [
        ['Full Name', '{{borrowerName}}'],
        ['Phone Number', '{{borrowerPhone}}'],
        ['Email Address', '{{borrowerEmail}}'],
        ['Client ID', '{{clientId}}']
      ]
    },
    {
      title: '2. GUARANTOR INFORMATION',
      type: 'table',
      headers: ['Field', 'Details'],
      rows: [
        ['Full Name', '{{guarantorName}}'],
        ['Phone Number', '{{guarantorPhone}}'],
        ['Relationship', '{{guarantorRelationship}}'],
        ['Address', '{{guarantorAddress}}']
      ]
    },
    {
      title: '3. LOAN TERMS AND CONDITIONS',
      type: 'table',
      headers: ['Term', 'Details'],
      rows: [
        ['Loan Product', '{{productName}}'],
        ['Principal Amount', '{{principalFormatted}}'],
        ['Interest Rate', '{{interestRate}}% per {{ratePer}}'],
        ['Interest Method', '{{interestMethod}}'],
        ['Total Interest', '{{totalInterestFormatted}}'],
        ['Loan Duration', '{{duration}} {{durationUnit}}'],
        ['Repayment Frequency', '{{repaymentFrequency}}'],
        ['Number of Installments', '{{numberOfInstallments}}'],
        ['Amount per Installment', '{{installmentAmountFormatted}}'],
        ['Daily Payment Amount', '{{dailyPaymentFormatted}} per day']
      ]
    },
    {
      title: '4. FEES AND CHARGES',
      type: 'table',
      headers: ['Fee Type', 'Amount', 'When Charged'],
      rows: [
        ['Registration Fee', '{{registrationFeeFormatted}}', 'Upfront (One-time for first-time clients)'],
        ['Processing Fee', '{{processingFeeFormatted}}', 'Upfront'],
        ['Penalty Rate', '{{penaltyRate}}% per day', 'On late payment after grace period'],
        ['Grace Period', '{{gracePeriod}} days', 'Days before penalties apply'],
        ['Total Upfront Fees', '{{totalUpfrontFeesFormatted}}', '-']
      ],
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 40 }
      }
    },
    {
      title: '5. PAYMENT SUMMARY',
      type: 'keyValue',
      keyWidth: 80,
      valueAlign: 'right',
      pairs: [
        { key: 'Principal Amount:', value: '{{principalFormatted}}' },
        { key: 'Total Interest:', value: '{{totalInterestFormatted}}' },
        { key: 'Total Amount to Repay:', value: '{{totalAmountFormatted}}' },
        { key: 'Processing Fee (Upfront):', value: '{{processingFeeFormatted}}' },
        { key: 'Registration Fee (Upfront):', value: '{{registrationFeeFormatted}}' },
        { key: 'Grand Total (Including Fees):', value: '{{grandTotalFormatted}}' }
      ]
    },
    {
      title: '6. TERMS AND CONDITIONS',
      type: 'list',
      numbered: true,
      items: [
        'The Borrower agrees to repay the loan amount plus accrued interest according to the agreed schedule.',
        'Late payments will attract a penalty fee as specified in the fees schedule.',
        'The Borrower may prepay the loan in full or in part at any time without penalty.',
        'The Guarantor agrees to guarantee the loan and undertakes to repay in case of default.',
        'The Lender reserves the right to take legal action in case of default.',
        'This agreement is governed by the laws of Uganda.',
        'Any disputes shall be resolved through arbitration before resorting to court proceedings.'
      ]
    },
    {
      title: '7. SIGNATURES',
      type: 'text',
      content: 'By signing below, all parties acknowledge that they have read, understood, and agree to be bound by the terms and conditions set forth in this Loan Agreement.'
    },
    {
      type: 'signature',
      signatures: [
        {
          label: 'Borrower Signature',
          nameKey: 'borrowerName',
          showDate: true
        },
        {
          label: 'Guarantor Signature',
          nameKey: 'guarantorName',
          showDate: true
        }
      ]
    },
    {
      title: 'SPOUSE CONSENT (If Married)',
      type: 'text',
      content: 'I, {{spouseName}}, spouse of {{borrowerName}}, hereby give my full and informed consent to this loan. I acknowledge that I have been clearly informed of all the terms and conditions governing this loan. I further understand and agree that the family assets listed within this agreement may be used as collateral for this loan, and I expressly permit their use for that purpose.',
      showIf: (data) => data.maritalStatus === 'MARRIED' && data.spouseName && data.spouseName !== 'N/A'
    },
    {
      type: 'signature',
      signatures: [
        {
          label: 'Spouse Signature',
          nameKey: 'spouseName',
          showDate: true
        }
      ],
      showIf: (data) => data.maritalStatus === 'MARRIED' && data.spouseName && data.spouseName !== 'N/A'
    },
    {
      title: 'LOCAL COUNCIL (LC1) VERIFICATION',
      type: 'text',
      content: 'I hereby confirm that {{borrowerName}} is a known resident of my area and is of good character. This verification is provided to support the loan application.'
    },
    {
      type: 'signature',
      signatures: [
        {
          label: 'LC1 Chairman/Leader',
          nameKey: 'lc1ChairmanName',
          showDate: true
        }
      ]
    },
    {
      type: 'signature',
      signatures: [
        {
          label: 'Loan Officer',
          nameKey: 'loanOfficerName',
          showDate: true
        }
      ]
    }
  ],
  
  footer: {
    text: 'Tindigwa Microfinance Ltd. | Contact: info@tindigwa.com | Page {{pageNumber}} of {{totalPages}}'
  }
};

// ==================== PAYMENT RECEIPT TEMPLATE ====================
export const paymentReceiptTemplate = {
  fileName: 'Payment_Receipt_{{receiptNumber}}',
  
  header: {
    background: true,
    title: 'TINDIGWA MICROFINANCE',
    subtitle: 'PAYMENT RECEIPT'
  },
  
  sections: [
    {
      type: 'keyValue',
      pairs: [
        { key: 'Receipt Number:', value: '{{receiptNumber}}' },
        { key: 'Receipt Date:', value: '{{receiptDate}}' },
        { key: 'Payment Method:', value: '{{paymentMethod}}' },
        { key: 'Transaction Reference:', value: '{{transactionRef}}' }
      ]
    },
    {
      title: 'CLIENT INFORMATION',
      type: 'table',
      rows: [
        ['Client Name', '{{clientName}}'],
        ['Client ID', '{{clientId}}'],
        ['Phone Number', '{{clientPhone}}'],
        ['Loan Number', '{{loanNumber}}']
      ]
    },
    {
      title: 'PAYMENT DETAILS',
      type: 'keyValue',
      keyWidth: 70,
      valueAlign: 'right',
      pairs: [
        { key: 'Loan Balance Before:', value: '{{balanceBeforeFormatted}}' },
        { key: 'Amount Paid:', value: '{{amountPaidFormatted}}' },
        { key: 'Principal Payment:', value: '{{principalPaymentFormatted}}' },
        { key: 'Interest Payment:', value: '{{interestPaymentFormatted}}' },
        { key: 'Penalty Payment:', value: '{{penaltyPaymentFormatted}}' },
        { key: 'Loan Balance After:', value: '{{balanceAfterFormatted}}' }
      ]
    },
    {
      type: 'text',
      content: 'This is an official receipt for the payment received. Please keep this for your records.'
    },
    {
      type: 'signature',
      signatures: [
        {
          label: 'Received By',
          nameKey: 'receivedBy',
          showDate: true
        },
        {
          label: 'Client Signature',
          nameKey: 'clientName',
          showDate: false
        }
      ]
    }
  ],
  
  footer: {
    text: 'Tindigwa Microfinance Ltd. | info@tindigwa.com | Page {{pageNumber}} of {{totalPages}}'
  }
};

// ==================== LOAN STATEMENT TEMPLATE ====================
export const loanStatementTemplate = {
  fileName: 'Loan_Statement_{{loanNumber}}',
  
  header: {
    background: true,
    title: 'TINDIGWA MICROFINANCE',
    subtitle: 'LOAN STATEMENT'
  },
  
  sections: [
    {
      type: 'keyValue',
      pairs: [
        { key: 'Statement Date:', value: '{{statementDate}}' },
        { key: 'Client Name:', value: '{{clientName}}' },
        { key: 'Loan Number:', value: '{{loanNumber}}' },
        { key: 'Loan Product:', value: '{{productName}}' }
      ]
    },
    {
      title: 'LOAN SUMMARY',
      type: 'keyValue',
      keyWidth: 70,
      valueAlign: 'right',
      pairs: [
        { key: 'Original Principal:', value: '{{originalPrincipalFormatted}}' },
        { key: 'Interest Rate:', value: '{{interestRate}}% per {{ratePer}}' },
        { key: 'Total Amount Due:', value: '{{totalDueFormatted}}' },
        { key: 'Amount Paid:', value: '{{amountPaidFormatted}}' },
        { key: 'Outstanding Balance:', value: '{{outstandingBalanceFormatted}}' },
        { key: 'Days Overdue:', value: '{{daysOverdue}}' },
        { key: 'Penalty Amount:', value: '{{penaltyAmountFormatted}}' }
      ]
    },
    {
      title: 'PAYMENT HISTORY',
      type: 'table',
      headers: ['Date', 'Description', 'Amount', 'Balance'],
      dataKey: 'paymentHistory',
      columns: ['date', 'description', 'amount', 'balance']
    },
    {
      type: 'text',
      content: 'For queries regarding this statement, please contact us at info@tindigwa.com or visit any of our branches.'
    }
  ],
  
  footer: {
    text: 'Tindigwa Microfinance Ltd. | Confidential | Page {{pageNumber}} of {{totalPages}}'
  }
};

// ==================== INVOICE TEMPLATE ====================
export const invoiceTemplate = {
  fileName: 'Invoice_{{invoiceNumber}}',
  
  header: {
    background: false,
    title: 'INVOICE',
    subtitle: 'Tindigwa Microfinance Limited'
  },
  
  sections: [
    {
      type: 'keyValue',
      pairs: [
        { key: 'Invoice Number:', value: '{{invoiceNumber}}' },
        { key: 'Invoice Date:', value: '{{invoiceDate}}' },
        { key: 'Due Date:', value: '{{dueDate}}' }
      ]
    },
    {
      title: 'BILL TO',
      type: 'text',
      content: '{{clientName}}\n{{clientAddress}}\n{{clientPhone}}\n{{clientEmail}}'
    },
    {
      title: 'ITEMS',
      type: 'table',
      headers: ['Description', 'Quantity', 'Unit Price', 'Amount'],
      dataKey: 'items',
      columns: ['description', 'quantity', 'unitPrice', 'amount']
    },
    {
      title: 'PAYMENT SUMMARY',
      type: 'keyValue',
      keyWidth: 70,
      valueAlign: 'right',
      pairs: [
        { key: 'Subtotal:', value: '{{subtotalFormatted}}' },
        { key: 'Tax ({{taxRate}}%):', value: '{{taxAmountFormatted}}' },
        { key: 'Total Amount Due:', value: '{{totalAmountFormatted}}' }
      ]
    },
    {
      type: 'text',
      content: 'Payment Terms: {{paymentTerms}}\nThank you for your business!'
    }
  ],
  
  footer: {
    text: 'Tindigwa Microfinance Ltd. | TIN: 123456789 | Page {{pageNumber}}'
  }
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Prepare data for loan agreement document
 */
export function prepareLoanAgreementData(formData, selectedProduct, metrics) {
  return {
    // Basic Info
    agreementDate: documentGenerationService.formatters.date(new Date()),
    loanNumber: `TDW-${Date.now()}`,
    
    // Borrower
    borrowerName: formData.borrowerName || 'N/A',
    borrowerPhone: formData.borrowerPhone || 'N/A',
    borrowerEmail: formData.borrowerEmail || 'N/A',
    clientId: formData.clientId || 'N/A',
    
    // Guarantor
    guarantorName: formData.guarantorName || 'N/A',
    guarantorPhone: formData.guarantorPhone || 'N/A',
    guarantorRelationship: formData.guarantorRelationship || 'N/A',
    guarantorAddress: formData.guarantorAddress || 'N/A',
    
    // Spouse (if married)
    spouseName: formData.spouseName || 'N/A',
    spousePhone: formData.spousePhone || 'N/A',
    
    // LC1 Chairman
    lc1ChairmanName: formData.lc1ChairmanName || '__________________________',
    lc1Area: formData.lc1Area || formData.village || 'N/A',
    
    // Loan Officer
    loanOfficerName: formData.loanOfficerName || 'Tindigwa Loan Officer',
    
    // Loan Details
    productName: selectedProduct?.productName || 'N/A',
    principal: metrics.principal,
    principalFormatted: documentGenerationService.formatters.currency(metrics.principal),
    interestRate: metrics.interestRate,
    ratePer: selectedProduct?.ratePer || 'month',
    interestMethod: getInterestMethodLabel(selectedProduct?.interestMethod),
    totalInterest: metrics.totalInterest,
    totalInterestFormatted: documentGenerationService.formatters.currency(metrics.totalInterest),
    duration: metrics.duration,
    durationUnit: metrics.durationUnit,
    repaymentFrequency: documentGenerationService.formatters.capitalize(selectedProduct?.defaultRepaymentFrequency),
    numberOfInstallments: metrics.numberOfInstallments,
    installmentAmount: metrics.installmentAmount,
    installmentAmountFormatted: documentGenerationService.formatters.currency(metrics.installmentAmount),
    dailyPayment: metrics.dailyPayment,
    dailyPaymentFormatted: documentGenerationService.formatters.currency(metrics.dailyPayment),
    
    // Fees
    registrationFee: metrics.registrationFee,
    registrationFeeFormatted: documentGenerationService.formatters.currency(metrics.registrationFee),
    processingFee: metrics.processingFee,
    processingFeeFormatted: documentGenerationService.formatters.currency(metrics.processingFee),
    penaltyRate: selectedProduct?.penaltyRate || 0,
    gracePeriod: selectedProduct?.defaultGracePeriodDays || 0,
    totalUpfrontFees: metrics.registrationFee + metrics.processingFee,
    totalUpfrontFeesFormatted: documentGenerationService.formatters.currency(metrics.registrationFee + metrics.processingFee),
    
    // Totals
    totalAmount: metrics.totalAmount,
    totalAmountFormatted: documentGenerationService.formatters.currency(metrics.totalAmount),
    grandTotal: metrics.totalAmount + metrics.registrationFee + metrics.processingFee,
    grandTotalFormatted: documentGenerationService.formatters.currency(metrics.totalAmount + metrics.registrationFee + metrics.processingFee),
    
    // Lender
    lenderName: 'Tindigwa Microfinance Ltd.'
  };
}

/**
 * Prepare data for payment receipt
 */
export function prepareReceiptData(paymentData) {
  return {
    receiptNumber: paymentData.receiptNumber || `RCP-${Date.now()}`,
    receiptDate: documentGenerationService.formatters.date(paymentData.date || new Date()),
    paymentMethod: paymentData.paymentMethod || 'Cash',
    transactionRef: paymentData.transactionRef || 'N/A',
    
    clientName: paymentData.clientName,
    clientId: paymentData.clientId,
    clientPhone: paymentData.clientPhone,
    loanNumber: paymentData.loanNumber,
    
    balanceBefore: paymentData.balanceBefore,
    balanceBeforeFormatted: documentGenerationService.formatters.currency(paymentData.balanceBefore),
    amountPaid: paymentData.amountPaid,
    amountPaidFormatted: documentGenerationService.formatters.currency(paymentData.amountPaid),
    principalPayment: paymentData.principalPayment,
    principalPaymentFormatted: documentGenerationService.formatters.currency(paymentData.principalPayment),
    interestPayment: paymentData.interestPayment,
    interestPaymentFormatted: documentGenerationService.formatters.currency(paymentData.interestPayment),
    penaltyPayment: paymentData.penaltyPayment || 0,
    penaltyPaymentFormatted: documentGenerationService.formatters.currency(paymentData.penaltyPayment || 0),
    balanceAfter: paymentData.balanceAfter,
    balanceAfterFormatted: documentGenerationService.formatters.currency(paymentData.balanceAfter),
    
    receivedBy: paymentData.receivedBy || 'System User'
  };
}

// Helper function
function getInterestMethodLabel(method) {
  const labels = {
    'reducing': 'Reducing Balance',
    'reducing_equal_installments': 'Reducing - Equal Installments',
    'flat': 'Flat Rate',
    'interest_only': 'Interest Only',
    'compound': 'Compound Interest'
  };
  return labels[method] || method || 'N/A';
}

export default {
  loanAgreementTemplate,
  paymentReceiptTemplate,
  loanStatementTemplate,
  invoiceTemplate,
  prepareLoanAgreementData,
  prepareReceiptData
};
