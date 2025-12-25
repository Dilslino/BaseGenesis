// Lazy-initialized Supabase client to avoid build-time errors with Node 18
// Re-exports from lib/supabase.ts for backward compatibility
export { getSupabaseClient as getSupabase, supabase } from '../../lib/supabase';
