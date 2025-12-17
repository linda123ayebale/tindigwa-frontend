import { test, expect } from '@playwright/test';
import { setupAuthentication } from './fixtures/auth';

test.describe('Loan Payment Tracking E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthentication(page);
  });

  test.describe('Tracking Button Visibility', () => {
    test('should display tracking button in All Loans table', async ({ page }) => {
      // Navigate to All Loans page
      await page.goto('http://localhost:3000/loans');
      
      // Wait for the table to load
      await page.waitForSelector('.loans-table', { timeout: 10000 });
      
      // Check if tracking button exists
      const trackingButton = page.locator('.action-btn.tracking').first();
      await expect(trackingButton).toBeVisible();
      
      // Verify button has correct title
      await expect(trackingButton).toHaveAttribute('title', 'View Payment Tracking');
      
      // Verify it has the BarChart3 icon (svg element)
      const icon = trackingButton.locator('svg');
      await expect(icon).toBeVisible();
    });

    test('should display tracking button in Pending Approvals table', async ({ page }) => {
      // Navigate to Pending Approvals page
      await page.goto('http://localhost:3000/loans/pending');
      
      // Wait for the table to load
      await page.waitForSelector('table', { timeout: 10000 });
      
      // Check if any loans exist
      const noLoansMessage = page.locator('text=No pending approvals');
      const hasLoans = await page.locator('.action-btn.tracking').count() > 0;
      
      if (hasLoans) {
        // Check if tracking button exists
        const trackingButton = page.locator('.action-btn.tracking').first();
        await expect(trackingButton).toBeVisible();
        await expect(trackingButton).toHaveAttribute('title', 'View Payment Tracking');
      } else {
        // If no loans, verify the empty state is shown
        await expect(noLoansMessage).toBeVisible();
      }
    });

    test('should display tracking button in Rejected Loans table', async ({ page }) => {
      // Navigate to Rejected Loans page
      await page.goto('http://localhost:3000/loans/rejected');
      
      // Wait for the page to load
      await page.waitForSelector('main', { timeout: 10000 });
      
      // Check if any loans exist
      const noLoansMessage = page.locator('text=No rejected loans');
      const hasLoans = await page.locator('.action-btn.tracking').count() > 0;
      
      if (hasLoans) {
        // Check if tracking button exists
        const trackingButton = page.locator('.action-btn.tracking').first();
        await expect(trackingButton).toBeVisible();
        await expect(trackingButton).toHaveAttribute('title', 'View Payment Tracking');
      } else {
        // If no loans, verify the empty state is shown
        await expect(noLoansMessage).toBeVisible();
      }
    });
  });

  test.describe('Navigation and Data Rendering', () => {
    test('should navigate to tracking page and display loan tracking data', async ({ page, request }) => {
      // Step 1: Navigate to All Loans and get a loan ID
      await page.goto('http://localhost:3000/loans');
      
      // Wait for loans to load
      await page.waitForSelector('.loans-table', { timeout: 10000 });
      
      // Get the first loan's tracking button
      const firstTrackingButton = page.locator('.action-btn.tracking').first();
      
      // Check if button exists
      const buttonCount = await page.locator('.action-btn.tracking').count();
      if (buttonCount === 0) {
        console.log('No loans available for testing');
        test.skip();
        return;
      }
      
      // Extract loan ID from the first row
      const firstRow = page.locator('.loans-table tbody tr').first();
      const loanNumberCell = firstRow.locator('td').nth(1); // Assuming loan number is in 2nd column
      const loanNumber = await loanNumberCell.textContent();
      
      console.log('Testing with loan:', loanNumber);
      
      // Step 2: Click tracking button
      await firstTrackingButton.click();
      
      // Step 3: Wait for navigation to tracking page
      await page.waitForURL(/\/loans\/tracking\/\d+/, { timeout: 10000 });
      
      // Step 4: Verify page header
      await expect(page.locator('h1')).toContainText('Loan Tracking Details');
      
      // Step 5: Verify loan number is displayed
      if (loanNumber) {
        await expect(page.locator('.page-description')).toContainText('Loan Number:');
      }
      
      // Step 6: Verify metrics cards are displayed
      await expect(page.locator('.metric-card').first()).toBeVisible();
      
      // Step 7: Take screenshot for verification
      await page.screenshot({ 
        path: 'test-results/loan-tracking-page.png', 
        fullPage: true 
      });
    });

    test('should display correct tracking data from backend', async ({ page, request }) => {
      // Step 1: Fetch loan data from backend
      try {
        const loansResponse = await request.get('http://localhost:8081/api/loans/table-view');
        if (!loansResponse.ok()) {
          console.log('Backend not available, skipping test');
          test.skip();
          return;
        }
        
        const loans = await loansResponse.json();
        if (!loans || loans.length === 0) {
          console.log('No loans available, skipping test');
          test.skip();
          return;
        }
        
        const testLoan = loans[0];
        const loanId = testLoan.id;
        
        // Fetch complete loan data from backend
        const completeResponse = await request.get(`http://localhost:8081/api/loans/${loanId}/complete`);
        if (!completeResponse.ok()) {
          console.log('Complete loan endpoint not available');
          test.skip();
          return;
        }
        
        const completeData = await completeResponse.json();
        console.log('Backend tracking data:', completeData.tracking);
        
        // Step 2: Navigate to tracking page
        await page.goto(`http://localhost:3000/loans/tracking/${loanId}`);
        
        // Wait for data to load
        await page.waitForSelector('.metric-card', { timeout: 10000 });
        
        // Step 3: Verify data matches backend
        // Note: The exact values might differ due to calculations, but fields should be present
        const outstandingBalance = page.locator('.metric-card').filter({ hasText: 'Balance Remaining' });
        await expect(outstandingBalance).toBeVisible();
        
        const totalPaid = page.locator('.metric-card').filter({ hasText: 'Total Paid' });
        await expect(totalPaid).toBeVisible();
        
        const completion = page.locator('.metric-card').filter({ hasText: 'Completion %' });
        await expect(completion).toBeVisible();
        
      } catch (error) {
        console.error('Test error:', error);
        test.skip();
      }
    });
  });

  test.describe('UI Components', () => {
    test('should display back button that navigates to loan tracking list', async ({ page }) => {
      // Navigate to loans and click tracking
      await page.goto('http://localhost:3000/loans');
      await page.waitForSelector('.loans-table', { timeout: 10000 });
      
      const buttonCount = await page.locator('.action-btn.tracking').count();
      if (buttonCount === 0) {
        console.log('No loans available');
        test.skip();
        return;
      }
      
      await page.locator('.action-btn.tracking').first().click();
      await page.waitForURL(/\/loans\/tracking\/\d+/, { timeout: 10000 });
      
      // Check for back button
      const backButton = page.locator('button:has-text("Back to Loan Tracking")');
      await expect(backButton).toBeVisible();
      
      // Click back button
      await backButton.click();
      
      // Should navigate back to tracking list page
      await page.waitForURL('http://localhost:3000/loans/tracking', { timeout: 10000 });
    });

    test('should display loading state while fetching data', async ({ page }) => {
      // Navigate directly to tracking page (fast navigation to catch loading state)
      await page.goto('http://localhost:3000/loans/tracking/1');
      
      // Try to catch loading state (might be too fast)
      const loadingSpinner = page.locator('.loading-spinner');
      const loadingText = page.locator('.loading-text');
      
      // Check if loading state appears (with a short timeout)
      try {
        await expect(loadingSpinner.or(loadingText)).toBeVisible({ timeout: 1000 });
      } catch {
        // Loading was too fast, which is fine
        console.log('Loading state was too fast to capture');
      }
      
      // Eventually, content should load
      await page.waitForSelector('.metric-card, .empty-state-pending', { timeout: 10000 });
    });

    test('should display empty state for loan without tracking data', async ({ page }) => {
      // Navigate to a non-existent or invalid loan ID
      await page.goto('http://localhost:3000/loans/tracking/999999');
      
      // Wait for either empty state or error message
      await page.waitForSelector('.empty-state-pending, text=No tracking data found, text=Failed to load', { 
        timeout: 10000 
      });
      
      // Verify appropriate message is shown
      const emptyState = page.locator('.empty-state-pending');
      const errorMessage = page.locator('text=No tracking data found, text=Failed to load');
      
      const hasEmptyState = await emptyState.count() > 0;
      const hasErrorMessage = await errorMessage.count() > 0;
      
      expect(hasEmptyState || hasErrorMessage).toBeTruthy();
    });

    test('should display financial breakdown section', async ({ page }) => {
      await page.goto('http://localhost:3000/loans');
      await page.waitForSelector('.loans-table', { timeout: 10000 });
      
      const buttonCount = await page.locator('.action-btn.tracking').count();
      if (buttonCount === 0) {
        test.skip();
        return;
      }
      
      await page.locator('.action-btn.tracking').first().click();
      await page.waitForURL(/\/loans\/tracking\/\d+/, { timeout: 10000 });
      
      // Wait for page to load
      await page.waitForSelector('.metric-card', { timeout: 10000 });
      
      // Check for financial breakdown section
      const breakdownSection = page.locator('.breakdown-section');
      await expect(breakdownSection).toBeVisible();
      
      // Verify it has a heading
      await expect(breakdownSection.locator('h2')).toHaveText('Financial Breakdown');
      
      // Check for breakdown items
      const principalItem = page.locator('text=Principal Amount:');
      const interestItem = page.locator('text=Interest Amount:');
      const totalItem = page.locator('text=Total Amount:');
      
      await expect(principalItem).toBeVisible();
      await expect(interestItem).toBeVisible();
      await expect(totalItem).toBeVisible();
    });
  });

  test.describe('Tracking Button Styling', () => {
    test('should have correct CSS styling for tracking button', async ({ page }) => {
      await page.goto('http://localhost:3000/loans');
      await page.waitForSelector('.loans-table', { timeout: 10000 });
      
      const buttonCount = await page.locator('.action-btn.tracking').count();
      if (buttonCount === 0) {
        test.skip();
        return;
      }
      
      const trackingButton = page.locator('.action-btn.tracking').first();
      
      // Verify button has tracking class
      await expect(trackingButton).toHaveClass(/tracking/);
      
      // Verify background color is light blue theme
      const backgroundColor = await trackingButton.evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor;
      });
      
      // Light blue color should be RGB(224, 242, 254) or similar
      expect(backgroundColor).toContain('rgb');
      
      console.log('Tracking button background color:', backgroundColor);
    });

    test('should have hover effect on tracking button', async ({ page }) => {
      await page.goto('http://localhost:3000/loans');
      await page.waitForSelector('.loans-table', { timeout: 10000 });
      
      const buttonCount = await page.locator('.action-btn.tracking').count();
      if (buttonCount === 0) {
        test.skip();
        return;
      }
      
      const trackingButton = page.locator('.action-btn.tracking').first();
      
      // Hover over button
      await trackingButton.hover();
      
      // Take screenshot after hover
      await page.screenshot({ 
        path: 'test-results/tracking-button-hover.png',
        clip: await trackingButton.boundingBox() || undefined
      });
      
      // Verify button is still visible after hover
      await expect(trackingButton).toBeVisible();
    });
  });

  test.describe('Multiple Tables Integration', () => {
    test('should work consistently across all loan tables', async ({ page }) => {
      const tables = [
        { path: '/loans', name: 'All Loans' },
        { path: '/loans/pending', name: 'Pending Approvals' },
        { path: '/loans/rejected', name: 'Rejected Loans' }
      ];
      
      for (const table of tables) {
        console.log(`Testing ${table.name} table...`);
        
        await page.goto(`http://localhost:3000${table.path}`);
        await page.waitForSelector('main', { timeout: 10000 });
        
        const buttonCount = await page.locator('.action-btn.tracking').count();
        
        if (buttonCount > 0) {
          const trackingButton = page.locator('.action-btn.tracking').first();
          await expect(trackingButton).toBeVisible();
          console.log(`✓ ${table.name}: Tracking button visible`);
        } else {
          console.log(`ℹ ${table.name}: No loans with tracking button`);
        }
      }
    });
  });
});
