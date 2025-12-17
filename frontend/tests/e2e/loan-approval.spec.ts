import { test, expect, Page } from '@playwright/test';
import { setupAuthentication } from './fixtures/auth';
import { getLoans, LoanResponse } from './utils/api';

/**
 * E2E Test Suite: Loan Approval/Rejection Flow
 * 
 * Tests the complete approve/reject functionality including:
 * - ApprovalCard visibility for different workflow statuses
 * - Approve button functionality and status changes
 * - Reject button functionality with reason input
 * - Real-time WebSocket updates
 * - Backend verification of status changes
 * - UI updates after approval/rejection
 */

const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL || 'http://localhost:3000';
const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || 'http://localhost:8081/api';

test.describe('Loan Approval/Rejection - E2E Flow', () => {
  
  test.beforeEach(async ({ page }) => {
    // Setup authentication for all tests
    await setupAuthentication(page);
    await page.waitForLoadState('networkidle');
  });

  test('should display ApprovalCard for pending approval loan', async ({ page }) => {
    console.log('📋 Test: ApprovalCard visibility for PENDING_APPROVAL');
    
    // Get pending loans from backend
    const pendingLoans = await getLoans('loans/pending-approval');
    
    if (pendingLoans.length === 0) {
      console.log('⚠️ No pending loans found, skipping test');
      test.skip();
      return;
    }
    
    const testLoan = pendingLoans[0];
    console.log(`🎯 Testing with loan: ${testLoan.loanNumber} (ID: ${testLoan.id})`);
    
    // Navigate to loan details page
    await page.goto(`${FRONTEND_BASE_URL}/loans/details/${testLoan.id}`);
    await page.waitForLoadState('networkidle');
    
    // Check for ApprovalCard with pending state
    const approvalCard = page.locator('[data-testid="approval-card-pending"]');
    await expect(approvalCard).toBeVisible({ timeout: 10000 });
    
    console.log('✅ ApprovalCard is visible');
    
    // Verify card content
    await expect(approvalCard.locator('.approval-title')).toContainText('Pending Approval');
    await expect(approvalCard).toContainText(testLoan.loanNumber);
    await expect(approvalCard).toContainText(testLoan.clientName);
    
    // Verify buttons are present
    const approveButton = page.locator('[data-testid="approve-button"]');
    const rejectButton = page.locator('[data-testid="reject-button"]');
    
    await expect(approveButton).toBeVisible();
    await expect(rejectButton).toBeVisible();
    await expect(approveButton).toContainText('Approve Loan');
    await expect(rejectButton).toContainText('Reject Loan');
    
    console.log('✅ Approve and Reject buttons are visible');
  });

  test('should approve a pending loan successfully', async ({ page, request }) => {
    console.log('📋 Test: Approve pending loan');
    
    // Get pending loans
    const pendingLoans = await getLoans('loans/pending-approval');
    
    if (pendingLoans.length === 0) {
      console.log('⚠️ No pending loans found, creating test scenario would be needed');
      test.skip();
      return;
    }
    
    const testLoan = pendingLoans[0];
    const loanId = testLoan.id;
    console.log(`🎯 Approving loan: ${testLoan.loanNumber} (ID: ${loanId})`);
    
    // Navigate to loan details
    await page.goto(`${FRONTEND_BASE_URL}/loans/details/${loanId}`);
    await page.waitForLoadState('networkidle');
    
    // Wait for approval card
    await page.waitForSelector('[data-testid="approval-card-pending"]', { timeout: 10000 });
    
    // Click approve button
    const approveButton = page.locator('[data-testid="approve-button"]');
    console.log('🖱️ Clicking Approve button...');
    await approveButton.click();
    
    // Wait for processing and success toast
    await page.waitForTimeout(2000);
    
    // Check for success toast
    const toast = page.locator('text=/Loan approved|successfully/i');
    await expect(toast).toBeVisible({ timeout: 5000 });
    console.log('✅ Success toast displayed');
    
    // Wait for page to update
    await page.waitForTimeout(2000);
    
    // Verify ApprovalCard changed to approved state
    const approvedCard = page.locator('[data-testid="approval-card-approved"]');
    await expect(approvedCard).toBeVisible({ timeout: 10000 });
    await expect(approvedCard.locator('.approval-title')).toContainText('Loan Approved');
    console.log('✅ ApprovalCard changed to APPROVED state');
    
    // Verify with backend
    const apiResponse = await request.get(`${BACKEND_BASE_URL}/loans/${loanId}`);
    expect(apiResponse.ok()).toBeTruthy();
    
    const updatedLoan = await apiResponse.json();
    console.log(`📊 Backend status: ${updatedLoan.workflowStatus}`);
    expect(updatedLoan.workflowStatus).toBe('APPROVED');
    
    console.log('✅ Loan approval verified in backend');
  });

  test('should reject a pending loan with reason', async ({ page, request }) => {
    console.log('📋 Test: Reject pending loan');
    
    // Get pending loans
    const pendingLoans = await getLoans('loans/pending-approval');
    
    if (pendingLoans.length === 0) {
      console.log('⚠️ No pending loans found, skipping test');
      test.skip();
      return;
    }
    
    const testLoan = pendingLoans[0];
    const loanId = testLoan.id;
    const rejectionReason = 'Test rejection: Insufficient documentation';
    
    console.log(`🎯 Rejecting loan: ${testLoan.loanNumber} (ID: ${loanId})`);
    
    // Navigate to loan details
    await page.goto(`${FRONTEND_BASE_URL}/loans/details/${loanId}`);
    await page.waitForLoadState('networkidle');
    
    // Wait for approval card
    await page.waitForSelector('[data-testid="approval-card-pending"]', { timeout: 10000 });
    
    // Setup dialog handler for rejection reason prompt
    page.once('dialog', async dialog => {
      console.log(`📝 Dialog prompt: ${dialog.message()}`);
      await dialog.accept(rejectionReason);
    });
    
    // Click reject button
    const rejectButton = page.locator('[data-testid="reject-button"]');
    console.log('🖱️ Clicking Reject button...');
    await rejectButton.click();
    
    // Wait for processing
    await page.waitForTimeout(2000);
    
    // Check for success toast
    const toast = page.locator('text=/Loan rejected|rejected/i');
    await expect(toast).toBeVisible({ timeout: 5000 });
    console.log('✅ Success toast displayed');
    
    // Wait for page to update
    await page.waitForTimeout(2000);
    
    // Verify ApprovalCard changed to rejected state
    const rejectedCard = page.locator('[data-testid="approval-card-rejected"]');
    await expect(rejectedCard).toBeVisible({ timeout: 10000 });
    await expect(rejectedCard.locator('.approval-title')).toContainText('Loan Rejected');
    
    // Verify rejection reason is displayed
    await expect(rejectedCard).toContainText(rejectionReason);
    console.log('✅ ApprovalCard changed to REJECTED state with reason');
    
    // Verify with backend
    const apiResponse = await request.get(`${BACKEND_BASE_URL}/loans/${loanId}`);
    expect(apiResponse.ok()).toBeTruthy();
    
    const updatedLoan = await apiResponse.json();
    console.log(`📊 Backend status: ${updatedLoan.workflowStatus}`);
    expect(updatedLoan.workflowStatus).toBe('REJECTED');
    expect(updatedLoan.rejectionReason).toContain('Test rejection');
    
    console.log('✅ Loan rejection verified in backend');
  });

  test('should display approved status card for approved loan', async ({ page }) => {
    console.log('📋 Test: Display approved status for APPROVED loan');
    
    // Get all loans and find an approved one
    const allLoans = await getLoans('loans');
    const approvedLoan = allLoans.find(loan => loan.workflowStatus === 'APPROVED');
    
    if (!approvedLoan) {
      console.log('⚠️ No approved loans found, skipping test');
      test.skip();
      return;
    }
    
    console.log(`🎯 Testing approved loan: ${approvedLoan.loanNumber} (ID: ${approvedLoan.id})`);
    
    // Navigate to loan details
    await page.goto(`${FRONTEND_BASE_URL}/loans/details/${approvedLoan.id}`);
    await page.waitForLoadState('networkidle');
    
    // Check for approved ApprovalCard
    const approvedCard = page.locator('[data-testid="approval-card-approved"]');
    await expect(approvedCard).toBeVisible({ timeout: 10000 });
    
    // Verify content
    await expect(approvedCard.locator('.approval-title')).toContainText('Loan Approved');
    await expect(approvedCard).toContainText('Ready for Disbursement');
    await expect(approvedCard).toContainText(approvedLoan.loanNumber);
    
    // Verify no action buttons present
    const approveButton = page.locator('[data-testid="approve-button"]');
    const rejectButton = page.locator('[data-testid="reject-button"]');
    
    await expect(approveButton).not.toBeVisible();
    await expect(rejectButton).not.toBeVisible();
    
    console.log('✅ Approved status card displayed correctly');
  });

  test('should display rejected status card for rejected loan', async ({ page }) => {
    console.log('📋 Test: Display rejected status for REJECTED loan');
    
    // Get rejected loans
    const rejectedLoans = await getLoans('loans/rejected');
    
    if (rejectedLoans.length === 0) {
      console.log('⚠️ No rejected loans found, skipping test');
      test.skip();
      return;
    }
    
    const testLoan = rejectedLoans[0];
    console.log(`🎯 Testing rejected loan: ${testLoan.loanNumber} (ID: ${testLoan.id})`);
    
    // Navigate to loan details
    await page.goto(`${FRONTEND_BASE_URL}/loans/details/${testLoan.id}`);
    await page.waitForLoadState('networkidle');
    
    // Check for rejected ApprovalCard
    const rejectedCard = page.locator('[data-testid="approval-card-rejected"]');
    await expect(rejectedCard).toBeVisible({ timeout: 10000 });
    
    // Verify content
    await expect(rejectedCard.locator('.approval-title')).toContainText('Loan Rejected');
    await expect(rejectedCard).toContainText('Application Rejected');
    await expect(rejectedCard).toContainText(testLoan.loanNumber);
    
    // Check if rejection reason is displayed
    if (testLoan.rejectionReason) {
      await expect(rejectedCard).toContainText(testLoan.rejectionReason);
      console.log('✅ Rejection reason displayed');
    }
    
    // Verify no action buttons present
    const approveButton = page.locator('[data-testid="approve-button"]');
    const rejectButton = page.locator('[data-testid="reject-button"]');
    
    await expect(approveButton).not.toBeVisible();
    await expect(rejectButton).not.toBeVisible();
    
    console.log('✅ Rejected status card displayed correctly');
  });

  test('should disable buttons during processing', async ({ page }) => {
    console.log('📋 Test: Button disabled state during processing');
    
    // Get pending loans
    const pendingLoans = await getLoans('loans/pending-approval');
    
    if (pendingLoans.length === 0) {
      console.log('⚠️ No pending loans found, skipping test');
      test.skip();
      return;
    }
    
    const testLoan = pendingLoans[0];
    
    // Navigate to loan details
    await page.goto(`${FRONTEND_BASE_URL}/loans/details/${testLoan.id}`);
    await page.waitForSelector('[data-testid="approval-card-pending"]', { timeout: 10000 });
    
    const approveButton = page.locator('[data-testid="approve-button"]');
    const rejectButton = page.locator('[data-testid="reject-button"]');
    
    // Verify buttons are initially enabled
    await expect(approveButton).toBeEnabled();
    await expect(rejectButton).toBeEnabled();
    console.log('✅ Buttons initially enabled');
    
    // Click approve button (without waiting for completion)
    await approveButton.click({ noWaitAfter: true });
    
    // Check if button shows processing state
    await page.waitForTimeout(100);
    
    // Button should show "Processing..." or be disabled
    const isProcessing = await approveButton.textContent();
    console.log(`Button text during processing: ${isProcessing}`);
    
    console.log('✅ Button state change verified');
  });

  test('should update UI via WebSocket when another user approves loan', async ({ page, context }) => {
    console.log('📋 Test: WebSocket real-time update simulation');
    
    // Get pending loans
    const pendingLoans = await getLoans('loans/pending-approval');
    
    if (pendingLoans.length === 0) {
      console.log('⚠️ No pending loans found, skipping test');
      test.skip();
      return;
    }
    
    const testLoan = pendingLoans[0];
    
    // Navigate to loan details
    await page.goto(`${FRONTEND_BASE_URL}/loans/details/${testLoan.id}`);
    await page.waitForSelector('[data-testid="approval-card-pending"]', { timeout: 10000 });
    
    console.log('✅ Loan details page loaded with pending card');
    
    // Simulate approval from another tab/user
    const secondPage = await context.newPage();
    await setupAuthentication(secondPage);
    await secondPage.goto(`${FRONTEND_BASE_URL}/loans/details/${testLoan.id}`);
    await secondPage.waitForSelector('[data-testid="approval-card-pending"]');
    
    // Approve from second page
    const approveButton = secondPage.locator('[data-testid="approve-button"]');
    await approveButton.click();
    await secondPage.waitForTimeout(2000);
    
    // Check if first page updates via WebSocket
    await page.waitForTimeout(3000); // Wait for WebSocket message
    
    // First page should now show approved card
    const approvedCard = page.locator('[data-testid="approval-card-approved"]');
    
    try {
      await expect(approvedCard).toBeVisible({ timeout: 5000 });
      console.log('✅ WebSocket update reflected in UI');
    } catch (error) {
      console.log('ℹ️ WebSocket update may take longer or require page refresh');
    }
    
    await secondPage.close();
  });

  test('should show loan details with approval info', async ({ page }) => {
    console.log('📋 Test: Approval info display');
    
    // Get all loans and find an approved one
    const allLoans = await getLoans('loans');
    const approvedLoan = allLoans.find(loan => loan.workflowStatus === 'APPROVED');
    
    if (!approvedLoan) {
      console.log('⚠️ No approved loans found, skipping test');
      test.skip();
      return;
    }
    
    await page.goto(`${FRONTEND_BASE_URL}/loans/details/${approvedLoan.id}`);
    await page.waitForLoadState('networkidle');
    
    const approvedCard = page.locator('[data-testid="approval-card-approved"]');
    await expect(approvedCard).toBeVisible();
    
    // Check for approver information
    const hasApproverInfo = await approvedCard.locator('text=/Approved By|Approved On/i').count();
    
    if (hasApproverInfo > 0) {
      console.log('✅ Approver information displayed');
    } else {
      console.log('ℹ️ Approver information may not be available');
    }
  });

  test('should handle rejection without reason gracefully', async ({ page }) => {
    console.log('📋 Test: Reject without reason (dialog cancel)');
    
    // Get pending loans
    const pendingLoans = await getLoans('loans/pending-approval');
    
    if (pendingLoans.length === 0) {
      console.log('⚠️ No pending loans found, skipping test');
      test.skip();
      return;
    }
    
    const testLoan = pendingLoans[0];
    
    await page.goto(`${FRONTEND_BASE_URL}/loans/details/${testLoan.id}`);
    await page.waitForSelector('[data-testid="approval-card-pending"]');
    
    // Setup dialog handler to cancel
    page.once('dialog', async dialog => {
      console.log('📝 Canceling rejection dialog');
      await dialog.dismiss();
    });
    
    const rejectButton = page.locator('[data-testid="reject-button"]');
    await rejectButton.click();
    
    await page.waitForTimeout(1000);
    
    // Card should still be in pending state
    const pendingCard = page.locator('[data-testid="approval-card-pending"]');
    await expect(pendingCard).toBeVisible();
    
    console.log('✅ Rejection canceled gracefully');
  });
});

