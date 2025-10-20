import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';
import { initTRPC, TRPCError } from '@trpc/server';
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

        // データベースからユーザー情報を取得
        try {
          const { data: userData, error: userError } = await authSupabase
            .from('users')
            .select('id, name, role, facility_id, is_active')
            .eq('id', authUser.id)
            .single();

          if (userError || !userData) {
            console.error('tRPC Context - User data fetch error:', userError);
            user = authUser; // 認証ユーザーのみを使用
          } else {
            console.log('tRPC Context - User data found:', userData);
            // 認証ユーザーとデータベースユーザーをマージ
            user = {
              ...authUser,
              ...userData,
              email: authUser.email || '',
            };
          }
        } catch (dbError) {
          console.error('tRPC Context - Database error:', dbError);
          user = authUser; // 認証ユーザーのみを使用
        }
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

export const systemAdminProcedure = t.procedure.use(async ({ ctx, next }) => {
  console.log('systemAdminProcedure - ctx.user:', ctx.user);
  if (!ctx.user) {
    console.log('systemAdminProcedure - No user found, throwing Unauthorized');
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Unauthorized',
    });
  }

  // ユーザーの詳細情報を取得してロールを確認
  try {
    const { data: userData, error } = await ctx.supabase
      .from('users')
      .select('role')
      .eq('id', ctx.user.id)
      .single();

    if (error || !userData) {
      console.log('systemAdminProcedure - User data not found:', error);
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User data not found',
      });
    }

    if (userData.role !== 'system_admin') {
      console.log(
        'systemAdminProcedure - User is not system admin:',
        userData.role
      );
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Access denied: System admin required',
      });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
        userRole: userData.role,
      },
    });
  } catch (error) {
    console.error('systemAdminProcedure - Error checking user role:', error);
    if (error instanceof TRPCError) {
      throw error;
    }
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Access denied: System admin required',
    });
  }
});
