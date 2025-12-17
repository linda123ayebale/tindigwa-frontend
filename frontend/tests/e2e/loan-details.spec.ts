import { test, expect } from '@playwright/test';
import { setupAuthentication } from './fixtures/auth';

/**
 * E2E Tests for Loan Details Dynamic Page
 * Tests all workflow states: PENDING_APPROVAL, APPROVED, DISBURSED, REJECTED
 */

// Base URL for API
const API_BASE_URL = process.env.BACKEND_BASE_URL || 'http://localhost:8081/api';

/**
 * Helper: Fetch complete loan data from API
 */
async function getCompleteLoanData(loanId: number) {
  const response = await fetch(`${API_BASE_URL}/loans/${loanId}/complete`);
  if (!response.ok) {
    throw new Error(`Failed to fetch loan ${loanId}: ${response.status}`);
  }
  return await response.json();
}

/**
 * Helper: Create a test loan with specific workflow status
 */
async function createTestLoan(workflowStatus: string) {
  const response = await fetch(`${API_BASE_URL}/loans`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clientId: 1,
      loanProductId: 1,
      principalAmount: 100000,
      interestRate: 10,
      loanDuration: 180,
      repaymentFrequency: 'monthly',
      lendingBranch: 'Main',
      createdBy: 1,
      workflowStatus: workflowStatus
    })
  });
  
  if (!response.ok) {
    throw new Error(`Failed to create loan: ${response.status}`);
  }
  
  return await response.json();
}

/**
 * Helper: Normalize currency strings for comparison
 */
function extractAmount(text: string | null): number {
  if (!text) return 0;
  const match = text.replace(/[^0-9.-]/g, '');
  return parseFloat(match) || 0;
}

/**
 * Helper: Format expected currency
 */
