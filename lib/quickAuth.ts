/**
 * Farcaster Quick Auth Utilities
 * 
 * Provides helper functions for authenticated API requests
 * using Farcaster Quick Auth tokens.
 */

import sdk from '@farcaster/frame-sdk';

/**
 * Make an authenticated fetch request to your backend
 * 
 * Automatically includes Quick Auth token in Authorization header
 * 
 * @param url - API endpoint URL
 * @param options - Fetch options
 * @returns Response from authenticated request
 */
export async function authenticatedFetch(
  url: string,
  options?: RequestInit
): Promise<Response> {
  try {
    // Use sdk.quickAuth.fetch which automatically handles token
    const response = await sdk.quickAuth.fetch(url, options);
    return response;
  } catch (error) {
    console.error('Authenticated fetch error:', error);
    throw error;
  }
}

/**
 * Verify Quick Auth token on your backend
 * 
 * Example backend validation:
 * ```typescript
 * import { createPublicClient, http } from 'viem';
 * import { optimism } from 'viem/chains';
 * 
 * const publicClient = createPublicClient({
 *   chain: optimism,
 *   transport: http()
 * });
 * 
 * async function validateToken(token: string) {
 *   const response = await fetch('https://auth.farcaster.xyz/v1/validate', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({ token })
 *   });
 *   
 *   const { valid, fid } = await response.json();
 *   return { valid, fid };
 * }
 * ```
 */
export interface QuickAuthTokenPayload {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
  custody_address?: string;
  verified_addresses?: {
    eth_addresses?: string[];
  };
}

/**
 * Decode Quick Auth JWT token (client-side only, DO NOT use for validation!)
 * 
 * This is for reading token data client-side. 
 * ALWAYS validate tokens on your backend!
 * 
 * @param token - JWT token from Quick Auth
 * @returns Decoded payload
 */
export function decodeQuickAuthToken(token: string): QuickAuthTokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }
    
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
}

/**
 * Check if Quick Auth token is expired
 * 
 * @param token - JWT token from Quick Auth
 * @returns true if token is expired
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeQuickAuthToken(token);
  if (!payload || !(payload as any).exp) {
    return true;
  }
  
  const expiryTime = (payload as any).exp * 1000; // Convert to milliseconds
  return Date.now() >= expiryTime;
}