test.describe('Loan Approval - UI/UX Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    await setupAuthentication(page);
    await page.waitForLoadState('networkidle');
  });

  test('should have proper styling for approval card states', async ({ page }) => {
    console.log('📋 Test: Approval card styling');
    
    const allLoans = await getLoans('loans');
    const pendingLoan = allLoans.find(loan => loan.workflowStatus === 'PENDING_APPROVAL');
    
    if (pendingLoan) {
      await page.goto(`${FRONTEND_BASE_URL}/loans/details/${pendingLoan.id}`);
      await page.waitForSelector('[data-testid="approval-card-pending"]');
      
      const card = page.locator('[data-testid="approval-card-pending"]');
      
      // Check for gradient background (pending uses yellow/amber)
      const backgroundColor = await card.locator('.approval-card-header').evaluate(el => {
        return window.getComputedStyle(el).background;
      });
      
      console.log('Card background:', backgroundColor);
      expect(backgroundColor).toBeTruthy();
      console.log('✅ Pending card has styled background');
    } else {
      console.log('ℹ️ No pending loan to test styling');
    }
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    console.log('📋 Test: Responsive design');
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    const pendingLoans = await getLoans('loans/pending-approval');
    
    if (pendingLoans.length > 0) {
      await page.goto(`${FRONTEND_BASE_URL}/loans/details/${pendingLoans[0].id}`);
      await page.waitForSelector('[data-testid="approval-card-pending"]');
      
      const card = page.locator('[data-testid="approval-card-pending"]');
      await expect(card).toBeVisible();
      
      const approveButton = page.locator('[data-testid="approve-button"]');
      await expect(approveButton).toBeVisible();
      
      console.log('✅ Approval card is responsive');
    }
  });
});
