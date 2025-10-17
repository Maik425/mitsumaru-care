import { supabaseAuthConfig } from '@/lib/auth/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    `Missing Supabase environment variables: URL=${!!supabaseUrl}, Key=${!!supabaseAnonKey}`
  );
}

// クライアント用のSupabaseインスタンス
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: supabaseAuthConfig,
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-web',
    },
  },
});

