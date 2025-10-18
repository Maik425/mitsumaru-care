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
    console.log(
      'tRPC Context - Token preview:',
      token.substring(0, 20) + '...'
    );
    try {
      const {
        data: { user: authUser },
        error,
      } = await supabase.auth.getUser(token);
      if (!error && authUser) {
        user = authUser;
        console.log('tRPC Context - User authenticated:', authUser.id);
        console.log('tRPC Context - User email:', authUser.email);

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
        console.log('tRPC Context - Auth error details:', error);
      }
    } catch (error) {
      console.error('Error getting user from token:', error);
    }
  } else {
    console.log('tRPC Context - No valid auth header found');
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

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  console.log('protectedProcedure - ctx.user:', ctx.user);
  if (!ctx.user) {
    console.log('protectedProcedure - No user found, throwing Unauthorized');
    throw new Error('Unauthorized');
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});
