import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from './environment';

// Admin client for server-side operations (JWT verification, storage, etc.)
export const supabaseAdmin: SupabaseClient = createClient(
  config.supabaseUrl,
  config.supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
