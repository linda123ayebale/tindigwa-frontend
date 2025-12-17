import { test, expect } from '@playwright/test';

/**
 * E2E Test: Enhanced Loan Overview with Comprehensive Financial Details
 * 
 * Tests the complete loan overview refactoring including:
 * - Backend API returning all financial fields
 * - Frontend displaying 5 sections: Loan Summary, Financial Details, Repayment Details, Dates, Balance Summary
 * - All fields populated correctly without N/A or missing data
 * - Responsive layout and styling
 */

const BASE_URL = process.env.VITE_API_URL || 'http://localhost:3000';
const API_BASE_URL = process.env.API_URL || 'http://localhost:8081';

test.describe('Enhanced Loan Overview E2E Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Set viewport for consistent testing
    await page.setViewportSize({ width: 1400, height: 900 });
  });

  test('Backend API returns comprehensive financial data', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/api/loans/1/complete`);
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    // Verify core structure
    expect(data).toHaveProperty('loan');
    expect(data).toHaveProperty('client');
    expect(data).toHaveProperty('loanOfficer');
    
    // Verify new financial fields
    expect(data).toHaveProperty('processingFee');
    expect(data).toHaveProperty('lateFee');
    expect(data).toHaveProperty('insuranceFee');
    expect(data).toHaveProperty('penaltyFee');
    
    // Verify payment totals
    expect(data).toHaveProperty('totalPaid');
    expect(data).toHaveProperty('principalPaid');
    expect(data).toHaveProperty('interestPaid');
    expect(data).toHaveProperty('feesPaid');
    
    // Verify outstanding balances
    expect(data).toHaveProperty('outstandingBalance');
    expect(data).toHaveProperty('outstandingPrincipal');
    expect(data).toHaveProperty('outstandingInterest');
    
    // Verify next payment
    expect(data).toHaveProperty('nextPaymentAmount');
    expect(data).toHaveProperty('nextPaymentDue');
    
    // Verify key dates
    expect(data).toHaveProperty('applicationDate');
    expect(data).toHaveProperty('approvalDate');
    expect(data).toHaveProperty('disbursementDate');
    expect(data).toHaveProperty('firstRepaymentDate');
    expect(data).toHaveProperty('maturityDate');
    expect(data).toHaveProperty('lastPaymentDate');
    
    // Verify loan terms
    expect(data).toHaveProperty('repaymentFrequency');
    expect(data).toHaveProperty('numberOfInstallments');
    expect(data).toHaveProperty('installmentsPaid');
    expect(data).toHaveProperty('installmentsRemaining');
    expect(data).toHaveProperty('gracePeriodDays');
    expect(data).toHaveProperty('interestMethod');
    expect(data).toHaveProperty('interestRate');
    
    // Verify classification
    expect(data).toHaveProperty('loanProduct');
    expect(data).toHaveProperty('loanCategory');
    expect(data).toHaveProperty('loanType');
    expect(data).toHaveProperty('loanPurpose');
    
    // Verify disbursement info
    expect(data).toHaveProperty('disbursedByUser');
    expect(data).toHaveProperty('disbursedAccount');
    
    // Verify collateral info
    expect(data).toHaveProperty('collateralDescription');
    expect(data).toHaveProperty('collateralValue');
    
    console.log('✅ Backend API returns all required fields');
  });

  test('Loan Overview displays all 5 sections', async ({ page }) => {
    await page.goto(`${BASE_URL}/loans/details/1`);
    
    // Wait for loan data to load
    await page.waitForSelector('.loan-overview-card', { timeout: 10000 });
    
    // Verify main header
    const header = await page.locator('.overview-header h3');
    await expect(header).toContainText('Loan Overview');
    
    // Verify all 5 sections exist
    const sections = await page.locator('.overview-section').all();
    expect(sections.length).toBeGreaterThanOrEqual(5);
    
    // Verify section titles
    const sectionTitles = await page.locator('.section-title').allTextContents();
    expect(sectionTitles).toContain('Loan Summary');
    expect(sectionTitles).toContain('Financial Details');
    expect(sectionTitles).toContain('Repayment Details');
    expect(sectionTitles).toContain('Key Dates');
    expect(sectionTitles).toContain('Balance Summary');
    
    console.log('✅ All 5 sections are displayed');
  });

  test('Loan Summary section displays all fields', async ({ page }) => {
    await page.goto(`${BASE_URL}/loans/details/1`);
    await page.waitForSelector('.loan-overview-card', { timeout: 10000 });
    
    // Find the Loan Summary section
    const loanSummarySection = page.locator('.overview-section').filter({ hasText: 'Loan Summary' });
    
    // Verify fields exist
    await expect(loanSummarySection.locator('.row').filter({ hasText: 'Loan Number' })).toBeVisible();
    await expect(loanSummarySection.locator('.row').filter({ hasText: 'Product' })).toBeVisible();
    await expect(loanSummarySection.locator('.row').filter({ hasText: 'Loan Category' })).toBeVisible();
    await expect(loanSummarySection.locator('.row').filter({ hasText: 'Loan Type' })).toBeVisible();
    await expect(loanSummarySection.locator('.row').filter({ hasText: 'Loan Purpose' })).toBeVisible();
    await expect(loanSummarySection.locator('.row').filter({ hasText: 'Loan Status' })).toBeVisible();
    
    console.log('✅ Loan Summary section displays all fields');
  });

  test('Financial Details section displays all fields with currency formatting', async ({ page }) => {
    await page.goto(`${BASE_URL}/loans/details/1`);
    await page.waitForSelector('.loan-overview-card', { timeout: 10000 });
    
    const financialSection = page.locator('.overview-section').filter({ hasText: 'Financial Details' });
    
    // Verify fields exist
    await expect(financialSection.locator('.row').filter({ hasText: 'Principal Amount' })).toBeVisible();
    await expect(financialSection.locator('.row').filter({ hasText: 'Total Payable' })).toBeVisible();
    await expect(financialSection.locator('.row').filter({ hasText: 'Processing Fee' })).toBeVisible();
    await expect(financialSection.locator('.row').filter({ hasText: 'Late Payment Fee' })).toBeVisible();
    await expect(financialSection.locator('.row').filter({ hasText: 'Insurance Fee' })).toBeVisible();
    await expect(financialSection.locator('.row').filter({ hasText: 'Collateral Value' })).toBeVisible();
    
    // Verify currency formatting (USh prefix)
    const principalAmount = await financialSection.locator('.row').filter({ hasText: 'Principal Amount' }).locator('.value').textContent();
    expect(principalAmount).toContain('USh');
    
    console.log('✅ Financial Details section displays with currency formatting');
  });

  test('Repayment Details section displays all fields', async ({ page }) => {
    await page.goto(`${BASE_URL}/loans/details/1`);
    await page.waitForSelector('.loan-overview-card', { timeout: 10000 });
    
    const repaymentSection = page.locator('.overview-section').filter({ hasText: 'Repayment Details' });
    
    await expect(repaymentSection.locator('.row').filter({ hasText: 'Interest Rate & Method' })).toBeVisible();
    await expect(repaymentSection.locator('.row').filter({ hasText: 'Duration' })).toBeVisible();
    await expect(repaymentSection.locator('.row').filter({ hasText: 'Repayment Frequency' })).toBeVisible();
    await expect(repaymentSection.locator('.row').filter({ hasText: 'Number of Installments' })).toBeVisible();
    await expect(repaymentSection.locator('.row').filter({ hasText: 'Grace Period' })).toBeVisible();
    await expect(repaymentSection.locator('.row').filter({ hasText: 'Branch' })).toBeVisible();
    
    console.log('✅ Repayment Details section displays all fields');
  });

  test('Key Dates section displays all date fields', async ({ page }) => {
    await page.goto(`${BASE_URL}/loans/details/1`);
    await page.waitForSelector('.loan-overview-card', { timeout: 10000 });
    
    const datesSection = page.locator('.overview-section').filter({ hasText: 'Key Dates' });
    
    await expect(datesSection.locator('.row').filter({ hasText: 'Application Date' })).toBeVisible();
    await expect(datesSection.locator('.row').filter({ hasText: 'Approval Date' })).toBeVisible();
    await expect(datesSection.locator('.row').filter({ hasText: 'Disbursement Date' })).toBeVisible();
    await expect(datesSection.locator('.row').filter({ hasText: 'First Repayment Date' })).toBeVisible();
    await expect(datesSection.locator('.row').filter({ hasText: 'Maturity Date' })).toBeVisible();
    await expect(datesSection.locator('.row').filter({ hasText: 'Last Payment Date' })).toBeVisible();
    
    console.log('✅ Key Dates section displays all date fields');
  });

  test('Balance Summary section displays with highlighted styling', async ({ page }) => {
    await page.goto(`${BASE_URL}/loans/details/1`);
    await page.waitForSelector('.loan-overview-card', { timeout: 10000 });
    
    const balanceSection = page.locator('.overview-section.highlight').filter({ hasText: 'Balance Summary' });
    await expect(balanceSection).toBeVisible();
    
    // Verify all balance fields
    await expect(balanceSection.locator('.row').filter({ hasText: 'Total Amount Paid' })).toBeVisible();
    await expect(balanceSection.locator('.row').filter({ hasText: 'Outstanding Balance' })).toBeVisible();
    await expect(balanceSection.locator('.row').filter({ hasText: 'Principal Paid' })).toBeVisible();
    await expect(balanceSection.locator('.row').filter({ hasText: 'Interest Paid' })).toBeVisible();
    await expect(balanceSection.locator('.row').filter({ hasText: 'Next Payment Amount' })).toBeVisible();
    await expect(balanceSection.locator('.row').filter({ hasText: 'Next Payment Due' })).toBeVisible();
    
    // Verify highlight class is applied
    const hasHighlightClass = await balanceSection.evaluate(el => el.classList.contains('highlight'));
    expect(hasHighlightClass).toBeTruthy();
    
    console.log('✅ Balance Summary section displays with highlighted styling');
  });

  test('Two-column grid layout is properly applied', async ({ page }) => {
    await page.goto(`${BASE_URL}/loans/details/1`);
    await page.waitForSelector('.loan-overview-card', { timeout: 10000 });
    
    // Check that two-column-grid exists
    const grids = await page.locator('.two-column-grid').all();
    expect(grids.length).toBeGreaterThanOrEqual(5); // One for each section
    
    // Verify grid has proper CSS
    const firstGrid = page.locator('.two-column-grid').first();
    const gridStyle = await firstGrid.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return styles.display;
    });
    
    expect(gridStyle).toBe('grid');
    
    console.log('✅ Two-column grid layout is properly applied');
  });

  test('Row layout displays label and value correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/loans/details/1`);
    await page.waitForSelector('.loan-overview-card', { timeout: 10000 });
    
    // Get first row
    const firstRow = page.locator('.two-column-grid .row').first();
    
    // Verify label exists
    const label = firstRow.locator('.label');
    await expect(label).toBeVisible();
    
    // Verify value exists
    const value = firstRow.locator('.value');
    await expect(value).toBeVisible();
    
    // Verify label is on the left (justify-content: space-between)
    const labelText = await label.textContent();
    const valueText = await value.textContent();
    expect(labelText).toBeTruthy();
    expect(valueText).toBeTruthy();
    
    console.log('✅ Row layout displays label and value correctly');
  });

  test('No N/A values for core financial fields', async ({ page }) => {
    await page.goto(`${BASE_URL}/loans/details/1`);
    await page.waitForSelector('.loan-overview-card', { timeout: 10000 });
    
    // Check critical financial fields don't show N/A
    const principalRow = page.locator('.row').filter({ hasText: 'Principal Amount' });
    const principalValue = await principalRow.locator('.value').textContent();
    expect(principalValue).not.toContain('N/A');
    expect(principalValue).toContain('USh');
    
    const totalPayableRow = page.locator('.row').filter({ hasText: 'Total Payable' });
    const totalValue = await totalPayableRow.locator('.value').textContent();
    expect(totalValue).not.toContain('N/A');
    
    const outstandingRow = page.locator('.row').filter({ hasText: 'Outstanding Balance' });
    const outstandingValue = await outstandingRow.locator('.value').textContent();
    expect(outstandingValue).not.toContain('N/A');
    
    console.log('✅ No N/A values for core financial fields');
  });

  test('Responsive layout works on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${BASE_URL}/loans/details/1`);
    await page.waitForSelector('.loan-overview-card', { timeout: 10000 });
    
    // Verify sections still visible
    const sections = await page.locator('.overview-section').all();
    expect(sections.length).toBeGreaterThanOrEqual(5);
    
    // Verify all sections are visible (not hidden)
    for (const section of sections) {
      await expect(section).toBeVisible();
    }
    
    console.log('✅ Responsive layout works on mobile viewport');
  });

  test('Status badges are displayed in header', async ({ page }) => {
    await page.goto(`${BASE_URL}/loans/details/1`);
    await page.waitForSelector('.loan-overview-card', { timeout: 10000 });
    
    const header = page.locator('.overview-header');
    const statusBadges = header.locator('.status-badges');
    
    await expect(statusBadges).toBeVisible();
    
    // Should have at least one badge
    const badges = await statusBadges.locator('.status-badge, [class*="badge"]').count();
    expect(badges).toBeGreaterThan(0);
    
    console.log('✅ Status badges are displayed in header');
  });

  test('Highlight values have special styling in Balance Summary', async ({ page }) => {
    await page.goto(`${BASE_URL}/loans/details/1`);
    await page.waitForSelector('.loan-overview-card', { timeout: 10000 });
    
    const balanceSection = page.locator('.overview-section.highlight');
    
    // Check for highlight-value class
    const highlightValues = await balanceSection.locator('.highlight-value').count();
    expect(highlightValues).toBeGreaterThan(0);
    
    // Verify special color is applied
    const firstHighlight = balanceSection.locator('.highlight-value').first();
    const color = await firstHighlight.evaluate(el => {
      return window.getComputedStyle(el).color;
    });
    
    // Color should not be default black
    expect(color).not.toBe('rgb(0, 0, 0)');
    
    console.log('✅ Highlight values have special styling');
  });

  test('All sections load without errors', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    page.on('pageerror', error => {
      errors.push(error.message);
    });
    
    await page.goto(`${BASE_URL}/loans/details/1`);
    await page.waitForSelector('.loan-overview-card', { timeout: 10000 });
    
    // Wait for all sections to render
    await page.waitForTimeout(2000);
    
    // Check for JavaScript errors
    expect(errors).toHaveLength(0);
    
    console.log('✅ All sections load without errors');
  });

  test('Complete E2E flow: Backend → Frontend data flow', async ({ page, request }) => {
    // Step 1: Fetch from backend
    const apiResponse = await request.get(`${API_BASE_URL}/api/loans/1/complete`);
    expect(apiResponse.ok()).toBeTruthy();
    const apiData = await apiResponse.json();
    
    // Step 2: Load frontend
    await page.goto(`${BASE_URL}/loans/details/1`);
    await page.waitForSelector('.loan-overview-card', { timeout: 10000 });
    
    // Step 3: Verify frontend displays backend data correctly
    
    // Verify loan number
    const loanNumberRow = page.locator('.row').filter({ hasText: 'Loan Number' });
    const loanNumber = await loanNumberRow.locator('.value').textContent();
    expect(loanNumber).toContain(apiData.loan.loanNumber);
    
    // Verify repayment frequency
    const frequencyRow = page.locator('.row').filter({ hasText: 'Repayment Frequency' });
    const frequency = await frequencyRow.locator('.value').textContent();
    expect(frequency?.toLowerCase()).toContain(apiData.repaymentFrequency?.toLowerCase() || apiData.loan.repaymentFrequency?.toLowerCase());
    
    // Verify installments
    const installmentsRow = page.locator('.row').filter({ hasText: 'Number of Installments' });
    const installments = await installmentsRow.locator('.value').textContent();
    const expectedInstallments = apiData.numberOfInstallments || apiData.loan.numberOfRepayments;
    expect(installments).toContain(expectedInstallments?.toString());
    
    console.log('✅ Complete E2E flow verified: Backend data flows correctly to frontend');
  });

});
