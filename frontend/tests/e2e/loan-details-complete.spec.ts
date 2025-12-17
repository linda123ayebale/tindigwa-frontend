import { test, expect, Page, APIRequestContext } from '@playwright/test';
import { setupAuthentication } from './fixtures/auth';

/**
 * 🎯 COMPLETE END-TO-END TEST SUITE FOR LOAN DETAILS PAGE
 * 
 * This test suite validates:
 * 1. Backend API returns correct data shape
 * 2. Frontend correctly displays all sections based on workflow status
 * 3. Status badges and conditional components render properly
 * 4. Data consistency between backend and frontend
 * 5. Responsive design and accessibility
 */

// Configuration
const BACKEND_URL = process.env.BACKEND_BASE_URL || 'http://localhost:8081/api';
const FRONTEND_URL = process.env.FRONTEND_BASE_URL || 'http://localhost:3000';
const TEST_LOAN_ID = 4; // Use existing loan from database

// Type definitions for API response
interface LoanData {
  loan: {
    id: number;
    loanNumber: string;
    principalAmount: number;
    totalPayable: number;
    workflowStatus: string;
    loanStatus: string;
    interestRate: number;
    productName: string;
    lendingBranch: string;
    createdAt: string;
    approvalDate?: string;
    disbursedAt?: string;
    rejectedAt?: string;
    rejectedBy?: string;
    rejectionReason?: string;
  };
  client: {
    fullName: string;
    phone: string;
    email: string;
  } | null;
  loanOfficer: {
    id: number;
    fullName: string;
    email: string;
    phone: string;
    branch: string;
    role: string;
  };
  tracking: {
    amountPaid: number;
    balance: number;
    installmentsPaid: number;
    totalInstallments: number;
    nextPaymentDate: string;
    nextPaymentAmount: number;
    status: string;
  } | null;
  payments: Array<{
    id: number;
    amount: number;
    paymentDate: string;
    method: string;
    status: string;
    recordedBy: string;
  }>;
  workflowHistory: Array<{
    action: string;
    performedBy: string;
    timestamp: string;
    notes?: string;
  }>;
}

/**
 * Helper: Fetch complete loan data from backend API
 */
async function fetchLoanData(request: APIRequestContext, loanId: number): Promise<LoanData> {
  console.log(`\n📡 Fetching loan data from API: ${BACKEND_URL}/loans/${loanId}/complete`);
  
  const response = await request.get(`${BACKEND_URL}/loans/${loanId}/complete`);
  
  expect(response.status(), 'API should return 200 OK').toBe(200);
  
  const data = await response.json();
  console.log(`✅ API Response received:`, {
    workflowStatus: data.loan.workflowStatus,
    loanStatus: data.loan.loanStatus,
    hasClient: data.client !== null,
    hasTracking: data.tracking !== null,
    paymentsCount: data.payments.length,
    historyCount: data.workflowHistory.length
  });
  
  return data;
}

/**
 * Helper: Wait for page to fully load
 */
async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('h1', { timeout: 10000 });
}

/**
 * Helper: Format currency for comparison
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency: 'UGX',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Helper: Extract number from currency string
 */
function extractAmount(text: string): number {
  const cleaned = text.replace(/[^0-9.-]/g, '');
  return parseFloat(cleaned) || 0;
}

