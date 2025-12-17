import { Page } from '@playwright/test';

/**
 * Mock authentication by setting a JWT token in localStorage
 * This bypasses the login flow for E2E tests
 */
export async function setupAuthentication(page: Page): Promise<void> {
  // Create a mock JWT token with necessary user info
  // JWT structure: header.payload.signature (base64 encoded)
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };
  
  const payload = {
    sub: 'test@tindigwa.com',
    email: 'test@tindigwa.com',
    firstName: 'Test',
    lastName: 'User',
    fullName: 'Test User',
    role: 'ADMIN',
    userId: 1,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400 // Expires in 24 hours
  };
  
  // Base64url encode (simplified for testing - not cryptographically signed)
  const base64UrlEncode = (obj: any) => {
    const str = JSON.stringify(obj);
    return Buffer.from(str).toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  };
  
  const encodedHeader = base64UrlEncode(header);
  const encodedPayload = base64UrlEncode(payload);
  const mockSignature = 'mock_signature_for_testing';
  
  const mockToken = `${encodedHeader}.${encodedPayload}.${mockSignature}`;
  
  // Navigate to the app first (needed to set localStorage)
  await page.goto('/');
  
  // Set the token in localStorage
  await page.evaluate((token) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('tindigwa_token', token);
  }, mockToken);
  
  console.log('🔐 Authentication set up for E2E tests');
}
