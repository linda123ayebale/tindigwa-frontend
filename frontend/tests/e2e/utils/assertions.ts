import { expect, Page } from '@playwright/test';
import { table, pagination } from './selectors';

/**
 * Verify table has expected column headers
 */
export async function expectTableColumns(page: Page, expectedCount: number = 7) {
  const headers = await page.locator(table.headers).all();
  expect(headers.length, `Should have ${expectedCount} columns`).toBe(expectedCount);
  
  // Verify each header has text
  for (let i = 0; i < expectedCount; i++) {
    const headerText = await page.locator(table.header(i)).textContent();
    expect(headerText?.trim().length, `Header ${i} should have text`).toBeGreaterThan(0);
  }
}

/**
 * Get count of rendered table rows
 */
export async function getRenderedRows(page: Page): Promise<number> {
  return await page.locator(table.rows).count();
}

/**
 * Verify pagination shows correct info
 */
export async function expectPaginationInfo(
  page: Page, 
  start: number, 
  end: number, 
  total: number
) {
  const paginationText = await page.locator(pagination.info).textContent();
  expect(paginationText).toContain(`${start}`);
  expect(paginationText).toContain(`${end}`);
  expect(paginationText).toContain(`${total}`);
}

/**
 * Wait for table to be loaded (no loading spinner)
 */
export async function waitForTableLoad(page: Page, timeout: number = 10000) {
  // Wait for loading spinner to disappear
  await page.locator('.loading-container').waitFor({ state: 'hidden', timeout }).catch(() => {
    // If no loading spinner found, that's fine
  });
  
  // Wait for either table or empty state
  await Promise.race([
    page.locator(table.container).waitFor({ state: 'visible', timeout }),
    page.locator('.empty-state-pending, .empty-state').waitFor({ state: 'visible', timeout }),
  ]);
}

/**
 * Check if empty state is shown
 */
export async function isEmptyState(page: Page): Promise<boolean> {
  const emptyStateLocator = page.locator('.empty-state-pending, .empty-state');
  return await emptyStateLocator.isVisible();
}