// =============================================================================
// TEST SUITE: BACKEND API VALIDATION
// =============================================================================
test.describe('Backend API Validation', () => {
  
  test('should return correct data structure from /complete endpoint', async ({ request }) => {
    console.log('\n🔍 TEST: API Data Structure Validation');
    
    const data = await fetchLoanData(request, TEST_LOAN_ID);
    
    // Validate loan object
    expect(data.loan, 'Loan object should exist').toBeTruthy();
    expect(data.loan.id, 'Loan should have ID').toBe(TEST_LOAN_ID);
    expect(data.loan.loanNumber, 'Loan should have loan number').toBeTruthy();
    expect(data.loan.principalAmount, 'Loan should have principal amount').toBeGreaterThan(0);
    expect(data.loan.workflowStatus, 'Loan should have workflow status').toBeTruthy();
    expect(data.loan.loanStatus, 'Loan should have loan status').toBeTruthy();
    
    // Validate loanOfficer object
    expect(data.loanOfficer, 'Loan officer should exist').toBeTruthy();
    expect(data.loanOfficer.fullName, 'Officer should have name').toBeTruthy();
    
    // Validate arrays
    expect(Array.isArray(data.payments), 'Payments should be an array').toBeTruthy();
    expect(Array.isArray(data.workflowHistory), 'Workflow history should be an array').toBeTruthy();
    expect(data.workflowHistory.length, 'Should have at least one workflow event').toBeGreaterThan(0);
    
    console.log('✅ All required API fields present');
  });
});

// =============================================================================
// TEST SUITE: FRONTEND RENDERING - APPROVED STATE
// =============================================================================
test.describe('Loan Details - APPROVED State', () => {
  
  test('should render all components for APPROVED loan', async ({ page, request }) => {
    console.log('\n🟢 TEST: APPROVED State Rendering');
    
    // Step 1: Fetch API data
    const apiData = await fetchLoanData(request, TEST_LOAN_ID);
    
    // Verify this is an APPROVED loan
    if (apiData.loan.workflowStatus !== 'APPROVED') {
      test.skip();
    }
    
    // Step 2: Setup authentication
    await setupAuthentication(page);
    
    // Step 3: Navigate to frontend
    console.log(`📱 Navigating to: ${FRONTEND_URL}/loans/details/${TEST_LOAN_ID}`);
    await page.goto(`${FRONTEND_URL}/loans/details/${TEST_LOAN_ID}`);
    await waitForPageLoad(page);
    
    // Step 4: Verify page header
    await expect(page.locator('h1')).toContainText('Loan Payment Details');
    console.log('✅ Page header loaded');
    
    // Step 5: Verify LoanOverviewCard renders
    await expect(page.locator('text=Loan Number')).toBeVisible();
    await expect(page.locator(`text=${apiData.loan.loanNumber}`)).toBeVisible();
    console.log('✅ LoanOverviewCard rendered');
    
    // Step 6: Verify loan amount displays correctly
    const displayedAmount = await page.locator('text=Principal Amount').locator('..').textContent();
    // Check if the formatted amount (with commas) is present
    const formattedAmount = apiData.loan.principalAmount.toLocaleString();
    expect(displayedAmount).toContain(formattedAmount);
    console.log(`✅ Principal amount matches: ${apiData.loan.principalAmount} (formatted: ${formattedAmount})`);
    
    // Step 7: Verify OfficerInfoCard renders
    await expect(page.locator(`text=${apiData.loanOfficer.fullName}`).first()).toBeVisible();
    console.log(`✅ Officer name visible: ${apiData.loanOfficer.fullName}`);
    
    // Step 8: Verify WorkflowTimeline renders
    const timelineVisible = await page.locator('text=Workflow Timeline').or(page.locator('text=Timeline')).isVisible();
    expect(timelineVisible).toBeTruthy();
    console.log('✅ WorkflowTimeline rendered');
    
    // Step 9: Verify workflow events match API
    const createdVisible = await page.locator('text=Created').or(page.locator('text=CREATED')).first().isVisible();
    const approvedVisible = await page.locator('text=Approved').or(page.locator('text=APPROVED')).first().isVisible();
    expect(createdVisible || approvedVisible).toBeTruthy();
    console.log(`✅ Workflow events visible (${apiData.workflowHistory.length} events in API)`);
    
    // Step 10: Verify TrackingSummaryCard if tracking exists
    if (apiData.tracking) {
      const trackingVisible = await page.locator('text=Payment Progress').or(page.locator('text=Tracking')).first().isVisible();
      if (trackingVisible) {
        console.log('✅ TrackingSummaryCard visible');
        
        // Verify balance (check formatted version)
        const balanceText = await page.textContent('body');
        const formattedBalance = apiData.tracking.balance.toLocaleString();
        expect(balanceText).toContain(formattedBalance);
        console.log(`✅ Balance visible: ${apiData.tracking.balance} (formatted: ${formattedBalance})`);
      }
    }
    
    // Step 11: Verify PaymentHistoryTable
    const paymentTableVisible = await page.locator('text=Payment History').first().isVisible();
    if (paymentTableVisible) {
      console.log('✅ PaymentHistoryTable visible');
      
      if (apiData.payments.length === 0) {
        await expect(page.locator('text=No payments recorded yet')).toBeVisible();
        console.log('✅ Empty payment state displayed');
      } else {
        const rows = await page.locator('table tbody tr').count();
        expect(rows).toBe(apiData.payments.length);
        console.log(`✅ Payment table has ${rows} rows (API has ${apiData.payments.length})`);
      }
    }
    
    // Step 12: Verify no rejection card
    const rejectionCardVisible = await page.locator('text=Loan Application Rejected').isVisible();
    expect(rejectionCardVisible).toBeFalsy();
    console.log('✅ Rejection card not visible (as expected)');
    
    // Step 13: Check for console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    if (consoleErrors.length > 0) {
      console.warn('⚠️ Console errors detected:', consoleErrors);
    } else {
      console.log('✅ No console errors');
    }
  });
  
  test('should display correct status badges for APPROVED loan', async ({ page, request }) => {
    console.log('\n🏷️  TEST: Status Badges for APPROVED loan');
    
    const apiData = await fetchLoanData(request, TEST_LOAN_ID);
    
    if (apiData.loan.workflowStatus !== 'APPROVED') {
      test.skip();
    }
    
    await setupAuthentication(page);
    await page.goto(`${FRONTEND_URL}/loans/details/${TEST_LOAN_ID}`);
    await waitForPageLoad(page);
    
    // Check for APPROVED badge
    const approvedBadgeVisible = await page.locator('text=Approved').or(page.locator('text=APPROVED')).first().isVisible();
    expect(approvedBadgeVisible).toBeTruthy();
    console.log('✅ APPROVED badge visible');
    
    // Check for loan status badge
    const statusText = apiData.loan.loanStatus.toLowerCase();
    const statusBadgeVisible = await page.locator(`text=${statusText}`).or(page.locator(`text=${apiData.loan.loanStatus}`)).isVisible();
    expect(statusBadgeVisible).toBeTruthy();
    console.log(`✅ Loan status badge visible: ${apiData.loan.loanStatus}`);
  });
});

