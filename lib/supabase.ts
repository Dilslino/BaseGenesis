/**
 * Unified Supabase Client
 *
 * This module provides a single Supabase client that works in both
 * client-side (Vite) and server-side (Next.js) environments.
 * Uses lazy initialization to avoid build-time errors with Node 18.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Create singleton client with lazy initialization
let supabaseInstance: SupabaseClient | null = null;
let initialized = false;

// Detect environment and get appropriate credentials
function getSupabaseCredentials(): { url: string; key: string } | null {
  // Server-side (Next.js) - use service role key for full access
  if (typeof process !== 'undefined' && process.env) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (url && key) {
      return { url, key };
    }
  }

  // Client-side (Vite) - use anon key
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    const env = (import.meta as any).env;
    const url = env.VITE_SUPABASE_URL;
    const key = env.VITE_SUPABASE_ANON_KEY;

    if (url && key) {
      return { url, key };
    }
  }

  return null;
}

/**
 * Get Supabase client (lazy initialization)
 * Returns null if credentials are not available
 */
export function getSupabaseClient(): SupabaseClient | null {
  // Return cached instance if available
  if (initialized) {
    return supabaseInstance;
  }

  initialized = true;

  try {
    const credentials = getSupabaseCredentials();

    if (!credentials) {
      console.warn('⚠️ Supabase credentials not found. Database operations will be disabled.');
      return null;
    }

    supabaseInstance = createClient(credentials.url, credentials.key, {
      auth: {
        persistSession: typeof window !== 'undefined', // Only persist on client
      }
    });

    return supabaseInstance;
  } catch (error) {
    console.warn('⚠️ Failed to initialize Supabase:', error);
    return null;
  }
}

// Export a proxy object that lazily gets the client
// This prevents initialization at import time
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    const client = getSupabaseClient();
    if (!client) {
      // Return a no-op function for method calls when client is null
      if (typeof prop === 'string') {
        return () => Promise.resolve({ data: null, error: { message: 'Supabase not initialized' } });
      }
      return undefined;
    }
    return (client as any)[prop];
  }
});

// Re-export types and utilities from services/supabase.ts for backwards compatibility
export type { UserProfile } from '../services/supabase';
