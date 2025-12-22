/**
 * Unified Supabase Client
 *
 * This module provides a single Supabase client that works in both
 * client-side (Vite) and server-side (Next.js) environments.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

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

// Create singleton client
let supabaseInstance: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient | null {
  if (supabaseInstance) {
    return supabaseInstance;
  }

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
}

// Export the client (may be null if credentials not found)
export const supabase = getSupabaseClient();

// Re-export types and utilities from services/supabase.ts for backwards compatibility
export type { UserProfile } from '../services/supabase';
