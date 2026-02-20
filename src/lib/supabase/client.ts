import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined;

export const supabase = createClient<Database>(
  supabaseUrl || 'https://invalid.local',
  supabaseAnonKey || 'invalid-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

import { createClient as createServerClient } from '@supabase/supabase-js';

export const getServerSupabase = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string | undefined;
  if (!url || !serviceKey) {
    throw new Error('Variáveis de ambiente do Supabase (server) não configuradas');
  }
  return createServerClient<Database>(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};