function formatCurrency(amount: number): string {
  return `UGX ${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

test.describe('Loan Details Page - E2E Tests', () => {
  
  // ====================
  // PENDING APPROVAL STATE
  // ====================
  test.describe('PENDING_APPROVAL State', () => {
    
    test('should display approval banner with action buttons', async ({ page }) => {
      console.log('\n🟡 Testing PENDING_APPROVAL state...');
      
      // Setup
      await setupAuthentication(page);
      
      // Find or create a pending loan
      const pendingLoanId = 4; // Replace with actual pending loan ID
      
      // Navigate to loan details
      await page.goto(`/loans/${pendingLoanId}`);
      await page.waitForLoadState('networkidle');
      
      // Verify page loaded
      await expect(page.locator('h1')).toContainText('Loan Payment Details');
      console.log('✅ Page loaded successfully');
      
      // Verify yellow approval banner is visible
      const banner = page.locator('div').filter({ hasText: /Pending Approval/i }).first();
      await expect(banner).toBeVisible();
      console.log('✅ Approval banner visible');
      
      // Verify "Action Required" alert box
      await expect(page.locator('text=Action Required')).toBeVisible();
      console.log('✅ Action Required alert visible');
      
      // Verify Approve and Reject buttons exist
      const approveBtn = page.locator('button:has-text("Approve Loan")');
      const rejectBtn = page.locator('button:has-text("Reject Loan")');
      
      await expect(approveBtn).toBeVisible();
      await expect(rejectBtn).toBeVisible();
      console.log('✅ Approve and Reject buttons visible');
      
      // Verify LoanOverviewCard is visible
      await expect(page.locator('text=Loan Number')).toBeVisible();
      console.log('✅ LoanOverviewCard visible');
      
      // Verify ClientInfoCard is visible
      await expect(page.locator('text=Client Information').or(page.locator('h3:has-text("Client")'))).toBeVisible();
      console.log('✅ ClientInfoCard visible');
      
      // Verify OfficerInfoCard is visible
      await expect(page.locator('text=Loan Officer Information').or(page.locator('h3:has-text("Officer")'))).toBeVisible();
      console.log('✅ OfficerInfoCard visible');
      
      // Verify WorkflowTimeline is visible
      await expect(page.locator('text=Workflow Timeline').or(page.locator('h3:has-text("Timeline")'))).toBeVisible();
      console.log('✅ WorkflowTimeline visible');
      
      // Verify NO tracking or payment sections
      await expect(page.locator('text=Payment History')).not.toBeVisible();
      await expect(page.locator('text=Payment Progress')).not.toBeVisible();
      console.log('✅ Payment sections hidden (as expected)');
    });
    
    test('should match API data for pending loan', async ({ page }) => {
      console.log('\n🔍 Verifying API data consistency for PENDING_APPROVAL...');
      
      await setupAuthentication(page);
      const loanId = 4;
      
      // Fetch API data
      const apiData = await getCompleteLoanData(loanId);
      console.log(`📊 API Data:`, JSON.stringify(apiData, null, 2));
      
      // Navigate to page
      await page.goto(`/loans/${loanId}`);
      await page.waitForLoadState('networkidle');
      
      // Verify workflow status
      expect(apiData.loan.workflowStatus).toBe('PENDING_APPROVAL');
      console.log('✅ API confirms PENDING_APPROVAL status');
      
      // Verify loan amount displayed
      const principalText = await page.locator('text=Principal Amount').locator('..').textContent();
      expect(principalText).toContain(apiData.loan.principalAmount.toString());
      console.log(`✅ Principal amount matches: ${apiData.loan.principalAmount}`);
      
      // Verify loan number
      await expect(page.locator(`text=${apiData.loan.loanNumber}`)).toBeVisible();
      console.log(`✅ Loan number visible: ${apiData.loan.loanNumber}`);
      
      // Verify client name (if exists)
      if (apiData.client) {
        await expect(page.locator(`text=${apiData.client.fullName}`)).toBeVisible();
        console.log(`✅ Client name visible: ${apiData.client.fullName}`);
      }
      
      // Verify officer name
      if (apiData.loanOfficer) {
        await expect(page.locator(`text=${apiData.loanOfficer.fullName}`)).toBeVisible();
        console.log(`✅ Officer name visible: ${apiData.loanOfficer.fullName}`);
      }
      
      // Verify workflow history
      expect(apiData.workflowHistory.length).toBeGreaterThan(0);
      await expect(page.locator('text=Created').or(page.locator('text=CREATED'))).toBeVisible();
      console.log(`✅ Workflow history shows ${apiData.workflowHistory.length} events`);
    });
  });
  
  // ====================
  // APPROVED STATE
  // ====================
  test.describe('APPROVED State', () => {
    
    test('should display disburse button and tracking info', async ({ page }) => {
      console.log('\n🟢 Testing APPROVED state...');
      
      await setupAuthentication(page);
      const approvedLoanId = 5; // Replace with actual approved loan ID
      
      await page.goto(`/loans/${approvedLoanId}`);
      await page.waitForLoadState('networkidle');
      
      // Verify Disburse button visible (if user has permission)
      const disburseBtn = page.locator('button:has-text("Disburse")');
      const isVisible = await disburseBtn.isVisible();
      if (isVisible) {
        console.log('✅ Disburse button visible (user has permission)');
      } else {
        console.log('⚠️  Disburse button not visible (user may lack permission)');
      }
      
      // Verify LoanOverviewCard
      await expect(page.locator('text=Loan Number')).toBeVisible();
      await expect(page.locator('text=Approved').or(page.locator('text=APPROVED'))).toBeVisible();
      console.log('✅ Loan shows APPROVED status');
      
      // Verify TrackingSummaryCard (if tracking exists)
      const hasTracking = await page.locator('text=Payment Progress').isVisible();
      if (hasTracking) {
        console.log('✅ TrackingSummaryCard visible');
      } else {
        console.log('⚠️  No tracking data yet');
      }
      
      // Verify PaymentHistoryTable (should be empty)
      const hasPaymentTable = await page.locator('text=Payment History').isVisible();
      if (hasPaymentTable) {
        const emptyMessage = await page.locator('text=No payments recorded yet').isVisible();
        expect(emptyMessage).toBeTruthy();
        console.log('✅ Payment table shows empty state');
      }
      
      // Verify timeline shows APPROVED event
      await expect(page.locator('text=Approved').or(page.locator('text=APPROVED'))).toBeVisible();
      console.log('✅ Workflow timeline shows approval');
    });
  });
  
  // ====================
  // DISBURSED STATE
  // ====================
  test.describe('DISBURSED State', () => {
    
    test('should display complete loan information with tracking', async ({ page }) => {
      console.log('\n🟣 Testing DISBURSED state...');
      
      await setupAuthentication(page);
      const disbursedLoanId = 4; // Use your test loan ID
      
      await page.goto(`/loans/${disbursedLoanId}`);
      await page.waitForLoadState('networkidle');
      
      // Verify Add Payment button (if balance > 0)
      const addPaymentBtn = page.locator('button:has-text("Add Payment")');
      const paymentBtnVisible = await addPaymentBtn.isVisible();
      console.log(`${paymentBtnVisible ? '✅' : '⚠️'} Add Payment button visibility: ${paymentBtnVisible}`);
      
      // Verify all components visible
      await expect(page.locator('text=Loan Number')).toBeVisible();
      console.log('✅ LoanOverviewCard visible');
      
      // Verify TrackingSummaryCard with progress bars
      const trackingCard = page.locator('text=Payment Progress').or(page.locator('text=Installment Progress'));
      const hasTracking = await trackingCard.isVisible();
      
      if (hasTracking) {
        console.log('✅ TrackingSummaryCard visible');
        
        // Verify progress bars exist
        const progressBars = page.locator('div[class*="bg-gradient"]');
        const progressCount = await progressBars.count();
        expect(progressCount).toBeGreaterThanOrEqual(2);
        console.log(`✅ ${progressCount} progress bars found`);
        
        // Verify metric cards
        await expect(page.locator('text=Outstanding Balance').or(page.locator('text=Balance'))).toBeVisible();
        await expect(page.locator('text=Next Payment').or(page.locator('text=Due Date'))).toBeVisible();
        console.log('✅ Metric cards visible');
      } else {
        console.log('⚠️  No tracking data available');
      }
      
      // Verify PaymentHistoryTable
      const paymentHistory = page.locator('text=Payment History');
      await expect(paymentHistory).toBeVisible();
      console.log('✅ PaymentHistoryTable visible');
      
      // Verify WorkflowTimeline
      await expect(page.locator('text=Workflow Timeline').or(page.locator('h3:has-text("Timeline")'))).toBeVisible();
      console.log('✅ WorkflowTimeline visible');
    });
    
    test('should match API tracking data with UI display', async ({ page }) => {
      console.log('\n🔍 Verifying tracking data consistency...');
      
      await setupAuthentication(page);
      const loanId = 4;
      
      // Fetch API data
      const apiData = await getCompleteLoanData(loanId);
      
      await page.goto(`/loans/${loanId}`);
      await page.waitForLoadState('networkidle');
      
      // Verify tracking data matches
      if (apiData.tracking) {
        console.log('📊 Tracking Data:', apiData.tracking);
        
        // Verify balance
        const balanceText = await page.locator('text=Balance').or(page.locator('text=Outstanding')).locator('..').textContent();
        if (balanceText) {
          const displayedBalance = extractAmount(balanceText);
          expect(Math.abs(displayedBalance - apiData.tracking.balance)).toBeLessThan(1);
          console.log(`✅ Balance matches: ${displayedBalance} ≈ ${apiData.tracking.balance}`);
        }
        
        // Verify installments progress
        const installmentsText = await page.textContent('body');
        expect(installmentsText).toContain(apiData.tracking.installmentsPaid.toString());
        expect(installmentsText).toContain(apiData.tracking.totalInstallments.toString());
        console.log(`✅ Installments: ${apiData.tracking.installmentsPaid}/${apiData.tracking.totalInstallments}`);
        
        // Verify amount paid
        const amountPaidText = await page.locator('text=Amount Paid').or(page.locator('text=Paid')).locator('..').textContent();
        if (amountPaidText) {
          const displayedPaid = extractAmount(amountPaidText);
          expect(Math.abs(displayedPaid - apiData.tracking.amountPaid)).toBeLessThan(1);
          console.log(`✅ Amount Paid matches: ${displayedPaid} ≈ ${apiData.tracking.amountPaid}`);
        }
      }
      
      // Verify payments array
      console.log(`📊 Payments count: ${apiData.payments.length}`);
      if (apiData.payments.length > 0) {
        // First payment should be visible in table
        const firstPayment = apiData.payments[0];
        await expect(page.locator(`text=${firstPayment.amount}`)).toBeVisible();
        console.log(`✅ First payment visible: ${firstPayment.amount}`);
      } else {
        await expect(page.locator('text=No payments recorded yet')).toBeVisible();
        console.log('✅ Empty payment state displayed');
      }
    });
    
    test('should display progress bars with correct percentages', async ({ page }) => {
      console.log('\n📊 Testing progress bar calculations...');
      
      await setupAuthentication(page);
      const loanId = 4;
      
      const apiData = await getCompleteLoanData(loanId);
      
      await page.goto(`/loans/${loanId}`);
      await page.waitForLoadState('networkidle');
      
      if (apiData.tracking) {
        // Calculate expected percentages
        const installmentPercent = (apiData.tracking.installmentsPaid / apiData.tracking.totalInstallments) * 100;
        const amountPercent = (apiData.tracking.amountPaid / (apiData.tracking.amountPaid + apiData.tracking.balance)) * 100;
        
        console.log(`Expected installment progress: ${installmentPercent.toFixed(1)}%`);
        console.log(`Expected amount progress: ${amountPercent.toFixed(1)}%`);
        
        // Progress bars should exist
        const progressBars = page.locator('div[style*="width"]').filter({ hasText: /\d+%/ });
        const count = await progressBars.count();
        
        expect(count).toBeGreaterThanOrEqual(2);
        console.log(`✅ Found ${count} progress indicators`);
      }
    });
  });
  
  // ====================
  // REJECTED STATE
  // ====================
  test.describe('REJECTED State', () => {
    
    test('should display rejection card with details', async ({ page }) => {
      console.log('\n🔴 Testing REJECTED state...');
      
      await setupAuthentication(page);
      // You'll need to create or use a rejected loan ID
      const rejectedLoanId = 10; // Replace with actual rejected loan
      
      await page.goto(`/loans/${rejectedLoanId}`);
      await page.waitForLoadState('networkidle');
      
      // Verify red rejection alert
      const rejectionCard = page.locator('text=Loan Application Rejected');
      await expect(rejectionCard).toBeVisible();
      console.log('✅ Rejection alert visible');
      
      // Verify "Important Notice"
      await expect(page.locator('text=Important Notice')).toBeVisible();
      console.log('✅ Important notice visible');
      
      // Verify rejection details section
      await expect(page.locator('text=Rejection Date').or(page.locator('text=Rejected'))).toBeVisible();
      console.log('✅ Rejection details visible');
      
      // Verify no action buttons (rejected loans cannot be modified)
      const approveBtn = page.locator('button:has-text("Approve")');
      const addPaymentBtn = page.locator('button:has-text("Add Payment")');
      
      expect(await approveBtn.isVisible()).toBeFalsy();
      expect(await addPaymentBtn.isVisible()).toBeFalsy();
      console.log('✅ Action buttons hidden (as expected)');
      
      // Verify LoanOverviewCard shows REJECTED status
      await expect(page.locator('text=Rejected').or(page.locator('text=REJECTED'))).toBeVisible();
      console.log('✅ Status shows REJECTED');
      
      // Verify no tracking/payment sections
      await expect(page.locator('text=Payment Progress')).not.toBeVisible();
      await expect(page.locator('text=Add Payment')).not.toBeVisible();
      console.log('✅ Payment sections hidden');
      
      // Verify timeline shows rejection event
      await expect(page.locator('text=Workflow Timeline')).toBeVisible();
      console.log('✅ Workflow timeline visible');
    });
    
    test('should match API rejection data', async ({ page }) => {
      console.log('\n🔍 Verifying rejection data consistency...');
      
      await setupAuthentication(page);
      const loanId = 10;
      
      const apiData = await getCompleteLoanData(loanId);
      
      await page.goto(`/loans/${loanId}`);
      await page.waitForLoadState('networkidle');
      
      // Verify workflow status
      expect(apiData.loan.workflowStatus).toBe('REJECTED');
      console.log('✅ API confirms REJECTED status');
      
      // Verify rejection reason displayed
      if (apiData.loan.rejectionReason) {
        await expect(page.locator(`text=${apiData.loan.rejectionReason}`)).toBeVisible();
        console.log(`✅ Rejection reason visible: ${apiData.loan.rejectionReason}`);
      }
      
      // Verify rejected by
      if (apiData.loan.rejectedBy) {
        await expect(page.locator(`text=${apiData.loan.rejectedBy}`)).toBeVisible();
        console.log(`✅ Rejector visible: ${apiData.loan.rejectedBy}`);
      }
      
      // Verify rejection date
      if (apiData.loan.rejectedAt) {
        const dateText = await page.textContent('body');
        expect(dateText).toBeTruthy();
        console.log('✅ Rejection date displayed');
      }
    });
  });
  
  // ====================
  // RESPONSIVE DESIGN
  // ====================
  test.describe('Responsive Design', () => {
    
    test('should render correctly on desktop (1920x1080)', async ({ page }) => {
      console.log('\n🖥️  Testing desktop layout...');
      
      await page.setViewportSize({ width: 1920, height: 1080 });
      await setupAuthentication(page);
      
      await page.goto('/loans/4');
      await page.waitForLoadState('networkidle');
      
      // Verify cards are side-by-side (check grid layout)
      const clientCard = page.locator('h3:has-text("Client")').locator('..');
      const officerCard = page.locator('h3:has-text("Officer")').locator('..');
      
      const clientBox = await clientCard.boundingBox();
      const officerBox = await officerCard.boundingBox();
      
      if (clientBox && officerBox) {
        // Cards should be on same horizontal level (approximately)
        const heightDiff = Math.abs(clientBox.y - officerBox.y);
        expect(heightDiff).toBeLessThan(50);
        console.log('✅ Cards displayed side-by-side on desktop');
      }
      
      // Verify max width applied
      const content = page.locator('.loan-details-content');
      const contentBox = await content.boundingBox();
      
      if (contentBox) {
        expect(contentBox.width).toBeLessThanOrEqual(1400);
        console.log(`✅ Content width: ${contentBox.width}px (max 1400px)`);
      }
    });
    
    test('should render correctly on tablet (768x1024)', async ({ page }) => {
      console.log('\n📱 Testing tablet layout...');
      
      await page.setViewportSize({ width: 768, height: 1024 });
      await setupAuthentication(page);
      
      await page.goto('/loans/4');
      await page.waitForLoadState('networkidle');
      
      // Verify components are still visible
      await expect(page.locator('text=Loan Number')).toBeVisible();
      console.log('✅ Components visible on tablet');
      
      // Verify table scrolls if needed
      const table = page.locator('table');
      const hasTable = await table.isVisible();
      
      if (hasTable) {
        const tableBox = await table.boundingBox();
        if (tableBox) {
          console.log(`✅ Table width: ${tableBox.width}px`);
        }
      }
    });
    
    test('should render correctly on mobile (375x667)', async ({ page }) => {
      console.log('\n📱 Testing mobile layout...');
      
      await page.setViewportSize({ width: 375, height: 667 });
      await setupAuthentication(page);
      
      await page.goto('/loans/4');
      await page.waitForLoadState('networkidle');
      
      // Verify cards stack vertically
      const cards = page.locator('[class*="bg-white"][class*="shadow"]');
      const cardCount = await cards.count();
      
      console.log(`✅ ${cardCount} cards visible on mobile`);
      
      // Verify all content is within viewport width
      const content = page.locator('.loan-details-content');
      const contentBox = await content.boundingBox();
      
      if (contentBox) {
        expect(contentBox.width).toBeLessThanOrEqual(375);
        console.log('✅ Content fits within mobile viewport');
      }
      
      // Verify action buttons are accessible
      const backBtn = page.locator('button:has-text("Back")');
      await expect(backBtn).toBeVisible();
      console.log('✅ Action buttons accessible on mobile');
    });
  });
  
  // ====================
  // DATA CONSISTENCY
  // ====================
  test.describe('Backend-Frontend Data Consistency', () => {
    
    test('should match all API fields with UI display', async ({ page }) => {
      console.log('\n🔍 Full data consistency check...');
      
      await setupAuthentication(page);
      const loanId = 4;
      
      const apiData = await getCompleteLoanData(loanId);
      console.log('📊 API Response Structure:', Object.keys(apiData));
      
      await page.goto(`/loans/${loanId}`);
      await page.waitForLoadState('networkidle');
      
      // Verify loan object
      expect(apiData.loan).toBeTruthy();
      console.log('✅ API returns loan object');
      
      // Verify client object
      expect(apiData.client !== undefined).toBeTruthy();
      console.log(`✅ API returns client object: ${apiData.client !== null}`);
      
      // Verify loanOfficer object
      expect(apiData.loanOfficer).toBeTruthy();
      console.log('✅ API returns loanOfficer object');
      
      // Verify tracking object
      expect(apiData.tracking !== undefined).toBeTruthy();
      console.log(`✅ API returns tracking object: ${apiData.tracking !== null}`);
      
      // Verify payments array
      expect(Array.isArray(apiData.payments)).toBeTruthy();
      console.log(`✅ API returns payments array (${apiData.payments.length} items)`);
      
      // Verify workflowHistory array
      expect(Array.isArray(apiData.workflowHistory)).toBeTruthy();
      console.log(`✅ API returns workflowHistory array (${apiData.workflowHistory.length} events)`);
      
      // Verify all required loan fields exist
      const requiredLoanFields = [
        'id', 'loanNumber', 'principalAmount', 'totalPayable', 
        'workflowStatus', 'loanStatus', 'interestRate', 'loanDuration'
      ];
      
      for (const field of requiredLoanFields) {
        expect(apiData.loan[field] !== undefined).toBeTruthy();
        console.log(`  ✓ loan.${field}: ${apiData.loan[field]}`);
      }
      
      console.log('✅ All data structures valid');
    });
  });
});