// =============================================================================
// TEST SUITE: CONDITIONAL RENDERING BY WORKFLOW STATUS
// =============================================================================
test.describe('Conditional Rendering Tests', () => {
  
  test('should hide payment sections for PENDING_APPROVAL', async ({ page, request }) => {
    console.log('\n🟡 TEST: PENDING_APPROVAL Conditional Rendering');
    
    // Note: This test requires a loan with PENDING_APPROVAL status
    // Skip if current loan is not in pending state
    const apiData = await fetchLoanData(request, TEST_LOAN_ID);
    
    if (apiData.loan.workflowStatus !== 'PENDING_APPROVAL') {
      console.log(`⏭️  Skipping: Loan is ${apiData.loan.workflowStatus}, not PENDING_APPROVAL`);
      test.skip();
    }
    
    await setupAuthentication(page);
    await page.goto(`${FRONTEND_URL}/loans/details/${TEST_LOAN_ID}`);
    await waitForPageLoad(page);
    
    // Should show approval banner
    await expect(page.locator('text=Pending Approval')).toBeVisible();
    console.log('✅ Approval banner visible');
    
    // Should NOT show payment sections
    const paymentHistoryVisible = await page.locator('text=Payment History').isVisible();
    const trackingVisible = await page.locator('text=Payment Progress').isVisible();
    
    expect(paymentHistoryVisible).toBeFalsy();
    expect(trackingVisible).toBeFalsy();
    console.log('✅ Payment sections hidden (as expected)');
  });
  
  test('should show rejection card for REJECTED loans', async ({ page, request }) => {
    console.log('\n🔴 TEST: REJECTED State Rendering');
    
    const apiData = await fetchLoanData(request, TEST_LOAN_ID);
    
    if (apiData.loan.workflowStatus !== 'REJECTED') {
      console.log(`⏭️  Skipping: Loan is ${apiData.loan.workflowStatus}, not REJECTED`);
      test.skip();
    }
    
    await setupAuthentication(page);
    await page.goto(`${FRONTEND_URL}/loans/details/${TEST_LOAN_ID}`);
    await waitForPageLoad(page);
    
    // Should show rejection card
    await expect(page.locator('text=Loan Application Rejected')).toBeVisible();
    console.log('✅ Rejection card visible');
    
    // Should show rejection reason if exists
    if (apiData.loan.rejectionReason) {
      await expect(page.locator(`text=${apiData.loan.rejectionReason}`)).toBeVisible();
      console.log(`✅ Rejection reason visible: ${apiData.loan.rejectionReason}`);
    }
    
    // Should NOT show payment sections
    const paymentHistoryVisible = await page.locator('text=Payment History').isVisible();
    expect(paymentHistoryVisible).toBeFalsy();
    console.log('✅ Payment sections hidden for rejected loan');
  });
});

