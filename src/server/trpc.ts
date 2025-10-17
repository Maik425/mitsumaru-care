import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';
import { initTRPC } from '@trpc/server';
import { type NextRequest } from 'next/server';

import { supabase } from '@/lib/supabase';

export const createTRPCContext = async (opts: {
  req: NextRequest;
  res?: any;
}) => {
  const { req, res } = opts;

  // リクエストヘッダーからAuthorizationトークンを取得
  const authHeader = req.headers.get('authorization');
  let user = null;

  console.log(
    'tRPC Context - Auth header:',
    authHeader ? 'Present' : 'Missing'
  );

  let authSupabase: SupabaseClient = supabase;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    console.log('tRPC Context - Token length:', token.length);
    try {
      const {
        data: { user: authUser },
        error,
      } = await supabase.auth.getUser(token);
      if (!error && authUser) {
        user = authUser;
        console.log('tRPC Context - User authenticated:', authUser.id);

        // 認証されたユーザー用のSupabaseクライアントを作成
        authSupabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            global: {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          }
        );
      } else {
        console.log('tRPC Context - Auth error:', error?.message);
      }
    } catch (error) {
      console.error('Error getting user from token:', error);
    }
  }

  return {
    req,
    res,
    supabase: authSupabase,
    user,
  };
};

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
