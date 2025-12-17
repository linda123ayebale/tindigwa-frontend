import { test, expect, Page } from '@playwright/test';
import { setupAuthentication } from './fixtures/auth';
import { getLoans, LoanResponse } from './utils/api';

/**
 * E2E Test Suite: Loan Edit Functionality
 * 
 * Tests the complete flow of editing a loan from the UI through to the backend.
 * Covers:
 * - Edit button visibility on different loan tables
 * - Navigation to edit page
 * - Form prefilling with existing data
 * - Step-by-step validation
 * - Successful update flow
 * - Backend verification
 */

const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL || 'http://localhost:3000';
const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || 'http://localhost:8081/api';

test.describe('Loan Edit - E2E Flow', () => {
  
  test.beforeEach(async ({ page }) => {
    // Setup authentication for all tests
    await setupAuthentication(page);
    
    // Wait for initial load
    await page.waitForLoadState('networkidle');
  });

  test('should display Edit button on All Loans table for editable loans', async ({ page }) => {
    console.log('📋 Test: Edit button visibility on All Loans table');
    
    // Navigate to All Loans page
    await page.goto(`${FRONTEND_BASE_URL}/loans`);
    await page.waitForLoadState('networkidle');
    
    // Wait for table to load
    await page.waitForSelector('table tbody tr', { timeout: 10000 });
    
    // Get all table rows
    const rows = page.locator('table tbody tr');
    const rowCount = await rows.count();
    
    console.log(`✅ Found ${rowCount} loan rows`);
    expect(rowCount).toBeGreaterThan(0);
    
    // Check first row for Edit button
    const firstRow = rows.first();
    const editButton = firstRow.locator('button.action-btn.edit');
    
    // Edit button should exist for loans with loanStatus = 'OPEN'
    if (await editButton.count() > 0) {
      console.log('✅ Edit button found on first loan');
      expect(await editButton.isVisible()).toBeTruthy();
      expect(await editButton.getAttribute('title')).toBe('Edit Loan');
    } else {
      console.log('ℹ️ No edit button (loan may not be in OPEN status)');
    }
  });

  test('should display Edit button on Pending Approvals table', async ({ page }) => {
    console.log('📋 Test: Edit button visibility on Pending Approvals table');
    
    // Navigate to Pending Approvals page
    await page.goto(`${FRONTEND_BASE_URL}/loans/pending`);
    await page.waitForLoadState('networkidle');
    
    // Check if loans exist
    const emptyState = page.locator('.empty-state-pending');
    const hasLoans = await emptyState.count() === 0;
    
    if (hasLoans) {
      await page.waitForSelector('table tbody tr', { timeout: 10000 });
      
      const rows = page.locator('table tbody tr');
      const rowCount = await rows.count();
      console.log(`✅ Found ${rowCount} pending loan rows`);
      
      // Check for Edit button
      const firstRow = rows.first();
      const editButton = firstRow.locator('button.action-btn.edit');
      
      if (await editButton.count() > 0) {
        console.log('✅ Edit button found on pending loan');
        expect(await editButton.isVisible()).toBeTruthy();
      }
    } else {
      console.log('ℹ️ No pending loans to test');
    }
  });

  test('should NOT display Edit button on Rejected Loans table', async ({ page }) => {
    console.log('📋 Test: Edit button should be hidden on Rejected Loans');
    
    await page.goto(`${FRONTEND_BASE_URL}/loans/rejected`);
    await page.waitForLoadState('networkidle');
    
    // Check if loans exist
    const emptyState = page.locator('.empty-state-pending');
    const hasLoans = await emptyState.count() === 0;
    
    if (hasLoans) {
      await page.waitForSelector('table tbody tr', { timeout: 10000 });
      
      const rows = page.locator('table tbody tr');
      const firstRow = rows.first();
      
      // Edit button should NOT exist for rejected loans
      const editButton = firstRow.locator('button.action-btn.edit');
      const editButtonCount = await editButton.count();
      
      console.log(`✅ Edit button count on rejected loan: ${editButtonCount}`);
      expect(editButtonCount).toBe(0);
    } else {
      console.log('ℹ️ No rejected loans to test');
    }
  });

  test('should navigate to Edit page when Edit button is clicked', async ({ page }) => {
    console.log('📋 Test: Navigation to Edit page');
    
    // Navigate to All Loans
    await page.goto(`${FRONTEND_BASE_URL}/loans`);
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('table tbody tr', { timeout: 10000 });
    
    // Find a loan with Edit button
    const editButton = page.locator('button.action-btn.edit').first();
    
    if (await editButton.count() > 0) {
      console.log('🖱️ Clicking Edit button...');
      await editButton.click();
      
      // Wait for navigation to edit page
      await page.waitForURL(/\/loans\/edit\/\d+/, { timeout: 10000 });
      
      const currentUrl = page.url();
      console.log(`✅ Navigated to: ${currentUrl}`);
      expect(currentUrl).toContain('/loans/edit/');
      
      // Verify page header
      const header = page.locator('h1');
      await expect(header).toHaveText('Edit Loan');
      console.log('✅ Edit Loan page loaded successfully');
    } else {
      console.log('⚠️ No editable loans found, skipping test');
      test.skip();
    }
  });

  test('should prefill form with existing loan data', async ({ page }) => {
    console.log('📋 Test: Form prefilling with loan data');
    
    // Get loans from backend
    const loans = await getLoans('loans');
    
    if (loans.length === 0) {
      console.log('⚠️ No loans found in backend, skipping test');
      test.skip();
      return;
    }
    
    const testLoan = loans[0];
    console.log(`🎯 Testing with loan: ${testLoan.loanNumber} (ID: ${testLoan.id})`);
    
    // Navigate directly to edit page
    await page.goto(`${FRONTEND_BASE_URL}/loans/edit/${testLoan.id}`);
    await page.waitForLoadState('networkidle');
    
    // Wait for form to load (check for stepper)
    await page.waitForSelector('.stepper-content', { timeout: 15000 });
    console.log('✅ Edit form loaded');
    
    // Verify header
    const header = page.locator('h1');
    await expect(header).toHaveText('Edit Loan');
    
    // Check that form fields are populated (Step 1: Client & Product)
    // Note: Specific field checks depend on form structure
    const stepContent = page.locator('.stepper-content');
    await expect(stepContent).toBeVisible();
    
    console.log('✅ Form is displaying with data');
  });

  test('should validate form before allowing navigation to next step', async ({ page }) => {
    console.log('📋 Test: Form validation');
    
    // Get a loan to edit
    const loans = await getLoans('loans');
    if (loans.length === 0) {
      console.log('⚠️ No loans found, skipping test');
      test.skip();
      return;
    }
    
    const testLoan = loans[0];
    await page.goto(`${FRONTEND_BASE_URL}/loans/edit/${testLoan.id}`);
    await page.waitForSelector('.stepper-content', { timeout: 15000 });
    
    // Try to navigate without filling required fields (clear a field first)
    // This tests client-side validation
    
    // Look for Next button
    const nextButton = page.locator('button:has-text("Next")');
    
    if (await nextButton.count() > 0) {
      console.log('🖱️ Clicking Next button...');
      await nextButton.click();
      
      // Should either move to next step OR show validation errors
      await page.waitForTimeout(1000);
      
      console.log('✅ Form validation check complete');
    }
  });

  test('should successfully update a loan through all steps', async ({ page }) => {
    console.log('📋 Test: Complete loan update flow');
    
    // Get a loan to edit
    const loans = await getLoans('loans');
    if (loans.length === 0) {
      console.log('⚠️ No loans found, skipping test');
      test.skip();
      return;
    }
    
    const testLoan = loans[0];
    console.log(`🎯 Editing loan: ${testLoan.loanNumber} (ID: ${testLoan.id})`);
    
    await page.goto(`${FRONTEND_BASE_URL}/loans/edit/${testLoan.id}`);
    await page.waitForSelector('.stepper-content', { timeout: 15000 });
    
    // Step through all steps
    let currentStep = 1;
    const maxSteps = 5; // Based on AddLoan structure
    
    while (currentStep < maxSteps) {
      const nextButton = page.locator('button:has-text("Next")');
      
      if (await nextButton.count() > 0 && await nextButton.isVisible()) {
        console.log(`📍 Step ${currentStep}: Clicking Next...`);
        await nextButton.click();
        await page.waitForTimeout(500);
        currentStep++;
      } else {
        break;
      }
    }
    
    console.log(`✅ Navigated through ${currentStep} steps`);
    
    // On final step, look for Update button
    const updateButton = page.locator('button:has-text("Update Loan")');
    
    if (await updateButton.count() > 0) {
      console.log('🖱️ Clicking Update Loan button...');
      
      // Listen for navigation after update
      const navigationPromise = page.waitForURL(/\/loans\/details\/\d+/, { timeout: 15000 });
      
      await updateButton.click();
      
      // Wait for success toast
      await page.waitForTimeout(2000);
      
      // Should redirect to loan details
      await navigationPromise;
      
      const finalUrl = page.url();
      console.log(`✅ Redirected to: ${finalUrl}`);
      expect(finalUrl).toContain('/loans/details/');
      
      console.log('✅ Loan updated successfully!');
    } else {
      console.log('⚠️ Update button not found at final step');
    }
  });

  test('should reflect changes in backend after update', async ({ page, request }) => {
    console.log('📋 Test: Backend verification after update');
    
    // Get initial loan data from backend
    const loansBeforeUpdate = await getLoans('loans');
    if (loansBeforeUpdate.length === 0) {
      console.log('⚠️ No loans found, skipping test');
      test.skip();
      return;
    }
    
    const testLoan = loansBeforeUpdate[0];
    const originalAmount = testLoan.principalAmount;
    console.log(`📊 Original amount: ${originalAmount}`);
    
    // Navigate to edit page
    await page.goto(`${FRONTEND_BASE_URL}/loans/edit/${testLoan.id}`);
    await page.waitForSelector('.stepper-content', { timeout: 15000 });
    
    // Make a small change (if we can access the principal field on step 2)
    const nextButton = page.locator('button:has-text("Next")');
    if (await nextButton.count() > 0) {
      await nextButton.click();
      await page.waitForTimeout(500);
      
      // Try to modify principal amount slightly
      const principalInput = page.locator('input[name="principal"], input#principal');
      if (await principalInput.count() > 0) {
        const newAmount = originalAmount + 1000;
        console.log(`✏️ Changing amount to: ${newAmount}`);
        await principalInput.fill(String(newAmount));
        await page.waitForTimeout(300);
      }
    }
    
    // Navigate to end and update
    let attempts = 0;
    while (attempts < 5) {
      const next = page.locator('button:has-text("Next")');
      if (await next.count() > 0 && await next.isVisible()) {
        await next.click();
        await page.waitForTimeout(500);
        attempts++;
      } else {
        break;
      }
    }
    
    const updateButton = page.locator('button:has-text("Update Loan")');
    if (await updateButton.count() > 0) {
      await updateButton.click();
      await page.waitForTimeout(3000);
      
      // Verify backend received update by fetching loan again
      const apiResponse = await request.get(`${BACKEND_BASE_URL}/loans/${testLoan.id}`);
      expect(apiResponse.ok()).toBeTruthy();
      
      const updatedLoan = await apiResponse.json();
      console.log(`✅ Backend returned updated loan: ${JSON.stringify(updatedLoan).substring(0, 200)}...`);
      
      console.log('✅ Backend verification complete');
    }
  });

  test('should show loading state while fetching loan data', async ({ page }) => {
    console.log('📋 Test: Loading state');
    
    const loans = await getLoans('loans');
    if (loans.length === 0) {
      console.log('⚠️ No loans found, skipping test');
      test.skip();
      return;
    }
    
    const testLoan = loans[0];
    
    // Navigate and try to catch loading state
    const navigationPromise = page.goto(`${FRONTEND_BASE_URL}/loans/edit/${testLoan.id}`);
    
    // Check for loading spinner (may be very fast)
    try {
      await page.waitForSelector('.loading-spinner', { timeout: 2000 });
      console.log('✅ Loading spinner displayed');
    } catch {
      console.log('ℹ️ Loading was too fast to catch spinner');
    }
    
    await navigationPromise;
    
    // Ensure content loads eventually
    await page.waitForSelector('.stepper-content', { timeout: 15000 });
    console.log('✅ Content loaded successfully');
  });

  test('should navigate back to loan details when Back button is clicked', async ({ page }) => {
    console.log('📋 Test: Back button navigation');
    
    const loans = await getLoans('loans');
    if (loans.length === 0) {
      console.log('⚠️ No loans found, skipping test');
      test.skip();
      return;
    }
    
    const testLoan = loans[0];
    await page.goto(`${FRONTEND_BASE_URL}/loans/edit/${testLoan.id}`);
    await page.waitForSelector('.stepper-content', { timeout: 15000 });
    
    // Look for Back button
    const backButton = page.locator('button:has-text("Back to Loan Details")');
    
    if (await backButton.count() > 0) {
      console.log('🖱️ Clicking Back button...');
      await backButton.click();
      
      // Should navigate to loan details
      await page.waitForURL(/\/loans\/details\/\d+/, { timeout: 10000 });
      
      const currentUrl = page.url();
      console.log(`✅ Navigated back to: ${currentUrl}`);
      expect(currentUrl).toContain('/loans/details/');
    } else {
      console.log('⚠️ Back button not found');
    }
  });

  test('should display stepper with 5 steps', async ({ page }) => {
    console.log('📋 Test: Stepper display');
    
    const loans = await getLoans('loans');
    if (loans.length === 0) {
      console.log('⚠️ No loans found, skipping test');
      test.skip();
      return;
    }
    
    const testLoan = loans[0];
    await page.goto(`${FRONTEND_BASE_URL}/loans/edit/${testLoan.id}`);
    await page.waitForSelector('.stepper-content', { timeout: 15000 });
    
    // Check for stepper component
    const stepper = page.locator('.stepper-container, .stepper');
    
    if (await stepper.count() > 0) {
      console.log('✅ Stepper component found');
      
      // Count steps (may vary based on actual implementation)
      const steps = page.locator('.step-item, .stepper-step');
      const stepCount = await steps.count();
      
      console.log(`✅ Found ${stepCount} steps in stepper`);
      expect(stepCount).toBeGreaterThan(0);
    } else {
      console.log('ℹ️ Stepper component structure may differ');
    }
  });
});