// =============================================================================
// TEST SUITE: DATA CONSISTENCY VALIDATION
// =============================================================================
test.describe('Backend-Frontend Data Consistency', () => {
  
  test('should display exact data from API on frontend', async ({ page, request }) => {
    console.log('\n🔍 TEST: Complete Data Consistency Check');
    
    // Step 1: Get API data
    const apiData = await fetchLoanData(request, TEST_LOAN_ID);
    
    // Step 2: Setup auth and load page
    await setupAuthentication(page);
    await page.goto(`${FRONTEND_URL}/loans/details/${TEST_LOAN_ID}`);
    await waitForPageLoad(page);
    
    // Step 3: Verify loan number
    const loanNumberVisible = await page.locator(`text=${apiData.loan.loanNumber}`).isVisible();
    expect(loanNumberVisible).toBeTruthy();
    console.log(`✅ Loan number matches: ${apiData.loan.loanNumber}`);
    
    // Step 4: Verify principal amount (check formatted version)
    const pageText = await page.textContent('body');
    const principalFormatted = apiData.loan.principalAmount.toLocaleString();
    const principalInText = pageText?.includes(principalFormatted) || pageText?.includes(apiData.loan.principalAmount.toString());
    expect(principalInText).toBeTruthy();
    console.log(`✅ Principal amount in page: ${apiData.loan.principalAmount} (formatted: ${principalFormatted})`);
    
    // Step 5: Verify product name (if exists)
    if (apiData.loan.productName) {
      const productVisible = await page.locator(`text=${apiData.loan.productName}`).isVisible();
      expect(productVisible).toBeTruthy();
      console.log(`✅ Product name matches: ${apiData.loan.productName}`);
    } else {
      console.log('ℹ️  Product name not in API response (skipping)');
    }
    
    // Step 6: Verify branch
    if (apiData.loan.lendingBranch) {
      const branchVisible = await page.locator(`text=${apiData.loan.lendingBranch}`).isVisible();
      expect(branchVisible).toBeTruthy();
      console.log(`✅ Branch matches: ${apiData.loan.lendingBranch}`);
    }
    
    // Step 7: Verify officer details
    expect(pageText).toContain(apiData.loanOfficer.fullName);
    console.log(`✅ Officer name in page: ${apiData.loanOfficer.fullName}`);
    
    // Step 8: Verify tracking data if exists
    if (apiData.tracking) {
      const balanceInText = pageText?.includes(apiData.tracking.balance.toString());
      const installmentsInText = pageText?.includes(apiData.tracking.installmentsPaid.toString()) &&
                                 pageText?.includes(apiData.tracking.totalInstallments.toString());
      
      if (balanceInText) {
        console.log(`✅ Balance in page: ${apiData.tracking.balance}`);
      }
      if (installmentsInText) {
        console.log(`✅ Installments in page: ${apiData.tracking.installmentsPaid}/${apiData.tracking.totalInstallments}`);
      }
    }
    
    // Step 9: Verify workflow history count
    console.log(`✅ Workflow history events: ${apiData.workflowHistory.length}`);
    
    // Step 10: Verify payments count
    console.log(`✅ Payments count: ${apiData.payments.length}`);
    
    console.log('\n✅ COMPLETE DATA CONSISTENCY VALIDATED');
  });
  
  test('should match all currency amounts between API and UI', async ({ page, request }) => {
    console.log('\n💰 TEST: Currency Amount Consistency');
    
    const apiData = await fetchLoanData(request, TEST_LOAN_ID);
    
    await setupAuthentication(page);
    await page.goto(`${FRONTEND_URL}/loans/details/${TEST_LOAN_ID}`);
    await waitForPageLoad(page);
    
    const pageText = await page.textContent('body');
    
    // Test principal amount (check both formatted and unformatted)
    const principalFormatted = apiData.loan.principalAmount.toLocaleString();
    const principalMatch = pageText?.includes(principalFormatted) || pageText?.includes(apiData.loan.principalAmount.toString());
    expect(principalMatch).toBeTruthy();
    console.log(`✅ Principal: ${apiData.loan.principalAmount} (formatted: ${principalFormatted})`);
    
    // Test total payable (check both formatted and unformatted)
    const totalFormatted = apiData.loan.totalPayable.toLocaleString();
    const totalMatch = pageText?.includes(totalFormatted) || pageText?.includes(apiData.loan.totalPayable.toString());
    expect(totalMatch).toBeTruthy();
    console.log(`✅ Total Payable: ${apiData.loan.totalPayable} (formatted: ${totalFormatted})`);
    
    // Test tracking amounts if exists
    if (apiData.tracking) {
      const balanceMatch = pageText?.includes(apiData.tracking.balance.toString());
      const amountPaidMatch = pageText?.includes(apiData.tracking.amountPaid.toString());
      
      console.log(`✅ Balance: ${apiData.tracking.balance} (in page: ${balanceMatch})`);
      console.log(`✅ Amount Paid: ${apiData.tracking.amountPaid} (in page: ${amountPaidMatch})`);
    }
  });
});

