
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let client = null;

if (supabaseUrl && supabaseKey) {
  client = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false // Since we are using this on the server, we don't need persistent sessions
    }
  });
} else {
  console.warn("⚠️ Supabase credentials missing in .env.local. Leaderboard will use mock data.");
}

// Export a typed client or any to avoid strict null checks everywhere, 
// though we handle the null check in the API route.
export const supabase = client as any;
