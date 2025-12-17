import { request, APIRequestContext, expect } from '@playwright/test';

/**
 * LoanResponse DTO structure from backend
 */
export interface LoanResponse {
  id: number;
  loanNumber: string;
  clientName: string;
  loanProductName: string;
  principalAmount: number;
  workflowStatus: string;
  loanStatus: string;
  createdAt: string;
  releaseDate: string | null;
  rejectionReason: string | null;
}

/**
 * Fetch loans from a specific API endpoint
 */
export async function getLoans(path: string): Promise<LoanResponse[]> {
  let baseURL = process.env.BACKEND_BASE_URL || 'http://localhost:8081/api';
  // Ensure baseURL ends with slash for proper path joining
  if (!baseURL.endsWith('/')) {
    baseURL = baseURL + '/';
  }
  
  const ctx: APIRequestContext = await request.newContext({
    baseURL,
    extraHTTPHeaders: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  });
  
  console.log(`📡 Fetching: ${baseURL}${path}`);
  const res = await ctx.get(path);
  
  console.log(`📊 Response status: ${res.status()}`);
  console.log(`📊 Response ok: ${res.ok()}`);
  
  if (!res.ok()) {
    const errorBody = await res.text();
    console.error(`❌ API Error (${res.status()}): ${errorBody.substring(0, 500)}`);
  }
  
  expect(res.ok(), `API request to ${path} should return 200, got ${res.status()}`).toBeTruthy();
  expect(res.status()).toBe(200);

  const data = await res.json();
  expect(Array.isArray(data), `Response from ${path} should be an array`).toBeTruthy();

  console.log(`✅ Received ${data.length} loans from API`);

  // Spot-check LoanResponse shape for first item if present
  if (data.length > 0) {
    const loan = data[0];
    expect(loan, 'Loan should have loanNumber').toHaveProperty('loanNumber');
    expect(loan, 'Loan should have clientName').toHaveProperty('clientName');
    expect(loan, 'Loan should have loanProductName').toHaveProperty('loanProductName');
    expect(loan, 'Loan should have principalAmount').toHaveProperty('principalAmount');
    expect(loan, 'Loan should have workflowStatus').toHaveProperty('workflowStatus');
    
    console.log(`🔍 Sample loan: ${loan.loanNumber} - ${loan.clientName} - ${loan.loanProductName}`);
  }

  await ctx.dispose();
  return data as LoanResponse[];
}

/**
 * Normalize money string for comparison
 * Removes currency symbols, commas, spaces
 */
export function normalizeMoney(text?: string | null): string {
  if (!text) return '';
  // Remove $, commas, spaces, convert to lowercase
  return text.replace(/[\$,\sUSh]/gi, '').toLowerCase();
}

/**
 * Normalize status string for comparison
 * Handles differences like "PENDING_APPROVAL" vs "Pending Approval"
 */
export function normalizeStatus(text?: string | null): string {
  if (!text) return '';
  return text.replace(/[_\-\s]/g, '').toLowerCase();
}

/**
 * Format date for comparison (handles different formats)
 */
export function normalizeDate(text?: string | null): string {
  if (!text) return '';
  // Remove all separators and keep just digits
  return text.replace(/[\/\-\s]/g, '');
}

/**
 * Extract numeric amount from formatted currency string
 */
export function extractAmount(text?: string | null): number {
  if (!text) return 0;
  const normalized = normalizeMoney(text);
  const number = parseFloat(normalized);
  return isNaN(number) ? 0 : number;
}
