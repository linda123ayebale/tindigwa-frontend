import { test, expect } from '@playwright/test';
import { getLoans, normalizeMoney, normalizeStatus, extractAmount, type LoanResponse } from './utils/api';
import { table, pagination } from './utils/selectors';
import { expectTableColumns, getRenderedRows, waitForTableLoad, isEmptyState } from './utils/assertions';
import { setupAuthentication } from './fixtures/auth';

/**
 * Test case definition for each loan list page
 */
type PageCase = {
  name: string;
  route: string;          // Frontend route
  apiPath: string;        // Backend API path
  expectedColumns: number; // Number of columns in table
  itemsPerPage: number;   // Pagination size
  columnMap: {            // Map of DTO fields to column indices
    loanNumber: number;
    clientName: number;
    productName?: number;
    amount: number;
    workflowStatus: number;  // Workflow status column
    loanStatus: number;      // Loan status column
    date: number;
    rejectionReason?: number;
  };
};

/**
 * All loan list pages to test
 */
const testCases: PageCase[] = [
  {
    name: 'Pending Approvals',
    route: '/loans/pending-approvals',
    apiPath: 'loans/pending-approval',
    expectedColumns: 8, // Loan Number, Client, Product, Amount, Workflow Status, Loan Status, Date, Actions
    itemsPerPage: 5,
    columnMap: {
      loanNumber: 0,       // Loan Number
      clientName: 1,       // Client
      productName: 2,      // Product
      amount: 3,           // Amount
      workflowStatus: 4,   // Workflow Status
      loanStatus: 5,       // Loan Status
      date: 6,             // Date
    },
  },
  {
    name: 'Rejected Loans',
    route: '/loans/rejected',
    apiPath: 'loans/rejected',
    expectedColumns: 9, // Loan Number, Client, Product, Amount, Workflow Status, Loan Status, Rejection Reason, Date, Actions
    itemsPerPage: 5,
    columnMap: {
      loanNumber: 0,        // Loan Number
      clientName: 1,        // Client
      productName: 2,       // Product
      amount: 3,            // Amount
      workflowStatus: 4,    // Workflow Status
      loanStatus: 5,        // Loan Status
      rejectionReason: 6,   // Rejection Reason
      date: 7,              // Date
    },
  },
  {
    name: 'All Loans',
    route: '/loans',
    apiPath: 'loans',
    expectedColumns: 9, // Client, Loan Number, Amount, Released, Maturity, Workflow Status, Loan Status, Balance, Actions
    itemsPerPage: 5,
    columnMap: {
      clientName: 0,      // Client
      loanNumber: 1,      // Loan Number
      amount: 2,          // Amount
      // Skip: Released (col 3), Maturity (col 4)
      workflowStatus: 5,  // Workflow Status
      loanStatus: 6,      // Loan Status
      // Skip: Balance (col 7)
      date: 3,            // Released (we'll use this as the date field)
    },
  },
];

/**
 * Main test suite for each loan page
 */