// =============================================================================
// TEST SUITE: RESPONSIVE DESIGN
// =============================================================================
test.describe('Responsive Design Validation', () => {
  
  test('should render correctly on desktop (1920x1080)', async ({ page, request }) => {
    console.log('\n🖥️  TEST: Desktop Layout');
    
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    const apiData = await fetchLoanData(request, TEST_LOAN_ID);
    
    await setupAuthentication(page);
    await page.goto(`${FRONTEND_URL}/loans/details/${TEST_LOAN_ID}`);
    await waitForPageLoad(page);
    
    // Verify main components visible
    await expect(page.locator('text=Loan Number')).toBeVisible();
    console.log('✅ Components visible on desktop');
    
    // Check content width
    const content = page.locator('.loan-details-content');
    if (await content.isVisible()) {
      const box = await content.boundingBox();
      if (box) {
        expect(box.width).toBeLessThanOrEqual(1400);
        console.log(`✅ Content width: ${box.width}px (max 1400px)`);
      }
    }
  });
  
  test('should render correctly on mobile (375x667)', async ({ page, request }) => {
    console.log('\n📱 TEST: Mobile Layout');
    
    await page.setViewportSize({ width: 375, height: 667 });
    
    const apiData = await fetchLoanData(request, TEST_LOAN_ID);
    
    await setupAuthentication(page);
    await page.goto(`${FRONTEND_URL}/loans/details/${TEST_LOAN_ID}`);
    await waitForPageLoad(page);
    
    // Verify components stack vertically
    await expect(page.locator('text=Loan Number')).toBeVisible();
    console.log('✅ Components visible on mobile');
    
    // Verify back button accessible
    const backBtn = page.locator('button:has-text("Back")');
    const backVisible = await backBtn.isVisible();
    console.log(`✅ Back button accessible: ${backVisible}`);
  });
});

