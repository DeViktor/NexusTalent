import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// Note: This client should only be used in server-side contexts (API routes, Server Actions)
// never expose the service role key to the client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
