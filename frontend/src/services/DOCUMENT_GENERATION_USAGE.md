# Document Generation Service - Usage Guide

## Overview

The reusable Document Generation Service provides a template-based approach to generating PDF and Word documents. This allows you to create any type of document (loan agreements, receipts, invoices, reports, etc.) without writing separate generation logic for each.

## Architecture

```
┌─────────────────────────────────────────┐
│   documentGenerationService.js          │
│   (Core reusable service)               │
│   - PDF generation                      │
│   - DOCX generation                     │
│   - Template rendering                  │
└─────────────────────────────────────────┘
               ▲
               │ uses
               │
┌─────────────────────────────────────────┐
│   documentTemplates.js                  │
│   (Template definitions)                │
│   - loanAgreementTemplate               │
│   - paymentReceiptTemplate              │
│   - invoiceTemplate                     │
│   - etc.                                │
└─────────────────────────────────────────┘
```

## Quick Start

### 1. For Existing Templates (Loan Agreement, Receipt, etc.)

```javascript
import loanAgreementService from './services/loanAgreementService';

// Generate PDF
await loanAgreementService.generatePDF(formData, selectedProduct);

// Generate DOCX
await loanAgreementService.generateDOCX(formData, selectedProduct);
```

### 2. For New Document Types

#### Step 1: Create a Template

```javascript
// In documentTemplates.js or create a new file

export const myCustomTemplate = {
  fileName: 'My_Document_{{clientName}}',
  
  header: {
    background: true,  // Optional: adds colored header
    title: 'MY COMPANY NAME',
    subtitle: 'Document Title'
  },
  
  sections: [
    // Different section types...
  ],
  
  footer: {
    text: 'Company Name | Contact | Page {{pageNumber}} of {{totalPages}}'
  }
};
```

#### Step 2: Use the Service

```javascript
import documentGenerationService from './services/documentGenerationService';
import { myCustomTemplate } from './templates/documentTemplates';

// Prepare your data
const data = {
  clientName: 'John Doe',
  amount: 100000,
  // ... other fields
};

// Generate PDF
await documentGenerationService.generatePDF(myCustomTemplate, data);

// Generate DOCX
await documentGenerationService.generateDOCX(myCustomTemplate, data);
```

## Template Structure

### Section Types

#### 1. **Text Section**
Simple paragraph text with placeholder support.

```javascript
{
  type: 'text',
  content: 'This is a contract between {{companyName}} and {{clientName}} dated {{date}}.'
}
```

#### 2. **Table Section**
Displays data in tabular format.

```javascript
{
  title: 'CLIENT INFORMATION',
  type: 'table',
  headers: ['Field', 'Value'],  // Optional
  rows: [
    ['Name', '{{clientName}}'],
    ['Phone', '{{clientPhone}}'],
    ['Email', '{{clientEmail}}']
  ]
}
```

For dynamic data:
```javascript
{
  title: 'PAYMENT HISTORY',
  type: 'table',
  headers: ['Date', 'Amount', 'Balance'],
  dataKey: 'payments',  // Refers to data.payments array
  columns: ['date', 'amount', 'balance']
}
```

#### 3. **Key-Value Section**
Displays data as key-value pairs (like a summary).

```javascript
{
  title: 'SUMMARY',
  type: 'keyValue',
  keyWidth: 80,  // Optional: width of key column
  valueAlign: 'right',  // Optional: 'left', 'right', 'center'
  pairs: [
    { key: 'Total Amount:', value: '{{totalAmount}}' },
    { key: 'Amount Paid:', value: '{{amountPaid}}' },
    { key: 'Balance:', value: '{{balance}}' }
  ]
}
```

#### 4. **List Section**
Displays items as bullet points or numbered list.

```javascript
{
  title: 'TERMS AND CONDITIONS',
  type: 'list',
  numbered: true,  // false for bullet points
  indent: 5,  // Optional: indentation in mm
  items: [
    'First term',
    'Second term',
    'Third term'
  ]
}
```

For dynamic lists:
```javascript
{
  type: 'list',
  numbered: false,
  dataKey: 'terms',  // Refers to data.terms array
  itemTemplate: '{{text}}'  // Template for each item
}
```

#### 5. **Signature Section**
Adds signature lines with names and dates.

```javascript
{
  title: 'SIGNATURES',
  type: 'signature',
  signatures: [
    {
      label: 'Client Signature',
      nameKey: 'clientName',  // Optional: displays name below line
      showDate: true,  // Optional: displays date
      dateKey: 'signedDate'  // Optional: specific date field
    },
    {
      label: 'Company Representative',
      nameKey: 'representativeName',
      showDate: true
    }
  ]
}
```