for (const testCase of testCases) {
  test.describe(`${testCase.name} - E2E Test`, () => {
    test(`should render table matching API data from ${testCase.apiPath}`, async ({ page }) => {
      console.log(`\n📋 Testing: ${testCase.name}`);
      console.log(`🌐 Route: ${testCase.route}`);
      console.log(`🔌 API: ${testCase.apiPath}`);

      // Step 1: Set up authentication
      await setupAuthentication(page);

      // Step 2: Fetch data from API
      const apiData: LoanResponse[] = await getLoans(testCase.apiPath);
      console.log(`📊 API returned ${apiData.length} loans`);

      // Step 3: Navigate to the page
      console.log(`🚀 Navigating to ${testCase.route}...`);
      await page.goto(testCase.route);

      // Step 4: Wait for page to load
      await waitForTableLoad(page);

      // Step 5: Handle empty state
      if (apiData.length === 0) {
        console.log('⚠️  No data - checking for empty state');
        const isEmpty = await isEmptyState(page);
        expect(isEmpty, 'Empty state should be visible when no data').toBeTruthy();
        console.log('✅ Empty state displayed correctly');
        return;
      }

      // Step 6: Verify table is visible
      await expect(page.locator(table.container)).toBeVisible();
      console.log('✅ Table is visible');

      // Step 7: Verify column headers
      await expectTableColumns(page, testCase.expectedColumns);
      console.log(`✅ Table has ${testCase.expectedColumns} columns`);

      // Step 8: Verify pagination - first page should show up to itemsPerPage rows
      const expectedFirstPageCount = Math.min(testCase.itemsPerPage, apiData.length);
      const renderedCount = await getRenderedRows(page);
      
      expect(
        renderedCount,
        `First page should render ${expectedFirstPageCount} rows`
      ).toBe(expectedFirstPageCount);
      console.log(`✅ Rendered ${renderedCount} rows on first page`);

      // Step 9: Compare each visible row against API data
      console.log(`🔍 Comparing ${expectedFirstPageCount} rows against API data...`);
      
      for (let rowIndex = 0; rowIndex < expectedFirstPageCount; rowIndex++) {
        const dto = apiData[rowIndex];
        const colMap = testCase.columnMap;
        console.log(`\n  Row ${rowIndex + 1}: ${dto.loanNumber}`);

        // Loan Number
        const loanNumber = await page.locator(table.cell(rowIndex, colMap.loanNumber)).textContent();
        expect(
          (loanNumber || '').trim(),
          `Row ${rowIndex}: Loan number should match`
        ).toContain(dto.loanNumber);
        console.log(`    ✓ Loan Number: ${loanNumber?.trim()}`);

        // Client Name
        const clientName = await page.locator(table.cell(rowIndex, colMap.clientName)).textContent();
        expect(
          (clientName || '').trim().toLowerCase(),
          `Row ${rowIndex}: Client name should match`
        ).toContain((dto.clientName || '').toLowerCase());
        console.log(`    ✓ Client: ${clientName?.trim()}`);

        // Product Name (optional for some tables)
        if (colMap.productName !== undefined) {
          const productName = await page.locator(table.cell(rowIndex, colMap.productName)).textContent();
          expect(
            (productName || '').trim().toLowerCase(),
            `Row ${rowIndex}: Product name should match`
          ).toContain((dto.loanProductName || '').toLowerCase());
          console.log(`    ✓ Product: ${productName?.trim()}`);
        }

        // Amount
        const amountText = await page.locator(table.cell(rowIndex, colMap.amount)).textContent();
        const displayedAmount = extractAmount(amountText);
        const apiAmount = dto.principalAmount;
        
        // Allow small rounding differences
        const amountDiff = Math.abs(displayedAmount - apiAmount);
        expect(
          amountDiff,
          `Row ${rowIndex}: Amount should match (diff: ${amountDiff})`
        ).toBeLessThan(1);
        console.log(`    ✓ Amount: ${amountText?.trim()} ≈ ${apiAmount}`);

        // Workflow Status
        const workflowStatusText = await page.locator(table.cell(rowIndex, colMap.workflowStatus)).textContent();
        const normalizedDisplayWorkflow = normalizeStatus(workflowStatusText);
        const normalizedApiWorkflow = normalizeStatus(dto.workflowStatus);
        
        expect(
          normalizedDisplayWorkflow.includes(normalizedApiWorkflow) || normalizedApiWorkflow.includes(normalizedDisplayWorkflow),
          `Row ${rowIndex}: Workflow status should match (displayed: "${workflowStatusText?.trim()}", API: "${dto.workflowStatus}")`
        ).toBeTruthy();
        console.log(`    ✓ Workflow Status: ${workflowStatusText?.trim()}`);
        
        // Loan Status
        const loanStatusText = await page.locator(table.cell(rowIndex, colMap.loanStatus)).textContent();
        const normalizedDisplayLoan = normalizeStatus(loanStatusText);
        const normalizedApiLoan = normalizeStatus(dto.loanStatus);
        
        expect(
          normalizedDisplayLoan.includes(normalizedApiLoan) || normalizedApiLoan.includes(normalizedDisplayLoan),
          `Row ${rowIndex}: Loan status should match (displayed: "${loanStatusText?.trim()}", API: "${dto.loanStatus}")`
        ).toBeTruthy();
        console.log(`    ✓ Loan Status: ${loanStatusText?.trim()}`);

        // Rejection Reason (only for rejected loans table)
        if (colMap.rejectionReason !== undefined) {
          const rejectionReason = await page.locator(table.cell(rowIndex, colMap.rejectionReason)).textContent();
          if (dto.rejectionReason) {
            expect(
              (rejectionReason || '').trim().length,
              `Row ${rowIndex}: Rejection reason should be present`
            ).toBeGreaterThan(0);
            console.log(`    ✓ Rejection Reason: ${rejectionReason?.trim()}`);
          }
        }

        // Date
        const dateText = await page.locator(table.cell(rowIndex, colMap.date)).textContent();
        
        // Just verify date is present if API has a date
        if (dto.releaseDate || dto.createdAt) {
          expect(
            (dateText || '').trim().length,
            `Row ${rowIndex}: Date should be present`
          ).toBeGreaterThan(0);
          console.log(`    ✓ Date: ${dateText?.trim()}`);
        }
      }

      console.log('\n✅ All rows match API data!');

      // Step 10: Test pagination if more than one page
      if (apiData.length > testCase.itemsPerPage) {
        console.log(`\n🔄 Testing pagination (${apiData.length} total items)...`);
        
        // Click Next button
        await page.locator(pagination.nextButton).click();
        console.log('  Clicked Next button');
        
        // Wait a moment for page to update
        await page.waitForTimeout(500);
        
        // Verify second page row count
        const secondPageExpectedCount = Math.min(
          testCase.itemsPerPage,
          apiData.length - testCase.itemsPerPage
        );
        const secondPageCount = await getRenderedRows(page);
        
        expect(
          secondPageCount,
          `Second page should show ${secondPageExpectedCount} rows`
        ).toBe(secondPageExpectedCount);
        console.log(`✅ Second page shows ${secondPageCount} rows`);
        
        // Verify pagination info updated
        const paginationInfo = await page.locator(pagination.info).textContent();
        expect(paginationInfo).toContain(`${testCase.itemsPerPage + 1}`);
        console.log(`✅ Pagination info updated: ${paginationInfo}`);
      }

      console.log(`\n🎉 ${testCase.name} test completed successfully!`);
    });
  });
}

/**
 * Comprehensive test that validates data consistency across all pages
 */
test.describe('Cross-page consistency', () => {
  test('approved loans should appear in All Loans table', async ({ page }) => {
    // Fetch from both endpoints
  const approvedLoans = await getLoans('loans/approved');
  const allLoans = await getLoans('loans');
    
    console.log(`📊 Approved: ${approvedLoans.length}, All: ${allLoans.length}`);
    
    // All approved loans should be in the all loans list
    expect(allLoans.length, 'All loans should include approved loans').toBeGreaterThanOrEqual(approvedLoans.length);
    
    // Check that loan numbers match
    const approvedNumbers = new Set(approvedLoans.map(l => l.loanNumber));
    const allNumbers = new Set(allLoans.map(l => l.loanNumber));
    
    for (const loanNumber of approvedNumbers) {
      expect(allNumbers.has(loanNumber), `Approved loan ${loanNumber} should be in all loans`).toBeTruthy();
    }
    
    console.log('✅ Data consistency verified across endpoints');
  });
});
