import { createClient } from '@supabase/supabase-js';
import { Database } from './types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Debug: Log environment variables
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key:', supabaseAnonKey ? 'Present' : 'Missing');

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    `Missing Supabase environment variables: URL=${!!supabaseUrl}, Key=${!!supabaseAnonKey}`
  );
}

// Create a singleton instance to avoid multiple GoTrueClient instances
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null;

export const supabase = (() => {
  if (!supabaseInstance) {
    supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
      global: {
        headers: {
          'X-Client-Info': 'supabase-js-web',
        },
      },
    });
  }
  return supabaseInstance;
})();

// Server-side client with service role key (only available on server)
let supabaseAdminInstance: ReturnType<typeof createClient<Database>> | null =
  null;

export const supabaseAdmin = (() => {
  // Always create admin client on server side
  if (typeof window === 'undefined') {
    if (!supabaseAdminInstance) {
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      console.log('Creating supabaseAdmin with service role key');
      console.log('Service role key present:', !!serviceRoleKey);

      if (!serviceRoleKey) {
        throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
      }

      supabaseAdminInstance = createClient<Database>(
        supabaseUrl,
        serviceRoleKey,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        }
      );
    }
    return supabaseAdminInstance;
  }
  console.log('Using regular supabase client (client side)');
  // Return the same singleton instance on client side
  return supabaseInstance;
})();