## Data Placeholders

Use `{{placeholderName}}` syntax in templates. Supports nested properties:

```javascript
// Template
'Client: {{client.fullName}}, Phone: {{client.contact.phone}}'

// Data
{
  client: {
    fullName: 'John Doe',
    contact: {
      phone: '0700123456'
    }
  }
}
```

## Built-in Formatters

```javascript
import documentGenerationService from './services/documentGenerationService';

// Currency formatting
const formatted = documentGenerationService.formatters.currency(100000);
// Output: "USh 100,000"

// Date formatting
const formattedDate = documentGenerationService.formatters.date(new Date());
// Output: "10/12/2025" (DD/MM/YYYY)

// Text transformations
documentGenerationService.formatters.uppercase('hello');  // "HELLO"
documentGenerationService.formatters.lowercase('HELLO');  // "hello"
documentGenerationService.formatters.capitalize('hello'); // "Hello"
```

## Complete Example: Payment Receipt

```javascript
// 1. Define template
export const receiptTemplate = {
  fileName: 'Receipt_{{receiptNumber}}',
  
  header: {
    background: true,
    title: 'TINDIGWA MICROFINANCE',
    subtitle: 'PAYMENT RECEIPT'
  },
  
  sections: [
    {
      type: 'keyValue',
      pairs: [
        { key: 'Receipt #:', value: '{{receiptNumber}}' },
        { key: 'Date:', value: '{{receiptDate}}' },
        { key: 'Method:', value: '{{paymentMethod}}' }
      ]
    },
    {
      title: 'PAYMENT DETAILS',
      type: 'table',
      rows: [
        ['Client Name', '{{clientName}}'],
        ['Loan Number', '{{loanNumber}}'],
        ['Amount Paid', '{{amountFormatted}}'],
        ['Balance', '{{balanceFormatted}}']
      ]
    },
    {
      type: 'signature',
      signatures: [
        {
          label: 'Received By',
          nameKey: 'receivedBy',
          showDate: true
        }
      ]
    }
  ],
  
  footer: {
    text: 'Thank you for your payment | Page {{pageNumber}}'
  }
};

// 2. Prepare data
function prepareReceiptData(paymentInfo) {
  return {
    receiptNumber: paymentInfo.id,
    receiptDate: documentGenerationService.formatters.date(new Date()),
    paymentMethod: paymentInfo.method,
    clientName: paymentInfo.client.name,
    loanNumber: paymentInfo.loan.number,
    amountFormatted: documentGenerationService.formatters.currency(paymentInfo.amount),
    balanceFormatted: documentGenerationService.formatters.currency(paymentInfo.balance),
    receivedBy: paymentInfo.receivedBy || 'System'
  };
}

// 3. Generate document
const handleGenerateReceipt = async () => {
  const data = prepareReceiptData(paymentInfo);
  
  // PDF
  await documentGenerationService.generatePDF(receiptTemplate, data);
  
  // Or DOCX
  await documentGenerationService.generateDOCX(receiptTemplate, data);
};
```

## Advanced: Custom Styling

```javascript
const options = {
  margin: 25,  // Custom margin (default: 20mm)
  colors: {
    primary: [255, 0, 0],  // Red header
    text: [0, 0, 0]
  }
};

await documentGenerationService.generatePDF(template, data, options);
```

## Tips & Best Practices

1. **Pre-format your data**: Format currency, dates, and complex fields before passing to the service
2. **Use helper functions**: Create `prepareXData()` functions for each document type
3. **Keep templates separate**: Store templates in `documentTemplates.js`
4. **Test with sample data**: Create mock data to test templates during development
5. **Reuse sections**: Common sections (signatures, footers) can be reused across templates

## Migration from Old Code

If you have existing PDF generation code:

**Before:**
```javascript
// Custom jsPDF code for each document type
const doc = new jsPDF();
doc.text('Title', 10, 10);
// ... 100+ lines of positioning logic
```

**After:**
```javascript
// Define template once
const template = { /* template structure */ };

// Use anywhere
await documentGenerationService.generatePDF(template, data);
```

## Common Use Cases

- ✅ Loan Agreements
- ✅ Payment Receipts  
- ✅ Loan Statements
- ✅ Invoices
- ✅ Financial Reports
- ✅ Client Contracts
- ✅ Disbursement Vouchers
- ✅ Collection Schedules
- ✅ And more...

All using the same reusable service!