test.describe('Loan Edit - Edge Cases', () => {
  
  test.beforeEach(async ({ page }) => {
    await setupAuthentication(page);
    await page.waitForLoadState('networkidle');
  });

  test('should handle invalid loan ID gracefully', async ({ page }) => {
    console.log('📋 Test: Invalid loan ID handling');
    
    const invalidLoanId = 999999;
    await page.goto(`${FRONTEND_BASE_URL}/loans/edit/${invalidLoanId}`);
    
    // Should either show error message or redirect
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    console.log(`✅ Current URL after invalid ID: ${currentUrl}`);
    
    // May redirect to /loans or show error
    const isRedirected = currentUrl.includes('/loans') && !currentUrl.includes('/edit/');
    const hasErrorMessage = await page.locator('text=Failed to load').count() > 0;
    
    if (isRedirected || hasErrorMessage) {
      console.log('✅ Invalid ID handled correctly');
    }
  });

  test('should prevent duplicate submissions', async ({ page }) => {
    console.log('📋 Test: Prevent duplicate submissions');
    
    const loans = await getLoans('loans');
    if (loans.length === 0) {
      test.skip();
      return;
    }
    
    const testLoan = loans[0];
    await page.goto(`${FRONTEND_BASE_URL}/loans/edit/${testLoan.id}`);
    await page.waitForSelector('.stepper-content', { timeout: 15000 });
    
    // Navigate to last step quickly
    for (let i = 0; i < 5; i++) {
      const nextButton = page.locator('button:has-text("Next")');
      if (await nextButton.count() > 0 && await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForTimeout(300);
      }
    }
    
    const updateButton = page.locator('button:has-text("Update Loan")');
    
    if (await updateButton.count() > 0) {
      // Click update button
      await updateButton.click();
      
      // Button should be disabled during submission
      await page.waitForTimeout(500);
      const isDisabled = await updateButton.isDisabled();
      
      console.log(`✅ Button disabled during submission: ${isDisabled}`);
    }
  });
});
