/**
 * Common selectors for loan table testing
 */

export const table = {
  container: 'table',
  thead: 'table thead',
  tbody: 'table tbody',
  rows: 'table tbody tr',
  headerRow: 'table thead tr',
  headers: 'table thead th',
  
  // Get specific cell by row and column index (0-based)
  cell: (rowIndex: number, colIndex: number) => 
    `table tbody tr:nth-of-type(${rowIndex + 1}) td:nth-of-type(${colIndex + 1})`,
  
  // Get specific header by index (0-based)
  header: (colIndex: number) => 
    `table thead th:nth-of-type(${colIndex + 1})`,
};

/**
 * Expected column headers for loan tables
 * Note: Some tables have 7 columns, some have 8 (rejected has extra column)
 */
export const standardColumns = [
  'Loan Number',
  'Client',
  'Product',
  'Amount',
  'Status',
  'Date',
  'Actions',
];

export const rejectedColumns = [
  'Loan Number',
  'Client',
  'Product',
  'Amount',
  'Status',
  'Rejection Reason',
  'Date',
  'Actions',
];

export const pagination = {
  info: '.pagination-info',
  container: '.pagination',
  nextButton: 'button:has-text("Next")',
  previousButton: 'button:has-text("Previous")',
  pageButton: (pageNum: number) => `.pagination button:has-text("${pageNum}")`,
};

export const emptyState = {
  container: '.empty-state-pending, .empty-state',
  message: '.empty-state-pending p, .empty-state p',
};

export const loading = {
  container: '.loading-container',
  spinner: '.loading-spinner',
};