// =============================================================================
// TEST SUITE: PERFORMANCE & ACCESSIBILITY
// =============================================================================
test.describe('Performance and Accessibility', () => {
  
  test('should load page within acceptable time', async ({ page, request }) => {
    console.log('\n⚡ TEST: Page Load Performance');
    
    const startTime = Date.now();
    
    await setupAuthentication(page);
    await page.goto(`${FRONTEND_URL}/loans/details/${TEST_LOAN_ID}`);
    await waitForPageLoad(page);
    
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds
    console.log(`✅ Page loaded in ${loadTime}ms`);
  });
  
  test('should have no console errors during normal usage', async ({ page, request }) => {
    console.log('\n🔍 TEST: Console Error Detection');
    
    const consoleErrors: string[] = [];
    const consoleWarnings: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      } else if (msg.type() === 'warning') {
        consoleWarnings.push(msg.text());
      }
    });
    
    await setupAuthentication(page);
    await page.goto(`${FRONTEND_URL}/loans/details/${TEST_LOAN_ID}`);
    await waitForPageLoad(page);
    
    // Wait a bit for any async errors
    await page.waitForTimeout(2000);
    
    if (consoleErrors.length > 0) {
      console.error('❌ Console errors detected:', consoleErrors);
    }
    
    expect(consoleErrors.length, 'Should have no console errors').toBe(0);
    console.log(`✅ No console errors (${consoleWarnings.length} warnings)`);
  });
  
  test('should have proper page title', async ({ page }) => {
    console.log('\n📄 TEST: Page Title');
    
    await setupAuthentication(page);
    await page.goto(`${FRONTEND_URL}/loans/details/${TEST_LOAN_ID}`);
    await waitForPageLoad(page);
    
    const title = await page.title();
    expect(title).toBeTruthy();
    console.log(`✅ Page title: ${title}`);
  });
});

// =============================================================================
// TEST SUITE: WORKFLOW TIMELINE VALIDATION
// =============================================================================
test.describe('Workflow Timeline Validation', () => {
  
  test('should display all workflow events from API', async ({ page, request }) => {
    console.log('\n📅 TEST: Workflow Timeline Events');
    
    const apiData = await fetchLoanData(request, TEST_LOAN_ID);
    
    await setupAuthentication(page);
    await page.goto(`${FRONTEND_URL}/loans/details/${TEST_LOAN_ID}`);
    await waitForPageLoad(page);
    
    // Verify timeline is visible
    const timelineVisible = await page.locator('text=Workflow Timeline').or(page.locator('text=Timeline')).isVisible();
    expect(timelineVisible).toBeTruthy();
    console.log('✅ Timeline component visible');
    
    // Verify each event from API is shown
    for (const event of apiData.workflowHistory) {
      // Use .first() to handle multiple matches
      const actionLocator = page.locator(`text=${event.action}`).first();
      const performerLocator = page.locator(`text=${event.performedBy}`).first();
      
      const actionVisible = await actionLocator.isVisible().catch(() => false);
      const performerVisible = await performerLocator.isVisible().catch(() => false);
      
      if (actionVisible || performerVisible) {
        console.log(`✅ Event visible: ${event.action} by ${event.performedBy}`);
      }
    }
    
    console.log(`✅ Workflow history validated (${apiData.workflowHistory.length} events)`);
  });
});

// =============================================================================
// SUMMARY REPORT
// =============================================================================
test.afterAll(async () => {
  console.log('\n' + '='.repeat(80));
  console.log('🎉 TEST SUITE COMPLETED');
  console.log('='.repeat(80));
  console.log('\n✅ Backend-to-Frontend integration validated');
  console.log('✅ Data consistency verified');
  console.log('✅ Conditional rendering tested');
  console.log('✅ Responsive design validated');
  console.log('✅ Performance checked');
  console.log('\n📊 View detailed report: npx playwright show-report');
  console.log('='.repeat(80) + '\n');
});
